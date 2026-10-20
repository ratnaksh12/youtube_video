"""Re-voice only the sentences containing MCU / TVA so the acronyms are spoken as one smooth word,
and fit each new clip into the sentence's ORIGINAL time slot (gentle time-stretch, then silence pad),
so every other word, and therefore every shot cut, stays exactly where it was.

  python3 patch_acronyms.py            # reads out/voiceover.wav + out/sentences.json, writes out/voiceover_v2.wav
"""
import json, os, re, subprocess, tempfile
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
import make_voiceover as MV

SR = MV.SR
MIN_TEMPO = 0.92            # never slow a sentence down by more than ~8%


def atempo(x, f):
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, "a.wav"), os.path.join(d, "b.wav")
        sf.write(a, x, SR, subtype="FLOAT")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", a, "-af", f"atempo={f:.5f}", b], check=True)
        y, _ = sf.read(b, dtype="float32")
    return y


def main():
    k = Kokoro("/home/user/tts_models/kokoro-v1.0.onnx", "/home/user/tts_models/voices-v1.0.bin")
    voice = 0.65 * k.get_voice_style("am_michael") + 0.35 * k.get_voice_style("am_onyx")
    y, sr = sf.read("out/voiceover.wav", dtype="float32"); assert sr == SR
    peak_scale = 0.89 / (np.abs(y).max() + 1e-9)   # the original was peak-normalised; match its level
    cues = json.load(open("out/sentences.json"))
    words = json.load(open("out/words.json"))["words"]
    for c in cues:
        if not re.search(r"\b(MCU|TVA)\b", c["text"]):
            continue
        clip, _ = k.create(MV.say_text(c["text"]), voice=voice, speed=1.06, lang="en-us")
        clip = MV.trim(clip.astype(np.float32))
        # the raw synth level matches the pre-normalisation level of the original file
        orig_peak = np.abs(y).max()
        lo, hi = int(round(c["start"] * SR)), int(round(c["end"] * SR))
        slot = hi - lo
        new = len(clip)
        if new < slot:
            f = max(MIN_TEMPO, new / slot)
            if f < 0.999:
                clip = atempo(clip, f)
            clip = np.concatenate([clip, np.zeros(max(0, slot - len(clip)), np.float32)])[:slot]
        elif new > slot:
            clip = atempo(clip, new / slot)[:slot]
        # level: original audio = raw * scale; scale = 0.89 / raw_peak of the whole file (unknown here),
        # so match RMS of the speech in the replaced region instead
        old = y[lo:hi]
        rms = lambda v: np.sqrt(np.mean(v[np.abs(v) > 0.01] ** 2)) if np.any(np.abs(v) > 0.01) else 1
        clip = clip * (rms(old) / rms(clip))
        y[lo:hi] = clip[: hi - lo]
        # re-place this sentence's words inside the same slot
        idx = [i for i, w in enumerate(words) if c["start"] - 0.01 <= w["start"] < c["end"] + 0.01]
        placed = [p for p in MV.place_words(c["text"], clip[: hi - lo]) if p["word"] not in ("—", "–")]
        if len(placed) == len(idx):
            for i, p in zip(idx, placed):
                words[i] = {"word": words[i]["word"], "start": round(c["start"] + p["start"], 3), "end": round(c["start"] + p["end"], 3)}
        print(f"[{c['start']:7.2f}] {new / SR:5.2f}s -> slot {slot / SR:5.2f}s  {c['text'][:70]}")
    y = np.clip(y, -1, 1)
    sf.write("out/voiceover_v2.wav", y, SR, subtype="PCM_16")
    json.dump({"words": words}, open("out/words_v2.json", "w"), indent=1)
    print("wrote out/voiceover_v2.wav and out/words_v2.json")


if __name__ == "__main__":
    main()
