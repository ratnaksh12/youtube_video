// The set for Reel 03: a glass sandbox (the training environment) with an AI core inside, and the live internet as a globe outside.
//   node models/gen_lab.mjs → models/lab.json + models/globe.json
// Metres, y up. Two models, because the globe turns on its own axis (holo.js spins a whole model about y; piece spin is z-only).
import { Model } from '../kit/models/mkmodel.mjs';
import fs from 'fs';

const TAU = Math.PI * 2;
const BOX = { s: 1.0, y0: 0.06 };                    // the sandbox: a 1 m cube standing just above the pad
const CORE = [0, BOX.y0 + 0.5, 0];                   // the AI, centred in the box
const PORT = [0.28, BOX.y0 + BOX.s, 0.22];           // the DNS port on the lid: the one way out
const CACHE = [-0.27, BOX.y0 + 0.17, 0.27];          // the saved copy of the web (appears in l06)
const GLOBE = { c: [0.8, 1.4, -1.5], r: 0.5 };   // the live internet

// ---------------------------------------------------------------- the sandbox, the core, the port, the cache
const m = new Model('LAB-01');
const h = BOX.s / 2, y0 = BOX.y0, y1 = BOX.y0 + BOX.s;
m.part('box', { anchor: [0, y1, 0] });
m.piece('frame');
const C = [[-h, y0, -h], [h, y0, -h], [h, y0, h], [-h, y0, h], [-h, y1, -h], [h, y1, -h], [h, y1, h], [-h, y1, h]].map(p => m.vtx(p));
for (let i = 0; i < 4; i++) { m.edge(C[i], C[(i + 1) % 4]); m.edge(C[4 + i], C[4 + (i + 1) % 4]); m.edge(C[i], C[4 + i]); }
// glass: each face as a 4×4 grid of quads (the solid look), with one faint midline each way
m.piece('glass');
const faces = [
  [[-h, y0, h], [1, 0, 0], [0, 1, 0]], [[h, y0, h], [0, 0, -1], [0, 1, 0]], [[h, y0, -h], [-1, 0, 0], [0, 1, 0]],
  [[-h, y0, -h], [0, 0, 1], [0, 1, 0]], [[-h, y1, h], [1, 0, 0], [0, 0, -1]],
];
for (const [o, u, v] of faces) {
  const N = 4, id = [];
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) id.push(m.vtx(o.map((x, k) => x + (u[k] * i + v[k] * j) * BOX.s / N)));
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) m.quad(id[j * 5 + i], id[j * 5 + i + 1], id[(j + 1) * 5 + i + 1], id[(j + 1) * 5 + i]);
  m.edge(id[2], id[22]); m.edge(id[10], id[14]);
}
m.piece('floor');                                           // a grid on the floor of the box
for (let i = 1; i < 8; i++) { const x = -h + i * BOX.s / 8; m.edge(m.vtx([x, y0 + 0.002, -h]), m.vtx([x, y0 + 0.002, h])); m.edge(m.vtx([-h, y0 + 0.002, x]), m.vtx([h, y0 + 0.002, x])); }

m.part('core', { anchor: CORE });
m.piece('ico', { axis: { c: CORE, d: [0, 0, 1] } });
icosphere(CORE, 0.17, 1);
m.piece('ring', { axis: { c: CORE, d: [0, 0, 1] } });
{ const n = [Math.sin(0.5), Math.cos(0.5), 0.25]; m.ring(CORE, n, 0.27, 48); m.ring(CORE, n, 0.29, 48); }
m.piece('inner', { axis: { c: CORE, d: [0, 0, 1] } });
icosphere(CORE, 0.07, 0);

