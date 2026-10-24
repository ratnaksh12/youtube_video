"""Build the reel kit's sound-effect library → kit/audio/sfx/*.flac + manifest.json.

Two sources, both usable offline and both cleared for commercial use:
  • earshot's bank (github.com/Leonxlnx/earshot, MIT): 252 effects stored as code (no recordings, no models). Rendered
    here at fixed seeds; tonal ones are tuned to the score's key (E minor) so chimes and pops sit in the music.
  • uisfx (shipped with Clipwing's real-sfx skill; github.com/romainsimon/uisfx): real UI recordings, CC0. The sci-fi
    pack matches the Hologram HUD look.

  ~/tools/earshot/.venv/bin/python kit/audio/sfxlib.py --uisfx <path to uisfx/sounds>
The rendered files are committed, so mixing a reel needs neither earshot nor uisfx.
"""
import argparse, json, os, subprocess, sys
import numpy as np
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'sfx')
SR = 48000

# name: (earshot id, seeds, pitch or None, role)   role = the level family the mixer uses (real-sfx's role targets)
EARSHOT = {
    'tick':        ('pro_hover_tick/ping', [0, 1, 2], None, 'data'),
    'tink':        ('pro_click/tink', [0, 1], None, 'click'),
    'click':       ('fit/click/floss_lid', [0], None, 'click'),
    'knock':       ('knock/wood', [0, 1], None, 'foley'),
    'land':        ('pro_pop_in/round', [0, 1], None, 'pop'),
    'whoosh':      ('whoosh_fast/crisp', [0, 1], None, 'whoosh'),
    'swish':       ('swish/bright', [0, 1], None, 'whoosh'),
    'swish_soft':  ('swish/soft', [0], None, 'whoosh'),
    'swipe':       ('swipe/paper', [0], None, 'whoosh'),
    'swipe_soft':  ('swipe/velvet', [0], None, 'whoosh'),
    'thump':       ('whoosh_big/thump', [0], None, 'whoosh'),
    'swell':       ('reverse_swell/dark', [0], None, 'riser'),
    'riser':       ('riser/dark', [0], None, 'riser'),
    'hit':         ('cut_hit/punch', [0], None, 'hit'),
    'kick':        ('cut_hit/kick', [0], None, 'hit'),
    'glitch':      ('glitch/burst', [0, 1], None, 'glitch'),
    'glitch_mid':  ('glitch/mid', [0], None, 'glitch'),
    'shutter':     ('shutter/dslr', [0], None, 'camera'),
    'mirror':      ('shutter/mirror', [0], None, 'camera'),
    'ding':        ('notify/mid_tine', [0], None, 'chime'),
    'fall':        ('downlifter/tape', [0], None, 'riser'),
    'shimmer':     ('pro_shimmer/m1', [0], None, 'chime'),     # m3 rings (comb) in its tail
}
# tuned families: E minor pentatonic (E G A B D), the score's key
TUNED = {
    'chime': ('mallet/glock', ['E5', 'G5', 'A5', 'B5', 'D6', 'E6'], 'chime'),
    'pop':   ('ui_pop/soft', ['E5', 'G5', 'B5'], 'pop'),
    'blip':  ('ui_pop/blip', [('E5', 747.3), ('B5', 1116.7)], 'data'),   # this member reads 212 cents flat of its knob: aim above
    'flourish': ('mallet/flourish', ['E5'], 'chime'),
}
UISFX = {   # name: (pack, file, role)
    'ui_lock': ('scifi', 'lock', 'ui'), 'ui_unlock': ('scifi', 'unlock', 'ui'), 'ui_select': ('scifi', 'select', 'ui'),
    'ui_open': ('scifi', 'open', 'ui'), 'ui_expand': ('scifi', 'expand', 'ui'), 'ui_collapse': ('scifi', 'collapse', 'ui'),
    'ui_close': ('scifi', 'close', 'ui'), 'ui_on': ('scifi', 'toggle-on', 'ui'), 'ui_off': ('scifi', 'toggle-off', 'ui'),
    'ui_success': ('scifi', 'success', 'ui'), 'ui_complete': ('scifi', 'complete', 'ui'), 'ui_error': ('scifi', 'error', 'error'),
    'ui_warning': ('scifi', 'warning', 'error'), 'ui_blocked': ('scifi', 'blocked', 'error'), 'ui_step': ('scifi', 'progress-step', 'data'),
    'ui_connect': ('scifi', 'connect', 'ui'), 'ui_scan': ('scifi', 'scanning', 'scifi'), 'ui_snap': ('scifi', 'snap', 'ui'),
    'ui_notify': ('scifi', 'notification', 'ui'), 'ui_swipe': ('scifi', 'swipe', 'ui'), 'ui_focus': ('scifi', 'focus', 'ui'),
    'ui_info': ('scifi', 'info', 'ui'), 'ui_wake': ('scifi', 'wake', 'scifi'), 'ui_sleep': ('scifi', 'sleep', 'scifi'),
    'ui_levelup': ('scifi', 'level-up', 'ui'), 'ui_press': ('scifi', 'press', 'ui'), 'ui_start': ('scifi', 'start', 'ui'),
}


