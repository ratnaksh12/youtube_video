// props.js — reusable objects: film cases with original icon art, TV, couch, case towers, tickets, globes,
// universe bubbles, portals, cracks, UI buttons. All in logical units; colours from mood()/S() where it matters.
import { E, S, V, alpha, shade, mix, lerp, clamp, ease, prog, rng, noise, seg, circle, ring, rr, poly, glow, linGrad, radGrad, text, measure, FONTS } from '/engine/core.js';
import { mandala, gauntlet, shield } from './cast.js';

export const MOVIES = [
  { n: 6, key: 'tb', lines: ['THUNDERBOLTS*'], year: '2025', icon: 'bolt', c1: '#2a2630', accent: '#ffd36a' },
  { n: 5, key: 'dw', lines: ['DEADPOOL &', 'WOLVERINE'], year: '2024', icon: 'swords', c1: '#3a0c12', accent: '#ffcf3a' },
  { n: 4, key: 'ds', lines: ['DOCTOR STRANGE', 'IN THE MULTIVERSE', 'OF MADNESS'], year: '2022', icon: 'mandala', c1: '#24102e', accent: '#ffae3a' },
  { n: 3, key: 'iw', lines: ['AVENGERS:', 'INFINITY WAR'], year: '2018', icon: 'gauntlet', c1: '#1e1030', accent: '#c58aff' },
  { n: 2, key: 'eg', lines: ['AVENGERS:', 'ENDGAME'], year: '2019', icon: 'hourglass', c1: '#101a34', accent: '#9fc0ff' },
  { n: 1, key: 'ff', lines: ['THE FANTASTIC FOUR:', 'FIRST STEPS'], year: '2025', icon: 'four', c1: '#0e2350', accent: '#7fb0ff' },
];
export const movie = (n) => MOVIES.find(m => m.n === n);

