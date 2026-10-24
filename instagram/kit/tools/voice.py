"""Voice every line of <reel>/script.json with Kokoro → <reel>/voice/<id>.wav (the account's narrator: am_michael, speed 1.1).
A line can set "say" when the spoken text should differ from "text" (pronunciation only).

  python kit/tools/voice.py <reel folder>
"""
import json, os, sys, subprocess
REEL = os.path.abspath(sys.argv[1]); LIB = os.environ.get('LIB', '/home/user/lemomo-ai/lemo-opuscar')
script = json.load(open(os.path.join(REEL, 'script.json')))
os.makedirs(os.path.join(REEL, 'voice'), exist_ok=True)
lines = [{'id': l['id'], 'text': l.get('say', l['text']), 'voice': l.get('voice', 'am_michael'), 'speed': l.get('speed', 1.1)} for l in script]
json.dump(lines, open(os.path.join(REEL, 'voice', 'lines.json'), 'w'), indent=1)
subprocess.run([os.path.join(LIB, '.venv', 'bin', 'python'), os.path.join(LIB, 'core', 'tts', 'tts.py'), os.path.join(REEL, 'voice', 'lines.json'), os.path.join(REEL, 'voice')], check=True, cwd=LIB)
