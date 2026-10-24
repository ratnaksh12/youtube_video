"""Mix a reel: voice (placed from timeline.json) + score (music/score.wav) + foley (from events.json) + ambience → out/mix.wav (48 kHz stereo).
Voice is compressed and sits ~10 dB over the music; music and foley duck under it with a held envelope (no pumping between words),
and the first 0.2 s of every lock / confirm escapes the duck. The silence window is true digital zero.

  python kit/audio/mix.py <reel folder> [--synth] [--out out/mix.wav]
Effects come from kit/audio/foley.py (earshot bank + uisfx recordings, placed by measured rules); --synth uses the older
procedural effects below instead (kept for comparison). Also writes out/sfx.wav (effects only) and out/foley_cues.json.
Event types it voices: scramble roll lock confirm shrink scan slide close probe deny card pulse wifi error dock whip draw sweep merge flag glitch
frost powerloss marker ignite erase off cta; silence (true zero) and ignite are optional.
"""
import os, sys, json
import numpy as np
import soundfile as sf
import soxr
from scipy.signal import butter, sosfilt
from scipy.ndimage import maximum_filter1d, uniform_filter1d

HERE = os.path.abspath(sys.argv[1])
SYNTH = '--synth' in sys.argv
OUTF = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join('out', 'mix.wav')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import foley  # noqa: E402
LIB = os.environ.get('LIB', '/home/user/lemomo-ai/lemo-opuscar'); sys.path.insert(0, LIB)
from core.audio.sfx import SR, compress, limit  # noqa: E402

TL = json.load(open(os.path.join(HERE, 'timeline.json')))
EV = json.load(open(os.path.join(HERE, 'events.json')))['ev']
DUR = TL['dur']; N = int(round(DUR * SR))
rng = np.random.default_rng(23)
def sos(kind, f, o=2): return butter(o, f, kind, fs=SR, output='sos')
def tt(d): return np.arange(int(round(d * SR))) / SR
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
def env(d, tau): return np.exp(-tt(d) / tau)
def nz(d): return rng.standard_normal(int(round(d * SR)))
def db(x): return 10 ** (x / 20)


def put(buf, x, at, gain=1.0, pan=0.0):
    s = int(round(at * SR))
    if x.ndim == 1: x = np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
    if s < 0: x = x[-s:]; s = 0
    e = min(N, s + len(x))
    if e > s: buf[s:e] += x[:e - s] * gain


# ---------------------------------------------------------------- foley (light = sines and FM blips in E minor; machines = servos, puffs)
def blip(m, d=0.06, fm=0.0, v=1.0):
    t = tt(d); f = hz(m)
    return np.sin(2 * np.pi * f * t + fm * np.sin(2 * np.pi * f * 2 * t)) * env(d, d / 4) * np.minimum(1, t / 0.002) * v
def tick(v=1.0):
    d = 0.006; return sosfilt(sos('high', 3000), nz(d)) * env(d, 0.0015) * v
def thump(v=1.0, f=58):
    d = 0.3; t = tt(d); fr = f + 70 * np.exp(-t / 0.02)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(d, 0.08) * v
def clack(v=1.0):
    d = 0.05; t = tt(d)
    return (sosfilt(sos('band', [1800, 5200]), nz(d)) * env(d, 0.004) + 0.5 * np.sin(2 * np.pi * 2300 * t) * env(d, 0.01)) * v
def whoosh(d=0.35, v=1.0, up=True):
    n = int(d * SR); x = nz(d); out = np.zeros(n); seg = 64
    for i in range(seg):   # moving band-pass
        a, b = i * n // seg, (i + 1) * n // seg; u = i / seg if up else 1 - i / seg
        fc = 300 + 3500 * u; out[a:b] = sosfilt(sos('band', [fc * 0.6, fc * 1.4]), x[max(0, a - 2000):b])[-(b - a):]
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5 * v
def servo(d=0.5, v=1.0, up=True):
    t = tt(d); f0, f1 = (170, 250) if up else (250, 170); f = f0 + (f1 - f0) * t / d
    ph = 2 * np.pi * np.cumsum(f) / SR; x = (ph / np.pi % 2 - 1) * 0.6 + 0.4 * np.sin(2 * ph)
    return sosfilt(sos('low', 1400), x) * np.minimum(1, t / 0.04) * np.minimum(1, (d - t) / 0.06) * v
