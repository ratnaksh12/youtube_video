"""Sound effects for a reel from real and designed sounds (kit/audio/sfx: earshot's bank, MIT, and uisfx recordings, CC0),
placed on the reel's events (events.json) by rules measured on finished films:

  • where a sound sits against its moment (earshot's launch kit): clicks lead by 11 ms, knocks by 40, chimes by 20;
    pops land 4 ms after; a whoosh's loudest point lands 37 ms after its cut, a swell's 42; a riser peaks 23 ms before
  • how loud each kind is (real-sfx's role peak targets), then 4–8 dB lower because the voice carries these films
    (real-sfx recipe 6), with accents on a bus that escapes the voice duck
  • runs keep earshot's minimum gaps (ticks 66 ms, pops 114 ms) and alternate takes and pitch (0, −2, +2, −3, +1, −1 st)
  • a sound that lands on speech is high-passed at 400 Hz (real-sfx masking rule); one sound per appearance, not three
  • tonal sounds are in the score's key (E minor): chimes walk E G A B D, pops and blips sit on E / G / B

place(EV, N, act) → (fol, trans, cues); act = where words are being spoken (0–1 per sample); fol is ducked under the
voice by the mixer, trans is not.
"""
import json, os
import numpy as np
import soundfile as sf
import soxr
from scipy.signal import butter, sosfilt

SR = 48000
LIB = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sfx')
ROLE_PEAK = {'hit': -4, 'whoosh': -9, 'riser': -12, 'glitch': -12, 'error': -10, 'click': -14, 'ui': -14, 'data': -14,
             'camera': -10, 'foley': -12, 'scifi': -12, 'pop': -14, 'chime': -13}            # real-sfx ROLE_TARGET_PEAK_DB
VOICE_LED = {'whoosh': -2, 'ui': 0, 'data': -2, 'click': +3, 'pop': -1, 'camera': -6, 'foley': -5, 'scifi': -6,
             'error': -3, 'chime': -3, 'hit': -4, 'glitch': -3, 'riser': +1}                # voice carries the film; short
# transients (click, data, ui) read quieter than their peak, so they get back what the peak rule takes (measured: bed.py)
REF = -3.4          # the voice's peak in the mixer's scale sits ~3.4 dB under where real-sfx's targets assume it
PITCH_WALK = [0, -2, 2, -3, 1, -1]
CHIMES = ['E5', 'G5', 'A5', 'B5', 'D6']


class Lib:
    def __init__(self):
        self.man = json.load(open(os.path.join(LIB, 'manifest.json')))['sounds']
        self.cache = {}

    def take(self, name, k=0):
        takes = self.man[name]; m = takes[k % len(takes)]
        if m['file'] not in self.cache:
            y, sr = sf.read(os.path.join(LIB, m['file']), dtype='float32'); assert sr == SR
            self.cache[m['file']] = y
        return self.cache[m['file']], m

    def pick(self, name, note):
        for k, m in enumerate(self.man[name]):
            if m.get('pitch') == note: return self.take(name, k)
        return self.take(name, 0)


def _hp(y, f=400):
    return sosfilt(butter(2, f, 'high', fs=SR, output='sos'), y, axis=0).astype(np.float32)


