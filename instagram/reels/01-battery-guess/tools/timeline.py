"""Place every voice line on the 120 BPM grid and estimate word times -> timeline.json (read by the page, the score and the mix).

  python tools/timeline.py          # from the project folder, after core/tts/tts.py has written voice/*.wav
"""
import json, os, re, sys
import soundfile as sf
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(HERE, '..', '..', '..', 'narration'))   # the repo's narration/make_voiceover.py
import make_voiceover as MV                                              # place_words: pause-aware word timing

BPM = 120
BEAT = 60 / BPM
START = 0.30                         # the first word lands at frame ~7; the number is already on screen at frame 0
GAP = {'l02': 0.12, 'l03': 0.35, 'l04': 0.35, 'l05': 0.2, 'l06': 0.2, 'l07': 0.3, 'l08': 0.35,
       'l09': 0.35, 'l10': 0.25, 'l11': 1.1, 'l12': 0.55, 'l13': 0.5}   # minimum silence before each line
SNAP = {'l03', 'l04', 'l06', 'l07', 'l08', 'l09', 'l10', 'l11', 'l12', 'l13'}   # lines whose first word lands on a beat
TAIL = 2.0

script = json.load(open(os.path.join(HERE, 'script.json')))
lines, t = [], START
for i, L in enumerate(script):
    a, sr = sf.read(os.path.join(HERE, 'voice', L['id'] + '.wav'), dtype='float32')
    if i:
        t = lines[-1]['t1'] + GAP[L['id']]
        if L['id'] in SNAP:
            t = -(-t // BEAT) * BEAT            # up to the next beat
    dur = len(a) / sr
    # sentence ends inside a line are clause breaks too (place_words only snaps at , ; : and dashes)
    toks = L['text'].split()
    placed = MV.place_words(re.sub(r'[.?!](?=\s)', ',', L['text']), a)
    words = [dict(w, word=tok) for w, tok in zip(placed, toks) if tok not in ('—', '–')]
    lines.append({'id': L['id'], 't0': round(t, 3), 't1': round(t + dur, 3), 'text': L['text'], 'sub': L['sub'],
                  'words': [{'w': w['word'], 't0': round(t + w['start'], 3), 't1': round(t + w['end'], 3)} for w in words]})
dur = round(-(-(lines[-1]['t1'] + TAIL) // BEAT) * BEAT, 3)
json.dump({'bpm': BPM, 'beat': BEAT, 'dur': dur, 'lines': lines}, open(os.path.join(HERE, 'timeline.json'), 'w'), indent=1)
for L in lines:
    print(f"{L['id']} {L['t0']:6.2f}-{L['t1']:6.2f}  bar {L['t0'] / (4 * BEAT) + 1:5.2f}  {L['sub']}")
print('dur', dur)
