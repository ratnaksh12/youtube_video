// A fictional handset (no real brand or silhouette), built for one job: open the back and find the chip that makes the battery number.
//   node models/gen_phone.mjs  → models/phone.json
// Metres, y up (the phone stands on its bottom edge), x = across the screen, z = out of the screen (the back faces -z).
import { Model } from './mkmodel.mjs';
import fs from 'fs';

const W = 0.074, H = 0.158, D = 0.0084, R = 0.0105;   // body
const m = new Model('HANDSET-01');

// rounded rectangle outline, counter-clockwise, n points per corner
function rr(cx, cy, w, h, r, n = 6) {
  const P = [], C = [[cx + w / 2 - r, cy + h / 2 - r, 0], [cx - w / 2 + r, cy + h / 2 - r, 1], [cx - w / 2 + r, cy - h / 2 + r, 2], [cx + w / 2 - r, cy - h / 2 + r, 3]];
  for (const [x, y, q] of C) for (let i = 0; i <= n; i++) { const a = (q + i / n) * Math.PI / 2; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  return P;
}
// a closed outline at depth z; returns vertex ids
function loop(pts, z) {
  const ids = pts.map(([x, y]) => m.vtx([x, y, z]));
  for (let i = 0; i < ids.length; i++) m.edge(ids[i], ids[(i + 1) % ids.length]);
  return ids;
}
// a slab: the outline at several depths, joined (side quads, every `rib`-th vertical line)
function slab(pts, z0, z1, rings = 2, rib = 3) {
  const L = [];
  for (let k = 0; k < rings; k++) L.push(loop(pts, z0 + (z1 - z0) * k / (rings - 1)));
  const n = pts.length;
  for (let k = 0; k < rings - 1; k++) for (let i = 0; i < n; i++) {
    if (i % rib === 0) m.edge(L[k][i], L[k + 1][i]);
    m.quad(L[k][i], L[k][(i + 1) % n], L[k + 1][(i + 1) % n], L[k + 1][i]);
  }
  return L;
}
// a flat face filled with quads between an outer outline and the same outline scaled about its centre (gives the solid hologram a skin)
function face(pts, z, cx, cy, s = 0.82) {
  const A = loop(pts, z), B = loop(pts.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s]), z);
  for (let i = 0; i < A.length; i++) m.quad(A[i], A[(i + 1) % A.length], B[(i + 1) % A.length], B[i]);
}

const body = rr(0, H / 2, W, H, R, 6);

// ---- the shell: side frame, screen, back cover ----
m.part('phone', { anchor: [0, H * 0.5, -D / 2 - 0.0003] });
m.piece('frame');
slab(body, -D / 2 + 0.0006, D / 2 - 0.0006, 3, 4);
m.box([W / 2 + 0.0006, 0.112, 0], [0.0014, 0.016, 0.0034]);          // power key
m.box([W / 2 + 0.0006, 0.088, 0], [0.0014, 0.022, 0.0034]);          // volume rocker
m.box([0, 0.0004, 0], [0.009, 0.0012, 0.0036]);                      // port, bottom edge
m.piece('screen');
face(rr(0, H / 2, W - 0.0012, H - 0.0012, R - 0.0006, 6), D / 2, 0, H / 2, 0.97);
loop(rr(0, H / 2, W - 0.0055, H - 0.0055, R - 0.003, 6), D / 2 + 0.0001); // active area
m.circle([0, H - 0.0085, D / 2 + 0.0001], [0, 0, 1], 0.0019, 12);     // punch-hole camera
m.piece('back', { explode: [0, 0, -0.055] });
face(rr(0, H / 2, W - 0.0012, H - 0.0012, R - 0.0006, 6), -D / 2, 0, H / 2, 0.97);
{ // camera island: a vertical pill, two lenses and a flash
  const cx = -0.0195, cy = 0.1365, pill = rr(cx, cy, 0.0145, 0.03, 0.0072, 8);
  slab(pill, -D / 2, -D / 2 - 0.0016, 2, 2);
  for (const [y, r] of [[0.1445, 0.0052], [0.1290, 0.0052]]) { m.ring([cx, y, -D / 2 - 0.0016], [0, 0, 1], r, 20, 0.0012); m.circle([cx, y, -D / 2 - 0.0023], [0, 0, 1], r * 0.55, 14); }
  m.circle([cx + 0.0105, 0.1445, -D / 2 - 0.0002], [0, 0, 1], 0.0018, 10);
}
for (const r of [0.0135, 0.0175, 0.0215]) m.circle([0, 0.072, -D / 2 + 0.0004], [0, 0, 1], r, 40);   // charging coil (inside the cover)

