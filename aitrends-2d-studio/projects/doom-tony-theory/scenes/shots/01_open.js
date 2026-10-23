// shots/01_open.js — cold open: the unmasking. Same face, two lives, two universes. Title card.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cosmos } from '/projects/avengers-doomsday-watchlist/scenes/sets/cosmos.js';
import { throneHall } from '/projects/avengers-doomsday-watchlist/scenes/sets/throne.js';
import { hero, bigDoom, bigIron } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { universe } from '/projects/avengers-doomsday-watchlist/scenes/props.js';
import { couchShot, nameTag, tShot } from '/projects/avengers-doomsday-watchlist/scenes/tpl.js';
import { person, bigMan, unmask, GREEN } from '../kit70.js';
import { home70 } from '../sets70.js';

export const battle = (g, t, cam) => cosmos(g, t, cam, { ground: true, tint: '#2a8a4a', c1: '#1a5a3a', c2: '#0a3a2a' });
export function fallen(g, GY, CX, t, s = 1.2) {
  [['CAP', -520, 1], ['THOR', -260, -1], ['SPIDEY', 300, 1], ['STRANGE', 560, -1]].forEach(([id, dx, f], i) => hero(g, id, { x: CX + dx, y: GY + 10, s, facing: f, pose: POSES.lie, rot: f * Math.PI / 2, t, expr: 'sad', rim: { color: '#9dffb6', dir: [0, -1] }, shadow: false, wind: 0.2, magic: 0 }));
}
const TONY_RIM = '#ffd59a';

// t001 — "Imagine this."  green eyes ignite in the dark
registerShot('t001', { draw(g, t, info) {
  backdrop(g, ['#000000', '#020604', '#000000']);
  const k = ease.out(prog(t, 0.2, 0.9)), r = V(330, 300), cx = E.W / 2, cy = E.H * 0.55;
  g.save(); g.globalAlpha *= 0.12 * k; bigDoom(g, cx, cy, r, { eyes: 0, t }); g.restore();
  for (const sx of [-1, 1]) { const x = cx + sx * r * 0.35, y = cy - r * 0.24; g.save(); g.translate(x, y); g.scale(k, 1); rr(g, -r * 0.19, -r * 0.04, r * 0.38, r * 0.08, r * 0.04); g.fillStyle = '#c8ffd8'; g.fill(); g.restore(); glow(g, x, y, r * 0.7 * k, GREEN, 0.7 * k); }
  FX.dust(g, t, { count: 20, color: '#9dffb6', a: 0.25 * k });
} });

// t002 — "The final battle of Avengers: Doomsday."
registerShot('t002', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur), y: 30 };
  const { GY, CX } = battle(g, t, cam);
  layer(g, cam, 1, (g) => { fallen(g, GY, CX, t, 1.0); hero(g, 'DOOM', { x: CX, y: GY, s: 1.6, facing: 1, pose: breathe(POSES.stand, t, 0.5), t, eyes: 1, rim: { color: '#9dffb6', dir: [0, -1], w: 5 }, wind: 1.4 }); });
  if (t > 0.3 && t < 0.6) FX.lightning(g, { x1: E.W * 0.7, y1: 0, x2: E.W * 0.58, y2: E.H * 0.5, seed: 4, a: 1 - prog(t, 0.3, 0.6), color: '#cfffd8' });
  FX.dust(g, t, { count: 60, color: '#9dffb6', a: 0.35 });
} });

// t003 — "Doctor Doom stands over the fallen heroes,"  low angle
registerShot('t003', { draw(g, t, info) {
  const cam = { z: 1.25 + 0.06 * t / info.dur, y: 60 };
  const { GY, CX } = battle(g, t, cam);
  layer(g, cam, 1, (g) => hero(g, 'DOOM', { x: CX + 60, y: GY, s: 2.3, facing: -1, pose: breathe({ ...POSES.stand, head: [6, -206] }, t, 0.4), t, eyes: 1, rim: { color: '#9dffb6', dir: [0, -1], w: 6 }, wind: 1.6 }));
  blurLayer(g, 10, (g) => { hero(g, 'CAP', { x: E.W * 0.22, y: E.H * 1.02, s: 2.4, facing: 1, pose: POSES.lie, rot: Math.PI / 2, t, rim: false, shadow: false }); hero(g, 'SPIDEY', { x: E.W * 0.86, y: E.H * 1.05, s: 2.4, facing: -1, pose: POSES.lie, rot: -Math.PI / 2, t, rim: false, shadow: false }); }, cam, 1.6);
  FX.dust(g, t, { count: 50, color: '#9dffb6', a: 0.35 });
} });

