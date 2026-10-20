// shots/07_fantastic.js — #1 The Fantastic Four: First Steps: top of the watchlist, Doom's comic history,
// Reed vs Doom (two minds, two futures), Marvel's First Family entering the bigger story.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, measure, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { living, TVC } from '../sets/living.js';
import { lab, retroCity, chalkboard, spires } from '../sets/retro.js';
import { rooftop } from '../sets/rooftop.js';
import { throneHall, GREEN } from '../sets/throne.js';
import { cosmos } from '../sets/cosmos.js';
import { hero, bigDoom, bigHero, mandala, wpt, OUT } from '../cast.js';
import { filmCase, MOVIES, movie, icon, portal, label } from '../props.js';
import { filmCard, fanFace, couchShot, nameTag, tShot } from '../tpl.js';

// s082 — "And finally, the movie you should put right at the top of your watchlist:"  TV watchlist UI
registerShot('s082', { draw(g, t, info) {
  blurLayer(g, 12, (g) => living(g, t, { z: 1.3, x: 200, y: 60 }, {})); veil(g, '#04040a', 0.4);
  const ui = S().ui, cam = { z: 1.0 + 0.04 * t / info.dur }, slide = ease.inOut(prog(t, 2.4, 3.4));
  layer(g, cam, 1, (g) => {
    const x = E.W / 2 - V(560, 440), y = V(130, 260), w = V(1120, 880), h = V(820, 1300);
    rr(g, x - 20, y - 20, w + 40, h + 40, 18); g.fillStyle = '#05050a'; g.fill(); g.fillStyle = '#0d1424'; g.fillRect(x, y, w, h); glow(g, E.W / 2, y + h / 2, w * 0.8, TVC, 0.12);
    text(g, 'MY WATCHLIST', x + 50, y + 60, { size: V(44, 50), color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 4 });
    const rows = [movie(2), movie(3), movie(4), movie(5), movie(6)], rh = V(120, 170);
    rows.forEach((m, i) => { const yy = y + 130 + (i + slide) * rh; if (yy > y + h - 60) return; rr(g, x + 40, yy, w - 80, rh - 16, 12); g.fillStyle = 'rgba(255,255,255,.05)'; g.fill(); filmCase(g, x + 110, yy + (rh - 16) / 2, (rh - 30) / 1.42, m, { t, rank: false, title: false, glowK: 0 }); text(g, m.lines.join(' '), x + 200, yy + (rh - 16) / 2, { size: V(32, 34), color: alpha(ui.cream, 0.75), font: FONTS.ui, weight: 900, align: 'left', spacing: 1 }); });
    if (slide > 0) { const yy = y + 130 + lerp(-rh, 0, slide), m = movie(1); g.save(); g.globalAlpha *= slide; rr(g, x + 40, yy, w - 80, rh - 16, 12); g.fillStyle = alpha(ui.gold, 0.18); g.fill(); g.strokeStyle = ui.gold; g.lineWidth = 3; g.stroke(); filmCase(g, x + 110, yy + (rh - 16) / 2, (rh - 30) / 1.42, m, { t, rank: false, title: false, glowK: 0.6 }); text(g, 'TOP PICK', x + 200, yy + (rh - 16) / 2, { size: V(36, 38), color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 4, glow: 14, glowColor: alpha(ui.gold, 0.6) }); g.restore(); }
  });
} });

registerShot('s083', { draw(g, t, info) { filmCard(g, t, info, 1, { extra: (g, t) => { const k = ease.out(prog(t, 0, 0.6)); FX.godRays(g, E.W * 0.27, E.H * 0.42, { count: 14, angle: -Math.PI / 2, spread: Math.PI * 2, len: 900, a: 0.05 * k, t, color: '#ffd36a' }); } }); } });
registerShot('s084', { draw(g, t, info) { fanFace(g, t, info, { expr: 'confused', q: 1, qAt: 0.1, look: [-0.3, -0.4], tilt: 0.06 }); } });