// ---- inside: logic board ----
m.part('board', { anchor: [0.006, 0.131, -0.0012] });
m.piece('pcb', { internal: true });
{
  const pcb = [[-0.031, 0.1125], [0.031, 0.1125], [0.031, 0.145], [0.026, 0.151], [-0.004, 0.151], [-0.006, 0.148], [-0.031, 0.148]];
  slab(pcb, -0.0006, 0.0004, 2, 1);
  m.box([0.007, 0.131, -0.0012], [0.013, 0.013, 0.0012]);             // processor
  m.box([0.022, 0.134, -0.0010], [0.006, 0.009, 0.0008]);             // memory
  m.box([0.019, 0.121, -0.0009], [0.008, 0.005, 0.0006]);             // power chip
  m.box([0.024, 0.1445, -0.0009], [0.006, 0.004, 0.0006]);
  m.box([-0.004, 0.119, -0.0009], [0.007, 0.005, 0.0006]);
  m.box([0.014, 0.1155, -0.0011], [0.008, 0.0026, 0.0012]);           // battery connector
  for (const [y, r] of [[0.1445, 0.0046], [0.1290, 0.0046]]) m.tube([-0.0195, y, -0.0008], [-0.0195, y, -0.0038], r, { rings: 2, seg: 14, longs: 4 });   // camera modules
}

// ---- inside: the cell ----
m.part('battery', { anchor: [0, 0.064, -0.0037], center: [0, 0.066, -0.002] });
m.piece('cell', { internal: true });
{
  const cell = rr(0, 0.0645, 0.061, 0.083, 0.004, 4);
  slab(cell, -0.0036, 0.0018, 3, 2);
  face(cell, -0.0036, 0, 0.0645, 0.86);
  loop(rr(0, 0.0645, 0.054, 0.076, 0.003, 4), -0.00365);             // pouch emboss
  // top seal flange
  const f = [[-0.0295, 0.106], [0.0295, 0.106], [0.0295, 0.1078], [-0.0295, 0.1078]];
  slab(f, -0.0012, -0.0004, 2, 1);
}

// ---- the cell tabs (where the voltage is read) ----
m.part('tabs', { anchor: [0, 0.1076, -0.0012], center: [0, 0.106, -0.001] });
m.piece('tab-pos', { internal: true });
m.box([-0.0065, 0.1088, -0.0008], [0.004, 0.0034, 0.0003]);
m.piece('tab-neg', { internal: true });
m.box([0.0065, 0.1088, -0.0008], [0.004, 0.0034, 0.0003]);

// ---- the fuel gauge: its little board, the chip, and the flex to the logic board ----
m.part('gauge', { anchor: [0.0, 0.1093, -0.0016], center: [0.0, 0.1093, -0.0012] });
m.piece('pcm', { internal: true });
m.box([0, 0.1093, -0.0005], [0.026, 0.0042, 0.0007]);
m.piece('ic', { internal: true });
m.box([0, 0.1093, -0.0012], [0.0042, 0.0032, 0.0008]);
for (let i = 0; i < 4; i++) { const x = -0.0015 + i * 0.001; m.box([x, 0.1075, -0.0010], [0.0004, 0.0005, 0.0003]); m.box([x, 0.1111, -0.0010], [0.0004, 0.0005, 0.0003]); }   // pins
m.piece('flex', { internal: true, box: false });
{
  const path = [[0.013, 0.1093], [0.0175, 0.1098], [0.0195, 0.1112], [0.0185, 0.1135], [0.0155, 0.1150]];
  let prevA = null, prevB = null;
  for (const [x, y] of path) {
    const a = m.vtx([x, y, -0.0006]), b = m.vtx([x, y, -0.0016]);
    m.edge(a, b);
    if (prevA !== null) { m.edge(prevA, a); m.edge(prevB, b); m.quad(prevA, a, b, prevB); }
    prevA = a; prevB = b;
  }
}

const j = m.toJSON();
// where the charge pulses travel: cell tab → chip → flex → board connector (used by film.js)
j.paths = { pulse: [[-0.0065, 0.1078, -0.0010], [-0.0065, 0.1093, -0.0010], [0, 0.1093, -0.0016], [0.013, 0.1093, -0.0011], [0.0175, 0.1098, -0.0011], [0.0195, 0.1112, -0.0011], [0.0185, 0.1135, -0.0011], [0.0155, 0.115, -0.0011]] };
j.cellBox = { x0: -0.0305, x1: 0.0305, y0: 0.023, y1: 0.106, z: -0.0037 };
let nv = 0, ne = 0; for (const P of j.parts) for (const C of P.pieces) { nv += C.v.length / 3; ne += C.e.length / 2; }
fs.writeFileSync(new URL('./phone.json', import.meta.url), JSON.stringify(j));
console.log(`phone.json: ${j.parts.length} parts, ${nv} vertices, ${ne} edges`);
