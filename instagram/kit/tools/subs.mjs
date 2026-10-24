// Write a reel's burned-in caption chunks as cues for core/render/srt.py: node kit/tools/subs.mjs <reel folder> > cues.json
import fs from 'fs'; import path from 'path';
globalThis.document = { createElement: () => ({ getContext: () => ({}) }) };   // ui.js only needs this to load
const { makeSubs } = await import(new URL('../ui.js', import.meta.url).href);
const TLJ = JSON.parse(fs.readFileSync(path.join(process.argv[2], 'timeline.json')));
console.log(JSON.stringify(makeSubs(TLJ).map(c => ({ t0: +c.t0.toFixed(3), t1: +c.t1.toFixed(3), text: c.text })), null, 1));
