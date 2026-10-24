"""Original score for "Your battery percentage is a guess": numpy synthesis, no samples.
120 BPM (1 bar = 2 s), E minor. Sections come from timeline.json + events.json, so the score follows the voice.
Every note onset sits on the 1/16 grid (0.125 s); key hits (locks, the glitch, the drop) land on it too.

  python music/score.py        → music/score.wav (48 kHz stereo) + music/onsets.json
"""
import os, sys, json
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

HERE = os.path.dirname(os.path.abspath(__file__)); PROJ = os.path.dirname(HERE)
LIB = os.environ.get('LIB', '/home/user/lemomo-ai/lemo-opuscar'); sys.path.insert(0, LIB)
from core.audio.sfx import SR, limit  # noqa: E402

TL = json.load(open(os.path.join(PROJ, 'timeline.json')))
EV = json.load(open(os.path.join(PROJ, 'events.json')))['ev']
BEAT = 60 / TL['bpm']; S16 = BEAT / 4; BAR = 4 * BEAT
DUR = TL['dur']; N = int(round(DUR * SR))
L = {l['id']: l for l in TL['lines']}
first = lambda typ: next(e for e in EV if e['type'] == typ)
SIL = first('silence'); SIL0, SIL1 = SIL['t'], SIL['t1']
GLITCH = first('glitch')['t']; IGNITE = first('ignite')['t']
FINAL = next(e for e in EV if e['type'] == 'confirm' and e.get('final'))['t']
T_GRAPH, T_MODEL, T_TENSE = L['l07']['t0'], L['l08']['t0'], L['l09']['t0']
rng = np.random.default_rng(11)
ONSETS = []


def q(t): return round(round(t / S16) * S16, 6)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def sos(kind, f, o=2): return butter(o, f, kind, fs=SR, output='sos')
def tt(d): return np.arange(int(round(d * SR))) / SR


def put(buf, x, at, gain=1.0, pan=0.0):
    s = int(round(at * SR))
    if s >= N or s < 0: return
    if x.ndim == 1:
        x = np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
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


# ---------------------------------------------------------------- harmony: one chord per bar
CHORDS = [  # (bass root, chord tones for arp/pad)
    (40, [64, 67, 71, 74, 78]),   # Em9
    (36, [64, 67, 71, 72, 76]),   # Cmaj7
    (43, [62, 67, 71, 74, 76]),   # G6
    (38, [62, 66, 69, 74, 76]),   # D(add9)
]
def chord_at(t): return CHORDS[int(t // BAR) % 4]


# ---------------------------------------------------------------- instruments
def arp_note(m, d, bright=1.0):
    n = int(d * SR) + int(0.25 * SR)
    f = hz(m)
    x = 0.6 * saw(f * 1.003, n) + 0.6 * saw(f * 0.997, n, 0.37)
    cut = 900 + 3800 * bright
    x = sosfilt(sos('low', cut), x) * adsr(n, 0.003, 0.09, 0.25, 0.09, int(d * SR))
    return x


def bass_note(m, d):
    n = int(d * SR) + int(0.1 * SR); f = hz(m)
    sq = np.sign(np.sin(2 * np.pi * f * tt(n / SR)[:n])) * 0.5 + saw(f, n) * 0.5
    x = sosfilt(sos('low', 520), sq) + 0.35 * np.sin(2 * np.pi * 2 * f * tt(n / SR)[:n])   # 2nd harmonic: speaks on phone speakers
    return x * adsr(n, 0.004, 0.12, 0.6, 0.05, int(d * SR * 0.85))


def hat(v=1.0, open_=False):
    d = 0.18 if open_ else 0.05; n = int(d * SR)
    x = sosfilt(sos('high', 7500), rng.standard_normal(n)) * np.exp(-tt(d)[:n] / (0.05 if open_ else 0.012))
    return x * v


def clap(v=1.0):
    d = 0.25; n = int(d * SR); x = sosfilt(sos('band', [900, 2600]), rng.standard_normal(n))
    e = np.zeros(n)
    for k, off in enumerate([0, 0.011, 0.023]): s = int(off * SR); e[s:] += np.exp(-tt(d)[:n - s] / (0.006 if k < 2 else 0.06))
    return x * e * v


def kick(v=1.0):
    d = 0.35; t = tt(d); f = 46 + 90 * np.exp(-t / 0.03)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.12)
    return x * v


def pad(ms, d, cut=1400):
    n = int(d * SR); x = np.zeros(n)
    for m in ms:
        for det in (-0.006, 0.0, 0.006): x += saw(hz(m) * (1 + det), n, rng.random())
    x = sosfilt(sos('low', cut), x) / (len(ms) * 3)
    e = np.minimum(1, tt(d)[:n] / 0.6) * np.minimum(1, (d - tt(d)[:n]) / 0.5)
    return x * e


def sub808(m0, m1, d):
    t = tt(d); f = hz(m1) + (hz(m0) - hz(m1)) * np.exp(-t / 0.25)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR)
    x = np.tanh(1.6 * x) * np.exp(-t / 1.4)
    return x