m.part('port', { anchor: PORT });
m.piece('port');
m.ring(PORT, [0, 1, 0], 0.07, 24, 0.012); m.ring(PORT, [0, 1, 0], 0.04, 16);
for (let i = 0; i < 4; i++) { const a = i * TAU / 4 + TAU / 8; m.edge(m.vtx([PORT[0] + Math.cos(a) * 0.07, PORT[1], PORT[2] + Math.sin(a) * 0.07]), m.vtx([PORT[0] + Math.cos(a) * 0.1, PORT[1], PORT[2] + Math.sin(a) * 0.1])); }

m.part('cache', { anchor: CACHE });
m.piece('cache', { internal: true });
latLong(CACHE, 0.12, 4, 8, 24);
m.ring([CACHE[0], y0 + 0.004, CACHE[2]], [0, 1, 0], 0.16, 32);

writeModel(m, 'lab.json', { BOX, CORE, PORT, CACHE, GLOBE });   // film.js reads the set's layout from here

// ---------------------------------------------------------------- the live internet
const g = new Model('NET-01');
g.part('globe', { anchor: GLOBE.c });
g.piece('grid');
latLong(GLOBE.c, GLOBE.r, 5, 14, 40, g);
g.piece('orbit');
{ const n = [0.25, 1, -0.15]; g.ring(GLOBE.c, n, GLOBE.r * 1.32, 64); }
g.piece('nodes');                                          // a few server nodes on the surface
for (let i = 0; i < 18; i++) {
  const la = (hash(i) - 0.5) * 2.2, lo = hash(i + 40) * TAU, r = GLOBE.r * 1.01;
  const p = [GLOBE.c[0] + Math.cos(la) * Math.cos(lo) * r, GLOBE.c[1] + Math.sin(la) * r, GLOBE.c[2] + Math.cos(la) * Math.sin(lo) * r];
  g.box(p, [0.018, 0.018, 0.018]);
}
writeModel(g, 'globe.json');

// ---------------------------------------------------------------- helpers
function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
function latLong(c, r, nLat, nLon, seg, M = m) {
  for (let i = 1; i < nLat; i++) { const la = -Math.PI / 2 + i * Math.PI / nLat; M.ring([c[0], c[1] + Math.sin(la) * r, c[2]], [0, 1, 0], Math.cos(la) * r, seg); }
  for (let j = 0; j < nLon; j++) {
    const lo = j * Math.PI / nLon;
    M.circle(c, [Math.sin(lo), 0, -Math.cos(lo)], r, seg);
  }
}
function icosphere(c, r, sub) {
  const t = (1 + Math.sqrt(5)) / 2;
  let V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]];
  let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  for (let s = 0; s < sub; s++) {
    const mid = {}, F2 = [];
    const md = (a, b) => { const k = a < b ? a + '_' + b : b + '_' + a; if (mid[k] === undefined) { V.push(V[a].map((x, i) => (x + V[b][i]) / 2)); mid[k] = V.length - 1; } return mid[k]; };
    for (const [a, b, d] of F) { const ab = md(a, b), bd = md(b, d), da = md(d, a); F2.push([a, ab, da], [b, bd, ab], [d, da, bd], [ab, bd, da]); }
    F = F2;
  }
  const ids = V.map(p => { const l = Math.hypot(...p); return m.vtx(p.map((x, i) => c[i] + x / l * r)); });
  const seen = new Set();
  for (const [a, b, d] of F) {
    for (const [x, y] of [[a, b], [b, d], [d, a]]) { const k = x < y ? x + '_' + y : y + '_' + x; if (!seen.has(k)) { seen.add(k); m.edge(ids[x], ids[y]); } }
    m.quad(ids[a], ids[b], ids[d], ids[d]);
  }
}
function writeModel(M, f, set) {
  const j = M.toJSON(); if (set) j.set = set;
  let nv = 0, ne = 0; for (const P of j.parts) for (const Q of P.pieces) { nv += Q.v.length / 3; ne += Q.e.length / 2; }
  fs.writeFileSync(new URL('./' + f, import.meta.url), JSON.stringify(j));
  console.log(`${f}: ${j.parts.length} parts, ${nv} vertices, ${ne} edges`);
}