def puff(v=1.0):
    d = 0.35; return sosfilt(sos('low', 1300), nz(d)) * env(d, 0.07) * np.minimum(1, tt(d) / 0.01) * v
def lock(v=1.0):
    return thump(0.9 * v), clack(0.8 * v), np.concatenate([blip(83, 0.07, 0.6), blip(88, 0.09, 0.6)]) * 0.7 * v
def confirm(v=1.0, d=0.5):
    t = tt(d); return sum(np.sin(2 * np.pi * hz(m) * t) * a for m, a in [(88, .6), (95, .4), (102, .25)]) * env(d, d / 3) * np.minimum(1, t / 0.003) * v
def glide(m0, m1, d, v=1.0):
    t = tt(d); f = hz(m0) * (hz(m1) / hz(m0)) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08) * v
def crush(x, bits=5, hold=6):
    y = np.repeat(x[::hold], hold)[:len(x)]; return np.round(y * 2 ** bits) / 2 ** bits


# ---------------------------------------------------------------- voice
voice = np.zeros(N)
for Ln in TL['lines']:
    a, sr = sf.read(os.path.join(HERE, 'voice', Ln['id'] + '.wav'), dtype='float32')
    a = soxr.resample(a, sr, SR)
    s = int(round(Ln['t0'] * SR)); e = min(N, s + len(a)); voice[s:e] += a[:e - s]
voice = sosfilt(sos('high', 80), voice)
voice = compress(voice / (np.abs(voice).max() + 1e-9), thr=0.22, ratio=3.0, att=0.003, rel=0.12)
vr = np.sqrt(np.mean(voice[np.abs(voice) > 0.02] ** 2))

# duck envelope: speech activity, held 0.5 s through word gaps, smoothed
act = maximum_filter1d((np.abs(voice) > 0.03).astype(float), size=int(0.5 * SR))
act = uniform_filter1d(act, size=int(0.12 * SR))

fol = np.zeros((N, 2)); trans = np.zeros((N, 2))   # trans = transients that escape the duck
if not SYNTH:
    words = uniform_filter1d((np.abs(voice) > 0.03).astype(float), size=int(0.03 * SR))   # words themselves, not the held duck
    fol, trans, CUES = foley.place(EV, N, words)
    fol = fol.astype(np.float64); trans = trans.astype(np.float64)