// ---------- icons (original line art) ----------
export function icon(g, kind, x, y, r, col, t = 0) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  switch (kind) {
    case 'bolt': glow(g, x, y, r * 1.5, col, 0.35); poly(g, [[x + r * 0.15, y - r], [x - r * 0.5, y + r * 0.1], [x - r * 0.02, y + r * 0.1], [x - r * 0.2, y + r], [x + r * 0.52, y - r * 0.18], [x + r * 0.04, y - r * 0.18], [x + r * 0.3, y - r]], col); break;
    case 'swords': glow(g, x, y, r * 1.4, col, 0.25);
      for (const s of [-1, 1]) { seg(g, [[x - s * r * 0.85, y + r * 0.85], [x + s * r * 0.75, y - r * 0.75]], r * 0.09, '#e6e9ee'); seg(g, [[x - s * r * 0.85, y + r * 0.85], [x - s * r * 0.5, y + r * 0.5]], r * 0.16, '#1a1a20'); seg(g, [[x - s * r * 0.62, y + r * 0.38], [x - s * r * 0.38, y + r * 0.62]], r * 0.1, col); }
      for (let i = -1; i <= 1; i++) seg(g, [[x + i * r * 0.18, y + r * 0.1], [x + i * r * 0.28, y - r * 0.95]], r * 0.07, col); break;
    case 'mandala': mandala(g, x, y, r * 0.9, t, col); break;
    case 'gauntlet': glow(g, x, y, r * 1.4, col, 0.3); rr(g, x - r * 0.55, y - r * 0.5, r * 1.1, r * 1.2, r * 0.3); g.fillStyle = '#e0b43a'; g.fill(); for (let i = 0; i < 4; i++) { rr(g, x - r * 0.55 + i * r * 0.28, y - r * 0.95, r * 0.25, r * 0.55, r * 0.12); g.fill(); } rr(g, x - r * 0.4, y + r * 0.6, r * 0.8, r * 0.45, r * 0.1); g.fillStyle = '#c8962a'; g.fill(); gauntlet(g, x, y, r * 0.42, t, 1); break;
    case 'hourglass': glow(g, x, y, r * 1.4, col, 0.3); seg(g, [[x - r * 0.6, y - r], [x + r * 0.6, y - r]], r * 0.1, col); seg(g, [[x - r * 0.6, y + r], [x + r * 0.6, y + r]], r * 0.1, col);
      g.strokeStyle = col; g.lineWidth = r * 0.07; g.beginPath(); g.moveTo(x - r * 0.48, y - r * 0.92); g.quadraticCurveTo(x - r * 0.45, y - r * 0.1, x, y); g.quadraticCurveTo(x - r * 0.45, y + r * 0.1, x - r * 0.48, y + r * 0.92); g.moveTo(x + r * 0.48, y - r * 0.92); g.quadraticCurveTo(x + r * 0.45, y - r * 0.1, x, y); g.quadraticCurveTo(x + r * 0.45, y + r * 0.1, x + r * 0.48, y + r * 0.92); g.stroke();
      const k = (t * 0.25) % 1; poly(g, [[x - r * 0.32 * (1 - k), y - r * 0.4 * (1 - k)], [x + r * 0.32 * (1 - k), y - r * 0.4 * (1 - k)], [x, y - r * 0.05]], alpha(col, 0.8)); poly(g, [[x - r * 0.4, y + r * 0.85], [x + r * 0.4, y + r * 0.85], [x, y + r * (0.85 - 0.5 * k)]], alpha(col, 0.8)); seg(g, [[x, y], [x, y + r * 0.8]], r * 0.03, alpha(col, 0.8)); break;
    case 'four': glow(g, x, y, r * 1.4, col, 0.3); ring(g, x, y, r * 0.85, r * 0.12, col); text(g, '4', x, y + r * 0.06, { size: r * 1.15, color: col, font: FONTS.ui, weight: 900 });
      for (let i = 0; i < 3; i++) { const a = t * 0.6 + i * 2.1; circle(g, x + Math.cos(a) * r * 1.15, y + Math.sin(a) * r * 1.15, r * 0.06, '#fff4d0'); } break;
    case 'spider': glow(g, x, y, r * 1.3, col, 0.25); for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const a = -0.9 + i * 0.6; seg(g, [[x, y], [x + s * Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5 - r * 0.1], [x + s * Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95 + r * 0.25]], r * 0.07, col); }
      g.fillStyle = col; g.beginPath(); g.ellipse(x, y + r * 0.1, r * 0.2, r * 0.32, 0, 0, 7); g.fill(); circle(g, x, y - r * 0.3, r * 0.14, col); break;
    case 'horns': glow(g, x, y, r * 1.3, col, 0.3); g.strokeStyle = col; g.lineWidth = r * 0.14; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x + s * r * 0.25, y + r * 0.35); g.quadraticCurveTo(x + s * r * 0.35, y - r * 0.6, x + s * r * 0.95, y - r * 0.95); g.stroke(); } g.beginPath(); g.arc(x, y + r * 0.55, r * 0.45, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); break;
    case 'mask': glow(g, x, y, r * 1.4, col, 0.3); rr(g, x - r * 0.6, y - r * 0.8, r * 1.2, r * 1.6, r * 0.32); g.fillStyle = '#b8bfc7'; g.fill(); for (const s of [-1, 1]) { rr(g, x + (s > 0 ? r * 0.08 : -r * 0.46), y - r * 0.28, r * 0.38, r * 0.14, r * 0.05); g.fillStyle = col; g.fill(); } for (let i = 0; i < 4; i++) seg(g, [[x - r * 0.22 + i * r * 0.15, y + r * 0.35], [x - r * 0.22 + i * r * 0.15, y + r * 0.55]], r * 0.05, '#3a4048'); break;
    case 'shield': shield(g, x, y, r * 0.9); break;
  }
  g.restore();
}

