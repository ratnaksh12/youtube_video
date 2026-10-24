// Write the burned-in caption chunks as cues for core/render/srt.py: node tools/subs.mjs > out/cues.json
import fs from 'fs';
globalThis.document = { createElement: () => ({ getContext: () => ({}) }) };   // film.js only needs this to load
const here = new URL('..', import.meta.url).pathname;
const { makeSubs } = await import(here + 'film.js');
const TLJ = JSON.parse(fs.readFileSync(here + 'timeline.json'));
console.log(JSON.stringify(makeSubs(TLJ).map(c => ({ t0: +c.t0.toFixed(3), t1: +c.t1.toFixed(3), text: c.text })), null, 1));
