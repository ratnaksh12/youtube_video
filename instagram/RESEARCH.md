# Starting an English tech account on Instagram: research and plan

*October 2026. This covers your repo, the Lemo-Opuscar link you sent, how Instagram ranks Reels now, what the top tech creators do, and a launch plan built on the tools you already have. The voices are in [`voices/`](voices/README.md).*

---

## TL;DR

1. **Your biggest advantage is that you already make original animation in code.** On 30 April 2026 Instagram stopped recommending accounts that mostly repost other people's content. The largest AI and tech pages are mostly that kind of page, so original animated explainers now have the gap to themselves.
2. **Reach comes from three signals: watch time, sends per reach and likes per reach.** Mosseri confirmed these. Sends count most for reaching people who don't follow you yet. So make videos that people forward to a friend.
3. **Format:** vertical 1080×1920 at 30–60 seconds. The payoff goes in the first second, with big burned-in captions. Keep discovery Reels under 3 minutes. Use 3–5 hashtags at most, because hashtags help search but not reach.
4. **Positioning:** a faceless, animated "tech, explained" account in English with **one recognisable narrator and one recognisable look**. Run four repeatable series: *Hidden features*, *How it actually works*, *The week in tech*, *Tech stories*.
5. **Tools:** your **aiTrends 2D Studio** already renders 9:16 with word-by-word captions. **Lemo-Opuscar** adds 59 styles plus 98 style prompts. About 15 of those fit tech well: Dark Tech Keynote, Living Screencast, Hologram HUD, Exploded Teardown, Whiteboard, Isometric Infographic, Broadcast News Package, Blueprint, ASCII/CRT and others. I got both working in this environment.
6. **Cadence:** 4 Reels and 1 carousel a week. Test hooks with Trial Reels, and review the numbers after the first 10 posts.
7. **Your decisions:** pick a voice from [`voices/`](voices/README.md), choose a handle, and say whether this is a new account or part of Inkverse. My recommendation is a separate account.

---

## 1. What I went through

### Your repo (`ratnaksh12/youtube_video`)
- **aiTrends 2D Studio** (`aitrends-2d-studio/`): every frame is drawn in code (canvas and Three.js) and rendered in headless Chromium. It handles cinematic stick figures, 2.5D sets, data overlays, blueprint diagrams and low-poly 3D, plus generated music and SFX, mixed to −14 LUFS. `tools/new_project.py` already supports `--aspect 9:16` and `--captions` (burned word-by-word captions, recommended for 9:16).
- **Narration** (`narration/make_voiceover.py`): Kokoro TTS reads the script word for word and writes word-level timings. It currently uses a deep 65/35 blend of `am_michael` and `am_onyx` at speed 1.06. `patch_acronyms.py` fixes how acronyms are pronounced.
- **Two finished Inkverse videos**, both 16:9 and 4–6 minutes: the Avengers: Doomsday watchlist and the Doom/Tony theory. You also have a banner, thumbnails and upload notes.
- **What carries over to Instagram:** an original, faceless, branded look; precise word timing (so captions sync); and music and SFX with no licensing problems.
- **What needs to change:** YouTube pacing doesn't work on Reels. A 5-minute horizontal video becomes **30–60 seconds, vertical, with the payoff first**. Shots need to be about 2× faster, and the captions need to be on screen.

### The link: Lemo-Opuscar / OPUSCAR 98
The page itself (`lemomo-ai.github.io`) is blocked by this environment's network policy, so I read its source repo instead: `github.com/lemomo-ai/lemo-opuscar`.
- **OPUSCAR 98** is a 6:31 film. One character walks through all 98 Best Picture winners, and each one is redrawn in a style that fits that film. The page also publishes **all 98 styles with a reusable style prompt for each**.
- **The library** has 59 film styles. Each has a `STYLE.md` and a demo film made fully in code (canvas/WebGL pictures, sampled music, TTS voice) with no video generation or stock footage. It installs as a Claude Code plugin (`claude plugin install lemo-opuscar@lemolab`), and it's tuned for Claude Opus 5.5.
- **The voice is Kokoro by default**, the same engine you use. Output is 1920×1080 by default, and **1080×1920 vertical works with `--size`**.
- **Licence:** the code is MIT, the demo films are CC BY 4.0, and **films you make with it are yours, with no credit needed**. Its copyright rules match yours: no real logos, product silhouettes or brand UI. Its Glass Product style, for example, always uses a fictional object.
- **Three of its guides are worth using on every video:** `DIRECTOR.md` (hook in 3 s; one subject, one goal, one turn; an ending that echoes; one "native move" at the peak), `TECHNIQUE.md` (rendering, voice checks, mixing) and each style's `STYLE.md`.

