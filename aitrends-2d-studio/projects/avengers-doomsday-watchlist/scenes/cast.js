// cast.js — every recurring character: an outfit (one signature item) + custom accessories drawn in the
// figure's local space (same transform as drawFigure: feet at y=0, facing +x). Use hero(g, 'DOOM', {...}).
import { E, S, alpha, shade, mix, lerp, clamp, seg, circle, ring, rr, poly, glow, linGrad, radGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, face, bigFace } from '/engine/rig2d.js';

export const COL = {
  doom: '#2f8a45', doomGlow: '#5dff8a', metal: '#a7aeb6', gold: '#e8b53a', ff: '#2f6bd6', red: '#c0262d',
  thanos: '#6b4a8a', pink: '#f29ac0', magic: '#ffae3a', sentry: '#ffd36a', psy: '#b48cff',
};

export const OUT = {
  FAN: { top: 'hoodie', color: '#3b3f5c', head: 'beanie', headColor: '#f29ac0' },
  DOOM: { top: 'trench', color: '#2a6a3a', head: 'hood', headColor: '#2f7a42', gloves: '#9aa1aa', legs: '#5e656e' },
  THANOS: { top: 'tshirt', color: '#34407a', legs: '#2a3360' },
  IRON: { top: 'suit', color: '#b3302a', color2: '#e8b53a', legs: '#b3302a', gloves: '#b3302a' },
  CAP: { top: 'tshirt', color: '#2c4f9e', legs: '#24345e' },
  THOR: { top: 'tshirt', color: '#3a3f4f', legs: '#2a2e3a' },
  STRANGE: { top: 'tshirt', color: '#273c78', legs: '#1f2a4a' },
  YELENA: { top: 'tshirt', color: '#6f7a3c', head: 'ponytail', legs: '#2a2a2e' },
  BUCKY: { top: 'tshirt', color: '#2b2d36', legs: '#23252c' },
  SENTRY: { top: 'tshirt', color: '#e3b23c', legs: '#2b3a7a' },
  REDG: { top: 'tshirt', color: '#b3262e', legs: '#2a2e4a' },
  DEADPOOL: { top: 'tshirt', color: '#a5212b', legs: '#7a1820' },
  WOLVERINE: { top: 'tshirt', color: '#f2c21a', legs: '#2a3f8a' },
  PROFX: { top: 'suit', color: '#2a3550', color2: '#8a6ad6' },
  MAGNETO: { top: 'tshirt', color: '#9a2430', legs: '#4a2050' },
  CYCLOPS: { top: 'tshirt', color: '#26355a', legs: '#26355a' },
  REED: { top: 'jersey', color: '#2f6bd6', legs: '#24508f' },
  SUE: { top: 'jersey', color: '#2f6bd6', legs: '#24508f', head: 'ponytail' },
  JOHNNY: { top: 'jersey', color: '#2f6bd6', legs: '#24508f', head: 'spiky' },
  BEN: { top: 'none', legs: '#2f6bd6' },
  SPIDEY: { top: 'tshirt', color: '#c0262d', legs: '#2747a0' },
  LOKI: { top: 'tshirt', color: '#1f2b2a', legs: '#1a2020' },
  STEVE: { top: 'suit', color: '#5a4636', color2: '#3a2a20' },
  ACTOR: { top: 'suit', color: '#1b1b22', color2: '#7a1d1d' },
  HWR: { top: 'trench', color: '#4a2f5a' },
  AGENT: { top: 'suit', color: '#6a4a2a', color2: '#c98a3a' },
};

// ---------- local-space helper (mirrors drawFigure's transform) ----------
const sOf = (o) => (o.s ?? 1) * (o.outfit?.kid ? 0.72 : 1);
export function local(g, o, fn) {
  const p = o.pose || POSES.stand, s = sOf(o), f = o.facing ?? 1;
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  g.translate(o.x, o.y); g.scale(f * s, s);
  if (o.rot) { g.translate(p.hip[0], p.hip[1]); g.rotate(o.rot); g.translate(-p.hip[0], -p.hip[1]); }
  fn(g, p, f, s); g.restore();
}
// world position of a pose point (no rotation support)
export function wpt(o, k) { const p = o.pose || POSES.stand, s = sOf(o), f = o.facing ?? 1; return [o.x + p[k][0] * f * s, o.y + p[k][1] * s]; }

