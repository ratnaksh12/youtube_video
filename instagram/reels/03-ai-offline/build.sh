#!/bin/sh
# Rebuild Reel 03: models → voice → timeline → events → score → mix → frames → master → subtitles.
#   LIB=/path/to/lemo-opuscar sh build.sh        (needs the library's .venv + Kokoro model, Node 20+, ffmpeg, a Chrome headless shell)
set -e
HERE=$(cd "$(dirname "$0")" && pwd); cd "$HERE"
LIB=${LIB:-/home/user/lemomo-ai/lemo-opuscar}; export LIB; PY="$LIB/.venv/bin/python"
node models/gen_lab.mjs
"$PY" kit/tools/voice.py .
"$PY" kit/tools/timeline.py .
(cd "$LIB" && node core/render/events.mjs "$HERE" --size 1080x1920 && node core/render/readcheck.mjs "$HERE" --size 1080x1920)
"$PY" kit/audio/score.py . && "$PY" kit/audio/mix.py .
(cd "$LIB" && node core/render/video.mjs "$HERE" --fps 24 --workers 4 --size 1080x1920 --out "$HERE/out/video.mp4")
sh kit/tools/master.sh out/video.mp4 out/mix.wav openai-ai-dns-loophole.mp4 24
node kit/tools/subs.mjs . > out/cues.json && "$PY" "$LIB/core/render/srt.py" out/cues.json openai-ai-dns-loophole.srt
(cd "$LIB" && node core/render/still.mjs "$HERE" 14.3 --q 'nosub=1' --size 1080x1920 --out "$HERE/stills/cover" --prefix c_)
"$PY" kit/tools/cover.py stills/cover/c_14.3.jpg kit/fonts cover.jpg "OPENAI'S AI SNUCK ONLINE" "THROUGH A DNS LOOPHOLE" "AI NEWS // 01"
