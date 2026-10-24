"""Median pitch (Hz) and speaking rate (words/min) for each rendered sample; adds both to voices.json.

  python3 voice_stats.py instagram/voices /tmp/wav_scratch      # the WAVs make_samples.py left in its scratch dir
"""
import json, sys, os
import numpy as np, librosa
d = sys.argv[1]; tmp = sys.argv[2]
meta = json.load(open(os.path.join(d, 'voices.json')))
nwords = len(("Voice 1. " + meta['line']).split())
for v in meta['voices']:
    y, sr = librosa.load(os.path.join(tmp, v['file'].replace('.mp3', '.wav')), sr=16000)
    f0, vf, _ = librosa.pyin(y, fmin=60, fmax=400, sr=sr, frame_length=1024)
    f0 = f0[vf & ~np.isnan(f0)]
    v['pitch_hz'] = int(np.median(f0)); v['wpm'] = int(round(nwords / v['seconds'] * 60))
    print(v['n'], v['id'], v['pitch_hz'], v['wpm'], flush=True)
json.dump(meta, open(os.path.join(d, 'voices.json'), 'w'), indent=1)
