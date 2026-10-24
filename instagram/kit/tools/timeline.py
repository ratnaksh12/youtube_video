"""Place a reel's voice lines on the 120 BPM grid and estimate word times → <reel>/timeline.json.

  python kit/tools/timeline.py <reel folder>
script.json lines may set "gap" (minimum silence before the line, default 0.3 s) and "snap": false (don't move the first word onto a beat).
"""
import json, os, re, sys
import soundfile as sf
KIT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(KIT, '..', '..', 'narration'))   # the repo's narration/make_voiceover.py
import make_voiceover as MV                                       # place_words: pause-aware word timing

REEL = os.path.abspath(sys.argv[1])
BPM = 120; BEAT = 60 / BPM; START = 0.30; TAIL = 2.0
script = json.load(open(os.path.join(REEL, 'script.json')))
lines = []
for i, L in enumerate(script):
    a, sr = sf.read(os.path.join(REEL, 'voice', L['id'] + '.wav'), dtype='float32')
    t = START
    if i:
        t = lines[-1]['t1'] + L.get('gap', 0.3)
        if L.get('snap', True): t = -(-t // BEAT) * BEAT
    dur = len(a) / sr
    toks = L['text'].split()
    placed = MV.place_words(re.sub(r'[.?!](?=\s)', ',', L['text']), a)   # sentence ends inside a line are clause breaks too
    words = [dict(w, word=tok) for w, tok in zip(placed, toks) if tok not in ('—', '–')]
    lines.append({'id': L['id'], 't0': round(t, 3), 't1': round(t + dur, 3), 'text': L['text'], 'sub': L['sub'],
                  'words': [{'w': w['word'], 't0': round(t + w['start'], 3), 't1': round(t + w['end'], 3)} for w in words]})
tail = script[-1].get('tail', TAIL)
dur = round(-(-(lines[-1]['t1'] + tail) // BEAT) * BEAT, 3)
json.dump({'bpm': BPM, 'beat': BEAT, 'dur': dur, 'lines': lines}, open(os.path.join(REEL, 'timeline.json'), 'w'), indent=1)
for L in lines: print(f"{L['id']} {L['t0']:6.2f}-{L['t1']:6.2f}  {L['sub']}")
print('dur', dur)
