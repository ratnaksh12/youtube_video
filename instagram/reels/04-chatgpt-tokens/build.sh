#!/bin/sh
# Rebuild Reel 04: voice → timeline → events → score → mix → frames (three.js, ~3 s a frame on a software renderer) → master → subtitles → cover.
#   LIB=/path/to/lemo-opuscar sh build.sh        (needs the library's .venv + Kokoro model + node_modules/three, Node 20+, ffmpeg, a Chrome headless shell)
set -e
HERE=$(cd "$(dirname "$0")" && pwd); cd "$HERE"
LIB=${LIB:-/home/user/lemomo-ai/lemo-opuscar}; export LIB; PY="$LIB/.venv/bin/python"
"$PY" kit/tools/voice.py .
"$PY" kit/tools/timeline.py .
(cd "$LIB" && node core/render/events.mjs "$HERE" --size 1080x1920)
"$PY" kit/audio/score.py . && "$PY" kit/audio/mix.py .
(cd "$LIB" && node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4")
sh kit/tools/master.sh out/video.mp4 out/mix.wav chatgpt-writes-one-token-at-a-time.mp4 24
node kit/tools/subs.mjs . > out/cues.json && "$PY" "$LIB/core/render/srt.py" out/cues.json chatgpt-writes-one-token-at-a-time.srt
(cd "$LIB" && node core/render/still.mjs "$HERE" 20.4 --size 1080x1920 --out "$HERE/stills/cover" --prefix c_)
"$PY" kit/tools/cover.py stills/cover/c_20.4.jpg kit/fonts cover.jpg "CHATGPT IS GUESSING" "ONE TOKEN AT A TIME" "HOW IT ACTUALLY WORKS // 02"