// comic page (s085, s086)
function comicPaper(g, t) {
  g.fillStyle = '#efe2c4'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  for (let y = 0; y < E.H; y += 14) for (let x = (y / 14) % 2 ? 7 : 0; x < E.W; x += 14) circle(g, x, y, 2.2, 'rgba(200,120,90,.18)');
}
function panel(g, x, y, w, h, fn, bg = '#f5ead2') { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = bg; g.fillRect(x, y, w, h); fn(g, x, y, w, h); g.restore(); g.strokeStyle = '#141018'; g.lineWidth = 8; g.strokeRect(x, y, w, h); }
registerShot('s085', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.08 * ease.inOut(t / info.dur), x: lerp(-60, 60, t / info.dur), r: -0.03 };
  layer(g, cam, 1, (g) => {
    comicPaper(g, t); const W = E.W, H = E.H, m = 60, gw = (W - m * 3) / 2;
    panel(g, m, m, gw * 1.1, H * 0.45, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#2a4a3a', '#6a9a7a']); g.fillRect(x, y, w, h); poly(g, [[x + w * 0.2, y + h], [x + w * 0.3, y + h * 0.3], [x + w * 0.35, y + h * 0.15], [x + w * 0.4, y + h * 0.3], [x + w * 0.55, y + h * 0.2], [x + w * 0.6, y + h * 0.05], [x + w * 0.65, y + h * 0.2], [x + w * 0.8, y + h]], '#1a2a22'); text(g, 'LATVERIA', x + w * 0.5, y + h - 40, { size: 40, color: '#f5ead2', font: FONTS.ui, weight: 900, spacing: 6 }); });
    panel(g, m * 2 + gw * 1.1, m, gw * 0.9, H * 0.45, (g, x, y, w, h) => { g.fillStyle = '#c0262d'; g.fillRect(x, y, w, h); for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; poly(g, [[x + w / 2, y + h / 2], [x + w / 2 + Math.cos(a) * w, y + h / 2 + Math.sin(a) * w], [x + w / 2 + Math.cos(a + 0.12) * w, y + h / 2 + Math.sin(a + 0.12) * w]], 'rgba(255,220,120,.4)'); } bigDoom(g, x + w / 2, y + h * 0.6, h * 0.36, { eyes: 1, t, rimColor: '#ffe2a0' }); });
    panel(g, m, m * 2 + H * 0.45, W - m * 2, H - m * 3 - H * 0.45, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#1a2a4a', '#3a5a8a']); g.fillRect(x, y, w, h); hero(g, 'DOOM', { x: x + w * 0.7, y: y + h - 10, s: 1.0, facing: -1, pose: POSES.point, t, rim: { color: '#ffe2a0', dir: [0, -1] } }); rr(g, x + 60, y + 30, 520, 90, 45); g.fillStyle = '#ffffff'; g.fill(); g.strokeStyle = '#141018'; g.lineWidth = 4; g.stroke(); text(g, 'DOOM WILL PREVAIL!', x + 320, y + 76, { size: 38, color: '#141018', font: FONTS.ui, weight: 900 }); });
  });
} });
registerShot('s086', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.06 * t / info.dur, r: 0.02 };
  layer(g, cam, 1, (g) => {
    comicPaper(g, t);
    panel(g, 70, 70, E.W - 140, E.H - 140, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#f2c46a', '#e07a3a']); g.fillRect(x, y, w, h); for (let i = 0; i < 24; i++) { const a = i * Math.PI / 12; poly(g, [[x + w * 0.7, y + h * 0.4], [x + w * 0.7 + Math.cos(a) * 2000, y + h * 0.4 + Math.sin(a) * 2000], [x + w * 0.7 + Math.cos(a + 0.1) * 2000, y + h * 0.4 + Math.sin(a + 0.1) * 2000]], 'rgba(255,255,255,.18)'); }
      const k = ease.out(prog(t, 0.2, 1.2)); g.save(); g.globalAlpha *= 0.85 * k; bigDoom(g, x + w * 0.74, y + h * 0.45, h * 0.36, { eyes: 1, t, rimColor: '#9dffb6' }); g.restore();
      const GY = y + h - 30; [['REED', 0], ['SUE', 1], ['JOHNNY', 2], ['BEN', 3]].forEach(([id, i]) => hero(g, id, { x: x + 170 + i * 170, y: GY, s: 1.35, facing: 1, pose: breathe(i === 0 ? POSES.point : POSES.ready, t, 1, i), t, expr: 'determined', rim: { color: '#fff1c8', dir: [0, -1] }, flame: id === 'JOHNNY' ? 1 : 0 }));
    });
  });
} });

