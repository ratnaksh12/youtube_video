// kit70.js — characters + props for "Is Doctor Doom Secretly Tony Stark?". Builds on the Doomsday project's cast
// (hero(), bigFace, Doom/Iron Man heads). Tony and Victor share ONE face design (goatee + moustache) on purpose.
import { E, S, V, alpha, shade, mix, lerp, clamp, ease, prog, rng, seg, circle, ring, rr, poly, glow, linGrad, radGrad, text, FONTS } from '/engine/core.js';
import { POSES, EXPR, bigFace } from '/engine/rig2d.js';
import { hero, local, arcReactor, OUT } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';

export const GREEN = '#5dff8a', CUBE = '#6ab8ff';
export const O70 = {
  TONY70: { top: 'suit', color: '#3a3f52', color2: '#7a1d1d', face: 'glasses' },
  TONY: { top: 'suit', color: '#1d1d26', color2: '#b3302a' },
  HOWARD: { top: 'suit', color: '#5a4636', color2: '#2a2a33' },
  MARIA: { top: 'dress', color: '#c06a8a', head: 'bun' },
  STEVE70: { top: 'tshirt', color: '#5a6a3a', legs: '#4a5530', head: 'cap', headColor: '#56663a' },
  AGENT70: { top: 'suit', color: '#2a2d36', color2: '#1a1a22', head: 'fedora', headColor: '#22252c' },
  VKID: { top: 'hoodie', color: '#2a6a3a', head: 'hood', headColor: '#2a6a3a', kid: true },
  VICTOR: { top: 'trench', color: '#2a6a3a' },
  PEPPER: { top: 'dress', color: '#e8e4ee', head: 'ponytail', headColor: '#e0905a' },
  FRANKLIN: { top: 'jersey', color: '#2f6bd6', kid: true },
};
const CREAM = () => S().feature;
// facial hair in figure-local space (side view, face on +x)
function beard(g, p, which) {
  const [hx, hy] = p.head, c = CREAM();
  if (which.includes('m')) { g.strokeStyle = c; g.lineWidth = 2.8; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx + 5, hy + 7); g.quadraticCurveTo(hx + 10, hy + 4, hx + 16, hy + 7); g.stroke(); }
  if (which.includes('g')) { seg(g, [[hx + 10, hy + 13], [hx + 11, hy + 20]], 3.2, c); }
}
// person(g, 'HOWARD', {...}) — any of the O70 characters, or a registry hero id passed through
export function person(g, id, o = {}) {
  const t = o.t ?? 0;
  if (!O70[id]) return hero(g, id, o);
  const oo = hero(g, 'FAN', { ...o, outfit: o.outfit || O70[id] });
  local(g, oo, (g, p) => {
    if (id === 'HOWARD') { beard(g, p, 'm'); if (o.old) { const [hx, hy] = p.head; g.strokeStyle = '#d8d6d2'; g.lineWidth = 6; g.beginPath(); g.arc(hx - 2, hy, 25, Math.PI * 1.05, Math.PI * 1.7); g.stroke(); } }
    if (id === 'TONY70' || id === 'TONY' || id === 'VICTOR') beard(g, p, 'mg');
    if (id === 'TONY') arcReactor(g, p, o.reactor ?? 1);
    if (id === 'MARIA' && o.belly !== false) { const x = lerp(p.sh[0], p.hip[0], 0.75) + 12, y = lerp(p.sh[1], p.hip[1], 0.75); g.fillStyle = O70.MARIA.color; g.beginPath(); g.ellipse(x, y, 13, 17, 0, 0, 7); g.fill(); }
    if (id === 'VICTOR' && o.hood) { const [hx, hy] = p.head; g.strokeStyle = '#2f7a42'; g.lineWidth = 7; g.beginPath(); g.arc(hx - 4, hy + 1, 30, -Math.PI * 0.46, Math.PI * 0.42, true); g.stroke(); }
  });
  return oo;
}