// ---------- accessories (local coords) ----------
export function cape(g, p, t, col, o = {}) {
  const { len = 1, flare = 1, collar = false, seed = 0, wind = 1 } = o;
  const [sx, sy] = p.sh, [hx] = p.hip, by = -6 - (1 - len) * 80;
  const w = Math.sin(t * 2.6 + seed) * 6 * wind, w2 = Math.sin(t * 3.4 + seed + 1) * 9 * wind;
  g.fillStyle = col; g.beginPath(); g.moveTo(sx + 8, sy - 4);
  g.quadraticCurveTo(hx + 4, (sy + by) / 2, hx - 8 + w, by);
  g.lineTo(hx - 62 * flare + w2, by + 3);
  g.quadraticCurveTo(sx - 36 * flare, (sy + by) / 2, sx - 12, sy - 2); g.closePath(); g.fill();
  if (o.flat) return;
  g.strokeStyle = alpha(shade(col, -0.4), 0.8); g.lineWidth = 3;
  g.beginPath(); g.moveTo(sx - 4, sy + 12); g.quadraticCurveTo(hx - 22, (sy + by) / 2, hx - 32 + w, by); g.stroke();
  if (collar) { poly(g, [[sx - 14, sy], [sx - 24, sy - 46], [sx - 2, sy - 16]], shade(col, 0.12)); poly(g, [[sx + 12, sy], [sx + 18, sy - 42], [sx + 4, sy - 14]], shade(col, -0.12)); }
}
export function doomMask(g, p, eyes = 1, hood = OUT.DOOM.headColor) {
  const [hx, hy] = p.head, r = 26;
  g.save(); g.beginPath(); g.arc(hx, hy, r + 0.6, 0, 7); g.clip();
  g.fillStyle = linGrad(g, hx - 6, hy - r, hx + r, hy + r, ['#dde2e8', '#99a0a9', '#5d636c']);
  g.beginPath(); g.moveTo(hx - 3, hy - r - 2); g.lineTo(hx + r + 3, hy - r - 2); g.lineTo(hx + r + 3, hy + r + 2); g.lineTo(hx + 3, hy + r + 2); g.quadraticCurveTo(hx - 9, hy, hx - 3, hy - r - 2); g.fill();
  g.restore();
  for (const ex of [hx + 3, hx + 17]) { rr(g, ex, hy - 9, 10, 5, 2); g.fillStyle = '#071009'; g.fill(); if (eyes > 0) { g.fillStyle = alpha('#9dffb6', eyes); g.fillRect(ex + 2, hy - 8, 6, 2.6); } }
  if (eyes > 0) glow(g, hx + 15, hy - 6, 26, COL.doomGlow, 0.55 * eyes);
  seg(g, [[hx + 14, hy - 3], [hx + 16, hy + 7]], 1.8, 'rgba(40,44,50,.55)');
  for (let i = 0; i < 4; i++) seg(g, [[hx + 6 + i * 4.6, hy + 12], [hx + 6 + i * 4.6, hy + 18]], 1.7, 'rgba(26,30,36,.85)');
  for (const [rx, ry] of [[hx + 2, hy + 4], [hx + 25, hy + 6]]) circle(g, rx, ry, 1.6, 'rgba(255,255,255,.5)');
  g.strokeStyle = shade(hood, -0.15); g.lineWidth = 6; g.beginPath(); g.arc(hx - 4, hy + 1, r + 4, -Math.PI * 0.46, Math.PI * 0.42); g.stroke();
}
function ironHelmet(g, p) {
  const [hx, hy] = p.head, r = 26; circle(g, hx, hy, r, '#b3302a');
  g.save(); g.beginPath(); g.arc(hx, hy, r, 0, 7); g.clip();
  g.fillStyle = '#e8b53a'; g.beginPath(); g.moveTo(hx + 1, hy - 19); g.lineTo(hx + r + 3, hy - 21); g.lineTo(hx + r + 3, hy + r); g.lineTo(hx + 11, hy + r); g.lineTo(hx + 4, hy + 6); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(hx - 18, hy - 22, 10, 30); g.restore();
  for (const ex of [hx + 7, hx + 19]) { g.fillStyle = '#eafcff'; g.fillRect(ex, hy - 8, 8, 3.6); }
  glow(g, hx + 15, hy - 6, 20, '#bfefff', 0.55);
  seg(g, [[hx + 10, hy + 12], [hx + 24, hy + 12]], 1.6, 'rgba(90,50,10,.6)');
}
export function arcReactor(g, p, k = 1) { const x = lerp(p.sh[0], p.hip[0], 0.28) + 5, y = lerp(p.sh[1], p.hip[1], 0.28); circle(g, x, y, 6.5, alpha('#e6faff', 0.25 + 0.75 * k)); glow(g, x, y, 30, '#9fe6ff', 0.75 * k); }
function spideyHead(g, p) {
  const [hx, hy] = p.head, r = 26; circle(g, hx, hy, r, '#c0262d');
  g.save(); g.beginPath(); g.arc(hx, hy, r, 0, 7); g.clip(); g.strokeStyle = 'rgba(25,8,10,.55)'; g.lineWidth = 1.2;
  for (let a = 0; a < 8; a++) { g.beginPath(); g.moveTo(hx + 10, hy - 2); g.lineTo(hx + 10 + Math.cos(a * 0.785) * 44, hy - 2 + Math.sin(a * 0.785) * 44); g.stroke(); }
  for (const q of [9, 18, 28]) { g.beginPath(); g.arc(hx + 10, hy - 2, q, 0, 7); g.stroke(); } g.restore();
  for (const [ex, sg] of [[hx + 4, -1], [hx + 20, 1]]) { g.fillStyle = '#0d0d10'; g.beginPath(); g.ellipse(ex, hy - 5, 7.8, 10, sg * 0.5, 0, 7); g.fill(); g.fillStyle = '#f4f4f8'; g.beginPath(); g.ellipse(ex, hy - 5, 5.6, 7.8, sg * 0.5, 0, 7); g.fill(); }
}
function deadpoolHead(g, p, squint = 0) {
  const [hx, hy] = p.head, r = 26; circle(g, hx, hy, r, '#a5212b');
  for (const [ex, sg] of [[hx + 4, -1], [hx + 20, 1]]) { g.fillStyle = '#0b0b0e'; g.beginPath(); g.ellipse(ex, hy - 5, 9, 11, sg * 0.35, 0, 7); g.fill(); g.fillStyle = '#f6f6f8'; g.beginPath(); g.ellipse(ex, hy - 5, 4.5, 6 * (1 - squint * 0.7), 0, 0, 7); g.fill(); }
}
function wolverineHead(g, p) {
  const [hx, hy] = p.head, r = 26;
  poly(g, [[hx - 10, hy - 18], [hx - 24, hy - 50], [hx - 1, hy - 24]], '#f2c21a'); poly(g, [[hx + 6, hy - 22], [hx + 4, hy - 52], [hx + 18, hy - 22]], '#f2c21a');
  circle(g, hx, hy, r, '#f2c21a');
  g.save(); g.beginPath(); g.arc(hx, hy, r, 0, 7); g.clip();
  poly(g, [[hx - 2, hy - 16], [hx + 30, hy - 20], [hx + 30, hy + 2], [hx + 12, hy + 4], [hx + 2, hy - 2]], '#16161c');
  g.fillStyle = '#2d2f36'; g.fillRect(hx - 30, hy + 6, 70, 30); g.restore();
  for (const ex of [hx + 6, hx + 19]) { g.fillStyle = '#f6f6f8'; g.beginPath(); g.ellipse(ex, hy - 8, 4.5, 2.6, 0, 0, 7); g.fill(); }
}
export function claws(g, p, k = 1) { const [x, y] = p.hF; for (let i = 0; i < 3; i++) seg(g, [[x + 4, y - 6 + i * 5], [x + 6 + 46 * k, y - 16 + i * 8]], 2.6, '#dfe5ec'); }
export function shield(g, x, y, R = 28, tilt = 0) {
  g.save(); g.translate(x, y); g.scale(Math.cos(tilt) * 0.5 + 0.5, 1);
  circle(g, 0, 0, R, '#c0262d'); circle(g, 0, 0, R * 0.78, '#eeeef2'); circle(g, 0, 0, R * 0.58, '#c0262d'); circle(g, 0, 0, R * 0.4, '#2a4fa0');
  g.fillStyle = '#f4f4f6'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? R * 0.15 : R * 0.36; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, R * 0.92, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); g.restore();
}
export function hammer(g, x, y, up = false, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  if (up) { seg(g, [[0, 6], [0, -30]], 5, '#6a4a32'); rr(g, -16, -50, 32, 20, 3); g.fillStyle = '#9aa1ad'; g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-14, -48, 28, 4); }
  else { seg(g, [[0, -6], [0, 30]], 5, '#6a4a32'); rr(g, -16, 28, 32, 20, 3); g.fillStyle = '#9aa1ad'; g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-14, 30, 28, 4); }
  g.restore();
}
export function mandala(g, x, y, r, t, col = COL.magic, a = 1) {
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.globalCompositeOperation = 'lighter';
  glow(g, 0, 0, r * 1.6, col, 0.45);
  g.strokeStyle = col; g.lineWidth = Math.max(1.5, r * 0.05);
  g.rotate(t * 1.4); g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.beginPath(); g.arc(0, 0, r * 0.82, 0, 7); g.stroke();
  for (let i = 0; i < 16; i++) { const a2 = i * Math.PI / 8; seg(g, [[Math.cos(a2) * r * 0.82, Math.sin(a2) * r * 0.82], [Math.cos(a2) * r, Math.sin(a2) * r]], Math.max(1, r * 0.03), col); }
  g.rotate(-t * 2.6); g.beginPath(); for (let i = 0; i <= 6; i++) { const a2 = i * Math.PI * 2 / 3; g.lineTo(Math.cos(a2) * r * 0.62, Math.sin(a2) * r * 0.62); } g.stroke();
  g.beginPath(); for (let i = 0; i <= 6; i++) { const a2 = i * Math.PI * 2 / 3 + Math.PI / 3; g.lineTo(Math.cos(a2) * r * 0.62, Math.sin(a2) * r * 0.62); } g.stroke();
  g.beginPath(); g.arc(0, 0, r * 0.3, 0, 7); g.stroke();
  for (let i = 0; i < 12; i++) { const a2 = t * 3 + i * 0.52; circle(g, Math.cos(a2) * r * (1.05 + 0.08 * Math.sin(t * 7 + i)), Math.sin(a2) * r * (1.05 + 0.08 * Math.sin(t * 7 + i)), Math.max(1, r * 0.025), '#ffe2a0'); }
  g.restore();
}
function magnetoHelmet(g, p) {
  const [hx, hy] = p.head, r = 26;
  g.fillStyle = '#9a2430'; g.beginPath(); g.arc(hx, hy - 1, r + 4, Math.PI * 1.02, Math.PI * 1.98); g.lineTo(hx + r + 4, hy + 4); g.lineTo(hx + r - 2, hy + 4); g.lineTo(hx + r - 4, hy - 10); g.lineTo(hx - r + 2, hy - 10); g.lineTo(hx - r - 2, hy + 16); g.lineTo(hx - r - 6, hy + 2); g.closePath(); g.fill();
  poly(g, [[hx - 6, hy - r - 2], [hx + 10, hy - r - 2], [hx + 2, hy - r - 14]], '#7a1a24');
  seg(g, [[hx - 20, hy - 14], [hx + 22, hy - 14]], 2, 'rgba(255,200,200,.35)');
}
function cyclopsVisor(g, p, k = 1) { const [hx, hy] = p.head; rr(g, hx - 6, hy - 13, 38, 10, 5); g.fillStyle = '#ff3a3a'; g.fill(); glow(g, hx + 14, hy - 8, 40 * k, '#ff4a4a', 0.6 * k); }
function hornsHelmet(g, p) {
  const [hx, hy] = p.head; g.strokeStyle = '#e8b53a'; g.lineWidth = 6; g.lineCap = 'round';
  for (const dx of [-10, 10]) { g.beginPath(); g.moveTo(hx + dx, hy - 20); g.quadraticCurveTo(hx + dx * 1.2 - 4, hy - 60, hx + dx * 2.6 - 24, hy - 70); g.stroke(); }
  g.strokeStyle = '#c99628'; g.lineWidth = 7; g.beginPath(); g.arc(hx, hy, 27, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
}
export function ffEmblem(g, p, f) {
  const x = lerp(p.sh[0], p.hip[0], 0.32) + 3, y = lerp(p.sh[1], p.hip[1], 0.32);
  ring(g, x, y, 9, 2.4, '#ffffff'); g.save(); g.translate(x, y); g.scale(f, 1); text(g, '4', 0, 1, { size: 13, color: '#ffffff', font: FONTS.ui, weight: 900 }); g.restore();
}
export function flame(g, x, y, s, t, a = 1) {
  g.save(); g.globalAlpha *= a; g.globalCompositeOperation = 'lighter'; glow(g, x, y, 60 * s, '#ff7a1a', 0.7);
  for (let i = 0; i < 5; i++) { const ph = t * 9 + i * 1.7, h = (34 + 16 * Math.sin(ph)) * s, w = (12 - i) * s, dx = (i - 2) * 7 * s;
    g.fillStyle = i % 2 ? 'rgba(255,200,60,.8)' : 'rgba(255,110,30,.75)'; g.beginPath(); g.moveTo(x + dx - w, y); g.quadraticCurveTo(x + dx - w * 0.3, y - h * 0.6, x + dx + Math.sin(ph) * 4 * s, y - h); g.quadraticCurveTo(x + dx + w * 0.3, y - h * 0.6, x + dx + w, y); g.fill(); }
  g.restore();
}
export function gauntlet(g, x, y, r = 12, t = 0, glowK = 1) {
  circle(g, x, y, r, '#e0b43a'); seg(g, [[x - r * 0.6, y - r * 0.2], [x + r * 0.6, y - r * 0.2]], r * 0.12, '#b88a22');
  const stones = ['#4a7cff', '#ff3a3a', '#a04aff', '#ffd23a', '#3aff7a', '#ff8a2a'];
  stones.forEach((c, i) => { const a = -Math.PI * 0.9 + i * 0.34; const sx = x + Math.cos(a) * r * 0.62, sy = y + Math.sin(a) * r * 0.62; circle(g, sx, sy, r * 0.15, c); if (glowK > 0) glow(g, sx, sy, r * 0.6, c, 0.35 * glowK * (0.7 + 0.3 * Math.sin(t * 4 + i))); });
}

// ---------- hero registry ----------
const H = {
  FAN: { out: OUT.FAN },
  DOOM: { out: OUT.DOOM, back: (g, p, t, o) => cape(g, p, t, '#24603a', { flare: 1.15, seed: 2, wind: o.wind ?? 1 }), front: (g, p, t, o) => doomMask(g, p, o.eyes ?? 1) },
  THANOS: { out: OUT.THANOS, ink: '#6b4a8a', inkFar: '#4a325e', scale: 1.4, front: (g, p, t, o) => { gauntlet(g, p.hF[0] + 4, p.hF[1], 12, t, o.stones ?? 1); const [hx, hy] = p.head; for (let i = 0; i < 4; i++) seg(g, [[hx + 6 + i * 5, hy + 14], [hx + 6 + i * 5, hy + 22]], 1.6, 'rgba(30,18,40,.6)'); } },
  IRON: { out: OUT.IRON, front: (g, p, t, o) => { ironHelmet(g, p); arcReactor(g, p, o.reactor ?? 1); } },
  CAP: { out: OUT.CAP, front: (g, p, t, o) => { if (o.shield !== false) shield(g, p.hF[0] + 8, p.hF[1] - 6, 30, o.shieldTilt ?? 0); } },
  THOR: { out: OUT.THOR, back: (g, p, t, o) => cape(g, p, t, '#a3232c', { seed: 1, wind: o.wind ?? 1 }), front: (g, p, t, o) => hammer(g, p.hF[0] + 2, p.hF[1], o.hammerUp) },
  STRANGE: { out: OUT.STRANGE, back: (g, p, t, o) => cape(g, p, t, '#b02a2a', { collar: true, seed: 3, wind: o.wind ?? 1 }), front: (g, p, t, o) => { if (o.magic) { mandala(g, p.hF[0] + 10, p.hF[1] - 6, 26 * o.magic, t); if (o.magic2) mandala(g, p.hB[0] + 10, p.hB[1] - 6, 22 * o.magic2, t + 1); } } },
  YELENA: { out: OUT.YELENA, front: (g, p) => { const [hx, hy] = p.head; seg(g, [[hx - 18, hy - 12], [hx - 13, hy - 4]], 4, '#d9c27a'); } },
  BUCKY: { out: OUT.BUCKY, front: (g, p) => { seg(g, [p.sh, p.eF, p.hF], 11.5, '#b9c0c9'); for (const k of [0.35, 0.65]) { const x = lerp(p.sh[0], p.eF[0], k), y = lerp(p.sh[1], p.eF[1], k); seg(g, [[x - 5, y], [x + 5, y]], 1.5, '#6f7680'); } circle(g, p.hF[0], p.hF[1], 7, '#c9cfd6'); const [sx, sy] = p.sh; g.fillStyle = '#c0262d'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 2.4 : 5.5; g.lineTo(sx + 2 + Math.cos(a) * q, sy + 6 + Math.sin(a) * q); } g.fill(); } },
  SENTRY: { out: OUT.SENTRY, back: (g, p, t, o) => { glow(g, p.hip[0], (p.sh[1] + p.hip[1]) / 2, 170, COL.sentry, 0.5 * (o.aura ?? 1)); cape(g, p, t, '#2b3a7a', { seed: 4, flare: 0.8, wind: o.wind ?? 1 }); } },
  REDG: { out: OUT.REDG, scale: 1.1, front: (g, p) => { const x = lerp(p.sh[0], p.hip[0], 0.3) + 3, y = lerp(p.sh[1], p.hip[1], 0.3); g.fillStyle = '#f4f4f6'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 3.4 : 8; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.fill(); } },
  DEADPOOL: { out: OUT.DEADPOOL, back: (g, p) => { const [sx, sy] = p.sh; seg(g, [[sx - 22, sy + 30], [sx + 6, sy - 40]], 4, '#3a3a44'); seg(g, [[sx - 6, sy + 30], [sx - 30, sy - 38]], 4, '#3a3a44'); seg(g, [[sx + 2, sy - 28], [sx + 8, sy - 44]], 6, '#16161c'); seg(g, [[sx - 26, sy - 26], [sx - 32, sy - 42]], 6, '#16161c'); }, front: (g, p, t, o) => deadpoolHead(g, p, o.squint || 0) },
  WOLVERINE: { out: OUT.WOLVERINE, front: (g, p, t, o) => { wolverineHead(g, p); if (o.claws !== false) claws(g, p, o.claws ?? 1); } },
  PROFX: { out: OUT.PROFX, front: (g, p, t, o) => { const wx = p.hip[0] - 4, wy = -44; ring(g, wx, wy, 44, 5, '#3c3a46'); for (let i = 0; i < 6; i++) { const a = t * 0.3 + i * Math.PI / 3; seg(g, [[wx, wy], [wx + Math.cos(a) * 42, wy + Math.sin(a) * 42]], 1.5, '#55525e'); } circle(g, wx, wy, 5, '#55525e'); seg(g, [[p.hip[0] - 30, -72], [p.hip[0] + 36, -72]], 6, '#2a2830'); seg(g, [[p.hip[0] - 30, -72], [p.hip[0] - 34, -150]], 6, '#2a2830'); if (o.psy) { const [hx, hy] = p.head; for (let k = 0; k < 3; k++) { const ph = (t * 0.8 + k / 3) % 1; ring(g, hx, hy, 34 + ph * 90, 2.5, alpha(COL.psy, 0.7 * (1 - ph) * o.psy)); } glow(g, hx, hy, 70, COL.psy, 0.35 * o.psy); } } },
  MAGNETO: { out: OUT.MAGNETO, back: (g, p, t, o) => cape(g, p, t, '#5a2a78', { seed: 5, wind: o.wind ?? 1 }), front: (g, p) => magnetoHelmet(g, p) },
  CYCLOPS: { out: OUT.CYCLOPS, front: (g, p, t, o) => { cyclopsVisor(g, p, o.visor ?? 1); if (o.beam) { const [hx, hy] = p.head; g.save(); g.globalCompositeOperation = 'lighter'; seg(g, [[hx + 26, hy - 8], [hx + 1400, hy - 8 + 40]], 18 * o.beam, 'rgba(255,60,60,.5)'); seg(g, [[hx + 26, hy - 8], [hx + 1400, hy - 8 + 40]], 6 * o.beam, 'rgba(255,220,220,.9)'); g.restore(); } } },
  REED: { out: OUT.REED, front: (g, p, t, o, f) => { ffEmblem(g, p, f); const [hx, hy] = p.head; seg(g, [[hx - 22, hy - 4], [hx - 18, hy + 6]], 4, '#c9ccd4'); } },
  SUE: { out: OUT.SUE, front: (g, p, t, o, f) => ffEmblem(g, p, f) },
  JOHNNY: { out: OUT.JOHNNY, front: (g, p, t, o, f) => { ffEmblem(g, p, f); if (o.flame) { flame(g, p.head[0], p.head[1] - 10, 1.1 * o.flame, t); flame(g, p.hF[0], p.hF[1], 0.7 * o.flame, t + 1); } } },
  BEN: { out: OUT.BEN, ink: '#c46a2e', inkFar: '#94491c', scale: 1.22, front: (g, p, t, o, f) => { const c = 'rgba(70,30,10,.55)'; const [sx, sy] = p.sh, [hx, hy] = p.hip; for (let i = 0; i < 4; i++) { const y = lerp(sy, hy, (i + 0.5) / 4); seg(g, [[sx - 7, y], [sx + 1, y + 4], [sx + 8, y - 1]], 1.6, c); } const [qx, qy] = p.head; seg(g, [[qx - 14, qy - 10], [qx - 4, qy - 4], [qx - 8, qy + 8]], 1.6, c); seg(g, [[qx + 2, qy + 12], [qx + 16, qy + 16]], 1.6, c); ffEmblem(g, { sh: [sx, sy + 26], hip: [hx, hy + 26] }, f); } },
  SPIDEY: { out: OUT.SPIDEY, front: (g, p) => spideyHead(g, p) },
  LOKI: { out: OUT.LOKI, back: (g, p, t, o) => cape(g, p, t, '#2d6e64', { seed: 6, wind: o.wind ?? 1 }), front: (g, p) => hornsHelmet(g, p) },
  STEVE: { out: OUT.STEVE, front: (g, p) => { const [hx, hy] = p.head; g.strokeStyle = '#d8d6d2'; g.lineWidth = 7; g.beginPath(); g.arc(hx - 2, hy, 25, Math.PI * 1.05, Math.PI * 1.7); g.stroke(); } },
  ACTOR: { out: OUT.ACTOR },
  HWR: { out: OUT.HWR },
  AGENT: { out: OUT.AGENT },
};
export const HERO_IDS = Object.keys(H);

