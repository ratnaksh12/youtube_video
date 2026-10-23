// shots/03_rule.js — Endgame's time-travel rule (blueprint), the branch, the case file, and the plot hole:
// Cap returned the stone, but not what people saw.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { lake } from '/projects/avengers-doomsday-watchlist/scenes/sets/misc.js';
import { hero } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { icon, universe, stamp, label } from '/projects/avengers-doomsday-watchlist/scenes/props.js';
import { fanFace, tShot } from '/projects/avengers-doomsday-watchlist/scenes/tpl.js';
import { person, tesseract, briefcase, alarmLight, photo, CUBE } from '../kit70.js';
import { base70, vault70, interro } from '../sets70.js';

// ---------- the branching blueprint ----------
const BX0 = () => V(140, 80), BX1 = () => E.W - V(140, 80), BY = () => E.H * 0.42, BP = () => E.W * 0.38;
export function timeline(g, t, info, o = {}) {
  const c = UI.bpStroke(), ui = S().ui, y = BY(), x0 = BX0(), x1 = BX1(), px = BP();
  const k = o.grow ?? 1;
  seg(g, [[x0, y], [lerp(x0, x1, k), y]], 6, c);
  for (let i = 0; i <= 8; i++) { const x = lerp(x0, x1, i / 8); if (x <= lerp(x0, x1, k)) circle(g, x, y, 7, c); }
  text(g, o.mainLabel || 'OUR TIMELINE', x0, y - 50, { size: V(30, 34), color: c, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
  ring(g, px, y, 22, 4, ui.gold); text(g, '1970', px, y + 56, { size: V(34, 38), color: ui.gold, font: FONTS.ui, weight: 900 });
  if (o.check) { const a = ease.outBack(prog(t, o.check, o.check + 0.35)); if (a > 0) { g.save(); g.translate(x1 - 40, y - 70); g.scale(a, a); circle(g, 0, 0, 34, ui.good); seg(g, [[-15, 0], [-4, 12], [16, -12]], 7, '#0b1324'); g.restore(); text(g, 'YOUR FUTURE', x1 - 100, y - 70, { size: V(28, 30), color: ui.good, font: FONTS.ui, weight: 900, align: 'right', spacing: 2, alpha: clamp(a) }); } }
  if (o.branch != null) { const b = o.branch; g.strokeStyle = ui.gold; g.lineWidth = 6; g.beginPath(); g.moveTo(px, y); const n = 40; for (let i = 1; i <= n * b; i++) { const u = i / n; g.lineTo(px + u * (x1 - px) * 0.8, y + Math.pow(u, 0.6) * V(330, 500)); } g.stroke(); const u = b, tx = px + u * (x1 - px) * 0.8, ty = y + Math.pow(u, 0.6) * V(330, 500); glow(g, tx, ty, 60, ui.gold, 0.7); if (o.branchLabel) text(g, o.branchText || 'NEW BRANCH', tx - 30, ty + 60, { size: V(36, 40), color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3, glow: 14, glowColor: alpha(ui.gold, 0.6), alpha: ease.out(prog(t, o.branchLabel, o.branchLabel + 0.3)) }); return [tx, ty]; }
  return null;
}
// t023 — "Endgame gave us one rule for time travel."
registerShot('t023', { draw(g, t, info) {
  UI.blueprint(g); const ui = S().ui, k = ease.outBack(prog(t, 0.1, 0.5));
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(k, k); ring(g, 0, 0, 120, 5, UI.bpStroke()); icon(g, 'hourglass', 0, 0, 80, ui.gold, t); g.restore();
  text(g, 'THE RULE', E.W / 2, E.H * 0.7, { size: V(80, 84), color: ui.gold, glow: 24, glowColor: alpha(ui.gold, 0.6), spacing: 10, alpha: ease.out(prog(t, 0.4, 0.8)) });
} });
// t024 — "Changing the past doesn't rewrite your future."
registerShot('t024', { draw(g, t, info) {
  UI.blueprint(g); const cam = { z: 1 + 0.03 * t };
  layer(g, cam, 1, (g) => {
    timeline(g, t, info, { check: tShot(info, "doesn't", 1.0) + 0.3 });
    const k = ease.inOut(prog(t, 0.2, 1.2)), y = BY(), x = lerp(BX1() - 200, BP(), k), arcH = Math.sin(k * Math.PI) * 130;
    g.setLineDash([10, 10]); g.strokeStyle = alpha('#ffffff', 0.5); g.lineWidth = 3; g.beginPath(); g.moveTo(BX1() - 200, y - 20); g.quadraticCurveTo((BX1() - 200 + BP()) / 2, y - 260, BP(), y - 20); g.stroke(); g.setLineDash([]);
    UI.lineFigure(g, { x, y: y - 20 - arcH, s: 0.45, color: '#e8f0ff', pose: POSES.dive });
  });
} });
// t025 — "It creates a brand new branch of reality."
registerShot('t025', { draw(g, t, info) {
  UI.blueprint(g); const cam = { z: 1 + 0.03 * t };
  layer(g, cam, 1, (g) => timeline(g, t, info, { branch: ease.inOut(prog(t, 0.3, 1.6)), branchLabel: tShot(info, 'branch', 1.5) }));
} });
// t026 — "So in the timeline Tony left behind,"  zoom into the branch: a small world
registerShot('t026', { draw(g, t, info) {
  UI.blueprint(g);
  const tip = [BP() + (BX1() - BP()) * 0.8, BY() + V(330, 500)], k = ease.inOut(prog(t, 0.2, info.dur));
  const cam = { z: lerp(1, 2.6, k), x: (tip[0] - E.W / 2) * k, y: (tip[1] - E.H / 2) * k };
  layer(g, cam, 1, (g) => { timeline(g, t, info, { branch: 1 }); universe(g, tip[0], tip[1], 70 + 40 * k, { hue: '#ffb050', t, seed: 3, inner: '#2a1a0a' }); });
} });
// case-file desk (t027, t028, t090)
export function desk(g, t, cam) {
  layer(g, cam, 0.8, (g) => { g.fillStyle = linGrad(g, 0, 0, E.W, E.H, ['#3a2618', '#1e140c']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(-E.W, i * 60, E.W * 3, 3); } glow(g, E.W * 0.25, E.H * 0.15, 900, '#ffcf8a', 0.18); });
}
function folder(g, x, y, w, h, title) {
  g.save(); g.translate(x, y); g.rotate(-0.03); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-w / 2 + 14, -h / 2 + 14, w, h); rr(g, -w / 2, -h / 2 - 30, 220, 50, 8); g.fillStyle = '#c9a46a'; g.fill(); g.fillStyle = '#d8b878'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = '#f2ead8'; g.fillRect(-w / 2 + 40, -h / 2 + 30, w - 80, h - 60);
  text(g, title, 0, -h / 2 + 80, { size: 34, color: '#2a2018', font: FONTS.ui, weight: 900, spacing: 4 }); text(g, 'S.H.I.E.L.D. · CLASSIFIED', 0, -h / 2 + 120, { size: 20, color: '#b3302a', font: FONTS.ui, weight: 900, spacing: 3 });
  for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(40,30,20,.25)'; g.fillRect(w * 0.05, -h / 2 + 200 + i * 30, w * 0.35, 6); }
  g.restore();
}
registerShot('t027', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.04 * t };
  desk(g, t, cam);
  layer(g, cam, 1, (g) => { folder(g, E.W / 2, E.H * 0.53, 1000, 760, 'CASE 70-114: THE CUBE'); photo(g, E.W / 2 - 230, E.H * 0.6, 300, 300, (g, x, y, w, h) => { g.fillStyle = '#1a2230'; g.fillRect(x, y, w, h); tesseract(g, x + w / 2, y + h / 2, 0.9, t); }, { rot: -0.05, label: 'ITEM #1' });
    const tm = tShot(info, 'missing', 0.6); stamp(g, E.W / 2 - 230, E.H * 0.6, 'MISSING', { col: '#d0302a', k: prog(t, tm, tm + 0.25), rot: -0.25, size: 56 }); });
} });
registerShot('t028', { draw(g, t, info) {
  const cam = { z: 1.06 + 0.04 * t };
  desk(g, t, cam);
  layer(g, cam, 1, (g) => { folder(g, E.W / 2, E.H * 0.53, 1000, 760, 'CASE 70-114: SUSPECTS');
    const px = E.W / 2 + 220, py = E.H * 0.6; photo(g, px, py, 300, 330, (g, x, y, w, h) => { g.fillStyle = '#5a6a7a'; g.fillRect(x, y, w, h); person(g, 'HOWARD', { x: x + w / 2, y: y + h + 160, s: 1.35, facing: 1, pose: POSES.stand, t, expr: 'worried', rim: false }); }, { rot: 0.04, label: 'H. STARK' });
    const kc = ease.inOut(prog(t, 0.2, 0.9)); g.strokeStyle = '#d0302a'; g.lineWidth = 7; g.beginPath(); g.ellipse(px, py - 10, 190, 210, 0.1, -Math.PI / 2, -Math.PI / 2 + k2(kc)); g.stroke();
    const ts = tShot(info, 'suspect', 1.0); stamp(g, px, py + 90, 'SUSPECT', { col: '#d0302a', k: prog(t, ts, ts + 0.25), rot: 0.2, size: 52 }); });
} });
const k2 = (k) => k * Math.PI * 2;

