"""Original score for a reel: numpy synthesis, no samples. 120 BPM (1 bar = 2 s), E minor, every onset on the 1/16 grid.
The arrangement comes from <reel>/score.json, so each reel shapes its own score around its voice and events:

  { "sections": [[0, "intro"], [4, "groove"], ["l04", "claps"], ["l05", "half"], ["ev:silence", "silence"], ["ev:ignite", "drop"]],
    "drop": "ev:ignite", "final": "ev:confirm.final", "risers": [["l06", "ev:silence"]], "tones": [["l07", "l07.end", 71]] }

Times: a number (s), "l03" (line start), "l03.end", "ev:type" (first event of that type), "ev:type.t1", "ev:confirm.final".
Modes: intro, groove, claps, graph (sparse), half (half-time), tense (octave up + fourth), silence (true zero), turn (no rhythm), drop, outro.

  python kit/audio/score.py <reel folder>   → <reel>/music/score.wav + onsets.json
"""
import os, sys, json
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

LIB = os.environ.get('LIB', '/home/user/lemomo-ai/lemo-opuscar'); sys.path.insert(0, LIB)
from core.audio.sfx import SR, limit  # noqa: E402

REEL = os.path.abspath(sys.argv[1])
TL = json.load(open(os.path.join(REEL, 'timeline.json')))
EV = json.load(open(os.path.join(REEL, 'events.json')))['ev']
CF = json.load(open(os.path.join(REEL, 'score.json')))
BEAT = 60 / TL['bpm']; S16 = BEAT / 4; BAR = 4 * BEAT
DUR = TL['dur']; N = int(round(DUR * SR))
LN = {l['id']: l for l in TL['lines']}
rng = np.random.default_rng(11)
ONSETS = []


def at(x):
    if x is None: return None
    if isinstance(x, (int, float)): return float(x)
    if x.startswith('ev:'):
        k = x[3:]; field = 't'
        if k.endswith('.t1'): k, field = k[:-3], 't1'
        if k == 'confirm.final': return next(e['t'] for e in EV if e['type'] == 'confirm' and e.get('final'))
        e = next((e for e in EV if e['type'] == k), None)
        return None if e is None else e.get(field, e['t'])
    if x.endswith('.end'): return LN[x[:-4]]['t1']
    return LN[x]['t0']


SECS = sorted([(at(a), m) for a, m in CF['sections']], key=lambda s: s[0])
DROP = at(CF.get('drop')); FINAL = at(CF.get('final', 'ev:confirm.final'))
SIL = next(((s, SECS[i + 1][0] if i + 1 < len(SECS) else DUR) for i, (s, m) in enumerate(SECS) if m == 'silence'), None)


def section(t):
    if FINAL is not None and t >= FINAL: return 'outro'
    m = 'intro'
    for s, mm in SECS:
        if t >= s - 1e-6: m = mm
    return m


def q(t): return round(round(t / S16) * S16, 6)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def sos(kind, f, o=2): return butter(o, f, kind, fs=SR, output='sos')
def tt(d): return np.arange(int(round(d * SR))) / SR


def put(buf, x, t0, gain=1.0, pan=0.0):
    s = int(round(t0 * SR))
    if s >= N or s < 0: return
    if x.ndim == 1: x = np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
    e = min(N, s + len(x)); buf[s:e] += x[:e - s] * gain


def saw(f, n, ph=0.0):
    f = np.broadcast_to(np.asarray(f, float), (n,)) if np.ndim(f) == 0 else f
    dt = f / SR; p = (ph + np.cumsum(dt)) % 1.0
    y = 2 * p - 1; o = np.zeros(n)
    m = p < dt; x = p[m] / dt[m]; o[m] = x + x - x * x - 1
    m = p > 1 - dt; x = (p[m] - 1) / dt[m]; o[m] = x * x + x + x + 1
    return y - o


def adsr(n, a=0.005, d=0.08, s=0.5, r=0.08, hold=None):
    hold = n if hold is None else hold
    t = np.arange(n) / SR; e = np.ones(n) * s
    A = t < a; e[A] = t[A] / a
    D = (t >= a) & (t < a + d); e[D] = 1 - (1 - s) * (t[D] - a) / d
    hs = hold / SR; R = t >= hs; e[R] = s * np.exp(-(t[R] - hs) / max(r, 1e-3))
    return e


