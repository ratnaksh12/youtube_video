// Page entry: timeline.json + the TV model → film
import { loadModel, normalizeModel } from './kit/engine/holo.js';
import { makeFilm } from './film.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['300', '500', '600', '700'].map(w => document.fonts.load(`${w} 40px Rajdhani`)).concat([document.fonts.load('20px ShareTechMono')]));
const TLJ = await (await fetch('timeline.json')).json();
const model = await loadModel('models/tv.json', { normalize: false });
let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
for (const P of model.parts) for (const C of P.pieces) for (let i = 0; i < C.v.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], C.v[i + k]); mx[k] = Math.max(mx[k], C.v[i + k]); }
normalizeModel(model, 2.0);
const s = model.scale, o = [(mn[0] + mx[0]) / 2, mn[1], (mn[2] + mx[2]) / 2], tw = p => p.map((x, k) => (x - o[k]) * s);
const sc = model.screen, screen = { o: tw(sc.o), u: sc.u.map(x => x * s), v: sc.v.map(x => x * s) };
const film = makeFilm(model, TLJ, { screen });
window.DUR = TLJ.dur;
window.EV = film.events();
window.TEXTS = t => film.texts(t);
const Q = new URLSearchParams(location.search);
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.render(g, t, { nosub: Q.has('nosub') }); };
window.READY = true;