def times(y):
    """onset (first 1 ms frame within 30 dB of the max), peak (loudest 5 ms), end (last 5 ms within 50 dB), like earshot's meta"""
    m = np.abs(y if y.ndim == 1 else y.max(1))
    h = int(0.001 * SR); env = np.array([m[i:i + h].max() for i in range(0, len(m) - h, h)]) + 1e-12
    db = 20 * np.log10(env / env.max())
    on = int(np.argmax(db > -30)) * 0.001
    w = int(0.005 * SR); r = np.convolve(m ** 2, np.ones(w) / w, 'same'); pk = int(np.argmax(r)) / SR
    above = np.where(db > -50)[0]; end = (above[-1] + 5) * 0.001 if len(above) else len(m) / SR
    return round(on, 4), round(pk, 4), round(min(end, len(m) / SR), 4)


def write(name, y, meta):
    y = np.asarray(y, np.float32)
    if y.ndim == 2 and y.shape[1] == 1: y = y[:, 0]
    p = os.path.join(OUT, name + '.flac'); sf.write(p, y, SR, subtype='PCM_24')
    on, pk, end = times(y)
    meta.update({'file': name + '.flac', 'dur_s': round(len(y) / SR, 4), 'onset_s': on, 'peak_s': pk, 'end_s': end, 'channels': 1 if y.ndim == 1 else y.shape[1]})
    return meta


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--uisfx', required=True); a = ap.parse_args()
    from earshot.forge import bank
    os.makedirs(OUT, exist_ok=True)
    man = {'sr': SR, 'bank': bank.VERSION, 'sounds': {}}
    def add(name, take): man['sounds'].setdefault(name, []).append(take)
    for name, (sid, seeds, pitch, role) in EARSHOT.items():
        e = bank.get(sid)
        for k, s in enumerate(seeds):
            y, m = bank.render(sid, seed=(e['seed'] + s), pitch=pitch)
            ok = (m.get('checks') or {}).get('ok', True)
            add(name, write(f'{name}_{k}', y, {'src': 'earshot', 'id': sid, 'seed': int(e['seed'] + s), 'role': role, 'audit_ok': bool(ok), 'licence': 'MIT (earshot bank, rendered from code)'}))
    for name, (sid, pitches, role) in TUNED.items():
        e = bank.get(sid)
        for p in pitches:
            note, hz = p if isinstance(p, tuple) else (p, p)
            y, m = bank.render(sid, pitch=hz)
            add(name, write(f'{name}_{note}', y, {'src': 'earshot', 'id': sid, 'seed': int(e['seed']), 'pitch': note, 'role': role, 'audit_ok': bool((m.get('checks') or {}).get('ok', True)), 'licence': 'MIT (earshot bank, rendered from code)'}))
    for name, (pack, f, role) in UISFX.items():
        src = os.path.join(a.uisfx, pack, f + '.mp3')
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
        y = np.frombuffer(raw, np.float32).copy()
        nz = np.where(np.abs(y) > np.abs(y).max() * 10 ** (-50 / 20))[0]
        y = y[max(0, nz[0] - 48):nz[-1] + 480] if len(nz) else y               # trim pack padding (real-sfx: "pack files with silence")
        y = 0.89 * y / (np.abs(y).max() + 1e-9)
        add(name, write(name, y, {'src': 'uisfx', 'pack': pack, 'name': f, 'role': role, 'licence': 'CC0-1.0 (uisfx sounds)'}))
    json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
    n = sum(len(v) for v in man['sounds'].values()); bad = [t['file'] for v in man['sounds'].values() for t in v if t.get('audit_ok') is False]
    print(f'{len(man["sounds"])} sounds, {n} takes → {OUT}; earshot audit warnings: {bad or "none"}')


if __name__ == '__main__':
    main()