CHORDS = [(40, [64, 67, 71, 74, 78]), (36, [64, 67, 71, 72, 76]), (43, [62, 67, 71, 74, 76]), (38, [62, 66, 69, 74, 76])]   # Em9 Cmaj7 G6 D(add9)
def chord_at(t): return CHORDS[int(t // BAR) % 4]


def arp_note(m, d, bright=1.0):
    n = int(d * SR) + int(0.25 * SR); f = hz(m)
    x = 0.6 * saw(f * 1.003, n) + 0.6 * saw(f * 0.997, n, 0.37)
    return sosfilt(sos('low', 900 + 3800 * bright), x) * adsr(n, 0.003, 0.09, 0.25, 0.09, int(d * SR))
def bass_note(m, d):
    n = int(d * SR) + int(0.1 * SR); f = hz(m); tq = np.arange(n) / SR
    x = sosfilt(sos('low', 520), np.sign(np.sin(2 * np.pi * f * tq)) * 0.5 + saw(f, n) * 0.5) + 0.35 * np.sin(2 * np.pi * 2 * f * tq)
    return x * adsr(n, 0.004, 0.12, 0.6, 0.05, int(d * SR * 0.85))
def hat(v=1.0):
    d = 0.05; n = int(d * SR); return sosfilt(sos('high', 7500), rng.standard_normal(n)) * np.exp(-tt(d)[:n] / 0.012) * v
def clap(v=1.0):
    d = 0.25; n = int(d * SR); x = sosfilt(sos('band', [900, 2600]), rng.standard_normal(n)); e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.023]): s = int(off * SR); e[s:] += np.exp(-tt(d)[:n - s] / (0.006 if k < 2 else 0.06))
    return x * e * v
def kick(v=1.0):
    d = 0.35; t = tt(d); f = 46 + 90 * np.exp(-t / 0.03); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12) * v
def pad(ms, d, cut=1400):
    n = int(d * SR); x = np.zeros(n)
    for m in ms:
        for det in (-0.006, 0.0, 0.006): x += saw(hz(m) * (1 + det), n, rng.random())
    x = sosfilt(sos('low', cut), x) / (len(ms) * 3)
    return x * np.minimum(1, tt(d)[:n] / 0.6) * np.minimum(1, (d - tt(d)[:n]) / 0.5)
def sub808(m0, m1, d):
    t = tt(d); f = hz(m1) + (hz(m0) - hz(m1)) * np.exp(-t / 0.25)
    return np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t / 1.4)
def tone(m, d, a=0.4, r=0.6):
    t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(2 * np.pi * hz(m) * 2 * t)
    return x * np.minimum(1, t / a) * np.minimum(1, (d - t) / r)


