// shots/02_1970.js — the Time Heist: 1970, the base, the Tesseract taken, the alarm, Howard the suspect.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { hero } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { nameTag, bigHand, tShot } from '/projects/avengers-doomsday-watchlist/scenes/tpl.js';
import { label } from '/projects/avengers-doomsday-watchlist/scenes/props.js';
import { person, tesseract, briefcase, O70, CUBE } from '../kit70.js';
import { base70, vault70, tunnel } from '../sets70.js';

const QSUIT = { top: 'tracksuit', color: '#e8e8f0', color2: '#c0262d', legs: '#d8d8e0' };
const bigYear = (g, t, at, str = '1970') => { const k = ease.outBack(prog(t, at, at + 0.35)); if (k <= 0) return; text(g, str, E.W / 2, E.H * 0.5, { size: 260 * k, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 50, glowColor: alpha(S().ui.gold, 0.8), stroke: 16, strokeColor: '#1a1206', alpha: clamp(k) }); };

// t014 — "Remember the Time Heist?"
registerShot('t014', { draw(g, t, info) {
  tunnel(g, t);
  for (const [i, dy] of [[0, -40], [1, 60]]) { const x = lerp(-200, E.W + 200, ((t * 0.5 + i * 0.18) % 1.2)), y = E.H * 0.5 + dy + Math.sin(t * 3 + i) * 20; hero(g, 'FAN', { x, y, s: 0.8, facing: 1, outfit: QSUIT, pose: POSES.dive, rot: Math.PI / 2.2, t, expr: 'determined', rim: { color: '#ffffff', dir: [0, -1] }, shadow: false }); }
  nameTag(g, t, E.W * 0.1, E.H * 0.2, 'THE TIME HEIST', 0.3, { color: '#ff6ad0' });
} });
// t015 — "Tony Stark and Steve Rogers travel back to 1970,"
registerShot('t015', { draw(g, t, info) {
  tunnel(g, t * 1.4);
  const tY = tShot(info, '1970', 3.1), k = ease.in(prog(t, 0, tY));
  hero(g, 'FAN', { x: E.W * 0.4 - k * 300, y: E.H * 0.62 + k * 300, s: 0.8 + k * 2.2, facing: 1, outfit: QSUIT, pose: POSES.dive, rot: Math.PI / 2.4, t, expr: 'determined', rim: { color: '#ffffff', dir: [0, -1] }, shadow: false });
  hero(g, 'FAN', { x: E.W * 0.6 + k * 300, y: E.H * 0.55 + k * 260, s: 0.8 + k * 2.2, facing: -1, outfit: QSUIT, pose: POSES.dive, rot: -Math.PI / 2.4, t, expr: 'determined', rim: { color: '#ffffff', dir: [0, -1] }, shadow: false });
  nameTag(g, t, E.W * 0.12, E.H * 0.24, 'TONY STARK', tShot(info, 'Tony', 0.15), { color: '#ffcf8a' });
  nameTag(g, t, E.W * 0.12, E.H * 0.33, 'STEVE ROGERS', tShot(info, 'Steve', 1.3), { color: '#9fc0ff' });
  bigYear(g, t, tY);
  if (t > tY) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,255,${0.5 * Math.exp(-(t - tY) * 5)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });
// t016 — "to a military base in New Jersey,"
registerShot('t016', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur), x: lerp(-60, 30, t / info.dur), y: 40 };
  const { GY, CX, rim } = base70(g, t, cam);
  layer(g, cam, 1, (g) => { person(g, 'TONY70', { x: CX - 520 + t * 120, y: GY + 20, s: 1.15, facing: 1, pose: walkPose(t * 5.2), t, expr: 'smirk', rim: { color: rim, dir: [0.6, -1] } }); person(g, 'STEVE70', { x: CX - 680 + t * 120, y: GY + 20, s: 1.2, facing: 1, pose: walkPose(t * 5.2 + 1), t, expr: 'determined', rim: { color: rim, dir: [0.6, -1] } }); });
  UI.badge(g, { str: '1970', a: ease.out(prog(t, 0, 0.3)), size: V(56, 60) });
  label(g, E.W * 0.08, E.H * 0.2, 'NEW JERSEY', { a: ease.out(prog(t, tShot(info, 'New', 2.2) - 0.1, tShot(info, 'New', 2.2) + 0.2)) });
} });
// t017 — "to steal the Tesseract."
registerShot('t017', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.12 * ease.inOut(t / info.dur), y: -60 };
  const r = vault70(g, t, cam, { cubeGlow: true });
  layer(g, cam, 1, (g) => tesseract(g, r.CX, r.cubeY - 40 + Math.sin(t * 2) * 5, 1.1, t));
  nameTag(g, t, E.W * 0.1, E.H * 0.25, 'THE TESSERACT', tShot(info, 'Tesseract', 0.7) - 0.1, { color: CUBE });
} });
// t018 — "They get it."
registerShot('t018', { draw(g, t, info) {
  const cam = { z: 1.6, y: -40 };
  const r = vault70(g, t, cam, { cubeGlow: true });
  const up = ease.inOut(prog(t, 0.1, 0.8));
  layer(g, cam, 1, (g) => { const x = r.CX + up * 220, y = r.cubeY - 40 - up * 160; tesseract(g, x, y, 1.1, t); bigHand(g, x + 60, y + 30, 0.9, { dir: 1, grip: 'closed', sleeve: O70.TONY70.color, rim: CUBE, ang: 0.3 }); });
} });
// t019 — "But they leave something behind."
registerShot('t019', { draw(g, t, info) {
  const al = ease.out(prog(t, 0.9, 1.4)), cam = { z: 1.45 - 0.05 * t, y: -20 };
  const r = vault70(g, t, cam, { alarm: al });
  layer(g, cam, 1, (g) => { const k = 1 - prog(t, 0, 1.6); g.save(); g.globalAlpha *= 0.4 * k; tesseract(g, r.CX, r.cubeY - 40, 1.1, t); g.restore(); for (let i = 0; i < 3; i++) { const fx = r.CX + 200 + i * 130, fy = r.GY + 30 + i * 10; g.fillStyle = alpha(CUBE, 0.35 * k); g.beginPath(); g.ellipse(fx, fy, 24, 9, 0, 0, 7); g.fill(); } });
} });
// t020 — "Because to everyone living in 1970,"
registerShot('t020', { draw(g, t, info) {
  const cam = { z: 1.1, x: 40 * t, y: 60 };
  const { GY, CX, rim } = base70(g, t, cam, { alarm: 1 });
  layer(g, cam, 1, (g) => [[-700, 0], [-420, 0.3], [-140, 0.6], [200, 0.2], [480, 0.5]].forEach(([dx, d], i) => person(g, 'AGENT70', { x: CX + dx + ((t + d) * 420) % 600 - 200, y: GY + 20 + (i % 2) * 30, s: 1.15, facing: 1, pose: walkPose((t + d) * 9, { run: true }), t, expr: 'worried', rim: { color: '#ff8a7a', dir: [0, -1] } })));
  UI.badge(g, { str: '1970', a: 1, size: V(56, 60) });
} });
// t021 — "the Tesseract simply vanished from a locked vault."
registerShot('t021', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.08 * ease.inOut(t / info.dur), y: -40 };
  const r = vault70(g, t, cam, { alarm: 0.8 });
  layer(g, cam, 1, (g) => { g.save(); g.globalAlpha *= 0.25 * (1 - prog(t, 0, info.dur)); tesseract(g, r.CX, r.cubeY - 40, 1.1, t); g.restore(); g.setLineDash([10, 10]); g.strokeStyle = alpha('#ffffff', 0.5); g.lineWidth = 3; g.strokeRect(r.CX - 60, r.cubeY - 100, 120, 120); g.setLineDash([]);
    const k = ease.outBack(prog(t, tShot(info, 'vanished', 1.2), tShot(info, 'vanished', 1.2) + 0.35)); if (k > 0) text(g, '?', r.CX, r.cubeY - 40, { size: 160 * k, color: S().ui.gold, glow: 30, glowColor: alpha(S().ui.gold, 0.7) }); });
} });
// t022 — "And the last person seen near it was Howard Stark."
registerShot('t022', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.08 * ease.inOut(t / info.dur), y: 120 };
  const { GY, CX, rim } = base70(g, t, cam, { alarm: 0.4 });
  const tH = tShot(info, 'Howard', 2.1), turn = t > tH - 0.3;
  layer(g, cam, 1, (g) => {
    FX.lightCone(g, CX, GY - 700, { len: 760, spread: 0.45, color: '#fff1dc', a: 0.25 * ease.out(prog(t, tH - 0.4, tH)) });
    person(g, 'HOWARD', { x: CX, y: GY, s: 1.5, facing: 1, pose: breathe(POSES.stand, t), t, expr: turn ? 'worried' : 'neutral', look: turn ? [0, -0.2] : [0.6, 0], rim: { color: rim, dir: [0, -1], w: 5 } });
    for (const [dx, f] of [[-460, 1], [-300, 1], [320, -1], [480, -1]]) person(g, 'AGENT70', { x: CX + dx, y: GY + 10, s: 1.4, facing: turn ? f : -f, pose: breathe(turn ? POSES.point : POSES.stand, t, 1, dx), t, expr: 'angry', rim: { color: rim, dir: [0, -1] } });
  });
  nameTag(g, t, E.W * 0.58, E.H * 0.3, 'HOWARD STARK', tH - 0.05, { color: '#ffcf8a', size: V(44, 46) });
} });
