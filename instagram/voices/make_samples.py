"""Render one tech-reel sample per English Kokoro voice (+ the channel's existing blend) -> MP3s and one numbered reel.

  python3 make_samples.py instagram/voices /tmp/wav_scratch     # needs the Kokoro v1.0 files in /home/user/tts_models
"""
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

OUT, TMP = sys.argv[1], sys.argv[2]
k = Kokoro('/home/user/tts_models/kokoro-v1.0.onnx', '/home/user/tts_models/voices-v1.0.bin')
SR = 24000
LINE = ("Stop scrolling. Your phone has a hidden AI feature that most people never find, "
        "and it takes ten seconds to turn on. Here's how.")
NAMES = {'af': 'American female', 'am': 'American male', 'bf': 'British female', 'bm': 'British male'}
voices = [v for v in k.get_voices() if v[:2] in NAMES]
cast = [(v, NAMES[v[:2]], k.get_voice_style(v)) for v in voices]
cast.append(('blend_michael_onyx', 'American male (your current channel voice: 65% michael + 35% onyx)',
             0.65 * k.get_voice_style('am_michael') + 0.35 * k.get_voice_style('am_onyx')))
meta, reel = [], []
for n, (vid, accent, style) in enumerate(cast, 1):
    a, sr = k.create(f"Voice {n}. " + LINE, voice=style, speed=1.08, lang='en-gb' if vid[:1] == 'b' else 'en-us')
    a = a.astype(np.float32)
    nz = np.where(np.abs(a) > 0.01)[0]
    a = a[max(0, nz[0] - 720): nz[-1] + 2400]
    a = 0.89 * a / (np.abs(a).max() + 1e-9)
    wav = os.path.join(TMP, f'{n:02d}_{vid}.wav'); sf.write(wav, a, SR)
    mp3 = os.path.join(OUT, f'{n:02d}_{vid}.mp3')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-ac', '1', '-b:a', '96k', mp3], check=True)
    reel += [a, np.zeros(int(0.7 * SR), np.float32)]
    meta.append({'n': n, 'id': vid, 'accent': accent, 'seconds': round(len(a) / SR, 2), 'file': os.path.basename(mp3)})
    print(n, vid, meta[-1]['seconds'], flush=True)
wav = os.path.join(TMP, 'ALL.wav'); sf.write(wav, np.concatenate(reel), SR)
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-ac', '1', '-b:a', '96k', os.path.join(OUT, '00_all_voices_reel.mp3')], check=True)
json.dump({'line': LINE, 'speed': 1.08, 'voices': meta}, open(os.path.join(OUT, 'voices.json'), 'w'), indent=1)
print('done', len(meta))
