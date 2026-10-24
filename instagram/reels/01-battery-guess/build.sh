#!/bin/sh
# Rebuild the reel from source: model → voice → timeline → events → score → mix → frames → master → subtitles.
#   LIB=/path/to/lemo-opuscar sh build.sh
# Needs: the Lemo-Opuscar library with its .venv (numpy, scipy, soundfile, soxr, kokoro-onnx) and the Kokoro model in core/tts/,
# Node 20+, ffmpeg, and a Chrome headless shell (PLAYWRIGHT_CHROME=… if playwright can't find one).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/home/user/lemomo-ai/lemo-opuscar}; export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "set LIB to the Lemo-Opuscar library folder"; exit 1; }
PY="$LIB/.venv/bin/python"
cd "$HERE"
node models/gen_phone.mjs
python3 -c "import json; s=json.load(open('script.json')); json.dump([{'id':l['id'],'text':l['text'],'voice':'am_michael','speed':1.1} for l in s], open('voice/lines.json','w'), indent=1)"
(cd "$LIB" && "$PY" core/tts/tts.py "$HERE/voice/lines.json" "$HERE/voice")
"$PY" tools/timeline.py
(cd "$LIB" && node core/render/events.mjs "$HERE" --size 1080x1920)
"$PY" music/score.py
"$PY" mix.py
(cd "$LIB" && node core/render/readcheck.mjs "$HERE" --size 1080x1920)
(cd "$LIB" && node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4")
sh master.sh out/video.mp4 out/mix.wav battery-percentage-guess.mp4 24
node tools/subs.mjs > out/cues.json && "$PY" "$LIB/core/render/srt.py" out/cues.json battery-percentage-guess.srt
