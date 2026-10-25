# Pixel Room: a reel look modelled on a reference reel

**Style test:** `pixel-room-style-test.mp4` (7 s, 1080×1920, −14 LUFS). It uses the hook of Reel 04: "ChatGPT doesn't know what it's going to say. It guesses. One word at a time."

## The reference reel (what it does)
The reference is a 120 s, 1280×720 reel promoting a creator's Claude "skill file" for making motion videos.
- **Watched with:** the Watch skill (`.claude/skills/watch`), 60 frames sampled every 2 s.
- **Words:** reconstructed from the on-screen captions plus a rough offline speech recognizer. Instagram gave no caption track.

**Story, beat by beat**
1. **0–8 s:** "This video went VIRAL." Everyone's asking for the prompt. It's the wrong question.
2. **8–24 s:** "Claude didn't make this." The difference is the director. He wrote his directing down as a skill file: "Same AI, different director."
3. **24–40 s:** "This video you're watching was made with that skill, so you can make videos at this exact level too." Then a cosmic cut-away (galaxy, the sun, a light beam): "one thing I have to show you".
4. **46–80 s:** No magic prompt, no course. "The prompt IS 50 kilobytes" that teach the AI to think like a motion designer and editor: script, storyboard, animation, captions, voiceover, sound design. "Not a prompt. A whole CREW in one file."
5. **82–110 s:** "Here's the part NOBODY tells you." Every note from the creator lives inside the file: "Fix this transition", "Lower that WHOOSH", "Hold the ending one beat LONGER". The skill does about 75 % of the work. The other 25 % is your idea and your taste.
6. **110–120 s:** Comment **SKILL** for the file, or **TUTORIAL** for the next part. Both go to your DMs, with a comment box being typed on screen.

**Why it works**
- **Look:** flat pixel-art characters inside a lit 3D pixel diorama. In the reference that's a cosy study (bookshelves, a desk, a monitor, a lamp, a red rug), with depth of field, warm practical lights against the dark, and dust in the light. Realistic or cosmic cut-aways break the pattern.
- **Kinetic captions instead of subtitles:** every phrase is laid out as type in the empty part of the frame and revealed word by word. It mixes four styles:
  - bold geometric sans for the main words;
  - light sans for small connecting words;
  - huge condensed caps in an accent colour for the punch words (NO MAGIC, NOBODY, INSIDE, TOO.);
  - handwritten script for the feeling words (think, taste).

  Numbers roll into place.
- **Pace:** a new picture every 1–2 s (43 hard cuts in 120 s, plus constant camera and text motion). Nothing ever holds still.
- **Interface inserts:** a code editor, a row of pipeline icons, a timeline with waveforms, a progress bar, a comment box.
- **Rhetoric:** a contrarian hook, a named hero, social proof, "not selling you a course", concrete numbers, "the part nobody tells you", a 75 / 25 split, and a two-keyword comment call to action.
- **Sound:** voiceover from start to finish over a music bed, mastered at −14 LUFS.

## Our version
- **Same grammar, our brand.** We don't copy the reference's characters, room or wording.
- **Mascot:** BIT, a small robot with a screen for a face and a violet hoodie. The account stays faceless.
- **Face states:** eyes, blink, "?", "…", and a raised arm.
- **Set:** a night study with violet ambience, a warm lamp and a lime screen glow.
- **Kinetic captions:** Montserrat 900/800/500, Anton for the punch words in lime, and Caveat script in warm amber. All OFL, in `kit/fonts`.
- **Format:** 9:16, 45–60 s instead of 120 s. The comment-keyword call to action matches Reel 02.
- **Engine:** Lemo-Opuscar's HD-2D tools (three.js pixel textures, sprite billboards, depth of field and bloom; MIT) plus our kit's voice, score, SFX library and mastering.
- **Cost here:** about 3 s per frame on this machine's software renderer, so a 60 s reel takes about 70 minutes to render.

Files: `main.js` (set, mascot, camera), `captions.js` (kinetic type), `script.json` / `timeline.json` (voice), `score.json`.