// hero(g, 'DOOM', { x, y, s, facing, pose, expr, rim, t, blink, look, alpha, ...flags })
export function hero(g, id, o = {}) {
  const h = H[id] || H.FAN, t = o.t ?? 0;
  const oo = { ...o, outfit: o.outfit || h.out, s: (o.s ?? 1) * (h.scale ?? 1) };
  if (h.ink || o.ink) { oo.ink = o.ink || h.ink; oo.inkFar = o.inkFar || h.inkFar; }
  if (h.back) {
    // rim light on capes etc.: a hard offset shadow in the rim colour peeks out on the lit side
    const rim = o.rim; g.save();
    if (rim && rim.color) { const d = rim.dir || [0, -1], L = Math.hypot(d[0], d[1]) || 1; g.shadowColor = rim.color; g.shadowBlur = 0; g.shadowOffsetX = (d[0] / L) * 4.5 * E.PX; g.shadowOffsetY = (d[1] / L) * 4.5 * E.PX; }
    local(g, oo, (g, p, f) => h.back(g, p, t, o, f)); g.restore();
  }
  drawFigure(g, oo);
  if (h.front) local(g, oo, (g, p, f) => h.front(g, p, t, o, f));
  return oo;
}

// ---------- giant close-up heads ----------
function rimCrescent(g, r, rc, side) { g.save(); g.beginPath(); g.arc(0, 0, r * 1.06, 0, Math.PI * 2); g.arc(side * r * 0.07, r * 0.02, r, 0, Math.PI * 2, true); g.fillStyle = rc; g.fill('evenodd'); g.restore(); }
export function bigDoom(g, cx, cy, r, o = {}) {
  const { eyes = 1, rimColor = '#9dffb6', rimSide = -1, tilt = 0, t = 0 } = o;
  g.save(); g.translate(cx, cy); g.rotate(tilt);
  g.fillStyle = '#1e4a2a'; g.beginPath(); g.ellipse(0, r * 1.7, r * 1.45, r * 0.95, 0, Math.PI, Math.PI * 2); g.fill();
  g.fillStyle = '#2a6a3a'; g.beginPath(); g.ellipse(0, r * 0.05, r * 1.32, r * 1.42, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = alpha('#7fd69a', 0.35); g.lineWidth = r * 0.04; g.beginPath(); g.arc(0, r * 0.05, r * 1.27, Math.PI * 1.08, Math.PI * 1.45); g.stroke();
  rimCrescent(g, r, rimColor, rimSide);
  g.fillStyle = linGrad(g, -r, -r, r, r, ['#e6eaef', '#a3aab3', '#5b616a']); rr(g, -r * 0.82, -r * 0.95, r * 1.64, r * 1.95, r * 0.42); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; rr(g, -r * 0.7, -r * 0.88, r * 0.3, r * 1.6, r * 0.15); g.fill();
  for (const sx of [-1, 1]) { rr(g, sx > 0 ? r * 0.1 : -r * 0.6, -r * 0.32, r * 0.5, r * 0.17, r * 0.06); g.fillStyle = '#050a07'; g.fill(); if (eyes > 0) { g.fillStyle = alpha('#b8ffcc', eyes); rr(g, sx > 0 ? r * 0.16 : -r * 0.54, -r * 0.28, r * 0.38, r * 0.08, r * 0.04); g.fill(); glow(g, sx * r * 0.35, -r * 0.24, r * 0.55, COL.doomGlow, 0.5 * eyes * (0.85 + 0.15 * Math.sin(t * 6))); } }
  seg(g, [[0, -r * 0.1], [0, r * 0.3]], r * 0.04, 'rgba(40,44,50,.55)');
  for (let i = 0; i < 6; i++) seg(g, [[-r * 0.32 + i * r * 0.128, r * 0.48], [-r * 0.32 + i * r * 0.128, r * 0.68]], r * 0.04, 'rgba(22,26,32,.85)');
  for (const [x, y] of [[-r * 0.66, r * 0.2], [r * 0.66, r * 0.2], [-r * 0.6, r * 0.7], [r * 0.6, r * 0.7]]) circle(g, x, y, r * 0.04, 'rgba(255,255,255,.55)');
  g.strokeStyle = '#2a6a3a'; g.lineWidth = r * 0.16; g.beginPath(); g.arc(0, r * 0.05, r * 1.02, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  g.restore();
}
export function bigIron(g, cx, cy, r, o = {}) {
  const { eyes = 1, rimColor = '#ffd59a', rimSide = -1, t = 0, tilt = 0, empty = false } = o;
  g.save(); g.translate(cx, cy); g.rotate(tilt);
  if (!empty) { g.fillStyle = '#8a221e'; g.beginPath(); g.ellipse(0, r * 1.65, r * 1.25, r * 0.85, 0, Math.PI, Math.PI * 2); g.fill(); }
  rimCrescent(g, r, rimColor, rimSide);
  circle(g, 0, 0, r, '#b3302a');
  g.fillStyle = '#e8b53a'; g.beginPath(); g.moveTo(-r * 0.62, -r * 0.62); g.lineTo(r * 0.62, -r * 0.62); g.lineTo(r * 0.7, r * 0.15); g.lineTo(r * 0.4, r * 0.82); g.lineTo(-r * 0.4, r * 0.82); g.lineTo(-r * 0.7, r * 0.15); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(-r * 0.45, -r * 0.5, r * 0.2, r * 0.35, -0.5, 0, 7); g.fill();
  for (const sx of [-1, 1]) { g.fillStyle = empty ? '#141418' : alpha('#effcff', 0.4 + 0.6 * eyes); g.beginPath(); g.moveTo(sx * r * 0.1, -r * 0.22); g.lineTo(sx * r * 0.52, -r * 0.26); g.lineTo(sx * r * 0.48, -r * 0.14); g.lineTo(sx * r * 0.12, -r * 0.12); g.closePath(); g.fill(); if (!empty && eyes > 0) glow(g, sx * r * 0.3, -r * 0.18, r * 0.45, '#bfefff', 0.5 * eyes); }
  seg(g, [[-r * 0.3, r * 0.48], [r * 0.3, r * 0.48]], r * 0.035, 'rgba(110,60,10,.6)');
  g.restore();
}
export function bigDeadpool(g, cx, cy, r, o = {}) {
  const { squint = 0, rimColor = '#ffc68a', rimSide = -1, tilt = 0, look = [0, 0] } = o;
  g.save(); g.translate(cx, cy); g.rotate(tilt);
  g.fillStyle = '#7a1820'; g.beginPath(); g.ellipse(0, r * 1.65, r * 1.25, r * 0.85, 0, Math.PI, Math.PI * 2); g.fill();
  rimCrescent(g, r, rimColor, rimSide); circle(g, 0, 0, r, '#a5212b');
  g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(-r * 0.45, -r * 0.45, r * 0.25, r * 0.4, -0.5, 0, 7); g.fill();
  for (const sx of [-1, 1]) { g.fillStyle = '#0b0b0e'; g.beginPath(); g.ellipse(sx * r * 0.36, -r * 0.18, r * 0.36, r * 0.42, sx * 0.4, 0, 7); g.fill();
    g.fillStyle = '#f6f6f8'; g.beginPath(); g.ellipse(sx * r * 0.34 + look[0] * r * 0.05, -r * 0.18 + look[1] * r * 0.05, r * 0.17, r * 0.22 * (1 - 0.75 * squint), 0, 0, 7); g.fill(); }
  g.restore();
}
export function bigThanos(g, cx, cy, r, o = {}) {
  const { expr = 'angry', rimColor = '#ffc68a', rimSide = -1, tilt = 0 } = o;
  g.save(); g.translate(cx, cy); g.rotate(tilt);
  g.fillStyle = '#e0b43a'; g.beginPath(); g.ellipse(0, r * 1.7, r * 1.45, r * 0.9, 0, Math.PI, Math.PI * 2); g.fill();
  g.fillStyle = '#34407a'; g.beginPath(); g.ellipse(0, r * 1.75, r * 1.0, r * 0.7, 0, Math.PI, Math.PI * 2); g.fill();
  rimCrescent(g, r, rimColor, rimSide);
  g.fillStyle = '#6b4a8a'; g.beginPath(); g.ellipse(0, 0, r, r * 1.08, 0, 0, 7); g.fill();
  for (let i = 0; i < 6; i++) seg(g, [[-r * 0.3 + i * r * 0.12, r * 0.55], [-r * 0.3 + i * r * 0.12, r * 0.85]], r * 0.035, 'rgba(30,16,44,.55)');
  face(g, 0, 0, r, { expr, front: true, override: expr === 'angry' ? { brows: 'worried' } : undefined });
  g.restore();
}
// fan / yelena / reed close-ups use the engine bigFace with their outfits
export const bigHero = (g, id, cx, cy, r, o = {}) => bigFace(g, cx, cy, r, { outfit: H[id].out, ...o });

// lineup for the end screen
export const END_CAST = [OUT.FAN, OUT.CAP, OUT.YELENA, OUT.DEADPOOL, OUT.STRANGE, OUT.REED, OUT.DOOM];