---

## 2. How Instagram decides reach (late 2026)

I couldn't open Instagram or the original posts from here, so I've marked how solid each point is.

| What | Detail | How solid |
|---|---|---|
| **Top ranking signals** | Watch time, likes per reach, sends per reach. Sends matter most with non-followers; likes matter most with followers. Watch time counts both the % watched and the seconds, so longer videos aren't penalised. | ✅ Mosseri, Jan–Feb 2025, still the framework in 2026 |
| **Originality rule (30 Apr 2026)** | If most of what an account posts is someone else's content, it's no longer recommended to non-followers. The rule now covers photos and carousels as well as Reels. Transforming the content meaningfully is OK. | ✅ Mosseri video, reported by PetaPixel and Tubefilter |
| **AI slop (Oct 2026)** | Mosseri says Instagram needs stronger protection against AI copying creators and low-effort AI content. | ✅ Mosseri Q&A and Threads, reported by Social Media Today |
| **AI labels** | The "AI-generated profile" label (31 Aug 2026) is only for accounts presenting AI-generated *people* as real. Separately, the post-level "AI info" label asks you to disclose realistic AI audio or video. | ✅ label change / ⚠️ details of the post label are second-hand |
| **Hashtags** | Max 5 per post. They help search, not reach. | ✅ reported from Mosseri |
| **Trial Reels** | Show a Reel to non-followers first, so you can test hooks without touching your followers' feed. They can be scheduled, and scheduling doesn't hurt reach. | ✅ Mosseri / ⚠️ the follower threshold to unlock them is unverified |
| **Length** | Upload limit is 3 min (Jan 2025). Reports say Reels over 3 min aren't recommended to non-followers. One study of about 6M Reels found **45–60 s** got the highest median views. | ✅ limit / ⚠️ the rest |
| **Specs** | 1080×1920. The profile grid shows the centre 3:4. Keep titles and faces inside the centre ~1080×1350, away from the bottom ~250–440 px (caption and audio) and the right-hand buttons. | ⚠️ sources disagree on exact safe-zone pixels |
| **Frequency** | Buffer's data on 2M posts: 3–5 posts a week is the sweet spot, and more helps with diminishing returns. Mosseri: post as much as you can sustain. | ⚠️ third-party data |
| **Collab posts** | Mosseri keeps recommending them, with bigger accounts inviting smaller ones. | ✅ |
| **Edits app** | Instagram's free editor. No watermark, captions, a planning board, and a weekly stream of new features. | ✅ |

**What this means for us**
- **Never repost** clips from MKBHD, Apple keynotes, viral robot videos and so on. That's exactly the model that just stopped being recommended. Everything we post is drawn by us.
- **Design for sends:** "send this to the friend who…", useful tips, myth-busting, and "wait, really?" facts.
- **Design for watch time:** the payoff in second one, one idea per shot, and an ending that loops back to the start.
- **Be upfront about the AI voice:** a line in the bio such as "AI-narrated, human-researched" builds trust. Turn on the AI label if a video could ever pass as real footage.

---

## 3. Top tech creators: what to learn from each

Follower counts are third-party estimates (influData, CreatorDB, HypeAuditor, hafi.pro, iqfluence), Sep–Oct 2026.

### Creators who show their face
| Creator | IG followers | What they do | The lesson for us |
|---|--:|---|---|
| **Julian Jewel Jeyaraj** @julianjewel | ~9.7M | Tech and AI gadgets. #1 US tech creator by follower growth (influData, Oct 2026) | Big growth is still possible in tech in 2026 |
| **Marques Brownlee** @mkbhd | ~5.2M (flat) | Very clean visuals, one clear opinion, low hype. Average Reel views around 2.1M | High production quality plus trust. Never overclaim |
| **911Reviews / Adam Nash** | ~5.0M | Gadget and car-tech reviews | A narrow sub-niche can still get huge |
| **Shlok Srivastava / Techburner** | ~4.2M | Indian tech, Hindi-English mix | Personality-led. Shows the demand in India |
| **Tony Chen** @setupsai | ~3.6–3.7M | One long-running series, *"Powerful websites you should know"*, posted daily. The tool's result is shown within seconds | **One repeatable series** plus a payoff in the first second |
| **Arun Maini / Mrwhosetheboss** | ~2M (22M on YouTube) | Hidden features, comparisons, playful props and set pieces | Curiosity framing: "your phone can do this?" |
| **Unbox Therapy** | ~1M | Unusual gadgets | Novelty objects get sends |

