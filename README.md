# Only These Movies You NEED to Watch Before Avengers: Doomsday

A 5:46 animated YouTube video (16:9, 1080p, 24 fps), made with the aiTrends 2D Studio: every frame is drawn by code (canvas + Three.js) and rendered in headless Chromium. Doomsday opens December 18.

## What's here
- `narration/script.md`: the video script. Headings and markdown are not spoken.
- `narration/make_voiceover.py`: generates the narration with the open Kokoro TTS model (a deep male blend of `am_michael` and `am_onyx`). It reads the script word for word and also writes word-level timings.
- `aitrends-2d-studio/`: the studio (renderer, engine, audio synthesis, tools).
- `aitrends-2d-studio/projects/avengers-doomsday-watchlist/`: the video itself.
  - `story/make_shots.py` → `story/shots.json`: 124 shots plus the music and sound-effect plan.
  - `story/bible.md`: the cast, locations and motifs.
  - `scenes/`: the cast (`cast.js`), props, sets, shot templates (`tpl.js`) and shots (`shots/01_hook.js` … `10_3d.js`).
  - `out/`: the final MP4.

## Re-render
```bash
cd aitrends-2d-studio
npm install                      # once; needs ffmpeg, Node 18+, Python 3 with numpy and scipy
node render.mjs --project projects/avengers-doomsday-watchlist --sheet --scale 0.5     # contact sheets
node render.mjs --project projects/avengers-doomsday-watchlist --workers 4 --format jpeg
python3 audio/mix.py --project projects/avengers-doomsday-watchlist                    # music + SFX + mux → out/
```
To use your own voiceover, replace `input/voiceover.flac` and re-time the words. Use `tools/transcribe.py`, or `tools/parse_script.py` with an SRT file. Then adjust the shot start times in `story/make_shots.py`.

The heroes are original stick-figure designs: each one is recognisable from a single signature colour or prop. No studio logos or poster art are used.