// t004 — "and slowly, he removes his mask."
registerShot('t004', { draw(g, t, info) {
  blurLayer(g, 14, (g) => battle(g, t, { z: 1.5, y: -120 })); veil(g, '#020604', 0.4);
  const lift = ease.inOut(prog(t, 0.7, 2.3)), r = V(300, 320) * (1 + 0.04 * t);
  unmask(g, E.W / 2, E.H * V(0.6, 0.55), r, { lift, t, expr: 'determined', rimSide: -1 });
  for (const s of [-1, 1]) { const hx = E.W / 2 + s * r * 1.05, hy = E.H * 0.55 - lift * r * 1.4; for (const [dx, dy, c] of [[-4, -4, '#9dffb6'], [0, 0, null]]) { circle(g, hx + dx, hy + dy, r * 0.22, c || '#8d949c'); } }
} });

// t005 — "The Avengers freeze."  FREEZE
registerShot('t005', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.03 * t, y: 120, r: 0.012 * t };
  const { GY, CX } = battle(g, 0.2, cam);
  layer(g, cam, 1, (g) => [['CAP', -380, 1], ['THOR', -130, 1], ['SPIDEY', 130, 1], ['IRON', 380, -1]].forEach(([id, dx, f], i) => { if (id === 'IRON') return; hero(g, id, { x: CX + dx, y: GY, s: 1.5, facing: f, pose: POSES.ready, t: 0.2, expr: 'shocked', look: [0.6, -0.2], rim: { color: '#9dffb6', dir: [0.7, -1], w: 5 } }); }));
  FX.drops(g, t, { count: 50, color: '#d8ffe4', rMax: 10, drift: 2 });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,140,255,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  FX.rings(g, E.W * 0.75, E.H * 0.4, t, { count: 3, r0: 80, r1: 500, speed: 0.4, color: '#e8f0ff', a: 0.3 });
} });

// the face (t006 Tony / t008 Victor and the reprises t088 / t089)
export function faceReveal(g, t, info, who, o = {}) {
  const tonyView = who === 'tony';
  blurLayer(g, 14, (g) => battle(g, t, { z: 1.5, y: -120 })); veil(g, '#020604', 0.4);
  if (tonyView) glow(g, E.W / 2, E.H * 0.5, 900, '#ffb050', 0.25);
  const r = V(300, 320) * (1 + 0.035 * t), cx = E.W / 2, cy = E.H * V(0.6, 0.55);
  const tN = o.nameAt ?? tShot(info, tonyView ? 'Tony' : 'Victor', 1.5);
  bigMan(g, cx, cy, r, { outfit: tonyView ? { top: 'suit', color: '#1d1d26' } : { top: 'trench', color: '#1e4a2a' }, hood: tonyView ? null : '#2a6a3a', expr: o.expr || 'determined', rimColor: tonyView ? TONY_RIM : '#c8ffd8', rimSide: tonyView ? 1 : -1, blink: (t % 3.2) > 3.1 });
  if (tonyView) { const k = Math.max(0, 1 - Math.abs(t - tN) / 0.6); if (k > 0) { g.save(); g.globalAlpha *= 0.55 * k; bigIron(g, cx, cy, r * 1.02, { t, eyes: 1 }); g.restore(); } }
  nameTag(g, t, cx + r * 1.25, cy - r * 0.2, tonyView ? 'TONY STARK' : 'VICTOR VON DOOM', tN - 0.05, { color: tonyView ? '#ffcf8a' : GREEN, size: V(44, 46) });
}
registerShot('t006', { draw(g, t, info) { faceReveal(g, t, info, 'tony'); } });
// t007 — "But Reed Richards and Sue Storm see someone else entirely."
registerShot('t007', { draw(g, t, info) {
  const cam = { z: 1.4 + 0.05 * t / info.dur, x: -80, y: 140 };
  const { GY, CX } = battle(g, t, cam);
  layer(g, cam, 1, (g) => { hero(g, 'REED', { x: CX - 120, y: GY, s: 1.6, facing: 1, pose: breathe(POSES.stand, t), t, expr: t > 1.6 ? 'sad' : 'shocked', look: [0.5, -0.2], rim: { color: '#9dffb6', dir: [1, -0.4], w: 5 } }); hero(g, 'SUE', { x: CX - 340, y: GY, s: 1.55, facing: 1, pose: breathe(POSES.handsOnHead, t, 1, 2), t, expr: 'sad', look: [0.6, -0.2], rim: { color: '#9dffb6', dir: [1, -0.4], w: 5 } }); });
  nameTag(g, t, E.W * 0.6, E.H * 0.3, 'REED & SUE', tShot(info, 'Reed', 0.3), { color: '#7fb0ff' });
} });
registerShot('t008', { draw(g, t, info) { faceReveal(g, t, info, 'victor'); } });

