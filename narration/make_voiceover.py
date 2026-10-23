"""Generate the voiceover from script.md with Kokoro TTS and write a word-timed JSON.

  python3 make_voiceover.py --script script.md --out out/

Spoken text = the script paragraphs, verbatim, with markdown/headings stripped.
Each sentence is synthesised on its own so its start/end time is exact; words inside a
sentence are placed on the voiced audio (pauses detected from the waveform), with
comma/dash clause breaks snapped to the detected pauses.
"""
import argparse, json, os, re
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

SR = 24000
GAP_SENT, GAP_PARA, GAP_SECTION = 0.16, 0.34, 0.75
EXTRA = {"Think about that for a second.": 0.45, "Now things get dangerous.": 0.25,
         "Because when Doom arrives…": 0.35, "Six movies.": 0.1, "Why?": 0.1}

# pronunciation hints only (display text stays verbatim)
# MCU / TVA are left as-is: the phonemizer reads them as one smooth word (no letter-by-letter pauses)
SAY = [(r"S\.H\.I\.E\.L\.D\.", "Shield"), (r"\bJr\.", "Junior"), (r"…", "..."),
       (r"\bBelova\b", "Beh-loh-vah"), (r"\bwatchlist\b", "watch list"), (r" & ", " and ")]


def spoken_blocks(md):
    """-> list of (section_index, [paragraph text,...])"""
    secs, cur = [], None
    for line in md.splitlines():
        s = line.strip()
        if s.startswith("## "):
            cur = []
            secs.append(cur)
            continue
        if cur is None or not s:
            continue
        s = s.replace("**", "").replace("*", "")
        cur.append(s)
    return secs


def split_sentences(p):
    p = p.replace("Jr. ", "Jr. ")
    p = re.sub(r"\b(?:[A-Z]\.){2,}", lambda m: m.group(0).replace(".", "\u2024"), p)   # S.H.I.E.L.D. is not a sentence end
    parts = re.split(r"(?<=[.?!…])[ \t]+", p)
    return [x.replace(" ", " ").replace("\u2024", ".").strip() for x in parts if x.strip()]


def say_text(s):
    for a, b in SAY:
        s = re.sub(a, b, s)
    return s


def trim(a, thr=0.008, pad=0.03):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    lo = max(0, idx[0] - int(pad * SR))
    hi = min(len(a), idx[-1] + int(pad * SR))
    return a[lo:hi]


def syl(w):
    w = w.lower()
    if re.fullmatch(r"\d+", w):
        return {"1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1}.get(w, 2)
    if w in ("mcu", "tva"):
        return 3
    n = len(re.findall(r"[aeiouy]+", re.sub(r"[^a-z]", "", w)))
    if w.endswith("e") and n > 1 and not w.endswith("le"):
        n -= 1
    return max(1, n)


def pauses(a, hop=0.01, min_len=0.085):
    n = int(hop * SR)
    fr = np.array([np.sqrt(np.mean(a[i:i + n] ** 2)) for i in range(0, len(a) - n, n)])
    thr = max(0.006, 0.06 * np.percentile(fr, 95))
    sil = fr < thr
    runs, i = [], 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]:
                j += 1
            if i > 0 and j < len(sil) and (j - i) * hop >= min_len:
                runs.append(((i) * hop, (j) * hop))
            i = j
        else:
            i += 1
    return runs


