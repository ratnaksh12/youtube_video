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
| `audio/mix.py` | voice + score + sound effects + ambience, ducked, ready for mastering (`--synth` = the old all-synthesised effects) |
| `audio/foley.py` | places real sound effects on the reel's `events.json` by measured rules: timing against the cut, level per kind, quieter and high-passed when on speech, tonal sounds in E minor |
| `audio/sfx/` | the effect library (53 sounds, 69 takes): earshot's bank rendered from code (MIT) + uisfx sci-fi UI recordings (CC0). Built by `audio/sfxlib.py`; committed, so mixing needs neither |
| `tools/master.sh` | two-pass loudnorm to −14 LUFS + H.264 |
| `tools/subs.mjs`, `tools/cover.py` | `.srt` export and the cover (frame + two-line title) |

A new Reel is a folder in `reels/` with a `kit -> ../../kit` link, `script.json`, a model generator, `film.js` (the choreography), `main.js`/`index.html`, `score.json`, `POST.md`, `FACTS.md`, `CREDITS` and `build.sh`. See `reels/02-cleanyourtv/` for the GitHub-repo format.

In `script.json`, a caption token `word^N` stands for N spoken words, e.g. `CleanYourTV,^3` for "Clean Your TV,".

Sound effects: add an event type to a reel's `film.js` (`ev(t, 'lock')`), then map it to a sound in `audio/foley.py`. `mix.py` prints a check after each mix: sounds per 10 s, the first sound (want one in the first 2 s) and the longest silent gap (want ≤ 3.2 s). To rebuild the library: `~/tools/earshot/.venv/bin/python kit/audio/sfxlib.py --uisfx <real-sfx>/vendor/node_modules/uisfx/sounds`.