### Faceless and media pages
| Page | IG followers | Model | Lesson |
|---|--:|---|---|
| **Evolving.ai** | ~4.8M | AI news brand (Netherlands), 3.2% engagement | The demand for AI news is huge |
| **HyperTech** @techskills | ~1.5M | Tech news clips | |
| **"Artificial Intelligence" pages** | ~1.3–1.5M each | Mostly reposted clips | |
| **Airesearches** | ~1.37M | Robot clips plus ChatGPT prompts, **0.6% engagement** | Repost pages get followers, not loyalty |
| **OpenAI** @openai | ~6.6M | Brand account | |

**What the winners have in common**
1. **A series, not random posts.** Viewers know what they get, so they follow. That's @setupsai's whole account.
2. **Payoff first.** The result, the number or the strange fact comes in the first second, and the explanation follows.
3. **Useful beats newsy.** Saves and sends come from "this helps me" or "my friend needs this".
4. **A recognisable look and voice.** You can tell an MKBHD frame with the sound off.
5. **Trust.** The big creators don't lie in hooks. Clickbait wins one video and loses the follow.

**Where there's room:** the faceless AI and tech pages are big but mostly made of reposts (now demoted) with low engagement. Face-led creators dominate gadget reviews. **Original, animated, fact-checked explainers with one narrator** are under-served, and that's what your pipeline already makes.

---

## 4. Positioning

**Concept:** *Tech, explained, and drawn.* Every Reel answers one question about the tech people use every day, in under a minute, in one consistent animated style with one narrator.

**Brand.** Tech is a different niche from Marvel theories, and Instagram recommends accounts with a consistent niche. My recommendation is a **separate account**. You can still reuse the Inkverse visual DNA if you want them to feel like siblings.

**Bio template:** *"Tech, explained in 60 seconds. New explainer Mon/Wed/Fri/Sun · AI-narrated, human-researched"* + link.

### The four series (pillars)
| Series | Example | Main signal | Length | Best style |
|---|---|---|---|---|
| **Hidden features** | "Your phone can translate a conversation offline. Here's the switch." | saves, sends | 25–40 s | Living Screencast (fictional UI), or our 2D studio with a phone prop |
| **How it actually works** | "How does Face ID know it's you?" | sends, watch time | 45–60 s | Hologram HUD, Isometric Infographic, Whiteboard, Blueprint |
| **The week in tech** | Every Friday: 3 stories, 60 seconds | follows, return viewers | 60 s | Broadcast News Package, Caption News |
| **Tech stories** | "The one line of code that blew up a rocket" | watch time, sends | 45–75 s | ASCII/CRT, Archive Light Table, our cinematic stick figures, OPUSCAR #88 Microfiche |

