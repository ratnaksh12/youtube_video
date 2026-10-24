# Voice samples: every English voice on the system

These are all the English voices in the **Kokoro v1.0** model that `narration/make_voiceover.py` already uses (it loads `kokoro-v1.0.onnx` and `voices-v1.0.bin` from `/home/user/tts_models`). The model has 54 voices. 28 of them are English, and #29 is the blend the channel uses now. Kokoro is Apache-2.0, so a monetised account can use it.

Every sample reads the same tech-reel hook at speed 1.08. Each one starts with its own number, so you can play `00_all_voices_reel.mp3` (4.5 min, all 29 in order) and note the numbers you like.

> *"Stop scrolling. Your phone has a hidden AI feature that most people never find, and it takes ten seconds to turn on. Here's how."*

**Pitch** is the median speaking pitch. **Pace** is words per minute at this speed. Reels work best at about 175–210 wpm. **Grade** is the quality grade on the Kokoro model card (A is best). I couldn't open the card from this environment, so the grades are from my knowledge of it. Treat them as a hint and trust your ears.

| # | Voice | Accent | Pitch | Pace | Grade | Notes |
|--:|---|---|--:|--:|:-:|---|
| 1 | af_alloy | US female | 146 Hz | 204 | C | low, even |
| 2 | af_aoede | US female | 173 Hz | 184 | C+ | |
| 3 | af_bella | US female | 206 Hz | 167 | A- | ⭐ bright, expressive |
| 4 | af_heart | US female | 201 Hz | 176 | A | ⭐ the model's best voice: warm, natural |
| 5 | af_jessica | US female | 204 Hz | 217 | D | |
| 6 | af_kore | US female | 144 Hz | 182 | C+ | low, calm |
| 7 | af_nicole | US female | 161 Hz | 114 | B- | whisper/ASMR voice: too slow for reels |
| 8 | af_nova | US female | 157 Hz | 208 | C | |
| 9 | af_river | US female | 173 Hz | 213 | D | |
| 10 | af_sarah | US female | 197 Hz | 187 | C+ | ⭐ clear, newsy |
| 11 | af_sky | US female | 152 Hz | 188 | C- | |
| 12 | am_adam | US male | 113 Hz | 195 | F+ | lowest grade |
| 13 | am_echo | US male | 107 Hz | 197 | D | |
| 14 | am_eric | US male | 154 Hz | 218 | D | |
| 15 | am_fenrir | US male | 131 Hz | 176 | C+ | ⭐ energetic, punchy |
| 16 | am_liam | US male | 127 Hz | 210 | D | |
| 17 | am_michael | US male | 115 Hz | 159 | C+ | ⭐ warm, trustworthy (half of the channel blend) |
| 18 | am_onyx | US male | 86 Hz | 203 | D | very deep (the other half of the blend) |
| 19 | am_puck | US male | 105 Hz | 185 | C+ | ⭐ upbeat, younger |
| 20 | am_santa | US male | 140 Hz | 167 | D- | novelty (Santa) |
| 21 | bf_alice | UK female | 212 Hz | 182 | D | |
| 22 | bf_emma | UK female | 179 Hz | 193 | B- | ⭐ the best British voice |
| 23 | bf_isabella | UK female | 200 Hz | 189 | C | |
| 24 | bf_lily | UK female | 198 Hz | 190 | D | |
| 25 | bm_daniel | UK male | 122 Hz | 196 | D | |
| 26 | bm_fable | UK male | 116 Hz | 194 | C | ⭐ storyteller |
| 27 | bm_george | UK male | 136 Hz | 162 | C | ⭐ documentary, measured |
| 28 | bm_lewis | UK male | 85 Hz | 165 | D+ | very deep |
| 29 | blend_michael_onyx | US male | 104 Hz | 167 | n/a | the current Inkverse voice: deep and cinematic |

⭐ = shortlist for a tech account.

**Picking tips**
- For quick tips and how-tos, a brighter, faster voice keeps people watching: #4, #3, #15 or #19.
- For explainers and "how it works", a warm, trusted voice: #17, #22 or #27.
- For stories and history of tech, deep and cinematic: #29 or #26.
- Pace is easy to change (the `speed` value). Timbre is not, so judge the sound, not the speed.
- Voices can be blended, as #29 is (65% michael + 35% onyx). Once you have one or two favourites, I can make blends that sit between them.

The other 26 voices are Spanish, French, Hindi, Italian, Japanese, Brazilian Portuguese and Mandarin. The four Hindi ones (`hf_alpha`, `hf_beta`, `hm_omega`, `hm_psi`) could be useful if you ever add a Hindi account.

## Re-make the samples
```bash
python3 instagram/voices/make_samples.py instagram/voices /tmp/vs     # MP3s, the reel and voices.json
python3 instagram/voices/voice_stats.py instagram/voices /tmp/vs      # adds pitch and pace to voices.json (needs librosa)
```