// s087 — "especially Reed Richards."  the stretch
registerShot('s087', { draw(g, t, info) {
  const cam = { z: 1.2, x: -80 + 40 * t, y: 110 };
  const { GY, CX, rim } = lab(g, t, cam);
  const k = ease.outBack(prog(t, 0.15, 0.8));
  layer(g, cam, 1, (g) => hero(g, 'REED', { x: CX - 420, y: GY, s: 1.5, facing: 1, pose: breathe({ ...POSES.point, eF: [34 + 200 * k, -172], hF: [68 + 520 * k, -176] }, t), t, expr: 'smile', rim: { color: rim, dir: [0.5, -1], w: 5 } }));
  nameTag(g, t, E.W * V(0.12, 0.1), E.H * V(0.25, 0.2), 'REED RICHARDS', 0.3, { color: '#7fb0ff' });
} });
// s088 — "Reed is one of Marvel's smartest characters,"  two chalkboards at once
registerShot('s088', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * t / info.dur, y: 30 };
  const { GY, CX, rim } = lab(g, t, cam, { boardK: 0.2 + 0.8 * ease.inOut(prog(t, 0, info.dur)) });
  layer(g, cam, 1, (g) => { const wob = Math.sin(t * 12) * 6; hero(g, 'REED', { x: CX, y: GY, s: 1.4, facing: 1, pose: breathe({ ...POSES.stand, eF: [140, -230], hF: [330 + wob, -330 + wob], eB: [-140, -230], hB: [-330 - wob, -330 - wob] }, t), t, expr: 'happy', rim: { color: rim, dir: [0, -1], w: 5 } }); });
} });

