#!/bin/sh
# Master and mux: two-pass loudnorm (−14 LUFS, true peak −1.2 dB, linear) + H.264 video, as core/render/mux.sh does.
# (mux.sh's "decoded duration" guard misreads ffmpeg 6.1, whose loudnorm progress ends ~3 s early; the audio itself is whole.)
#   sh master.sh out/video.mp4 out/mix.wav battery-percentage-guess.mp4 24
set -e
V=$1; A=$2; O=$3; FPS=${4:-24}
J=$(ffmpeg -hide_banner -nostats -i "$A" -af loudnorm=I=-14:TP=-1.2:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | grep "\"$1\"" | sed 's/.*: "\(.*\)".*/\1/'; }
LN="loudnorm=I=-14:TP=-1.2:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true"
echo "measured: I $(g input_i) LUFS, TP $(g input_tp) dB → $(g normalization_type) would be used in one pass"
TMP="$O.part.mp4"
ffmpeg -y -loglevel error -i "$V" -i "$A" \
  -filter_complex "[0:v]fps=$FPS,format=yuv420p[v];[1:a]$LN,aresample=48000[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -preset slow -crf 19 -r "$FPS" -c:a aac -b:a 256k -movflags +faststart -shortest "$TMP"
mv "$TMP" "$O"
echo "$O"
ffmpeg -hide_banner -nostats -i "$O" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):" | head -3