def tone(m, d, a=0.4, r=0.6):
    t = tt(d); x = np.sin(2 * np.pi * hz(m) * t) + 0.25 * np.sin(2 * np.pi * hz(m) * 2 * t)
    return x * np.minimum(1, t / a) * np.minimum(1, (d - t) / r)


# ---------------------------------------------------------------- arrangement
arpB = np.zeros((N, 2)); bassB = np.zeros((N, 2)); drumB = np.zeros((N, 2)); padB = np.zeros((N, 2)); fxB = np.zeros((N, 2))

def section(t):
    if t < 4: return 'intro'
    if t < 12: return 'groove'
    if t < T_GRAPH - 1.5: return 'claps'
    if t < T_MODEL: return 'graph'
    if t < T_TENSE: return 'half'
    if t < SIL0: return 'tense'
    if t < SIL1: return 'silence'
    if t < IGNITE: return 'turn'
    if t < FINAL: return 'drop'
    return 'outro'


steps = int(DUR / S16)
for i in range(steps):
    t = round(i * S16, 6); sec = section(t); beat16 = i % 16; root, tones = chord_at(t)
    if sec in ('silence', 'turn'): continue
    # arpeggio: 16ths up/down the chord; brightness opens through the intro, an octave up in the tension
    if sec not in ('half',) or beat16 % 2 == 0:
        if sec == 'outro':
            k = int((t - FINAL) / S16)                         # removed note by note
            if beat16 % 4 >= 4 - min(4, k // 4) or t > FINAL + 2.0: pass
            else:
                put(arpB, arp_note(tones[[0, 2, 4, 2][beat16 % 4]], S16 * 0.9, 0.5), t, 0.11, -0.3 if i % 2 else 0.3); ONSETS.append({'t': q(t), 'part': 'arp'})
        else:
            seq = [0, 1, 2, 3, 4, 3, 2, 1]; m = tones[seq[beat16 % 8]] + (12 if sec == 'tense' and t > GLITCH - 2 else 0)
            bright = min(1, t / 4) if sec == 'intro' else (0.55 if sec == 'graph' else 0.85)
            g = {'intro': 0.12, 'graph': 0.08, 'half': 0.09}.get(sec, 0.12)
            put(arpB, arp_note(m, S16 * 0.85, bright), t, g, -0.35 if i % 2 else 0.35); ONSETS.append({'t': q(t), 'part': 'arp'})
    # bass: 8ths (half notes in the half-time, up a fourth in the tension)
    if sec in ('intro', 'groove', 'claps', 'graph', 'drop', 'tense') and beat16 % 2 == 0:
        m = root - 12 + (5 if sec == 'tense' and t > GLITCH else 0)
        put(bassB, bass_note(m, S16 * 1.7), t, 0.3); ONSETS.append({'t': q(t), 'part': 'bass'})
    if sec == 'half' and beat16 % 8 == 0:
        put(bassB, bass_note(root - 12, BEAT * 1.8), t, 0.32); ONSETS.append({'t': q(t), 'part': 'bass'})
    # drums
    if sec in ('groove', 'claps', 'drop', 'tense'):
        if beat16 % 2 == 0: put(drumB, hat(0.5 if beat16 % 4 else 0.3), t, 0.16, 0.2)
        if sec in ('claps', 'tense', 'drop') and beat16 % 2 == 1: put(drumB, hat(0.25), t, 0.12, 0.25)
        if sec in ('claps', 'drop', 'tense') and beat16 in (4, 12): put(drumB, clap(), t, 0.22, -0.05)
        if beat16 % 4 == 0 and (sec != 'groove' or beat16 == 0): put(drumB, kick(), t, 0.5); ONSETS.append({'t': q(t), 'part': 'kick'})
    if sec == 'half':
        if beat16 % 4 == 0: put(drumB, hat(0.4), t, 0.14, 0.2)
        if beat16 == 8: put(drumB, clap(), t, 0.2)
        if beat16 == 0: put(drumB, kick(), t, 0.45)
    if sec == 'intro' and beat16 % 4 == 0: put(drumB, kick(0.7), t, 0.35)
    # pads on each bar
    if beat16 == 0 and sec in ('groove', 'claps', 'graph', 'half', 'tense', 'drop'):
        put(padB, pad(tones[:4], BAR + 0.4, 1100 if sec != 'drop' else 1800), t, 0.12)

# the held tone under the flat zone (one sustained note while the voltage "barely moves")
put(fxB, tone(71, L['l07']['t1'] - T_GRAPH + 0.6, 0.5, 0.8), q(T_GRAPH), 0.07)
# tension riser into the glitch, then the riser that ends exactly where the silence starts
d = GLITCH - (GLITCH - 2.0); n = int(d * SR); r = sosfilt(sos('band', [600, 6000]), rng.standard_normal(n)) * np.linspace(0, 1, n) ** 2
put(fxB, r, GLITCH - 2.0, 0.07)
d = SIL0 - (GLITCH + 0.5); n = int(d * SR); r = sosfilt(sos('band', [400, 5000]), rng.standard_normal(n)) * np.linspace(0, 1, n) ** 3
put(fxB, r, GLITCH + 0.5, 0.06)
# the turn: one low sustained tone under the reveal (no rhythm), fading into the drop
put(fxB, tone(40, IGNITE - SIL1 + 0.3, 1.2, 0.4) * 0.8, SIL1 + 0.1, 0.16)
# the drop: 808 glide + a wide 7-voice saw chord
put(bassB, sub808(52, 40, 2.6), q(IGNITE), 0.55)
n = int(2.4 * SR); wide = np.zeros((n, 2))
for k, m in enumerate([52, 59, 64, 67, 71, 74, 78]):
    for side, det in ((0, -0.008), (1, 0.008)): wide[:, side] += saw(hz(m) * (1 + det * (1 + k * 0.2)), n, rng.random())
wide = sosfilt(sos('low', 2600), wide, axis=0) * np.exp(-tt(2.4)[:n] / 0.9)[:, None] / 7
put(padB, wide, q(IGNITE), 0.5)
ONSETS.append({'t': q(IGNITE), 'part': 'drop'})
# the final chord when 1% locks: Em(add9), long tail
put(padB, pad([52, 59, 64, 66, 71], DUR - FINAL, 1600), q(FINAL), 0.2)

# ---------------------------------------------------------------- voice-friendly EQ: scoop 1–4 kHz from the arp and pads
def scoop(x, db=-6):
    band = sosfilt(sos('band', [1000, 4000]), x, axis=0)
    return x + band * (10 ** (db / 20) - 1)
arpB = scoop(arpB); padB = scoop(padB, -4)
# simple stereo ping-pong delay on the arp (dotted 8th)
dl = int(0.375 * SR); dly = np.zeros_like(arpB)
dly[dl:, 0] = arpB[:-dl, 1] * 0.35; dly[2 * dl:, 1] = arpB[:-2 * dl, 0] * 0.22
arpB = arpB + sosfilt(sos('low', 3000), dly, axis=0)

mixd = arpB + bassB + drumB + padB + fxB
# true digital silence: nothing between SIL0 and SIL1 (fade the tail over the last 30 ms before it)
s0, s1 = int(SIL0 * SR), int(SIL1 * SR); f = int(0.03 * SR)
mixd[s0 - f:s0] *= np.linspace(1, 0, f)[:, None]; mixd[s0:s1] = 0
mixd = limit(mixd, 0.9) if mixd.ndim == 1 else np.stack([limit(mixd[:, 0], 0.9), limit(mixd[:, 1], 0.9)], 1)
mixd[s0:s1] = 0
sf.write(os.path.join(HERE, 'score.wav'), mixd.astype(np.float32), SR)
off = [o for o in ONSETS if abs(o['t'] / S16 - round(o['t'] / S16)) > 1e-6]
json.dump({'bpm': TL['bpm'], 'onsets': ONSETS, 'silence': [SIL0, SIL1], 'drop': IGNITE}, open(os.path.join(HERE, 'onsets.json'), 'w'))
print(f'score.wav {DUR:.1f}s, {len(ONSETS)} onsets, {len(off)} off-grid; silence {SIL0:.3f}–{SIL1:.3f}; drop {IGNITE:.3f}; final {FINAL:.3f}')