// ---------- the shared face, close-up (front view) ----------
// bigMan(g, cx, cy, r, { outfit, expr, hood: colour|null, glasses, rimColor, rimSide, look, blink, tilt })
export function bigMan(g, cx, cy, r, o = {}) {
  const hood = o.hood;
  if (hood) { g.save(); g.translate(cx, cy); g.rotate(o.tilt || 0); g.fillStyle = shade(hood, -0.15); g.beginPath(); g.ellipse(0, r * 0.05, r * 1.32, r * 1.42, 0, 0, 7); g.fill(); g.restore(); }
  // the engine draws front-view brows mirrored (angry reads as worried), so swap them for close-ups
  const brows = (EXPR[o.expr || 'neutral'] || {}).brows, face = brows === 'angry' ? { brows: 'worried' } : brows === 'worried' ? { brows: 'angry' } : undefined;
  bigFace(g, cx, cy, r, { outfit: o.outfit || { top: 'suit', color: '#1d1d26' }, expr: o.expr || 'neutral', rimColor: o.rimColor, rimSide: o.rimSide ?? -1, look: o.look, blink: o.blink, tilt: o.tilt, face });
  g.save(); g.translate(cx, cy); g.rotate(o.tilt || 0); const c = CREAM();
  g.strokeStyle = c; g.lineCap = 'round'; g.lineWidth = r * 0.065;
  const beard = o.beard ?? 'mg';
  if (beard.includes('m')) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * 0.04, r * 0.22); g.quadraticCurveTo(s * r * 0.16, r * 0.17, s * r * 0.27, r * 0.26); g.stroke(); }
  if (beard.includes('g')) poly(g, [[-r * 0.08, r * 0.5], [r * 0.08, r * 0.5], [r * 0.035, r * 0.68], [-r * 0.035, r * 0.68]], c);
  if (o.glasses) { g.lineWidth = r * 0.05; for (const s of [-1, 1]) { rr(g, s * r * 0.34 - r * 0.24, -r * 0.3, r * 0.48, r * 0.32, r * 0.08); g.stroke(); } }
  if (hood) { g.strokeStyle = hood; g.lineWidth = r * 0.16; g.beginPath(); g.arc(0, r * 0.05, r * 1.04, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
  g.restore();
}
// Doom's mask plate (same design as the Doomsday bigDoom), drawn on its own so it can lift off the face
export function maskPlate(g, cx, cy, r, o = {}) {
  const { eyes = 1, t = 0, lift = 0 } = o; if (lift >= 1) return;
  g.save(); g.translate(cx, cy - lift * r * 1.9); g.rotate(-lift * 0.25); g.globalAlpha *= 1 - ease.in(clamp((lift - 0.55) / 0.45));
  g.fillStyle = linGrad(g, -r, -r, r, r, ['#e6eaef', '#a3aab3', '#5b616a']); rr(g, -r * 0.82, -r * 0.95, r * 1.64, r * 1.95, r * 0.42); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; rr(g, -r * 0.7, -r * 0.88, r * 0.3, r * 1.6, r * 0.15); g.fill();
  const ek = eyes * (1 - lift);
  for (const sx of [-1, 1]) { rr(g, sx > 0 ? r * 0.1 : -r * 0.6, -r * 0.32, r * 0.5, r * 0.17, r * 0.06); g.fillStyle = '#050a07'; g.fill(); if (ek > 0) { g.fillStyle = alpha('#b8ffcc', ek); rr(g, sx > 0 ? r * 0.16 : -r * 0.54, -r * 0.28, r * 0.38, r * 0.08, r * 0.04); g.fill(); glow(g, sx * r * 0.35, -r * 0.24, r * 0.55, GREEN, 0.5 * ek); } }
  seg(g, [[0, -r * 0.1], [0, r * 0.3]], r * 0.04, 'rgba(40,44,50,.55)');
  for (let i = 0; i < 6; i++) seg(g, [[-r * 0.32 + i * r * 0.128, r * 0.48], [-r * 0.32 + i * r * 0.128, r * 0.68]], r * 0.04, 'rgba(22,26,32,.85)');
  g.restore();
}
// the unmasking close-up: hood + face underneath + the plate lifting away
export function unmask(g, cx, cy, r, o = {}) {
  const { lift = 0, t = 0, expr = 'determined', rimSide = -1 } = o;
  bigMan(g, cx, cy, r, { outfit: { top: 'trench', color: '#1e4a2a' }, hood: '#2a6a3a', expr, rimColor: '#c8ffd8', rimSide, look: o.look });
  maskPlate(g, cx, cy, r, { lift, t, eyes: o.eyes ?? 1 });
}

// ---------- props ----------
export function tesseract(g, x, y, s = 1, t = 0, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  glow(g, 0, 0, 160, CUBE, 0.55); glow(g, 0, 0, 70, '#dff2ff', 0.5);
  const f = [[0, -46], [42, -22], [42, 26], [0, 50], [-42, 26], [-42, -22]];
  poly(g, [f[0], f[1], [0, 4], f[5]], alpha('#9ad4ff', 0.85)); poly(g, [f[1], f[2], f[3], [0, 4]], alpha('#3a86d8', 0.85)); poly(g, [f[5], [0, 4], f[3], f[4]], alpha('#5aa6ff', 0.85));
  g.strokeStyle = 'rgba(230,246,255,.9)'; g.lineWidth = 2; g.beginPath(); f.forEach((q, i) => (i ? g.lineTo(...q) : g.moveTo(...q))); g.closePath(); g.stroke(); seg(g, [f[1], [0, 4], f[5]], 1.5, 'rgba(230,246,255,.6)'); seg(g, [[0, 4], f[3]], 1.5, 'rgba(230,246,255,.6)');
  for (let i = 0; i < 6; i++) { const ang = t * 2 + i; circle(g, Math.cos(ang) * 18, 4 + Math.sin(ang * 1.3) * 18, 2.5, '#ffffff'); }
  g.restore();
}
export function pedestal(g, x, y, s = 1, glass = true) {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -70, -20, 140, 120, 6); g.fillStyle = '#3a3f4a'; g.fill(); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(-70, -20, 140, 8);
  if (glass) { g.strokeStyle = 'rgba(200,230,255,.45)'; g.lineWidth = 3; g.strokeRect(-60, -200, 120, 180); g.fillStyle = 'rgba(160,210,255,.06)'; g.fillRect(-60, -200, 120, 180); seg(g, [[-48, -190], [-30, -40]], 4, 'rgba(255,255,255,.18)'); }
  g.restore();
}
export function alarmLight(g, x, y, s, t, k = 1) {
  if (k <= 0) return; rr(g, x - 18 * s, y - 10 * s, 36 * s, 22 * s, 6 * s); g.fillStyle = '#2a1416'; g.fill();
  g.save(); g.globalCompositeOperation = 'lighter'; const a = t * 7; g.fillStyle = `rgba(255,60,50,${0.18 * k})`; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 900 * s, a, a + 0.5); g.closePath(); g.fill(); g.beginPath(); g.moveTo(x, y); g.arc(x, y, 900 * s, a + Math.PI, a + Math.PI + 0.5); g.closePath(); g.fill(); g.restore();
  circle(g, x, y - 4 * s, 12 * s, `rgba(255,${80 + 60 * Math.sin(t * 14)},70,${0.7 + 0.3 * k})`); glow(g, x, y, 90 * s, '#ff3a2a', 0.6 * k);
}
export function briefcase(g, x, y, s = 1) { rr(g, x - 34 * s, y - 24 * s, 68 * s, 48 * s, 6 * s); g.fillStyle = '#5a3a24'; g.fill(); seg(g, [[x - 12 * s, y - 24 * s], [x - 12 * s, y - 34 * s], [x + 12 * s, y - 34 * s], [x + 12 * s, y - 24 * s]], 4 * s, '#3a2414'); seg(g, [[x - 34 * s, y - 6 * s], [x + 34 * s, y - 6 * s]], 2 * s, '#3a2414'); }
export function photo(g, x, y, w, h, fn, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2 + 8, -h / 2 + 10, w, h); g.fillStyle = '#efe6d2'; g.fillRect(-w / 2, -h / 2, w, h);
  g.save(); g.beginPath(); g.rect(-w / 2 + 12, -h / 2 + 12, w - 24, h - 48); g.clip(); fn(g, -w / 2 + 12, -h / 2 + 12, w - 24, h - 48); g.restore();
  if (o.label) text(g, o.label, 0, h / 2 - 18, { size: 22, color: '#3a2a18', font: FONTS.ui, weight: 900 });
  if (o.burn) { g.save(); g.globalCompositeOperation = 'source-atop'; const b = o.burn; g.fillStyle = radGrad(g, w * 0.3, h * 0.4, 0, w * 1.2 * b, ['rgba(10,6,4,1)', 'rgba(60,20,8,.9)', 'rgba(0,0,0,0)']); g.fillRect(-w / 2, -h / 2, w, h); g.restore(); }
  g.restore();
}
// green hologram panel
export function holo(g, x, y, w, h, t, fn, a = 1) {
  g.save(); g.globalAlpha *= a; g.fillStyle = 'rgba(30,120,60,.12)'; g.fillRect(x, y, w, h); g.strokeStyle = alpha(GREEN, 0.6); g.lineWidth = 3; g.strokeRect(x, y, w, h);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn?.(g, x, y, w, h);
  g.globalCompositeOperation = 'lighter'; for (let yy = y + ((t * 40) % 6); yy < y + h; yy += 6) { g.fillStyle = 'rgba(93,255,138,.05)'; g.fillRect(x, yy, w, 2); }
  g.restore(); for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) { seg(g, [[cx, cy], [cx + (cx === x ? 30 : -30), cy]], 5, GREEN); seg(g, [[cx, cy], [cx, cy + (cy === y ? 30 : -30)]], 5, GREEN); }
  glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.7, GREEN, 0.12); g.restore();
}
// draw anything as a green hologram: render into an offscreen copy of the canvas, tint it, composite it back
let _hc = null;
export function asHolo(g, fn, a = 0.85) {
  const W = g.canvas.width, H = g.canvas.height;
  if (!_hc || _hc.width !== W || _hc.height !== H) { _hc = document.createElement('canvas'); _hc.width = W; _hc.height = H; }
  const x = _hc.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.setTransform(g.getTransform()); fn(x);
  x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(80,255,140,.62)'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= a; g.drawImage(_hc, 0, 0); g.restore();
}
