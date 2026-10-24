// A fictional 55" smart TV on a centre pedestal (no real brand or silhouette). The home screen itself is drawn by film.js on the screen plane.
//   node models/gen_tv.mjs → models/tv.json
// Metres, y up, x across the screen, z out of the screen (the back faces -z).
import { Model } from '../kit/models/mkmodel.mjs';
import fs from 'fs';

const W = 1.23, H = 0.71, D = 0.028, Y0 = 0.15, R = 0.012;
const m = new Model('TV-01');
function rr(cx, cy, w, h, r, n = 4) {
  const P = [], C = [[cx + w / 2 - r, cy + h / 2 - r, 0], [cx - w / 2 + r, cy + h / 2 - r, 1], [cx - w / 2 + r, cy - h / 2 + r, 2], [cx + w / 2 - r, cy - h / 2 + r, 3]];
  for (const [x, y, q] of C) for (let i = 0; i <= n; i++) { const a = (q + i / n) * Math.PI / 2; P.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  return P;
}
function loop(pts, z) { const ids = pts.map(([x, y]) => m.vtx([x, y, z])); for (let i = 0; i < ids.length; i++) m.edge(ids[i], ids[(i + 1) % ids.length]); return ids; }
function slab(pts, z0, z1, rings = 2, rib = 3) {
  const L = []; for (let k = 0; k < rings; k++) L.push(loop(pts, z0 + (z1 - z0) * k / (rings - 1)));
  const n = pts.length;
  for (let k = 0; k < rings - 1; k++) for (let i = 0; i < n; i++) { if (i % rib === 0) m.edge(L[k][i], L[k + 1][i]); m.quad(L[k][i], L[k][(i + 1) % n], L[k + 1][(i + 1) % n], L[k + 1][i]); }
  return L;
}
function face(pts, z, cx, cy, s) { const A = loop(pts, z), B = loop(pts.map(([x, y]) => [cx + (x - cx) * s, cy + (y - cy) * s]), z); for (let i = 0; i < A.length; i++) m.quad(A[i], A[(i + 1) % A.length], B[(i + 1) % A.length], B[i]); }

const cy = Y0 + H / 2;
m.part('tv', { anchor: [0, cy, D / 2 + 0.001] });
m.piece('bezel');
slab(rr(0, cy, W, H, R), -D / 2, D / 2, 3, 3);
m.piece('screen');
const SW = W - 0.016, SH = H - 0.016;
face(rr(0, cy, SW, SH, R * 0.6), D / 2 + 0.0005, 0, cy, 0.985);
m.box([0, Y0 + 0.004, D / 2 + 0.002], [0.03, 0.006, 0.003]);                  // status LED / IR window
m.piece('back');
const hump = rr(0, cy - 0.04, 0.78, 0.46, 0.05, 6);
slab(hump, -D / 2, -D / 2 - 0.045, 3, 2);
face(hump, -D / 2 - 0.045, 0, cy - 0.04, 0.8);
for (let i = 0; i < 9; i++) { const x = -0.2 + i * 0.05; m.box([x, cy + 0.12, -D / 2 - 0.046], [0.03, 0.004, 0.002]); }   // vents
for (let i = 0; i < 4; i++) m.box([0.27, cy - 0.12 + i * 0.035, -D / 2 - 0.046], [0.03, 0.014, 0.004]);          // HDMI / USB / LAN
m.box([-0.04, cy - 0.04, -D / 2 - 0.047], [0.16, 0.1, 0.002]);                // VESA plate
m.piece('stand');
m.tube([0, Y0 + 0.02, -0.03], [0, 0.012, -0.03], 0.022, { rings: 4, seg: 14, longs: 6 });   // neck
const base = rr(0, 0, 0.46, 0.22, 0.09, 8).map(([x, z]) => [x, z]);
{ const A = base.map(([x, z]) => m.vtx([x, 0.0, z - 0.03])), B = base.map(([x, z]) => m.vtx([x, 0.012, z - 0.03])); const n = A.length;
  for (let i = 0; i < n; i++) { m.edge(A[i], A[(i + 1) % n]); m.edge(B[i], B[(i + 1) % n]); if (i % 3 === 0) m.edge(A[i], B[i]); m.quad(A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]); } }
m.box([0, Y0 + 0.05, -D / 2 - 0.01], [0.09, 0.07, 0.02]);                      // mount where the neck meets the panel

const j = m.toJSON();
// the screen as a plane for film.js: origin = bottom-left of the active area, u = width, v = height
j.screen = { o: [-SW / 2 + 0.006, Y0 + 0.014, D / 2 + 0.0012], u: [SW - 0.012, 0, 0], v: [0, SH - 0.012, 0] };
let nv = 0, ne = 0; for (const P of j.parts) for (const C of P.pieces) { nv += C.v.length / 3; ne += C.e.length / 2; }
fs.writeFileSync(new URL('./tv.json', import.meta.url), JSON.stringify(j));
console.log(`tv.json: ${j.parts.length} parts, ${nv} vertices, ${ne} edges`);