arpB, bassB, drumB, padB, fxB = (np.zeros((N, 2)) for _ in range(5))
for i in range(int(DUR / S16)):
    t = round(i * S16, 6); sec = section(t); b16 = i % 16; root, tones = chord_at(t)
    if sec in ('silence', 'turn'): continue
    if sec == 'outro':
        k = int((t - FINAL) / S16)                                   # the arp is removed note by note
        if not (b16 % 4 >= 4 - min(4, k // 4) or t > FINAL + 2.0):
            put(arpB, arp_note(tones[[0, 2, 4, 2][b16 % 4]], S16 * 0.9, 0.5), t, 0.11, -0.3 if i % 2 else 0.3); ONSETS.append(q(t))
        continue
    if sec != 'half' or b16 % 2 == 0:
        m = tones[[0, 1, 2, 3, 4, 3, 2, 1][b16 % 8]] + (12 if sec == 'tense' else 0)
        bright = min(1, t / 4) if sec == 'intro' else (0.55 if sec == 'graph' else 0.85)
        put(arpB, arp_note(m, S16 * 0.85, bright), t, {'intro': 0.12, 'graph': 0.08, 'half': 0.09}.get(sec, 0.12), -0.35 if i % 2 else 0.35); ONSETS.append(q(t))
    if sec in ('intro', 'groove', 'claps', 'graph', 'drop', 'tense') and b16 % 2 == 0:
        put(bassB, bass_note(root - 12 + (5 if sec == 'tense' else 0), S16 * 1.7), t, 0.3)
    if sec == 'half' and b16 % 8 == 0: put(bassB, bass_note(root - 12, BEAT * 1.8), t, 0.32)
    if sec in ('groove', 'claps', 'drop', 'tense'):
        if b16 % 2 == 0: put(drumB, hat(0.5 if b16 % 4 else 0.3), t, 0.16, 0.2)
        if sec in ('claps', 'tense', 'drop') and b16 % 2 == 1: put(drumB, hat(0.25), t, 0.12, 0.25)
        if sec in ('claps', 'drop', 'tense') and b16 in (4, 12): put(drumB, clap(), t, 0.22, -0.05)
        if b16 % 4 == 0 and (sec != 'groove' or b16 == 0): put(drumB, kick(), t, 0.5)
    if sec == 'half':
        if b16 % 4 == 0: put(drumB, hat(0.4), t, 0.14, 0.2)
        if b16 == 8: put(drumB, clap(), t, 0.2)
        if b16 == 0: put(drumB, kick(), t, 0.45)
    if sec == 'intro' and b16 % 4 == 0: put(drumB, kick(0.7), t, 0.35)
    if b16 == 0 and sec in ('groove', 'claps', 'graph', 'half', 'tense', 'drop'):
        put(padB, pad(tones[:4], BAR + 0.4, 1800 if sec == 'drop' else 1100), t, 0.12)

for a, b, m in CF.get('tones', []):                                  # held tones (reading time, "barely moves")
    t0, t1 = at(a), at(b); put(fxB, tone(m, t1 - t0 + 0.6, 0.5, 0.8), q(t0), 0.07)
for a, b in CF.get('risers', []):                                    # noise risers that end exactly on a hit or a silence
    t0, t1 = at(a), at(b); n = int((t1 - t0) * SR)
    if n > 0: put(fxB, sosfilt(sos('band', [500, 6000]), rng.standard_normal(n)) * np.linspace(0, 1, n) ** 2.5, t0, 0.065)
if SIL and section(SIL[1] + 0.01) == 'turn':                         # the turn: one low sustained tone, no rhythm
    nxt = next((s for s, m in SECS if s > SIL[1] + 0.01), DROP or DUR)
    put(fxB, tone(40, nxt - SIL[1] + 0.3, 1.2, 0.4) * 0.8, SIL[1] + 0.1, 0.16)
if DROP is not None:                                                 # the drop: 808 glide + a wide 7-voice saw chord
    put(bassB, sub808(52, 40, 2.6), q(DROP), 0.55)
    n = int(2.4 * SR); wide = np.zeros((n, 2))
    for k, m in enumerate([52, 59, 64, 67, 71, 74, 78]):
        for side, det in ((0, -0.008), (1, 0.008)): wide[:, side] += saw(hz(m) * (1 + det * (1 + k * 0.2)), n, rng.random())
    put(padB, sosfilt(sos('low', 2600), wide, axis=0) * np.exp(-tt(2.4)[:n] / 0.9)[:, None] / 7, q(DROP), 0.5)
if FINAL is not None: put(padB, pad([52, 59, 64, 66, 71], DUR - FINAL, 1600), q(FINAL), 0.2)

def scoop(x, dbv=-6): return x + sosfilt(sos('band', [1000, 4000]), x, axis=0) * (10 ** (dbv / 20) - 1)   # leave room for the voice
arpB = scoop(arpB); padB = scoop(padB, -4)
dl = int(0.375 * SR); dly = np.zeros_like(arpB); dly[dl:, 0] = arpB[:-dl, 1] * 0.35; dly[2 * dl:, 1] = arpB[:-2 * dl, 0] * 0.22
arpB = arpB + sosfilt(sos('low', 3000), dly, axis=0)
mixd = arpB + bassB + drumB + padB + fxB
if SIL:
    s0, s1 = int(SIL[0] * SR), int(SIL[1] * SR); f = int(0.03 * SR)
    mixd[s0 - f:s0] *= np.linspace(1, 0, f)[:, None]; mixd[s0:s1] = 0
mixd = np.stack([limit(mixd[:, 0], 0.9), limit(mixd[:, 1], 0.9)], 1)
if SIL: mixd[s0:s1] = 0
os.makedirs(os.path.join(REEL, 'music'), exist_ok=True)
sf.write(os.path.join(REEL, 'music', 'score.wav'), mixd.astype(np.float32), SR)
json.dump({'bpm': TL['bpm'], 'onsets': ONSETS, 'sections': SECS, 'drop': DROP, 'final': FINAL}, open(os.path.join(REEL, 'music', 'onsets.json'), 'w'))
print(f'score.wav {DUR:.1f}s, {len(ONSETS)} arp onsets; sections ' + ' · '.join(f'{m}@{s:.2f}' for s, m in SECS) + f'; drop {DROP}; final {FINAL}')