// ---------- film case (cover with original art + rank badge) ----------
export function filmCase(g, x, y, w, m, o = {}) {
  const { t = 0, glowK = 0.4, rank = true, dim = 0, lock = 0, tilt = 0, a = 1, title = true } = o;
  const h = w * 1.42, ui = S().ui;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(tilt);
  if (glowK > 0) glow(g, 0, 0, w * 1.3, m.accent, glowK * 0.5);
  g.fillStyle = 'rgba(0,0,0,.45)'; rr(g, -w / 2 + 10, -h / 2 + 14, w, h, w * 0.05); g.fill();
  rr(g, -w / 2, -h / 2, w, h, w * 0.05); g.fillStyle = linGrad(g, 0, -h / 2, 0, h / 2, [shade(m.c1, 0.15), m.c1, '#07060a']); g.fill();
  g.save(); g.clip();
  glow(g, 0, -h * 0.12, w * 0.75, m.accent, 0.35);
  if (lock < 1) icon(g, m.icon, 0, -h * 0.12, w * 0.3, m.accent, t);
  for (let i = 0; i < 18; i++) circle(g, -w / 2 + ((i * 53) % 100) / 100 * w, -h / 2 + ((i * 37) % 100) / 100 * h * 0.6, 1.2, alpha('#ffffff', 0.25));
  g.fillStyle = 'rgba(255,255,255,.06)'; poly(g, [[-w / 2, -h / 2], [-w / 2 + w * 0.35, -h / 2], [-w / 2, -h / 2 + h * 0.5]], 'rgba(255,255,255,.07)');
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2, -h / 2, w * 0.06, h);
  g.restore();
  g.strokeStyle = alpha(m.accent, 0.35); g.lineWidth = Math.max(1.5, w * 0.012); rr(g, -w / 2, -h / 2, w, h, w * 0.05); g.stroke();
  if (title && lock < 1) {
    const L = m.lines, base = w * 0.105; let yy = h * 0.24 - (L.length - 1) * base * 0.6;
    L.forEach((ln, i) => { const sz = Math.min(i === 0 ? base * 1.15 : base, (w * 0.86) / Math.max(1, measure(g, ln, 100) / 100)); text(g, ln, 0, yy, { size: sz, color: i === 0 ? ui.cream : m.accent, glow: 10, glowColor: alpha(m.accent, 0.5), spacing: 1 }); yy += sz * 1.12 + 2; });
  }
  if (lock > 0) { const k = lock; g.save(); g.globalAlpha *= k; glow(g, 0, -h * 0.05, w * 0.6, '#5dff8a', 0.4 + 0.2 * Math.sin(t * 5)); text(g, '?', 0, -h * 0.05, { size: w * 0.6, color: '#9dffb6', glow: 30, glowColor: 'rgba(93,255,138,.9)' }); g.restore(); }
  if (rank) { const bx = -w / 2 + w * 0.02, by = -h / 2 + w * 0.02, br = w * 0.15; circle(g, bx, by, br, ui.gold); glow(g, bx, by, br * 2, ui.gold, 0.35); text(g, '#' + m.n, bx, by + br * 0.04, { size: br * 1.0, color: '#1a1206', font: FONTS.ui, weight: 900 }); }
  if (dim > 0) { g.fillStyle = `rgba(6,6,12,${dim})`; rr(g, -w / 2, -h / 2, w, h, w * 0.05); g.fill(); }
  g.restore();
  return h;
}