// Doom's four powers blueprint (s089 intelligence; s090 technology / power / sorcery)
function gearIcon(g, x, y, r, c) { g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, rr2 = i % 4 < 2 ? r : r * 0.78; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } g.closePath(); g.stroke(); ring(g, x, y, r * 0.35, 5, c); }
function brainIcon(g, x, y, r, c) { g.strokeStyle = c; g.lineWidth = 5; for (const dx of [-0.32, 0.32]) { g.beginPath(); g.ellipse(x + dx * r, y, r * 0.45, r * 0.62, 0, 0, 7); g.stroke(); } seg(g, [[x - r * 0.5, y - r * 0.1], [x - r * 0.2, y + r * 0.15]], 4, c); seg(g, [[x + r * 0.5, y - r * 0.1], [x + r * 0.2, y + r * 0.15]], 4, c); }
function crownIcon(g, x, y, r, c) { g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.moveTo(x - r * 0.8, y + r * 0.5); g.lineTo(x - r * 0.8, y - r * 0.4); g.lineTo(x - r * 0.4, y); g.lineTo(x, y - r * 0.6); g.lineTo(x + r * 0.4, y); g.lineTo(x + r * 0.8, y - r * 0.4); g.lineTo(x + r * 0.8, y + r * 0.5); g.closePath(); g.stroke(); }
function powers(g, t, info, phase) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui, cx = E.W / 2, cy = E.H * 0.52, cam = { z: 1 + 0.03 * t };
  const tt = phase ? { intelligence: -5, technology: tShot(info, 'technology', 0.15), power: tShot(info, 'power', 1.5), sorcery: tShot(info, 'sorcery', 2.8) } : { intelligence: tShot(info, 'intelligence', 1.97), technology: 99, power: 99, sorcery: 99 };
  layer(g, cam, 1, (g) => {
    const m = ease.out(prog(t, 0, 0.4)); g.save(); g.globalAlpha *= phase ? 1 : m; const r = V(150, 140);
    g.strokeStyle = c; g.lineWidth = 4; rr(g, cx - r * 0.8, cy - r, r * 1.6, r * 2, r * 0.4); g.stroke(); for (const s of [-1, 1]) { rr(g, cx + (s > 0 ? r * 0.12 : -r * 0.62), cy - r * 0.3, r * 0.5, r * 0.16, 6); g.stroke(); } for (let i = 0; i < 5; i++) seg(g, [[cx - r * 0.3 + i * r * 0.15, cy + r * 0.45], [cx - r * 0.3 + i * r * 0.15, cy + r * 0.7]], 3, c); g.restore();
    const P = [['INTELLIGENCE', brainIcon, -1, -1, 'intelligence'], ['TECHNOLOGY', gearIcon, 1, -1, 'technology'], ['POLITICAL POWER', crownIcon, -1, 1, 'power'], ['SORCERY', null, 1, 1, 'sorcery']];
    P.forEach(([lab, fn, sx, sy, key]) => { const x = cx + sx * V(520, 300), y = cy + sy * V(230, 420), on = t > tt[key], k = ease.outBack(prog(t, tt[key], tt[key] + 0.35)), col = on ? ui.gold : alpha(c, 0.35);
      g.setLineDash([8, 10]); seg(g, [[cx + sx * 170, cy + sy * 110], [x - sx * 110, y - sy * 40]], 3, alpha(col, on ? 0.9 : 0.4)); g.setLineDash([]);
      g.save(); g.translate(x, y); const sc = on ? 0.8 + 0.2 * k : 0.8; g.scale(sc, sc); ring(g, 0, 0, 90, 4, col); if (on) glow(g, 0, 0, 160, ui.gold, 0.3); if (fn) fn(g, 0, 0, 50, col); else mandala(g, 0, 0, 52, t, col, on ? 1 : 0.4); g.restore();
      text(g, lab, x, y + 130, { size: V(32, 34), color: col, font: FONTS.ui, weight: 900, spacing: 3 }); });
  });
}
registerShot('s089', { draw(g, t, info) { powers(g, t, info, 0); } });
registerShot('s090', { draw(g, t, info) { powers(g, t, info, 1); } });