// split screens (t009 face | face, t010 two lives)
function halves(g, left, right) {
  g.save(); g.beginPath(); g.rect(0, 0, E.W / 2, E.H); g.clip(); left(g); g.restore();
  g.save(); g.beginPath(); g.rect(E.W / 2, 0, E.W / 2, E.H); g.clip(); right(g); g.restore();
  seg(g, [[E.W / 2, 0], [E.W / 2, E.H]], 6, '#ffffff'); glow(g, E.W / 2, E.H / 2, 200, '#ffffff', 0.2);
}
registerShot('t009', { draw(g, t, info) {
  const r = V(230, 170), y = E.H * 0.55;
  halves(g, (g) => { backdrop(g, ['#2a1408', '#6a3a14', '#2a1408']); glow(g, E.W * 0.25, y, 500, '#ffb050', 0.3); bigMan(g, E.W * 0.25, y, r, { expr: 'smirk', rimColor: TONY_RIM, rimSide: -1 }); },
    (g) => { backdrop(g, ['#031008', '#0e3a1e', '#031008']); glow(g, E.W * 0.75, y, 500, GREEN, 0.25); bigMan(g, E.W * 0.75, y, r, { outfit: { top: 'trench', color: '#1e4a2a' }, hood: '#2a6a3a', expr: 'angry', rimColor: '#c8ffd8', rimSide: 1 }); });
  const k = ease.outBack(prog(t, 0.15, 0.45)); g.save(); g.translate(E.W / 2, y); g.scale(k, k); circle(g, 0, 0, 56, '#0a0610'); seg(g, [[-26, -12], [26, -12]], 9, '#ffffff'); seg(g, [[-26, 12], [26, 12]], 9, '#ffffff'); g.restore();
} });
registerShot('t010', { draw(g, t, info) {
  halves(g, (g) => { const r = home70(g, t, { z: 1.25, x: -260, y: 120 }, {}); layer(g, { z: 1.25, x: -260, y: 120 }, 1, (g) => person(g, 'TONY', { x: E.W / 2 - 640, y: r.GY, s: 1.5, facing: 1, pose: breathe(POSES.relaxed, t), t, expr: 'smile', rim: { color: TONY_RIM, dir: [1, -0.5], w: 5 } })); },
    (g) => { const r = throneHall(g, t, { z: 1.25, x: 260, y: 120 }, { flashes: [0.2] }); layer(g, { z: 1.25, x: 260, y: 120 }, 1, (g) => person(g, 'VICTOR', { x: E.W / 2 + 640, y: r.GY, s: 1.5, facing: -1, pose: breathe(POSES.crossArms, t), t, expr: 'angry', hood: true, rim: { color: '#c8ffd8', dir: [0, -1], w: 5 } })); });
} });

// t011 — "Two universes."
registerShot('t011', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.05 * t / info.dur };
  cosmos(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    const r = V(250, 200), y = E.H * 0.5;
    for (const [x, hue, id, rimC, f] of [[E.W * 0.3, '#ffb050', 'TONY', TONY_RIM, 1], [E.W * 0.7, '#3ad07a', 'VICTOR', '#c8ffd8', -1]]) {
      universe(g, x, y, r, { hue, t, seed: id.length, inner: shade(hue, -0.8) });
      g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); person(g, id, { x, y: y + r * 0.62, s: 0.9, facing: f, pose: breathe(POSES.stand, t), t, expr: 'neutral', hood: true, rim: { color: rimC, dir: [0, -1] } }); g.restore();
    }
    g.setLineDash([12, 14]); seg(g, [[E.W * 0.3 + r, y], [E.W * 0.7 - r, y]], 3, alpha('#ffffff', 0.5)); g.setLineDash([]);
  });
} });

// t012 — "And according to one fan theory,"
registerShot('t012', { draw(g, t, info) {
  couchShot(g, t, info, { z: 1.4, x: 90, y: 150, expr: (t) => (t > 1.0 ? 'awe' : 'thinking'), pose: { ...POSES.sit, eF: [22, -140], hF: [34, -172] }, prop: { type: 'phone', glow: '#9dffb6' }, look: [0.5, 0.2] });
  glow(g, E.W * 0.55, E.H * 0.45, 200, GREEN, 0.25);
} });

// t013 — TITLE CARD
registerShot('t013', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.05 * ease.inOut(t / info.dur) };
  layer(g, cam, 0.3, (g) => {
    halves(g, (g) => { backdrop(g, ['#1a0806', '#4a1a10', '#1a0806']); g.save(); g.globalAlpha *= 0.4; bigIron(g, E.W * 0.28, E.H * 0.55, V(300, 220), { t }); g.restore(); },
      (g) => { backdrop(g, ['#020a04', '#0a2a14', '#020a04']); g.save(); g.globalAlpha *= 0.4; bigDoom(g, E.W * 0.72, E.H * 0.55, V(300, 220), { t }); g.restore(); });
  });
  veil(g, '#000', 0.35);
  UI.titleCard(g, t, { lines: ['IS DOCTOR DOOM SECRETLY', 'TONY STARK?'], sub: 'A FAN THEORY', dur: info.dur, y: E.H * V(0.46, 0.42) });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.35 });
} });