// ---------- furniture / home ----------
export function couch(g, x, y, w = 520, color = '#3a2f4a', s = 1) {
  const h = 150 * s, c2 = shade(color, -0.3);
  rr(g, x - w / 2, y - h * 1.15, w, h * 0.7, 30 * s); g.fillStyle = c2; g.fill();
  rr(g, x - w / 2 + 10, y - h * 0.62, w - 20, h * 0.42, 18 * s); g.fillStyle = color; g.fill();
  rr(g, x - w / 2 - 34 * s, y - h * 0.85, 70 * s, h * 0.75, 26 * s); g.fillStyle = shade(color, -0.15); g.fill();
  rr(g, x + w / 2 - 36 * s, y - h * 0.85, 70 * s, h * 0.75, 26 * s); g.fill();
  g.fillStyle = shade(color, -0.55); g.fillRect(x - w / 2, y - h * 0.22, w, h * 0.16);
  for (const dx of [-w / 2 + 20, w / 2 - 30]) g.fillRect(x + dx, y - h * 0.08, 12 * s, h * 0.08);
}
export function tvSet(g, x, y, w, h, content, glowC = '#7fd0ff', a = 0.3) {
  rr(g, x - w / 2 - 12, y - h - 12, w + 24, h + 24, 10); g.fillStyle = '#0a0a0f'; g.fill();
  g.save(); g.beginPath(); g.rect(x - w / 2, y - h, w, h); g.clip(); g.fillStyle = '#0d1824'; g.fillRect(x - w / 2, y - h, w, h); content?.(g, x - w / 2, y - h, w, h); g.restore();
  glow(g, x, y - h / 2, Math.max(w, h) * 1.1, glowC, a);
  seg(g, [[x, y + 12], [x, y + 50]], 10, '#0a0a0f'); seg(g, [[x - 70, y + 52], [x + 70, y + 52]], 8, '#0a0a0f');
}
export function popcorn(g, x, y, s = 1) {
  poly(g, [[x - 26 * s, y - 60 * s], [x + 26 * s, y - 60 * s], [x + 19 * s, y], [x - 19 * s, y]], '#e9e3da');
  for (let i = 0; i < 4; i++) poly(g, [[x - 26 * s + i * 13 * s, y - 60 * s], [x - 19.5 * s + i * 13 * s, y - 60 * s], [x - 14 * s + i * 9.5 * s, y], [x - 17 * s + i * 9.5 * s, y]], '#c0262d');
  for (let i = 0; i < 9; i++) circle(g, x - 22 * s + (i % 5) * 11 * s, y - 64 * s - Math.floor(i / 5) * 9 * s - (i % 2) * 4 * s, 8 * s, '#fff1c8');
}
const SPINES = ['#c0262d', '#2c4f9e', '#e3b23c', '#6f7a3c', '#7a3aa8', '#2f8a45', '#b8bec8', '#d06a2a', '#1e2a4a', '#a5212b', '#2f6bd6', '#4a2050'];
// tower of stacked movie cases; returns the top y
export function caseStack(g, x, y, n, o = {}) {
  const { w = 150, th = 16, seed = 1, sway = 0, t = 0 } = o; const r = rng(seed);
  let yy = y;
  for (let i = 0; i < n; i++) { const off = (r() - 0.5) * 22 + Math.sin(t * 1.3 + i * 0.3) * sway * i * 0.04, ww = w * (0.9 + r() * 0.2), c = SPINES[Math.floor(r() * SPINES.length)];
    g.fillStyle = shade(c, -0.25); g.fillRect(x - ww / 2 + off, yy - th, ww, th - 1.5); g.fillStyle = c; g.fillRect(x - ww / 2 + off, yy - th, ww * 0.18, th - 1.5); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - ww / 2 + off + ww * 0.25, yy - th * 0.62, ww * 0.4, 2.5);
    yy -= th; }
  return yy;
}
export function ticket(g, x, y, w, o = {}) {
  const { rot = 0, glowK = 0.5, l1 = 'AVENGERS:', l2 = 'DOOMSDAY', l3 = 'DEC 18', a = 1 } = o, h = w * 0.42, ui = S().ui;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
  glow(g, 0, 0, w * 0.9, '#5dff8a', glowK * 0.4);
  g.fillStyle = '#efe6d2'; g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(w / 2, -h / 2); g.lineTo(w / 2, -h * 0.12); g.arc(w / 2, 0, h * 0.12, -Math.PI / 2, Math.PI / 2, true); g.lineTo(w / 2, h / 2); g.lineTo(-w / 2, h / 2); g.lineTo(-w / 2, h * 0.12); g.arc(-w / 2, 0, h * 0.12, Math.PI / 2, -Math.PI / 2, true); g.closePath(); g.fill();
  g.fillStyle = '#1d3a26'; g.fillRect(-w / 2 + w * 0.04, -h / 2 + h * 0.1, w * 0.66, h * 0.8);
  g.setLineDash([6, 6]); seg(g, [[w * 0.24, -h / 2 + 6], [w * 0.24, h / 2 - 6]], 2, 'rgba(60,40,20,.5)'); g.setLineDash([]);
  text(g, l1, -w * 0.13, -h * 0.13, { size: w * 0.075, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 2 });
  text(g, l2, -w * 0.13, h * 0.12, { size: w * 0.105, color: '#9dffb6', glow: 12, glowColor: 'rgba(93,255,138,.7)', spacing: 2 });
  text(g, l3, w * 0.37, 0, { size: w * 0.06, color: '#3a2a18', font: FONTS.ui, weight: 900 });
  g.restore();
}
export function calendar(g, x, y, w, label, tear = 0, o = {}) {
  const h = w * 1.1, ui = S().ui;
  rr(g, x - w / 2, y - h / 2, w, h, 10); g.fillStyle = '#e9e2d4'; g.fill(); g.fillStyle = '#b3262e'; g.fillRect(x - w / 2, y - h / 2, w, h * 0.22);
  for (let i = 0; i < 2; i++) circle(g, x - w * 0.25 + i * w * 0.5, y - h / 2 + 4, 7, '#2a2630');
  text(g, label, x, y + h * 0.1, { size: w * 0.22, color: '#2a2630', font: FONTS.ui, weight: 900 });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) g.fillStyle = 'rgba(40,30,30,.25)', g.fillRect(x - w * 0.42 + c * w * 0.12, y + h * 0.26 + r * h * 0.05, w * 0.08, h * 0.02);
  if (tear > 0 && tear < 1) { g.save(); g.translate(x - w / 2, y - h / 2 + h * 0.22); g.rotate(tear * 1.2); g.globalAlpha *= 1 - tear; g.fillStyle = '#efe8da'; g.fillRect(0, 0, w, h * 0.78); g.restore(); }
}