// s091 — "That makes their rivalry much more than a simple battle between a hero and a villain."
function bigBoard(g, cam, t) {
  layer(g, cam, 0.95, (g) => {
    const cx = E.W / 2, top = E.H * 0.7, bot = E.H * 2.2, wT = 1600, wB = 5200, N = 8;
    const P = (u, v) => { const y = lerp(top, bot, v), w = lerp(wT, wB, v); return [cx - w / 2 + u * w, y]; };
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) poly(g, [P(i / N, j / N), P((i + 1) / N, j / N), P((i + 1) / N, (j + 1) / N), P(i / N, (j + 1) / N)], (i + j) % 2 ? '#141c26' : '#b8c4cc');
    FX.pool(g, cx - 300, top + 20, 400, 60, '#7fb0ff', 0.3); FX.pool(g, cx + 300, top + 20, 400, 60, GREEN, 0.3);
  });
}
registerShot('s091', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 1.0, 3.6)), cam = { z: lerp(1.9, 1.0, k), y: lerp(240, 60, k) };
  cosmos(g, t, cam, { c1: '#1a4a7a', c2: '#1a6a3a' });
  bigBoard(g, cam, t);
  const GY = E.H * 0.72;
  layer(g, cam, 1, (g) => {
    hero(g, 'REED', { x: E.W / 2 - 300, y: GY, s: 1.4, facing: 1, pose: breathe(POSES.ready, t), t, expr: 'determined', rim: { color: '#9fc0ff', dir: [0, -1], w: 5 } });
    hero(g, 'DOOM', { x: E.W / 2 + 300, y: GY, s: 1.4, facing: -1, pose: breathe(POSES.crossArms, t, 1, 2), t, eyes: 1, rim: { color: '#9dffb6', dir: [0, -1], w: 5 } });
  });
  FX.dust(g, t, { count: 50, color: '#cfe0ff', a: 0.3 });
} });
// s092 — "It's a clash between two brilliant minds"  two faces, one arc of lightning
registerShot('s092', { draw(g, t, info) {
  cosmos(g, t, { z: 1.2 }, { c1: '#1a4a7a', c2: '#1a6a3a' }); veil(g, '#000', 0.2);
  const r = V(250, 200), y = E.H * 0.56, push = 1 + 0.04 * t;
  bigHero(g, 'REED', E.W / 2 - V(470, 260) * push, y, r, { expr: 'determined', rimColor: '#9fc0ff', rimSide: 1, look: [0.6, 0] });
  bigDoom(g, E.W / 2 + V(470, 260) * push, y, r, { eyes: 1, t, rimSide: -1 });
  const a = 0.6 + 0.4 * Math.sin(t * 20); FX.lightning(g, { x1: E.W / 2 - V(220, 120), y1: y - r * 0.3, x2: E.W / 2 + V(220, 120), y2: y - r * 0.3, seed: Math.floor(t * 12), a, color: '#e0f0ff', jag: 50, branches: 2 });
  glow(g, E.W / 2, y - r * 0.3, 200, '#cfe0ff', 0.35 * a);
} });
// s093 — "with very different ideas about power and the future."  two futures, split
registerShot('s093', { draw(g, t, info) {
  const div = E.W / 2 + Math.sin(t * 0.6) * 60, cam = { z: 1.05 + 0.04 * t };
  g.save(); g.beginPath(); g.moveTo(-10, -10); g.lineTo(div + 160, -10); g.lineTo(div - 160, E.H + 10); g.lineTo(-10, E.H + 10); g.closePath(); g.clip();
  retroCity(g, t, { ...cam, x: 300 }); layer(g, cam, 1, (g) => hero(g, 'REED', { x: div - 420, y: E.H * 0.8, s: 1.3, facing: 1, pose: breathe(POSES.explain, t), t, expr: 'smile', rim: { color: '#ffd6a8', dir: [0, -1] } })); g.restore();
  g.save(); g.beginPath(); g.moveTo(div + 160, -10); g.lineTo(E.W + 10, -10); g.lineTo(E.W + 10, E.H + 10); g.lineTo(div - 160, E.H + 10); g.closePath(); g.clip();
  const th = throneHall(g, t, { ...cam, x: -320, y: 40 }, { flashes: [1.2] }); layer(g, { ...cam, x: -320, y: 40 }, 1, (g) => hero(g, 'DOOM', { x: E.W / 2 + 700, y: th.GY, s: 1.3, facing: -1, pose: breathe(POSES.crossArms, t), t, eyes: 1, rim: { color: th.rim, dir: [0, -1] } })); g.restore();
  seg(g, [[div + 160, -10], [div - 160, E.H + 10]], 6, '#ffffff'); glow(g, div, E.H / 2, 300, '#ffffff', 0.2);
  label(g, V(120, 60), E.H * 0.2, 'THE FUTURE', { a: ease.out(prog(t, tShot(info, 'future', 3.2), tShot(info, 'future', 3.2) + 0.3)), line: '#7fb0ff' });
  label(g, E.W - V(120, 60), E.H * 0.2, 'POWER', { a: ease.out(prog(t, tShot(info, 'power', 2.3), tShot(info, 'power', 2.3) + 0.3)), line: '#5dff8a', align: 'right' });
} });

// s094 — "This movie introduces Marvel's First Family and establishes their world,"
registerShot('s094', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.07 * ease.inOut(t / info.dur), y: 80 };
  const { GY, CX, rim } = retroCity(g, t, cam);
  const tF = tShot(info, 'First', 1.6);
  layer(g, cam, 1, (g) => [['SUE', -330], ['REED', -110], ['JOHNNY', 110], ['BEN', 340]].forEach(([id, dx], i) => hero(g, id, { x: CX + dx, y: GY, s: 1.35, facing: i < 2 ? 1 : -1, pose: breathe(t > tF ? (i === 2 ? POSES.wave : POSES.relaxed) : POSES.stand, t, 1, i), t, expr: t > tF ? 'happy' : 'smile', rim: { color: rim, dir: [0, -1], w: 5 }, flame: id === 'JOHNNY' ? ease.out(prog(t, tF, tF + 0.5)) : 0, alpha: id === 'SUE' ? 0.55 + 0.45 * Math.abs(Math.sin(t * 1.2)) : 1 })));
  FX.lensStreak(g, E.W * 0.6, E.H * 0.4, E.W, '#ffe2c0', 0.2);
} });

