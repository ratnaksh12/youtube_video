# Reel kit (@ratnaksh.ai)

Shared parts for every Reel: 1080×1920, 24 fps, the Hologram HUD look (violet lines, lime only on locked values), narrator `am_michael` at 1.1.

| Path | What it is |
|---|---|
| `engine/holo.js`, `engine/hud.js`, `models/mkmodel.mjs` | wireframe engine, HUD parts and model builder from Lemo-Opuscar (MIT, see `LICENSE-lemo-opuscar`) |
| `ui.js` | the account's HUD layer: theme, chrome, cards, big rolling values, rail chips, captions (2-row chunks, spoken word lit), the comment-to-DM call to action, text on a 3D plane, whip blur |
| `fonts/` | Rajdhani + Share Tech Mono (OFL) |
| `tools/voice.py` | voices `script.json` with Kokoro |
| `tools/timeline.py` | places the lines on the 120 BPM grid, estimates word times → `timeline.json` |
| `audio/score.py` | original synthesised score, shaped by the reel's `score.json` |
| `audio/mix.py` | voice + score + foley from `events.json` + ambience, ducked, ready for mastering |
| `tools/master.sh` | two-pass loudnorm to −14 LUFS + H.264 |
| `tools/subs.mjs`, `tools/cover.py` | `.srt` export and the cover (frame + two-line title) |

A new Reel is a folder in `reels/` with a `kit -> ../../kit` link, `script.json`, a model generator, `film.js` (the choreography), `main.js`/`index.html`, `score.json`, `POST.md`, `FACTS.md`, `CREDITS` and `build.sh`. See `reels/02-cleanyourtv/` for the GitHub-repo format.

In `script.json`, a caption token `word^N` stands for N spoken words, e.g. `CleanYourTV,^3` for "Clean Your TV,".