// ---------- cosmic ----------
export function universe(g, x, y, r, o = {}) {
  const { hue = '#5a7cff', t = 0, seed = 1, a = 1, crack = 0, inner = '#0b1022', dim = 0 } = o; const R = rng(seed);
  g.save(); g.globalAlpha *= a;
  glow(g, x, y, r * 1.8, hue, 0.35);
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip();
  g.fillStyle = radGrad(g, x - r * 0.3, y - r * 0.4, 0, r * 1.2, [mix(hue, '#ffffff', 0.25), mix(hue, inner, 0.55), inner]); g.fillRect(x - r, y - r, r * 2, r * 2);
  for (let i = 0; i < 26; i++) circle(g, x + (R() - 0.5) * r * 1.8, y + (R() - 0.7) * r * 1.2, 0.6 + R() * 1.6 * (r / 80), alpha('#ffffff', 0.6 * R()));
  const by = y + r * 0.45; let cx = x - r; g.fillStyle = alpha(shade(hue, -0.65), 0.95);
  while (cx < x + r) { const bw = r * (0.08 + R() * 0.12), bh = r * (0.1 + R() * 0.45); g.fillRect(cx, by - bh, bw, bh + r); for (let wy = by - bh + 4; wy < by - 3; wy += Math.max(3, r * 0.06)) if (R() < 0.4) { g.fillStyle = alpha('#ffe2a8', 0.8); g.fillRect(cx + bw * 0.3, wy, Math.max(1, r * 0.02), Math.max(1, r * 0.025)); g.fillStyle = alpha(shade(hue, -0.65), 0.95); } cx += bw + r * 0.01; }
  g.fillStyle = alpha(shade(hue, -0.75), 1); g.fillRect(x - r, by, r * 2, r);
  if (dim) { g.fillStyle = `rgba(0,0,0,${dim})`; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.restore();
  ring(g, x, y, r, Math.max(1.5, r * 0.025), alpha(mix(hue, '#ffffff', 0.5), 0.8));
  g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(x - r * 0.42, y - r * 0.48, r * 0.22, r * 0.12, -0.6, 0, 7); g.fill();
  if (crack > 0) cracks(g, x, y, { seed: seed + 7, len: r * 1.1 * crack, count: 5, color: '#ffffff', glowC: hue, a: clamp(crack * 1.5) });
  g.restore();
}
export function cracks(g, x, y, o = {}) {
  const { seed = 3, len = 300, count = 6, color = '#ffffff', glowC = '#ff5a3a', a = 1, w = 3 } = o; const R = rng(seed);
  g.save(); g.globalAlpha *= a; g.globalCompositeOperation = 'lighter'; g.shadowColor = glowC; g.shadowBlur = 18;
  for (let i = 0; i < count; i++) { let ang = (i / count) * Math.PI * 2 + R() * 0.6, px = x, py = y; const pts = [[px, py]]; const n = 6;
    for (let k = 0; k < n; k++) { ang += (R() - 0.5) * 0.9; const d = (len / n) * (0.6 + R() * 0.8); px += Math.cos(ang) * d; py += Math.sin(ang) * d; pts.push([px, py]); }
    seg(g, pts, w, alpha(glowC, 0.9)); seg(g, pts, w * 0.4, alpha(color, 0.95)); }
  g.restore();
}
export function portal(g, x, y, rx, ry, t, o = {}) {
  const { color = '#ffae3a', inside = null, a = 1, k = 1 } = o;
  g.save(); g.globalAlpha *= a;
  if (inside) { g.save(); g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, 7); g.clip(); inside(g, x - rx, y - ry, rx * 2, ry * 2); g.restore(); }
  g.globalCompositeOperation = 'lighter'; glow(g, x, y, Math.max(rx, ry) * 1.3 * k, color, 0.35);
  for (let i = 0; i < 70; i++) { const ang = t * 3.2 + i * 0.09, rr2 = 1 + 0.05 * Math.sin(i * 7.1 + t * 9); const px = x + Math.cos(ang) * rx * rr2 * k, py = y + Math.sin(ang) * ry * rr2 * k; const tx = -Math.sin(ang) * 18, ty = Math.cos(ang) * 18 * (ry / rx);
    seg(g, [[px, py], [px + tx, py + ty]], 2.2, alpha(i % 3 ? '#ffd28a' : color, 0.85)); }
  g.strokeStyle = alpha(color, 0.9); g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, rx * k, ry * k, 0, 0, 7); g.stroke();
  g.restore();
}
export function globe(g, x, y, r, t, o = {}) {
  const { land = '#3a7a5a', sea = '#1e3a7a', a = 1 } = o;
  g.save(); g.globalAlpha *= a; glow(g, x, y, r * 1.5, '#7fb0ff', 0.35); circle(g, x, y, r, sea);
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.fillStyle = land;
  for (let i = 0; i < 7; i++) { const u = ((i * 0.31 + t * 0.03) % 1.4) - 0.2, lx = x - r + u * r * 2.4, ly = y + Math.sin(i * 2.3) * r * 0.55; g.beginPath(); g.ellipse(lx, ly, r * (0.18 + 0.1 * Math.sin(i)), r * (0.12 + 0.08 * Math.cos(i * 1.7)), i, 0, 7); g.fill(); }
  g.fillStyle = radGrad(g, x - r * 0.4, y - r * 0.4, r * 0.1, r * 1.3, ['rgba(255,255,255,.12)', 'rgba(0,0,0,0)', 'rgba(0,0,0,.6)']); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
  ring(g, x, y, r * 1.02, r * 0.03, 'rgba(160,200,255,.6)'); g.restore();
}
export function galaxy(g, x, y, r, t, o = {}) {
  const { col = '#b48cff', a = 1 } = o; g.save(); g.globalAlpha *= a; g.globalCompositeOperation = 'lighter'; glow(g, x, y, r * 0.5, '#fff1d0', 0.6); glow(g, x, y, r, col, 0.25);
  for (let i = 0; i < 420; i++) { const arm = i % 2, d = (i / 420) * r, ang = d / r * 5 + arm * Math.PI + t * 0.05 + Math.sin(i * 13.7) * 0.3; const px = x + Math.cos(ang) * d, py = y + Math.sin(ang) * d * 0.45; circle(g, px, py, 1 + ((i * 7) % 3) * 0.6, alpha(i % 5 ? col : '#ffffff', 0.5 * (1 - d / r) + 0.15)); }
  g.restore();
}
export function nebula(g, t, o = {}) {
  const { c1 = '#5a2a8a', c2 = '#1a6a7a', seed = 1 } = o; const R = rng(seed);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) { const x = R() * E.W * 1.4 - E.W * 0.2, y = R() * E.H * 1.2 - E.H * 0.1, r = 300 + R() * 500; g.fillStyle = radGrad(g, x + Math.sin(t * 0.1 + i) * 20, y, 0, r, [alpha(i % 2 ? c1 : c2, 0.22), alpha(i % 2 ? c1 : c2, 0)]); g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.restore();
}