Extra formats for later: **Versus**, a 16-bit arcade fight between two products or technologies (OPUSCAR #77), and **Myth vs fact** (Game Show Flat).

### Tech-ready styles from the link
- **Library styles:** Dark Tech Keynote · Living Screencast · Sci-fi Hologram HUD · Glass Product Render (fictional products only) · Exploded Teardown (real open hardware from its own files) · Broadcast News Package (its demo is "The Week in AI") · Caption News (it has a specific 9:16 layout) · Data Storytelling · Isometric Infographic · Whiteboard Explainer · Blueprint · ASCII/CRT Terminal · Game Show Flat · Microgame Frenzy · Mid-century Cartoon (its demo is a robot-vacuum set-up guide).
- **OPUSCAR 98 prompts:** #70 *Blueprint Developing into 3D* (good for product reveals) · #82 *Technical Manual Line Art* · #92 *Architectural Section Axonometric* (good for cutaways of devices and data centres) · #30 *Cyanotype Blueprint* · #18 *Typewriter Character Art* · #28 *1955 Kinescope TV* (history of tech) · #74 *Window Marker & Chalk* (maths and AI) · #77 *16-bit Arcade Fighter* (versus) · #81 *Quiz-Show Studio* · #95 *Ray-Marched Multiverse* · #96 *3D Particle Fireball* (big reveals).

**Signature look.** Pick **one home style** and use it on about 80% of posts so the grid and the feed are recognisable. Use other styles as occasional specials. Good home styles are Isometric Infographic, Hologram HUD or our own 2D studio look. I'd test two of them in the first two weeks and let the numbers decide.

---

## 5. How we make each Reel the best it can be

**Script** (≈110–160 words for 40–60 s at our ~180 wpm pace)
1. **Hook, 0–2 s:** the payoff or the surprising number, on screen *and* spoken. No intro, no "hey guys", no logo.
2. **Stakes, 1 line:** why it matters to *you*.
3. **3 beats:** one idea per shot, with a visual change every 1.5–3 s.
4. **Turn and payoff:** the "oh, that's why" moment, using one native move of the style at the peak.
5. **Loop or ask:** end on a line that leads back into the first frame, or "send this to someone who still…". Never "like and subscribe".

**Hook templates:** "You've been using X wrong." · "This number on your phone is lying to you." · "X does Y, and almost nobody knows why." · "Here's what actually happens when you press ___." · "In 1996, one line of code destroyed a $370M rocket."

**Picture**
- 1080×1920, 30 fps for UI-heavy styles and 24 fps for cinematic ones. Titles and subjects go in the centre safe area, clear of the bottom ~440 px and the right-hand buttons.
- Burned-in word-by-word captions. Most people watch muted, so the video must work with the sound off (the Caption News rule).
- No real logos, product silhouettes or brand UI. Use names in narration with original drawings, and fictional stand-ins on screen. Footage you record yourself of your own phone's settings is fine.

**Sound:** Kokoro in the voice you choose at speed 1.06–1.12, every line checked with speech-to-text. Music sits about 10 dB under the voice, with SFX on every cut, mastered at −14 LUFS. All of it is generated, so there are no copyright claims.

**Facts:** every number comes with a source. The source goes in the caption, and for news it's also on screen.

**Packaging:** a 1080×1920 cover whose title reads inside the 3:4 grid crop. The first caption line is a keyword sentence, because Instagram search reads captions. Use 3–5 specific hashtags.

**Distribution:** post the first test of each new series as a **Trial Reel**. Accept collabs with bigger tech accounts. Cross-post the same vertical to YouTube Shorts and TikTok.

**Quality loop:** contact sheet → 0.2 s strips of key moments → one full watch with sound → fix in one round (DIRECTOR.md §11).

---

## 6. First 12 video ideas

| # | Series | Title / hook | Style |
|--:|---|---|---|
| 1 | How it works | "Your battery percentage is a guess. Here's how your phone makes it." | Hologram HUD |
| 2 | How it works | "How ChatGPT writes a sentence: one word at a time, in 45 seconds" | Whiteboard |
| 3 | Stories | "One line of code blew up a $370M rocket (Ariane 5, 1996)" | ASCII/CRT |
| 4 | How it works | "What actually happens when you hit Send on WhatsApp" | Isometric Infographic |
| 5 | How it works | "How Face ID knows it's you, and why a photo can't fool it" | Hologram HUD |
| 6 | Hidden features | "Why your Wi-Fi dies in one room (and the 10-second fix)" | Isometric / 2D studio |
| 7 | Stories | "70 years of AI in 60 seconds" | Game Show Flat |
| 8 | Myth vs fact | "Does closing apps save battery? No, and here's why" | Whiteboard / Game Show |
| 9 | How it works | "Why some USB-C cables cost $3 and others $100" | Blueprint / Teardown |
| 10 | How it works | "Deleting a file doesn't delete it. Here's where it goes." | Isometric Infographic |
| 11 | Stories | "The phone that ruled the world, then lost it all in 5 years" | 2D studio cinematic |
| 12 | Week in tech | Friday roundup: 3 stories, 60 seconds | Broadcast News Package |

I'll check every fact before scripting. For example, Ariane 5 Flight 501 failed because a 64-bit float was converted into a 16-bit integer and overflowed. The often-quoted ~$370M covers the rocket and its payload.

---

## 7. 30-day launch plan

**Week 0, set-up:** handle, profile picture, bio, a brand board (2 colours + 1 accent, a caption font, a cover template), the voice, a 9:16 project template in the studio, and 3 Reels in the bank before launch.

**Weeks 1–4:** 4 Reels (Mon/Wed/Fri/Sun) + 1 carousel a week. The carousel reuses stills from that week's best Reel.
- Week 1: one Reel from each of the four series.
- Week 2: test the two home styles against each other on similar topics.
- Weeks 3–4: double down on whichever series and style got the best **sends per reach** and **average watch %**.

**What to track** (Instagram Insights, per Reel): average watch time and % watched, the 3-second hold rate, sends, saves, follows from the Reel, and the share of views from non-followers. Ignore raw likes.

**Production capacity:** a 45-second Reel takes the agent roughly 30–60 minutes (the Lemo-Opuscar estimate), and much less once a series template exists. Batch 4 Reels in one session.

---

## 8. What I need from you
1. **The voice:** listen to [`voices/00_all_voices_reel.mp3`](voices/00_all_voices_reel.mp3) and send me the number(s). The table in [`voices/README.md`](voices/README.md) has my shortlist.
2. **The account:** a new handle or part of Inkverse? I can suggest names if you'd like.
3. **Faceless only, or will you ever appear or record your own voice?** This plan assumes faceless.
4. **First topic:** pick from the 12 above, or give me your own.

---

## Sources
- Mosseri's ranking signals: [Dataslayer](https://www.dataslayer.ai/blog/instagram-algorithm-2025-complete-guide-for-marketers) · [HighStyle](https://www.highstyle.ai/insights/instagram-reels-algorithm-2026) · [eClincher](https://www.eclincher.com/articles/how-the-instagram-algorithm-works-in-2026)
- Originality rule, 30 Apr 2026: [PetaPixel](https://petapixel.com/2026/04/30/new-instagram-policies-target-reposted-content/) · [Tubefilter](https://www.tubefilter.com/2026/04/30/instagram-removes-algorithm-recommendations-repost-content-aggregator/) · [Coruzant](https://coruzant.com/digital-strategy/instagram-originality-rule/)
- AI slop and 2026 updates: [Social Media Today](https://www.socialmediatoday.com/news/instagram-chief-says-stronger-ai-slop-prevention-is-needed/833416/) · [Pepper Agency roundup](https://www.pepperagency.com/blog/every-instagram-update-adam-mosseri-has-shared-in-2026---updated-october-2026) · [NapoleonCat](https://napoleoncat.com/blog/instagram-new-features-and-updates/) · [EmbedSocial](https://embedsocial.com/blog/new-instagram-features-2026/)
- AI labels: [TechRepublic](https://www.techrepublic.com/es/article/news-instagram-ai-generated-profile-label-recommendations/) · [GadgetReview](https://www.gadgetreview.com/instagram-is-done-letting-ai-influencers-hide-in-plain-sight) · [gradually.ai](https://www.gradually.ai/en/instagram-ai-label/)
- Length and specs: [Social Media Today, 3-minute Reels](https://www.socialmediatoday.com/news/instagram-officially-expands-reels-length-3-minutes/737766/) · [Bytecap](https://www.bytecap.io/research/best-instagram-reels-length) · [Later](https://later.com/blog/instagram-reels/) · [Hopper HQ](https://www.hopperhq.com/blog/instagram-reel-size/)
- Frequency: [Buffer, 2M posts](https://buffer.com/resources/how-often-to-post-on-instagram/) · [RouteNote, Mosseri](https://routenote.com/blog/how-often-you-should-post-on-instagram/)
- Edits app: [NapoleonCat](https://napoleoncat.com/blog/instagram-edits/)
- Creators: [influData US tech, Oct 2026](https://infludata.com/rankings/top-20-influencer-united-states-of-america-tech-instagram) · [hafi.pro AI & tech](https://hafi.pro/top/most-followed-instagram/ai-tech) · [CreatorDB setupsai](https://creatordb.app/creatorstats/setupsai/) · [CreatorDB evolvingai](https://creatordb.app/creatorstats/evolvingai/) · [CreatorDB airesearches](https://creatordb.app/creatorstats/airesearches/) · [CreatorDB mkbhd](https://creatordb.app/creatorstats/mkbhd/) · [HypeAuditor mkbhd](https://hypeauditor.com/de/instagram/mkbhd/) · [iqfluence Mrwhosetheboss](https://iqfluence.io/public/free-influencer-reports/mrwhosetheboss) · [Cherry Lane](https://cherrylanemedia.com/blog/top-tech-influencers)
- Monetisation benchmarks (tech is priced above lifestyle; engagement matters more than follower count): [ClickAnalytic creator pricing report](https://www.clickanalytic.com/creator-pricing-report/)
- Lemo-Opuscar: [github.com/lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar), including README, AGENTS.md, DIRECTOR.md, TECHNIQUE.md, `styles/*/STYLE.md` and `styleboard/opuscar98_styles.json`