for e in EV:
    if not SYNTH and e['type'] not in foley.SYNTH_ONLY: continue
    t, typ = e['t'], e['type']; t1 = e.get('t1', t)
    if typ in ('scramble', 'roll'):                    # rolls tick at frame rate
        k = 0
        for f in np.arange(t, t1, 1 / 24):
            put(fol, tick(0.5 + 0.5 * rng.random()), f, 0.10, rng.uniform(-0.4, 0.4)); k += 1
        if e.get('count'): continue
    elif typ == 'lock':
        a, b, c = lock(1.0 if not e.get('first') else 1.25)
        put(trans, a, t, 0.55); put(trans, b, t, 0.22); put(trans, c, t + 0.01, 0.14)
    elif typ == 'confirm':
        put(trans, confirm(1.0, 0.9 if e.get('final') else 0.5), t, 0.16 if not e.get('hard') else 0.22)
    elif typ == 'shrink': put(fol, whoosh(0.4, 1.0, False), t, 0.10)
    elif typ == 'scan':
        d = t1 - t; n = int(d * SR); x = nz(d); out = np.zeros(n); seg = 48
        for i in range(seg):
            a, b = i * n // seg, (i + 1) * n // seg; fc = 400 * (10 ** (i / seg))
            out[a:b] = sosfilt(sos('band', [fc * 0.7, fc * 1.3]), x[max(0, a - 2000):b])[-(b - a):]
        put(fol, out * np.sin(np.pi * np.linspace(0, 1, n)), t, 0.07)
        put(fol, glide(64, 76, d, 0.5), t, 0.05)
    elif typ == 'slide': put(fol, servo(0.6, 1.0), t, 0.12, -0.2); put(fol, puff(), t + 0.55, 0.12, 0.2)
    elif typ == 'close': put(fol, servo(0.5, 1.0, False), t, 0.10, 0.2); put(trans, puff(), t + 0.45, 0.12, -0.2)
    elif typ == 'probe': put(fol, glide(79, 83, 0.6, 1.0), t, 0.06)
    elif typ == 'deny': put(fol, np.concatenate([blip(76, 0.09), np.zeros(int(0.04 * SR)), blip(72, 0.12)]), t, 0.12)
    elif typ == 'card': put(fol, whoosh(0.3, 0.8), t, 0.07); put(fol, tick(1.0), t + 0.25, 0.15)
    elif typ in ('pulse', 'wifi'): put(fol, blip(88 if e.get('dir', 1) > 0 else 83, 0.08, 1.2), t, 0.07, 0.3 * e.get('dir', 1))
    elif typ == 'off': put(fol, glide(83, 64, 0.18, 1.0), t, 0.09, rng.uniform(-0.3, 0.3)); put(fol, tick(1.0), t, 0.12)
    elif typ == 'cta': a, b, c = lock(1.1); put(trans, a, t, 0.5); put(trans, b, t, 0.2); put(trans, confirm(1.0, 0.8), t + 0.4, 0.18)
    elif typ == 'error':
        d = t1 - t; tq = tt(d); x = np.sin(2 * np.pi * (hz(81) + 9 * np.sin(2 * np.pi * 6 * tq) * tq / d) * tq) * np.minimum(1, tq / 0.2) * np.minimum(1, (d - tq) / 0.2)
        put(fol, x, t, 0.035)
    elif typ == 'dock': put(fol, clack(0.7), t + 0.25, 0.12, -0.5); put(fol, whoosh(0.25, 0.6, False), t, 0.05, -0.4)
    elif typ == 'whip': put(fol, whoosh(0.5, 1.0), t, 0.13)
    elif typ == 'draw': put(fol, glide(64, 71, t1 - t, 0.6), t, 0.035)
    elif typ == 'sweep': put(fol, glide(71, 71.6, t1 - t, 0.8), t, 0.05)   # the voltage "barely moves": so does the pitch
    elif typ == 'merge': put(fol, blip(76, 0.12, 0.8), t, 0.08, -0.4); put(fol, blip(83, 0.12, 0.8), t + 0.12, 0.08, -0.2); put(trans, confirm(0.8, 0.6), t + 0.5, 0.1)
    elif typ == 'flag':
        for k, f in enumerate(np.arange(t, t1, 0.5)): put(fol, np.sign(np.sin(2 * np.pi * 988 * tt(0.07))) * env(0.07, 0.03), f, 0.03)
    elif typ == 'glitch':
        d = 0.125; x = crush(sosfilt(sos('band', [300, 6000]), nz(d)) * 0.7 + 0.6 * np.sign(np.sin(2 * np.pi * hz(52) * tt(d))), 3, 9)
        put(trans, x * np.minimum(1, (d - tt(d)) / 0.01), t, 0.22)
    elif typ == 'frost': put(fol, sosfilt(sos('high', 5500), nz(0.9)) * env(0.9, 0.35), t, 0.06, 0.3); put(fol, blip(95, 0.05), t + 0.05, 0.05)
    elif typ == 'powerloss': put(trans, glide(88, 40, 0.45, 1.0), t, 0.18); put(trans, thump(0.8, 50), t + 0.35, 0.4)
    elif typ == 'marker': put(trans, blip(83, 0.15, 0.4), t, 0.1)
    elif typ == 'ignite':
        d = 1.1; tq = tt(d); f = hz(52) * 2 ** (2 * tq / d); x = np.sin(2 * np.pi * np.cumsum(f) / SR + 2 * np.sin(2 * np.pi * np.cumsum(f * 2) / SR))
        put(fol, x * np.minimum(1, tq / 0.5) * env(d, 0.6), t - 0.5, 0.06)
        put(trans, sosfilt(sos('low', 2500), nz(0.8)) * env(0.8, 0.12), t, 0.18)
    elif typ == 'erase':
        d = t1 - t; put(fol, whoosh(d, 0.9, False), t, 0.08)