// ---------- UI-ish objects ----------
export function thumbsUp(g, x, y, s = 1, col = '#ffffff') {
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -60, -10, 34, 80, 8); g.fillStyle = col; g.fill();
  g.beginPath(); g.moveTo(-20, -6); g.lineTo(-2, -60); g.quadraticCurveTo(14, -78, 22, -56); g.lineTo(14, -18); g.lineTo(58, -18); g.quadraticCurveTo(74, -14, 68, 4); g.lineTo(56, 60); g.quadraticCurveTo(52, 72, 38, 72); g.lineTo(-20, 72); g.closePath(); g.fill();
  g.restore();
}
export function bell(g, x, y, s = 1, t = 0, col = '#ffffff') {
  g.save(); g.translate(x, y); g.rotate(Math.sin(t * 18) * 0.25 * Math.exp(-t * 1.2)); g.scale(s, s); g.fillStyle = col;
  g.beginPath(); g.moveTo(-40, 30); g.quadraticCurveTo(-34, 20, -34, -4); g.quadraticCurveTo(-34, -46, 0, -50); g.quadraticCurveTo(34, -46, 34, -4); g.quadraticCurveTo(34, 20, 40, 30); g.closePath(); g.fill();
  circle(g, 0, 40, 10, col); circle(g, 0, -56, 7, col); g.restore();
}
export function subscribePill(g, x, y, s = 1, pressed = 0) {
  const sc = s * (1 - 0.08 * pressed); g.save(); g.translate(x, y); g.scale(sc, sc);
  rr(g, -170, -44, 340, 88, 44); g.fillStyle = pressed > 0.5 ? '#5a5a66' : '#e0302a'; g.fill();
  text(g, pressed > 0.5 ? 'SUBSCRIBED' : 'SUBSCRIBE', 0, 2, { size: 40, color: '#fff', font: FONTS.ui, weight: 900, spacing: 1 }); g.restore();
}
export function stamp(g, x, y, str, o = {}) {
  const { col = '#e8b53a', rot = -0.18, k = 1, size = 64 } = o; if (k <= 0) return;
  const sc = 1 + 1.6 * (1 - ease.out(k)); g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc); g.globalAlpha *= clamp(k * 2);
  const w = measure(g, str, size, FONTS.ui, 900) + size * 0.8, h = size * 1.5; g.strokeStyle = col; g.lineWidth = size * 0.1; rr(g, -w / 2, -h / 2, w, h, size * 0.2); g.stroke();
  text(g, str, 0, size * 0.04, { size, color: col, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore();
}
export function label(g, x, y, str, o = {}) {
  const { a = 1, size = V(34, 40), col = S().ui.cream, line = S().ui.gold, align = 'left' } = o; if (a <= 0) return;
  const w = measure(g, str, size, FONTS.ui, 900); const x0 = align === 'left' ? x : x - w;
  g.save(); g.globalAlpha *= a; g.fillStyle = 'rgba(8,8,14,.55)'; rr(g, x0 - 16, y - size * 0.85, w + 32, size * 1.7, 8); g.fill();
  g.fillStyle = line; g.fillRect(x0 - 16, y - size * 0.85, 5, size * 1.7);
  text(g, str, x0, y + 2, { size, color: col, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 }); g.restore();
}