def place(EV, N, act, seed=31):
    L = Lib(); rng = np.random.default_rng(seed)
    fol = np.zeros((N, 2), np.float32); trans = np.zeros((N, 2), np.float32); cues = []
    counters = {}
    accents = sorted(e['t'] for e in EV if e['type'] in ('lock', 'confirm', 'cta', 'glitch'))

    def nxt(key):
        counters[key] = counters.get(key, -1) + 1; return counters[key]

    def add(name, t, anchor='onset', off_ms=0.0, gain=0.0, pan=0.0, bus='fol', k=None, note=None, st=0, max_dur=None, role=None, label=''):
        y, m = L.pick(name, note) if note else L.take(name, nxt(name) if k is None else k)
        role = role or m['role']
        y = y.copy()
        if st: y = soxr.resample(y, SR, SR / 2 ** (st / 12)).astype(np.float32)
        r = 2 ** (-st / 12)
        if max_dur and len(y) > max_dur * SR:                        # trim with a short fade (looping signals, long tails)
            n = int(max_dur * SR); f = min(int(0.08 * SR), n // 3)
            y = y[:n]; y[-f:] *= np.linspace(1, 0, f)[:, None] if y.ndim == 2 else np.linspace(1, 0, f)
        a = (m['peak_s'] if anchor == 'peak' else m['onset_s']) * r
        start = t + off_ms / 1000 - a
        target = ROLE_PEAK.get(role, -12) + VOICE_LED.get(role, -5) + REF + gain
        y = y * (10 ** (target / 20) / (np.abs(y).max() + 1e-9))
        s0 = max(0, int(round(start * SR))); s1 = min(N, s0 + len(y))
        masked = bus == 'fol' and s1 > s0 and float(np.mean(act[s0:s1] > 0.5)) > 0.3
        if masked: y = _hp(y) * 10 ** (-2 / 20)                     # on top of speech: get out of its way
        if y.ndim == 1: y = np.stack([y * np.cos((pan + 1) * np.pi / 4), y * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
        buf = trans if bus == 'trans' else fol
        i0 = int(round(start * SR)); y2 = y
        if i0 < 0: y2 = y[-i0:]; i0 = 0
        e = min(N, i0 + len(y2))
        if e > i0: buf[i0:e] += y2[:e - i0]
        cues.append({'t': round(t, 3), 'sound': m['file'], 'role': role, 'start': round(start, 3), 'peak_dbfs': round(target - (2 if masked else 0), 1),
                     'masked_hp': masked, 'bus': bus, 'event': label})

    def run(name, t0, t1, gap, gain, label):                      # ticks in a run: earshot's minimum gap, never on top of an accent
        t = t0
        while t < t1 - 0.05:
            if not any(abs(t - a) < 0.07 for a in accents):
                add(name, t, gain=gain, pan=0.35 * (1 if nxt('tickpan') % 2 else -1), label=label)
            t += gap

    for e in EV:
        t, typ = e['t'], e['type']; t1 = e.get('t1', t)
        if typ == 'scramble': run('tick', t, t1, 1 / 12, -2, typ)
        elif typ == 'roll':
            if t1 - t < 0.22: add('tink', t, gain=-2, label=typ)
            else: run('tick', t, t1, 0.125 if e.get('count') else 1 / 12, -4 if e.get('count') else -2, typ)
        elif typ == 'lock':
            add('ui_lock', t, gain=+1, bus='trans', label=typ)
            add('shutter', t, off_ms=9, gain=-5, label=typ)
            if e.get('first'): add('chime', t, off_ms=-20, note='E5', gain=+2, bus='trans', label='lock (first after silence)')
        elif typ == 'confirm':
            if e.get('final'):
                for i, n in enumerate(['E5', 'G5', 'B5', 'E6']): add('chime', t + i * 0.11, off_ms=-20, note=n, gain=-1 + i * 0.5, pan=-0.4 + i * 0.27, bus='trans', label='final run')
                add('ui_success', t + 0.05, gain=-3, label='final')
            elif e.get('hard'):
                add('chime', t, off_ms=-20, note='E6', gain=+1, bus='trans', label='confirm (hard)'); add('knock', t, off_ms=-40, gain=-2, label=typ)
            else:
                add('chime', t, off_ms=-20, note=CHIMES[nxt('chime_walk') % len(CHIMES)], bus='trans', label=typ)
        elif typ == 'shrink': add('swish_soft', t + 0.2, anchor='peak', off_ms=37, gain=-3, label=typ)
        elif typ == 'scan': add('ui_scan', t, gain=-2, max_dur=t1 - t + 0.1, label=typ)
        elif typ == 'slide': add('swipe', t + 0.35, anchor='peak', off_ms=37, label=typ); add('mirror', t + 0.62, off_ms=9, gain=-2, label='latch')
        elif typ == 'close': add('swipe_soft', t + 0.3, anchor='peak', off_ms=37, label=typ); add('ui_snap', t + 0.47, gain=-1, label='latch')
        elif typ == 'probe': add('ui_focus', t, label=typ)
        elif typ == 'deny': add('ui_blocked', t, gain=-1, label=typ)
        elif typ == 'card': add('ui_expand', t, gain=-2, label=typ)
        elif typ in ('pulse', 'wifi'):
            if typ == 'wifi' and nxt('wifi_first') == 0: add('ui_connect', t, gain=-2, label='wifi connect')
            add('blip', t, note='E5' if e.get('dir', 1) > 0 else 'B5', gain=-1, pan=0.3 * e.get('dir', 1), label=typ)
        elif typ == 'error': add('ui_warning', t, gain=-3, label=typ)
        elif typ == 'dock': add('pop', t + 0.25, off_ms=4, note=['E5', 'G5', 'B5'][nxt('dock') % 3], gain=-1, pan=-0.4, label=typ)
        elif typ == 'whip': add('whoosh', t + 0.4, anchor='peak', off_ms=37, gain=+1, label=typ)
        elif typ == 'merge': add('flourish', t + 0.4, off_ms=-20, bus='trans', label=typ)
        elif typ == 'flag':
            for i, f in enumerate(np.arange(t, t1, 1.0)): add('ui_warning', f, gain=-4 - 2 * i, label=typ)
        elif typ == 'glitch': add('glitch', t, gain=+1, bus='trans', label=typ)
        elif typ == 'frost': add('shimmer', t, gain=-4, pan=0.3, label=typ)
        elif typ == 'powerloss': add('fall', t, gain=+1, bus='trans', label=typ); add('ui_sleep', t + 0.05, gain=-2, label=typ)
        elif typ == 'marker': add('ui_info', t, bus='trans', label=typ)
        elif typ == 'ignite':
            add('swell', t, anchor='peak', off_ms=42, label='ignite swell')                 # a reverse swell into the reveal
            add('chime', t, off_ms=-20, note='E6', gain=+1, bus='trans', label='ignite accent')   # product films: a bright accent, no sub drop
            add('ui_wake', t + 0.12, gain=-2, label='ignite power-on')
        elif typ == 'hover': add('tink', t, off_ms=-11, gain=-3, pan=0.2 * (1 if nxt('hover') % 2 else -1), label=typ)
        elif typ == 'erase': add('swipe_soft', (t + t1) / 2, anchor='peak', off_ms=37, gain=-2, label=typ)
        elif typ == 'off':
            add('ui_off', t, st=PITCH_WALK[nxt('off') % len(PITCH_WALK)], gain=-1, pan=rng.uniform(-0.3, 0.3), label=typ)
        elif typ == 'cta':
            add('ui_lock', t, gain=+2, bus='trans', label=typ); add('knock', t, off_ms=-40, gain=-1, label=typ)
    return fol, trans, cues


SYNTH_ONLY = {'draw', 'sweep'}       # designed gestures the library doesn't replace: the mixer keeps its own glides for these


def report(cues, dur, act_frac=None):
    """real-sfx's measured norms: a sound in the first 2 s, gestures per 10 s (a run with no 0.25 s pause = one gesture), longest gap"""
    ts = sorted(c['start'] for c in cues)
    if not ts: return 'no cues'
    g = [ts[0]]
    for x in ts[1:]:
        if x - g[-1] > 0.25: g.append(x)
    gaps = np.diff([0.0] + g + [dur]) if g else [dur]
    masked = sum(c['masked_hp'] for c in cues)
    return (f'{len(cues)} sounds, {len(g)} gestures ({10 * len(g) / dur:.1f} per 10 s; references ~15 incl. music), first at {ts[0]:.2f} s, '
            f'longest gap {max(gaps):.1f} s (references: ≤ 3.2 s), high-passed under speech: {masked}')