# ---------------------------------------------------------------- ambience: projector hum 40/80/120 Hz + room tone (off in the silence and during the power-down)
amb = np.zeros((N, 2)); ta = np.arange(N) / SR
hum = 0.5 * np.sin(2 * np.pi * 40 * ta) + 0.35 * np.sin(2 * np.pi * 80 * ta) + 0.25 * np.sin(2 * np.pi * 120 * ta)
room = sosfilt(sos('band', [150, 2500]), rng.standard_normal(N)) * 0.25
sil = next((e for e in EV if e['type'] == 'silence'), None); S0, S1 = (sil['t'], sil['t1']) if sil else (0, 0)
ign = next((e['t'] for e in EV if e['type'] == 'ignite'), None)
lvl = np.ones(N)
if sil:
    end = ign if ign and ign > S1 else S1
    lvl[int(S0 * SR):int(end * SR)] = 0.0
    if end > S1:
        ramp = int(min(0.6, end - S1) * SR); i1 = int(end * SR); lvl[i1 - ramp:i1] = np.linspace(0, 1, ramp)
        lvl[int(S1 * SR):i1 - ramp] = 0.35               # only low room tone under the turn
amb[:, 0] = (hum * 0.04 + room * 0.03) * lvl; amb[:, 1] = (hum * 0.04 + room * 0.028) * lvl

music, _ = sf.read(os.path.join(HERE, 'music', 'score.wav'), dtype='float32')
music = music[:N] if len(music) >= N else np.vstack([music, np.zeros((N - len(music), 2))])
mr = np.sqrt(np.mean(music[act < 0.1] ** 2)) + 1e-9
music = music * (vr * db(-10) / mr) * 1.0                 # music, measured where nobody speaks, sits ~10 dB under the voice
music = music * db(-8 * act)[:, None]                     # and ducks a further 8 dB under speech
fol = fol * db(-7 * act)[:, None]
sfx_only = fol + trans

mixd = music + fol + trans + amb
mixd[:, 0] += voice; mixd[:, 1] += voice
s0, s1 = int(S0 * SR), int(S1 * SR); mixd[s0:s1] = 0      # true digital silence
# makeup gain into a look-ahead limiter: the master then needs only a small linear loudness gain (crest ≤ 12 dB keeps loudnorm linear)
vdb = 20 * np.log10(np.sqrt(np.mean(voice[act > 0.5] ** 2)) + 1e-12)
mixd = mixd * db(-17.5 - vdb)                             # voice at about -17.5 dB RMS: lands near -14 LUFS with a small linear master gain
mixd = np.stack([limit(mixd[:, 0], 0.8), limit(mixd[:, 1], 0.8)], 1); mixd[s0:s1] = 0
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, OUTF), mixd, SR, subtype='PCM_24')
sf.write(os.path.join(HERE, 'out', 'sfx' + ('_synth' if SYNTH else '') + '.wav'), sfx_only * db(-17.5 - vdb), SR, subtype='PCM_24')
if not SYNTH:
    json.dump(CUES, open(os.path.join(HERE, 'out', 'foley_cues.json'), 'w'), indent=1)
    print(foley.report(CUES, DUR))

# report: levels per stem and low-end balance
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
full = mixd.mean(1); low = sosfilt(sos('band', [20, 120], 4), full); rest = sosfilt(sos('high', 120, 4), full)
print(f'voice {rms_db(voice[act > 0.5]):.1f} dB, music(under speech) {rms_db(music[act > 0.5]):.1f} dB, music(alone) {rms_db(music[act < 0.1]):.1f} dB')
print(f'low end 20–120 Hz vs rest: {rms_db(low) - rms_db(rest):+.1f} dB; peak {np.abs(mixd).max():.2f}' + (f'; silence max {np.abs(mixd[s0:s1]).max():.1e}' if sil else ''))