// s095 — "making it one of the most relevant films to watch before Doomsday."  #1 glows, meter maxes
registerShot('s095', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * t / info.dur };
  blurLayer(g, 12, (g) => living(g, t, { z: 1.4, x: 300, y: -200 }, { couch: false })); veil(g, '#06060e', 0.45);
  const ui = S().ui, fill = ease.inOut(prog(t, 0.4, 3.0));
  layer(g, cam, 1, (g) => {
    const y = E.H * 0.42;
    MOVIES.forEach((m, i) => { const x = E.W * 0.18 + i * E.W * 0.128, top = m.n === 1; filmCase(g, x, y - (top ? 20 + 10 * Math.sin(t * 3) : 0), top ? 200 : 160, m, { t, glowK: top ? 1.1 : 0.15, dim: top ? 0 : 0.45, rank: true }); });
    const bx = E.W * 0.2, by = E.H * 0.8, bw = E.W * 0.6;
    text(g, 'RELEVANCE', bx, by - 50, { size: V(36, 40), color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 4 });
    rr(g, bx, by - 20, bw, 40, 20); g.fillStyle = alpha(ui.gold, 0.12); g.fill(); rr(g, bx, by - 20, Math.max(40, bw * fill), 40, 20); g.fillStyle = ui.gold; g.fill(); glow(g, bx + bw * fill, by, 70, ui.gold, 0.6);
    if (fill > 0.98) text(g, 'MAX', bx + bw + 30, by, { size: V(40, 44), color: ui.gold, font: FONTS.ui, weight: 900, align: 'left', glow: 16, glowColor: alpha(ui.gold, 0.6) });
  });
} });

// s096 — "And with the Fantastic Four entering the larger Marvel story,"  through the portal
registerShot('s096', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.05 * t / info.dur, y: 70 };
  const { GY, CX, rim } = retroCity(g, t, cam);
  layer(g, cam, 1, (g) => {
    const px = CX + 420, py = GY - 230, open = ease.outBack(prog(t, 0.1, 0.8));
    portal(g, px, py, 190, 240, t, { color: '#7fb0ff', k: open, inside: (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#0b1028', '#1d2550', '#3a3570']); g.fillRect(x, y, w, h); FX.skyline(g, { x, y: y + h * 0.95, w, maxH: h * 0.6, color: '#0e1226', windowColor: 'rgba(255,184,96,.8)', lit: 0.3, seed: 5 }); } });
    [['REED', 0], ['SUE', 1], ['JOHNNY', 2], ['BEN', 3]].forEach(([id, i]) => { const x = CX - 520 + i * 150 + t * 120; const into = clamp((x - (px - 120)) / 160); hero(g, id, { x, y: GY, s: 1.25, facing: 1, pose: walkPose(t * 5 + i * 1.3), t, expr: 'determined', rim: { color: rim, dir: [0, -1] }, alpha: 1 - into, flame: id === 'JOHNNY' ? 0.6 : 0 }); });
  });
} });

// s097 — "you definitely don't want to miss their introduction."  popcorn and joy
registerShot('s097', { draw(g, t, info) {
  couchShot(g, t, info, { tv: true, z: 1.15, x: 160, y: 110, popcorn: true, expr: (t) => (t > 0.6 ? 'joy' : 'happy'), pose: (t) => breathe(posesAt(t, [[0, POSES.sit], [0.6, { ...POSES.sit, eF: [24, -170], hF: [36, -210] }]]), t),
    tvContent: (g, x, y, w, h) => { g.fillStyle = '#0e2350'; g.fillRect(x, y, w, h); icon(g, 'four', x + w / 2, y + h / 2, h * 0.32, '#7fb0ff', t); } });
} });
