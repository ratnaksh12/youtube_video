// Page entry: timeline.json (voice lines + word times) + the phone model → film
import { loadModel, normalizeModel } from './engine/holo.js';
import { makeFilm, W, H } from './film.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['300', '500', '600'].map(w => document.fonts.load(`${w} 40px Rajdhani`)).concat([document.fonts.load('20px ShareTechMono')]));
const TLJ = await (await fetch('timeline.json')).json();
const model = await loadModel('models/phone.json', { normalize: false });
// normalise, and carry the extra paths the film needs through the same transform
let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
for (const P of model.parts) for (const C of P.pieces) for (let i = 0; i < C.v.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], C.v[i + k]); mx[k] = Math.max(mx[k], C.v[i + k]); }
normalizeModel(model);
const s = model.scale, o = [(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2], tw = p => p.map((x, k) => (x - o[k]) * s);
const cb = model.cellBox, c0 = tw([cb.x0, cb.y0, cb.z]), c1 = tw([cb.x1, cb.y1, cb.z]);
const film = makeFilm(model, TLJ, { pulse: model.paths.pulse.map(tw), cell: { x0: c0[0], y0: c0[1], x1: c1[0], y1: c1[1], z: c0[2] } });
window.DUR = TLJ.dur;
window.EV = film.events();
window.SUBS = film.subs.map(c => ({ t0: +c.t0.toFixed(3), t1: +c.t1.toFixed(3), text: c.text }));
window.TEXTS = t => film.texts(t);
const Q = new URLSearchParams(location.search);
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.render(g, t, { nosub: Q.has('nosub') }); };
window.READY = true;
