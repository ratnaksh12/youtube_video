// Page entry: timeline.json + the lab and globe models → film
import { loadModel } from './kit/engine/holo.js';
import { makeFilm } from './film.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['300', '500', '600', '700'].map(w => document.fonts.load(`${w} 40px Rajdhani`)).concat([document.fonts.load('20px ShareTechMono')]));
const TLJ = await (await fetch('timeline.json')).json();
const [lab, globe] = await Promise.all([loadModel('models/lab.json', { normalize: false }), loadModel('models/globe.json', { normalize: false })]);
const film = makeFilm({ lab, globe, set: lab.set }, TLJ);
window.DUR = TLJ.dur;
window.EV = film.events();
window.TEXTS = t => film.texts(t);
const Q = new URLSearchParams(location.search);
window.render = t => { g.setTransform(1, 0, 0, 1, 0, 0); film.render(g, t, { nosub: Q.has('nosub') }); };
window.READY = true;