// ---------- the plot hole ----------
registerShot('t029', { draw(g, t, info) { fanFace(g, t, info, { expr: 'thinking', q: 1, qAt: 0.2, look: [0.5, -0.6] }); } });
// t030 — "didn't Captain America return every stone at the end of Endgame?"
registerShot('t030', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.05 * t / info.dur, y: 130 };
  const { GY, CX, rim } = lake(g, t, cam);
  layer(g, cam, 1, (g) => {
    g.fillStyle = '#c8ccd4'; g.beginPath(); g.ellipse(CX, GY + 6, 230, 34, 0, 0, 7); g.fill(); g.strokeStyle = '#ff5a5a'; g.lineWidth = 4; g.beginPath(); g.ellipse(CX, GY + 6, 200, 26, 0, 0, 7); g.stroke();
    const p = hero(g, 'FAN', { x: CX, y: GY, s: 1.55, facing: 1, outfit: { top: 'tracksuit', color: '#e8e8f0', color2: '#c0262d', legs: '#d8d8e0' }, pose: breathe({ ...POSES.stand, eF: [16, -140], hF: [26, -112] }, t), t, expr: 'determined', rim: { color: rim, dir: [0.6, -1], w: 5 } });
    const bx = CX + 44, by = GY - 128; briefcase(g, bx, by, 1.3);
    ['#4a7cff', '#ff3a3a', '#a04aff', '#ffd23a', '#3aff7a', '#ff8a2a'].forEach((c, i) => { const a = t * 1.5 + i; const x = bx + Math.cos(a) * 70, y = by - 90 + Math.sin(a) * 26; circle(g, x, y, 9, c); glow(g, x, y, 40, c, 0.5); });
    const tq = tShot(info, 'return', 1.3); if (t > tq) FX.rings(g, CX, GY - 160, t - tq, { count: 3, r0: 60, r1: 360, speed: 0.8, color: '#ffffff', a: 0.4 });
  });
} });
// t031 — "He did."  the Tesseract snaps back onto its pedestal
registerShot('t031', { draw(g, t, info) {
  const cam = { z: 1.5, y: -50 };
  const r = vault70(g, t, cam, { cubeGlow: true });
  layer(g, cam, 1, (g) => { tesseract(g, r.CX, r.cubeY - 40, 1.1 * ease.outBack(prog(t, 0, 0.3)), t); FX.rings(g, r.CX, r.cubeY - 40, t, { count: 3, r0: 30, r1: 360, speed: 1.5, color: '#bfe4ff', a: 0.6 * (1 - prog(t, 0, info.dur)) }); });
} });
// t032 — "But putting the Tesseract back can't undo what people already saw."
registerShot('t032', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.06 * ease.inOut(t / info.dur), y: 40 };
  const r = vault70(g, t, cam, { cubeGlow: true, alarm: 0.5 });
  layer(g, cam, 1, (g) => { tesseract(g, r.CX, r.cubeY - 40, 1.1, t); [[-460, 1], [-300, 1], [300, -1], [460, -1]].forEach(([dx, f], i) => person(g, 'AGENT70', { x: r.CX + dx, y: r.GY + 10, s: 1.35, facing: f, pose: breathe(i % 2 ? POSES.crossArms : POSES.stand, t, 1, i), t, expr: 'worried', look: [0.5, -0.2], rim: { color: '#ff9a8a', dir: [0, -1] } })); });
} });
// t033 — "The alarms."
registerShot('t033', { draw(g, t, info) {
  backdrop(g, ['#100406', '#2a0a0c', '#100406']); const cam = { z: 1 + 0.08 * t };
  layer(g, cam, 1, (g) => { for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(i * 110, 0, 4, E.H); } alarmLight(g, E.W / 2, E.H * 0.5, 4, t, 1); });
} });
// t034 — "The questions."
registerShot('t034', { draw(g, t, info) {
  const cam = { z: 1.25 + 0.05 * t, y: 120 };
  const { GY, CX, rim } = interro(g, t, cam);
  layer(g, cam, 1, (g) => { person(g, 'HOWARD', { x: CX - 140, y: GY, s: 1.45, facing: 1, pose: breathe(POSES.sit, t), t, expr: 'nervous', rim: { color: rim, dir: [0, -1], w: 5 }, shadow: false }); const a = person(g, 'AGENT70', { x: CX + 200, y: GY, s: 1.5, facing: -1, pose: breathe({ ...POSES.point, head: [14, -196], sh: [8, -168] }, t), t, expr: 'angry', rim: { color: rim, dir: [0, -1], w: 5 } });
    [[CX + 120, GY - 470, 0.1], [CX + 300, GY - 520, 0.5]].forEach(([x, y, at]) => { const k = ease.outBack(prog(t, at, at + 0.25)); if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); UI.bubble(g, 0, 0, { w: 100, h: 70, str: '?' }); g.restore(); } }); });
} });
// t035 — "The suspicion that now follows Howard everywhere."
registerShot('t035', { draw(g, t, info) {
  const cam = { z: 1.15, x: t * 120 - 120, y: 70 };
  const { GY, CX, rim } = base70(g, t, cam);
  veil(g, '#0a0614', 0.45);
  layer(g, cam, 1, (g) => {
    const hx = CX - 300 + t * 150; FX.lightCone(g, hx + 20, GY - 700, { len: 740, spread: 0.3, color: '#fff1dc', a: 0.25 });
    person(g, 'HOWARD', { x: hx, y: GY + 10, s: 1.4, facing: 1, pose: walkPose(t * 5), t, expr: 'worried', look: [-0.6, 0], rim: { color: '#fff1dc', dir: [0, -1], w: 5 } });
    for (const [dx, d] of [[-330, 0.2], [-520, 0.6]]) { g.save(); g.globalAlpha *= 0.85; person(g, 'AGENT70', { x: hx + dx, y: GY + 10, s: 1.4, facing: 1, pose: walkPose(t * 5 + d), t, expr: 'angry', rim: { color: '#ff9a8a', dir: [0, -1] } }); g.restore(); }
  });
} });
