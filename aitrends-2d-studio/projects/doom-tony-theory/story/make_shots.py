"""story/make_shots.py — builds story/shots.json for "Is Doctor Doom Secretly Tony Stark?".
Each shot is anchored to the first words of its phrase (searched in order through timeline/words.json);
a shot starts 0.15 s before its anchor word and ends where the next one starts. Run from the project folder.
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.dirname(HERE)
LEAD, TAIL_END = 0.15, 5.2          # end card runs ~5 s after the last word (room for YouTube end-screen elements)
S = lambda *a: [{"at": a[i], "name": a[i + 1], "gain": a[i + 2]} for i in range(0, len(a), 3)]

# id, anchor (first words of the phrase; None = starts at 0), set, scene, extras
PLAN = [
 # ---------- cold open ----------
 ("t001", None, "black", "darkness: two green eye slits ignite", dict(bars="scope", sfx=S(0.3, "stinger", -8))),
 ("t002", "The final battle", "battle", "green multiverse battlefield, fallen heroes, Doom stands centre", dict(bars="scope", sfx=S(0.1, "thunder", -8), amb={"name": "wind", "gain": -22})),
 ("t003", "Doctor Doom stands", "battle", "low angle: Doom towers over the fallen heroes", dict(bars="scope", amb={"name": "wind", "gain": -22})),
 ("t004", "and slowly, he", "battle", "close-up: Doom slowly lifts his mask away", dict(bars="scope", sfx=S(0.4, "riser", -12, 1.0, "hit", -14))),
 ("t005", "The Avengers freeze", "battle", "FREEZE: Cap, Thor, Spider-Man shocked, debris hangs in the air", dict(bars="scope", in_={"type": "flash", "dur": 0.3}, sfx=S(0.0, "freeze", -6))),
 ("t006", "Because the face", "battle", "the face under the mask; an Iron Man helmet ghost dissolves into it: TONY STARK", dict(bars="scope", sfx=S(1.9, "stinger", -8))),
 ("t007", "But Reed Richards", "battle", "Reed and Sue stare, a different recognition", dict(bars="scope", amb={"name": "wind", "gain": -22})),
 ("t008", "They see Victor", "battle", "the same face, now framed by a green hood: VICTOR VON DOOM", dict(bars="scope", sfx=S(0.6, "shimmer", -10))),
 ("t009", "Same face", "split", "split: Tony's face | Victor's face, identical", dict(sfx=S(0.05, "whoosh", -12))),
 ("t010", "Two lives", "split", "split: Tony in a gold-lit mansion | Victor alone in a green castle", dict(sfx=S(0.05, "whoosh", -12))),
 ("t011", "Two universes", "cosmos", "two universe bubbles, blue and green, a figure in each", dict(sfx=S(0.1, "shimmer", -12))),
 ("t012", "And according to", "living", "the fan scrolls a theory post on a glowing phone", dict(amb={"name": "roomtone", "gain": -24})),
 ("t013", "it all started", "title", "TITLE CARD: IS DOCTOR DOOM SECRETLY TONY STARK?", dict(bars="scope", in_={"type": "fade", "dur": 0.5}, captions=False, sfx=S(0.0, "stinger", -5, 2.6, "impact", -8))),
 # ---------- 1970 ----------
 ("t014", "Remember the Time", "tunnel", "the quantum tunnel, two tiny figures flying through it", dict(in_={"type": "dip", "dur": 0.4}, sfx=S(0.0, "whoosh", -8, 0.8, "riser", -12))),
 ("t015", "Tony Stark and", "tunnel", "Tony and Steve pop out of the tunnel in 1970 disguises", dict(sfx=S(0.2, "powerup", -10, 2.6, "flash", -12))),
 ("t016", "to a military", "base70", "1970 army base establishing, golden afternoon, badge 1970 / NEW JERSEY", dict(in_={"type": "flash", "dur": 0.3}, amb={"name": "wind", "gain": -24})),
 ("t017", "to steal the", "vault70", "insert: the glowing Tesseract in its vault case", dict(sfx=S(0.1, "hum", -16, 0.4, "shimmer", -12))),
 ("t018", "They get it", "vault70", "a hand lifts the cube into a briefcase", dict(sfx=S(0.3, "pop", -10))),
 ("t019", "But they leave", "vault70", "the empty case, a footprint of light, the alarm starts to pulse", dict(sfx=S(1.0, "buzz", -12))),
 ("t020", "Because to everyone", "base70", "agents run across the base, red alarm lights", dict(sfx=S(0.2, "buzz", -10), amb={"name": "murmur", "gain": -22})),
 ("t021", "the Tesseract simply", "vault70", "the locked vault: empty pedestal, a fading blue afterglow, '?'", dict(sfx=S(0.5, "glitch", -14))),
 ("t022", "And the last", "base70", "spotlight on Howard Stark in the corridor, agents turn to look: HOWARD STARK", dict(sfx=S(1.6, "impact", -10))),
 # ---------- the rule ----------
 ("t023", "Endgame gave us", "blueprint", "BLUEPRINT: THE RULE (hourglass)", dict(bars="none", in_={"type": "zoom", "dur": 0.4}, sfx=S(0.3, "pop", -12))),
 ("t024", "Changing the past", "blueprint", "BLUEPRINT: a traveller loops back; the original line stays intact", dict(bars="none", sfx=S(0.4, "whoosh", -14, 1.8, "ding", -14))),
 ("t025", "It creates a", "blueprint", "BLUEPRINT: a new branch sprouts from the 1970 point: NEW BRANCH", dict(bars="none", sfx=S(1.2, "shimmer", -10))),
 ("t026", "So in the", "blueprint", "zoom into the branch: it becomes a little world with the base inside", dict(bars="none", sfx=S(0.4, "whoosh", -12))),
 ("t027", "has a missing", "desk70", "case file: the cube's photo stamped MISSING", dict(sfx=S(1.2, "hit", -8))),
 ("t028", "and only one", "desk70", "Howard's photo pinned, red circle, stamped SUSPECT", dict(sfx=S(0.9, "hit", -8))),
 # ---------- plot hole ----------
 ("t029", "Now, you might", "living", "bigFace fan, thinking, '?'", dict(sfx=S(0.1, "blip", -14))),
 ("t030", "didn't Captain America", "platform", "Steve on the time platform with a case of six glowing stones", dict(sfx=S(2.2, "powerup", -10))),
 ("t031", "He did", "vault70", "flash: the Tesseract reappears on its pedestal", dict(in_={"type": "flash", "dur": 0.25}, sfx=S(0.1, "shimmer", -8))),
 ("t032", "But putting the", "vault70", "the cube is back, but agents still stand around it, staring", dict(amb={"name": "hum", "gain": -22})),
 ("t033", "The alarms", "vault70", "insert: a red alarm light spinning", dict(sfx=S(0.0, "buzz", -8))),
 ("t034", "The questions", "interro", "interrogation: Howard under a hanging lamp, an agent leans in", dict(sfx=S(0.2, "hit", -14))),
 ("t035", "The suspicion that", "base70", "Howard walks; agents' shadows follow, a spotlight tracks him", dict(sfx=S(0.4, "footstep", -14, 1.2, "footstep", -14, 2.0, "footstep", -14))),
 # ---------- Howard's choice ----------
 ("t036", "And here's what", "base70", "bigFace Howard, worried", dict()),
 ("t037", "In that same", "base70", "two-shot: Howard and disguised Tony talk; a baby icon in a bubble", dict(amb={"name": "murmur", "gain": -26})),
 ("t038", "A father who", "home70", "Howard and pregnant Maria at home, golden light, a heart glow", dict(amb={"name": "roomtone", "gain": -24}, sfx=S(1.0, "shimmer", -14))),
 ("t039", "So when he's", "choice", "split: prison bars on one side, an open road on the other, Howard between", dict(sfx=S(1.0, "heartbeat", -10))),
 ("t040", "Howard chooses his", "home70", "Howard takes Maria's hand, suitcase in the other", dict(sfx=S(0.6, "ding", -14))),
 ("t041", "He takes Maria", "harbor", "a ship leaves New York at dusk, two figures on deck", dict(amb={"name": "wind", "gain": -22}, sfx=S(0.5, "whoosh", -16))),
 ("t042", "and starts over", "latveria", "LATVERIA establishing: mountains, a castle on the hill, village lights", dict(sfx=S(1.8, "shimmer", -12), amb={"name": "wind", "gain": -24})),
 # ---------- a different future ----------
 ("t043", "Think about what", "blueprint", "BLUEPRINT: two timelines split: OUR WORLD / THE BRANCH", dict(bars="none", in_={"type": "zoom", "dur": 0.4}, sfx=S(0.3, "pop", -12))),
 ("t044", "Howard's genius never", "blueprint", "BLUEPRINT: missile schematics, crossed out in red on 'never'", dict(bars="none", sfx=S(1.0, "hit", -10))),
 ("t045", "There is no", "city", "a tower's STARK INDUSTRIES sign glitches out of existence", dict(sfx=S(0.6, "glitch", -10))),
 ("t046", "Instead, his mind", "latveria", "Latveria blooms: high-tech spires rise, green lights switch on", dict(sfx=S(0.5, "powerup", -10))),
 ("t047", "And without Stark", "road", "a road forks at dusk; the car takes the glowing retro road", dict(sfx=S(0.6, "carpass", -12))),
 ("t048", "A bright, retro", "retro", "the retro-future city, a rocket launches", dict(sfx=S(0.4, "riser", -14), amb={"name": "city", "gain": -24})),
 ("t049", "The kind of", "space", "a rocket in space flies into a cosmic storm", dict(sfx=S(0.6, "powerup", -10))),
 ("t050", "become the Fantastic", "retro", "the Fantastic Four lineup in their retro world", dict(sfx=S(0.3, "impact", -10), amb={"name": "city", "gain": -24})),
 # ---------- Victor ----------
 ("t051", "Howard's son is", "latveria", "a castle window glows at night; Howard and Maria with a baby", dict(in_={"type": "dip", "dur": 0.4}, amb={"name": "wind", "gain": -26})),
 ("t052", "But he never", "latveria", "a ghostly Iron Man helmet fades; a small boy stands in its place", dict(sfx=S(0.6, "shimmer", -14))),
 ("t053", "He becomes Victor", "latveria", "young Victor in a green hood in the village square: VICTOR VON DOOM", dict(sfx=S(1.0, "stinger", -10))),
 ("t054", "Brilliant", "forge", "teen Victor builds a machine, sparks fly", dict(sfx=S(0.1, "hit", -12))),
 ("t055", "Proud", "latveria", "Victor on a castle balcony, arms crossed, cloak in the wind", dict(sfx=S(0.0, "whoosh", -14))),
 ("t056", "Raised on stories", "home70", "by the fire, old Howard tells a story; a blue cube glows in the smoke", dict(amb={"name": "roomtone", "gain": -24})),
 ("t057", "He meets Reed", "lab", "Victor shakes hands with Reed in the retro lab: REED RICHARDS", dict(amb={"name": "hum", "gain": -24}, sfx=S(0.6, "pop", -12))),
 ("t058", "Sue Storm. Johnny", "lab", "Sue, Johnny and Ben pop in one by one", dict(sfx=S(0.1, "pop", -12, 1.2, "pop", -12, 2.4, "pop", -12))),
 ("t059", "The same kind", "lab", "a warm photo: Victor with the four, friends", dict(sfx=S(0.4, "shimmer", -14))),
 ("t060", "But Victor loses", "lab", "the experiment explodes in green fire; the photo burns", dict(sfx=S(0.2, "impact", -5))),
 ("t061", "And from that", "forge", "a glowing mask is hammered on an anvil: Doom is born", dict(bars="scope", sfx=S(0.6, "hit", -8, 1.4, "hit", -8, 2.2, "hit", -6))),
 # ---------- the discovery ----------
 ("t062", "Then Doom discovers", "throne", "Doom in his hall before a green hologram", dict(sfx=S(0.3, "thunder", -12), amb={"name": "rain", "gain": -24})),
 ("t063", "He traces his", "holo", "HOLOGRAM: his timeline traced back to one bright point", dict(sfx=S(0.4, "whoosh", -12, 2.8, "ding", -12))),
 ("t064", "the 1970 Tesseract", "holo", "HOLOGRAM: the vault and the cube, 1970", dict(sfx=S(0.2, "glitch", -14))),
 ("t065", "And he finds", "holo", "HOLOGRAM: a man in glasses walks out with a briefcase, highlighted red", dict(sfx=S(1.0, "hit", -12))),
 ("t066", "A man with", "holo", "split: Victor's face and the hologram's face, identical", dict(sfx=S(0.2, "heartbeat", -10))),
 ("t067", "His father's name", "holo", "HOLOGRAM: a STARK nameplate, then a mother hugging a boy", dict(sfx=S(0.1, "pop", -14, 1.4, "pop", -14))),
 ("t068", "Tony Stark", "throne", "Iron Man's helmet reflected in Doom's eye slits: TONY STARK", dict(bars="scope", sfx=S(0.1, "stinger", -8))),
 # ---------- stolen lives ----------
 ("t069", "Tony was given", "split", "split: Tony warm and gold | Victor cold and green", dict()),
 ("t070", "Howard's love", "montage", "memory: young Tony and Howard, warm", dict(sfx=S(0.0, "whoosh", -16))),
 ("t071", "Pepper Potts", "montage", "memory: Tony and Pepper", dict(sfx=S(0.0, "whoosh", -16))),
 ("t072", "The Avengers", "montage", "memory: the Avengers line up", dict(sfx=S(0.0, "whoosh", -16))),
 ("t073", "The Stark legacy", "city", "memory: a tower with a glowing STARK sign", dict(sfx=S(0.0, "whoosh", -16))),
 ("t074", "A hero's ending", "wasteland", "memory: Iron Man at peace against the sunset", dict(bars="scope", sfx=S(0.3, "shimmer", -14))),
 ("t075", "To Victor, that", "throne", "Doom watching the memories float around him", dict(amb={"name": "rain", "gain": -24})),
 ("t076", "It was stolen", "throne", "Doom crushes the hologram, shards burst", dict(sfx=S(0.4, "impact", -6))),
 ("t077", "And that could", "cinema", "a cinema screen plays the Doomsday trailer: Doom's silhouette", dict(amb={"name": "murmur", "gain": -24})),
 ("t078", "In the Doomsday", "throne", "Doom addresses kneeling heroes from the throne steps", dict(sfx=S(0.4, "thunder", -12))),
 ("t079", "stolen lives, and", "throne", "bigFace Doom, words STOLEN LIVES burn in green", dict(bars="scope", sfx=S(0.1, "stinger", -8))),
 ("t080", "Maybe he isn't", "retro", "the Fantastic Four under Doom's spreading shadow", dict(sfx=S(0.3, "riser", -14))),
 ("t081", "Maybe he's talking", "battle", "a small Iron Man under a giant green Doom silhouette", dict(bars="scope", sfx=S(1.1, "impact", -8))),
 # ---------- Franklin ----------
 ("t082", "And remember the", "card", "the Fantastic Four: First Steps case floats in", dict(in_={"type": "whip", "dur": 0.35}, sfx=S(0.0, "swish", -8))),
 ("t083", "Doom quietly visits", "nursery", "nursery at night: a cloaked Doom, mask in hand, beside little Franklin", dict(amb={"name": "roomtone", "gain": -24}, sfx=S(1.2, "heartbeat", -12))),
 ("t084", "In the comics", "nursery", "Franklin's hands glow; reality bends around him", dict(sfx=S(1.0, "powerup", -10))),
 ("t085", "What if Doom", "throne", "Doom on the throne, universe bubbles orbiting him", dict(sfx=S(0.4, "shimmer", -12))),
 ("t086", "What if he", "cosmos", "Doom's gauntlet reaches for a warm bubble holding Tony's life", dict(sfx=S(1.8, "riser", -12))),
 # ---------- outro ----------
 ("t087", "That's what could", "stage", "spotlight: an actor holds an Iron Man helmet and Doom's mask: ROBERT DOWNEY JR.", dict(in_={"type": "dip", "dur": 0.4}, sfx=S(0.2, "impact", -12))),
 ("t088", "When the mask", "battle", "reprise: the mask comes off: TONY STARK", dict(bars="scope", sfx=S(0.6, "hit", -12))),
 ("t089", "Reed and Sue", "battle", "reprise: the same face in a green hood: VICTOR VON DOOM", dict(bars="scope", sfx=S(0.3, "shimmer", -12))),
 ("t090", "And stolen lives", "desk70", "a script page: the words STOLEN LIVES glow", dict(sfx=S(0.4, "pop", -12))),
 ("t091", "It becomes the", "web3d", "3D: two universes joined by a glowing thread through the Tesseract", dict(sfx=S(0.1, "whoosh", -10, 1.6, "shimmer", -10))),
 ("t092", "Of course, this", "living", "the fan shrugs, a THEORY stamp", dict(sfx=S(1.7, "hit", -10), amb={"name": "roomtone", "gain": -24})),
 ("t093", "Marvel hasn't confirmed", "living", "NOT CONFIRMED stamp... then YET pops", dict(sfx=S(0.8, "hit", -10, 2.03, "pop", -10))),
 ("t094", "So tell me", "versus", "VERSUS: Iron Man helmet vs Doom mask, a '=' with a '?'", dict(sfx=S(2.67, "impact", -8, 4.02, "pop", -10))),
 ("t095", "Or is the", "versus", "comment bubbles: SAME MAN / COINCIDENCE", dict(sfx=S(0.2, "pop", -12, 0.6, "pop", -12, 1.0, "pop", -12, 1.8, "pop", -12))),
 ("t096", "If you enjoyed", "living", "like, subscribe and the bell pop in", dict(sfx=S(1.8, "pop", -8, 2.46, "pop", -8, 3.76, "ding", -8))),
 ("t097", "Because when Doom", "throne", "Doom walks out of the green fog toward us", dict(bars="scope", in_={"type": "dip", "dur": 0.4}, sfx=S(0.3, "thunder", -6, 1.1, "footstep", -8))),
 ("t098", "Nothing in the", "space", "the universe cracks with green light", dict(bars="scope", sfx=S(0.2, "riser", -10, 1.6, "impact", -4))),
 ("t099", "@END", "end", "END SCREEN: the question, subscribe, the cast", dict(in_={"type": "fade", "dur": 0.5}, captions=False, bars="none")),
]

MUSIC = [
 ("t001", "dark", 0.6), ("t009", "mystery", 0.6), ("t013", "epic", 0.7), ("t014", "mystery", 0.55), ("t023", "wonder", 0.5),
 ("t029", "tension", 0.5), ("t036", "sad", 0.45), ("t043", "wonder", 0.55), ("t051", "mystery", 0.5), ("t060", "dark", 0.7),
 ("t062", "tension", 0.65), ("t069", "sad", 0.5), ("t076", "dark", 0.7), ("t082", "mystery", 0.6), ("t087", "epic", 0.65),
 ("t092", "calm", 0.4), ("t097", "epic", 0.8),
]


def norm(w):
    return re.sub(r"[^\w']", "", w.lower())


def main():
    words = json.load(open(os.path.join(P, "timeline", "words.json")))["words"]
    last_end = words[-1]["end"]
    duration = round(last_end + 0.5 + TAIL_END, 2)
    starts, wi = [], 0
    for sid, anchor, *_ in PLAN:
        if anchor is None:
            starts.append(0.0); continue
        if anchor == "@END":
            starts.append(round(last_end + 0.5, 3)); continue
        toks = [norm(x) for x in anchor.split()]
        for j in range(wi, len(words) - len(toks) + 1):
            if all(norm(words[j + k]["word"]) == toks[k] for k in range(len(toks))):
                starts.append(round(max(0.0, words[j]["start"] - LEAD), 3)); wi = j + 1; break
        else:
            raise SystemExit(f"anchor not found after word {wi}: {sid} '{anchor}'")
    shots = []
    for i, (sid, anchor, set_, scene, ex) in enumerate(PLAN):
        st, en = starts[i], starts[i + 1] if i + 1 < len(PLAN) else duration
        line = " ".join(w["word"] for w in words if st - 0.02 <= w["start"] < en - 0.02)
        sh = {"id": sid, "start": st, "end": round(en, 3), "line": line, "scene": scene, "set": set_, "bars": ex.get("bars"),
              "in": ex.get("in_", {"type": "cut"}), "sfx": [c for c in ex.get("sfx", []) if c["at"] < en - st], "notes": ""}
        if ex.get("amb"): sh["amb"] = ex["amb"]
        if "captions" in ex: sh["captions"] = ex["captions"]
        shots.append(sh)
    ids = [s["id"] for s in shots]
    music = []
    for k, (sid, mood, inten) in enumerate(MUSIC):
        a = shots[ids.index(sid)]["start"]; b = shots[ids.index(MUSIC[k + 1][0])]["start"] if k + 1 < len(MUSIC) else duration
        music.append({"start": a, "end": b, "mood": mood, "intensity": inten})
    story = {"title": "Is Doctor Doom Secretly Tony Stark? How Endgame Created Doom (Theory)", "duration": duration, "shots": shots, "music": music}
    json.dump(story, open(os.path.join(P, "story", "shots.json"), "w"), indent=1, ensure_ascii=False)
    d = sorted(s["end"] - s["start"] for s in shots)
    print(f"{len(shots)} shots, {duration:.1f}s, median {d[len(d) // 2]:.2f}s, min {d[0]:.2f}s, max {d[-1]:.2f}s")
    for s in shots:
        if s["end"] - s["start"] < 0.7 or not s["line"] and s["id"] not in ("t099",):
            print("  check", s["id"], round(s["end"] - s["start"], 2), repr(s["line"]))


if __name__ == "__main__":
    main()