def place_words(text, a):
    """word timings (relative to clip start) for one sentence clip."""
    toks = text.split()
    dur = len(a) / SR
    w = [syl(t) + 0.6 for t in toks]
    breaks = [i for i, t in enumerate(toks[:-1]) if re.search(r"[,;:—–]$", t) or toks[i + 1] in ("—", "–")]
    runs = pauses(a)
    # clause groups: walk the breaks in order; each break goes where the remaining time predicts,
    # snapped to a detected pause only if one lies close to that prediction
    bounds = []  # (word_lo, word_hi, t0, t1)
    lo, t0 = 0, 0.0
    for b in breaks:
        exp = t0 + (dur - t0) * sum(w[lo: b + 1]) / sum(w[lo:])
        near = [r for r in runs if abs(r[0] - exp) < 0.4 and r[0] > t0 + 0.12 and r[1] < dur - 0.12]
        if near:
            r = min(near, key=lambda r: abs(r[0] - exp))
            bounds.append((lo, b + 1, t0, r[0]))
            lo, t0 = b + 1, r[1]
        else:
            bounds.append((lo, b + 1, t0, exp))
            lo, t0 = b + 1, exp
    bounds.append((lo, len(toks), t0, dur))
    out = []
    for lo, hi, t0, t1 in bounds:
        # inner pauses inside this group are removed from the speaking time
        inner = [r for r in runs if r[0] >= t0 + 0.02 and r[1] <= t1 - 0.02]
        speak = (t1 - t0) - sum(r[1] - r[0] for r in inner)
        ww = w[lo:hi]
        acc = 0.0

        def map_t(x):  # speaking-time offset -> clip time
            t = t0 + x
            for r in inner:
                if t >= r[0]:
                    t += r[1] - r[0]
            return t

        for i, tw in zip(range(lo, hi), ww):
            d = speak * tw / sum(ww)
            out.append({"word": toks[i], "start": map_t(acc), "end": map_t(acc + d * 0.94)})
            acc += d
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--script", default="script.md")
    ap.add_argument("--out", default="out")
    ap.add_argument("--speed", type=float, default=1.06)
    ap.add_argument("--models", default="/home/user/tts_models")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    k = Kokoro(os.path.join(a.models, "kokoro-v1.0.onnx"), os.path.join(a.models, "voices-v1.0.bin"))
    voice = 0.65 * k.get_voice_style("am_michael") + 0.35 * k.get_voice_style("am_onyx")
    secs = spoken_blocks(open(a.script, encoding="utf-8").read())
    audio, words, cues, t = [np.zeros(int(0.35 * SR), np.float32)], [], [], 0.35
    for si, paras in enumerate(secs):
        if si:
            audio.append(np.zeros(int(GAP_SECTION * SR), np.float32)); t += GAP_SECTION
        for pi, p in enumerate(paras):
            if pi:
                audio.append(np.zeros(int(GAP_PARA * SR), np.float32)); t += GAP_PARA
            for ji, s in enumerate(split_sentences(p)):
                if ji:
                    audio.append(np.zeros(int(GAP_SENT * SR), np.float32)); t += GAP_SENT
                clip, sr = k.create(say_text(s), voice=voice, speed=a.speed, lang="en-us")
                assert sr == SR
                clip = trim(clip.astype(np.float32))
                for wd in place_words(s, clip):
                    if wd["word"] in ("—", "–"):
                        continue
                    words.append({"word": wd["word"], "start": round(t + wd["start"], 3), "end": round(t + wd["end"], 3)})
                cues.append({"start": round(t, 3), "end": round(t + len(clip) / SR, 3), "text": s, "section": si})
                audio.append(clip); t += len(clip) / SR
                if s in EXTRA:
                    audio.append(np.zeros(int(EXTRA[s] * SR), np.float32)); t += EXTRA[s]
                print(f"[{cues[-1]['start']:7.2f}] {s}")
    audio.append(np.zeros(int(0.6 * SR), np.float32))
    y = np.concatenate(audio)
    y = 0.89 * y / (np.abs(y).max() + 1e-9)
    sf.write(os.path.join(a.out, "voiceover.wav"), y, SR, subtype="PCM_16")
    json.dump({"words": words}, open(os.path.join(a.out, "words.json"), "w"), indent=1)
    json.dump(cues, open(os.path.join(a.out, "sentences.json"), "w"), indent=1)
    print(f"voiceover {len(y) / SR:.1f}s, {len(words)} words, {len(cues)} sentences")


if __name__ == "__main__":
    main()
