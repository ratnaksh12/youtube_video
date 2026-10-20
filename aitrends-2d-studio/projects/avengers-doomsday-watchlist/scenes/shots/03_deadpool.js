// shots/03_deadpool.js — #5 Deadpool & Wolverine: the multiverse, Fox's legacy, the X-Men legends, collision.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, measure, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { wasteland } from '../sets/wasteland.js';
import { cosmos } from '../sets/cosmos.js';
import { stage } from '../sets/misc.js';
import { living, TVC } from '../sets/living.js';
import { hero, bigDeadpool, wpt } from '../cast.js';
import { filmCase, movie, universe, icon, label } from '../props.js';
import { filmCard, couchShot, bigHand, nameTag, tShot } from '../tpl.js';

registerShot('s025', { draw(g, t, info) { filmCard(g, t, info, 5); } });

// s026 — "And this one is important for one massive reason:"  back to back in the Void
registerShot('s026', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.05 * ease.inOut(t / info.dur), y: 140 };
  const { GY, CX, rim } = wasteland(g, t, cam, { variant: 'void' });
  layer(g, cam, 1, (g) => {
    const r = { color: rim, dir: [-1, -0.4], w: 5 };
    hero(g, 'DEADPOOL', { x: CX - 70, y: GY, s: 1.55, facing: -1, pose: breathe(posesAt(t, [[0, POSES.stand], [1.3, POSES.wave]]), t), t, rim: r });
    hero(g, 'WOLVERINE', { x: CX + 70, y: GY, s: 1.55, facing: 1, pose: breathe(POSES.crossArms, t, 1, 2), t, expr: 'angry', rim: r, claws: ease.out(prog(t, 0.6, 0.9)) });
  });
} });

// s027 — "the multiverse."  zoom out of their bubble into countless universes
const BUBS = [{ x: 960, y: 520, r: 150, hue: '#f2a65a', seed: 1 }, { x: 560, y: 330, r: 90, hue: '#5a7cff', seed: 2 }, { x: 1380, y: 300, r: 110, hue: '#c06aff', seed: 3 }, { x: 1500, y: 760, r: 80, hue: '#3ad0c0', seed: 4 }, { x: 420, y: 800, r: 100, hue: '#ff6a8a', seed: 5 }, { x: 200, y: 330, r: 60, hue: '#9fc0ff', seed: 6 }, { x: 1760, y: 520, r: 70, hue: '#ffd36a', seed: 7 }, { x: 760, y: 900, r: 60, hue: '#7aff9a', seed: 8 }, { x: 1180, y: 900, r: 55, hue: '#ff9a5a', seed: 9 }, { x: 1150, y: 120, r: 50, hue: '#5aa0ff', seed: 10 }];
registerShot('s027', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur)), cam = { z: lerp(3.2, 1.0, k) };
  cosmos(g, t, cam, { bubbles: BUBS.map(b => ({ ...b, x: V(b.x, b.x * 0.5625), y: V(b.y, b.y * 1.6) })), bubbleDepth: 1 });
  layer(g, cam, 1, (g) => { for (const [id, dx, f] of [['DEADPOOL', -14, -1], ['WOLVERINE', 14, 1]]) hero(g, id, { x: V(960, 540) + dx, y: V(560, 900), s: 0.22, facing: f, pose: POSES.stand, t, rim: { color: '#ffe2a8', dir: [0, -1], w: 1.5 }, claws: 1 }); });
} });

// s028 — "This movie connects Deadpool and Wolverine's world to the larger Marvel multiverse"
registerShot('s028', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.04 * ease.inOut(t / info.dur), x: 20 * t };
  const tC = tShot(info, 'connects', 0.5), tM = tShot(info, 'multiverse', 3.8);
  const L = [V(500, 300), V(560, 700)], C = [[1300, 420, 140, '#5a7cff'], [1560, 300, 90, '#c06aff'], [1520, 640, 100, '#3ad0c0'], [1180, 700, 70, '#ff6a8a'], [1700, 520, 70, '#9fc0ff']].map(([x, y, r, h]) => [V(x, x * 0.5625 + 0), V(y, y * 1.5), V(r, r * 0.8), h]);
  cosmos(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    const k = ease.inOut(prog(t, tC, tC + 1.6)), [lx, ly] = L, [cx, cy] = C[0];
    if (k > 0) { const ex = lerp(lx, cx, k), ey = lerp(ly, cy, k); g.save(); g.globalCompositeOperation = 'lighter'; seg(g, [[lx, ly], [ex, ey]], 14, alpha('#ffd36a', 0.35)); seg(g, [[lx, ly], [ex, ey]], 4, '#fff1c8'); glow(g, ex, ey, 60, '#ffd36a', 0.9); g.restore(); }
    universe(g, lx, ly, V(120, 110), { hue: '#f2a65a', t, seed: 1 }); icon(g, 'swords', lx, ly - 10, V(50, 46), '#ffcf3a', t);
    C.forEach(([x, y, r, h], i) => universe(g, x, y, r * (1 + 0.15 * ease.outBack(prog(t, tM + i * 0.06, tM + 0.4 + i * 0.06))), { hue: h, t, seed: 20 + i, a: 0.5 + 0.5 * ease.out(prog(t, 0, 0.5 + i * 0.2)) }));
  });
  const ui = S().ui;
  label(g, V(300, 120), V(820, 1000), "THEIR WORLD", { a: ease.out(prog(t, 0.3, 0.7)) });
  label(g, V(1380, 600), V(940, 1250), 'MARVEL MULTIVERSE', { a: ease.out(prog(t, tM, tM + 0.4)), line: '#7fa8ff' });
} });

// s029 — "and brings the legacy of Fox's"  sepia film strip of classic mutant silhouettes
registerShot('s029', { draw(g, t, info) {
  const sep = '#c9a46a';
  backdrop(g, ['#1a120a', '#3a2814', '#1a120a']); glow(g, E.W / 2, E.H / 2, 900, '#ffcf8a', 0.18 * (0.85 + 0.15 * Math.sin(t * 30)));
  const fw = V(380, 420), fh = V(280, 300), y = E.H / 2, off = -t * 240;
  g.fillStyle = '#0c0805'; g.fillRect(-100, y - fh / 2 - 60, E.W + 200, fh + 120);
  for (let x = (off % 60) - 60; x < E.W + 60; x += 60) { rr(g, x, y - fh / 2 - 46, 30, 22, 4); g.fillStyle = '#3a2814'; g.fill(); rr(g, x, y + fh / 2 + 24, 30, 22, 4); g.fill(); }
  const ids = ['WOLVERINE', 'MAGNETO', 'CYCLOPS', 'PROFX', 'WOLVERINE', 'MAGNETO', 'CYCLOPS', 'PROFX'];
  for (let i = 0; i < 8; i++) { const fx = off + i * (fw + 30) + 40; if (fx < -fw || fx > E.W + fw) continue;
    g.save(); g.beginPath(); g.rect(fx, y - fh / 2, fw, fh); g.clip(); g.fillStyle = linGrad(g, 0, y - fh / 2, 0, y + fh / 2, ['#e8d2a6', '#b89466']); g.fillRect(fx, y - fh / 2, fw, fh);
    glow(g, fx + fw / 2, y - fh * 0.1, fw * 0.6, '#fff1d0', 0.4);
    const id = ids[i]; hero(g, id, { x: fx + fw / 2, y: y + fh / 2 - 10, s: 0.95, facing: i % 2 ? -1 : 1, pose: id === 'PROFX' ? POSES.sit : i % 2 ? POSES.crossArms : POSES.ready, t, expr: 'determined', ink: '#3a2a1a', inkFar: '#5a4630', claws: 1, rim: false, psy: id === 'PROFX' ? 0.6 : 0 });
    g.fillStyle = 'rgba(90,60,20,.35)'; g.fillRect(fx, y - fh / 2, fw, fh);
    for (let k = 0; k < 3; k++) seg(g, [[fx + ((i * 97 + k * 53 + Math.floor(t * 12) * 31) % fw), y - fh / 2], [fx + ((i * 97 + k * 53 + Math.floor(t * 12) * 31) % fw) + 2, y + fh / 2]], 1, 'rgba(40,25,10,.4)');
    g.restore(); }
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = alpha(sep, 0.35); g.fillRect(0, 0, E.W, E.H); g.restore();
  FX.dust(g, t, { count: 60, color: '#ffe2b0', a: 0.5 });
  UI.badge(g, { str: 'FOX', a: ease.out(prog(t, tShot(info, "Fox's", 1.6), tShot(info, "Fox's", 1.6) + 0.3)), color: '#ffcf8a' });
} });

// s030 — "Marvel characters into the conversation."  Fox mutants join the MCU heroes, speech bubbles
registerShot('s030', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.04 * t, y: 120 };
  const { GY, CX } = stage(g, t, cam, { spots: [{ x: E.W / 2 - 360, k: 1, color: '#9fc0ff', w: 300 }, { x: E.W / 2 + 360, k: ease.out(prog(t, 0, 0.5)), color: '#ffcf8a', w: 300 }] });
  layer(g, cam, 1, (g) => {
    rr(g, CX - 520, GY - 110, 1040, 26, 8); g.fillStyle = '#1e1a26'; g.fill(); seg(g, [[CX - 460, GY - 90], [CX - 460, GY]], 8, '#141018'); seg(g, [[CX + 460, GY - 90], [CX + 460, GY]], 8, '#141018');
    const kW = ease.out(prog(t, 0, 1.0));
    hero(g, 'CAP', { x: CX - 470, y: GY, s: 1.3, facing: 1, pose: breathe(POSES.talk, t), t, expr: 'smile', rim: { color: '#9fc0ff', dir: [0, -1] }, shield: false });
    hero(g, 'THOR', { x: CX - 270, y: GY, s: 1.3, facing: 1, pose: breathe(POSES.relaxed, t, 1, 2), t, expr: 'happy', rim: { color: '#9fc0ff', dir: [0, -1] } });
    hero(g, 'WOLVERINE', { x: CX + 270 + (1 - kW) * 500, y: GY, s: 1.3, facing: -1, pose: kW < 1 ? walkPose(t * 5.5) : breathe(POSES.crossArms, t), t, expr: 'smirk', rim: { color: '#ffcf8a', dir: [0, -1] }, claws: 0 });
    hero(g, 'MAGNETO', { x: CX + 480 + (1 - kW) * 500, y: GY, s: 1.3, facing: -1, pose: kW < 1 ? walkPose(t * 5.5 + 1) : breathe(POSES.talk, t, 1, 3), t, expr: 'smirk', rim: { color: '#ffcf8a', dir: [0, -1] } });
    [[CX - 420, GY - 420, 0.9], [CX + 420, GY - 430, 1.3], [CX - 230, GY - 470, 1.9]].forEach(([x, y, at]) => { const k = ease.outBack(prog(t, at, at + 0.3)); if (k > 0) { g.save(); g.translate(x, y); g.scale(k, k); UI.bubble(g, 0, 0, { w: 130, h: 72 }); g.restore(); } });
  });
} });

// s031 — "And here's why that matters."  Deadpool leans into the lens
registerShot('s031', { draw(g, t, info) {
  blurLayer(g, 14, (g) => wasteland(g, t, { z: 1.5, x: -200, y: -120 }, { variant: 'void' })); veil(g, '#120a06', 0.3);
  const k = ease.out(prog(t, 0, 0.8)), r = V(300, 330) * (1 + 0.12 * k), tw = tShot(info, 'why', 0.6);
  bigDeadpool(g, E.W / 2 + V(80, 0), E.H * V(0.6, 0.55), r, { squint: ease.inOut(prog(t, tw, tw + 0.25)), tilt: -0.12 + 0.04 * Math.sin(t * 2), rimColor: '#ffd59a', rimSide: -1, look: [-0.2, 0] });
} });

// X-Men legends on a dark stage
function legendStage(g, t, info, which, o = {}) {
  const spots = [-480, 0, 480].map((dx, i) => ({ x: E.W / 2 + dx, k: i === which ? ease.out(prog(t, 0, 0.25)) : which > i ? 0.35 : 0.08, color: ['#c9b0ff', '#ff8a9a', '#ff6a5a'][i], w: 260 }));
  const cam = { z: o.z ?? 1.25, x: o.x ?? [-480, 0, 480][which] * 0.35, y: o.y ?? 110 };
  const { GY, CX } = stage(g, t, cam, { spots: which < 0 ? spots.map(s => ({ ...s, k: 0.12 })) : spots });
  layer(g, cam, 0.5, (g) => { text(g, 'AVENGERS: DOOMSDAY', CX, GY - V(600, 950), { size: 72, color: '#9dffb6', glow: 30, glowColor: 'rgba(93,255,138,.8)', spacing: 6, alpha: o.marquee ?? 0.35 }); });
  layer(g, cam, 1, (g) => {
    const vis = (i) => (which < 0 ? 0.25 : i === which ? 1 : i < which ? 0.55 : 0.12);
    hero(g, 'PROFX', { x: CX - 480, y: GY, s: 1.3, facing: 1, pose: breathe(POSES.sit, t), t, expr: 'smile', rim: { color: '#c9b0ff', dir: [0, -1] }, alpha: vis(0), psy: which === 0 ? 1 : 0 });
    hero(g, 'MAGNETO', { x: CX, y: GY, s: 1.3, facing: 1, pose: breathe(which === 1 ? POSES.explain : POSES.crossArms, t), t, expr: 'smirk', rim: { color: '#ff8a9a', dir: [0, -1] }, alpha: vis(1) });
    hero(g, 'CYCLOPS', { x: CX + 480, y: GY, s: 1.3, facing: -1, pose: breathe(POSES.ready, t), t, expr: 'determined', rim: { color: '#ff6a5a', dir: [0, -1] }, alpha: vis(2), beam: which === 2 ? ease.out(prog(t, 0.3, 0.45)) * (1 - prog(t, 0.9, 1.1)) : 0 });
    if (which === 1) for (let i = 0; i < 9; i++) { const a = t * 1.5 + i * 0.7, x = CX + Math.cos(a) * 160, y = GY - 250 + Math.sin(a) * 60 - i * 6; rr(g, x - 10, y - 5, 20, 10, 2); g.fillStyle = '#9aa1ab'; g.fill(); }
  });
  o.extra?.(g, cam, GY, CX);
}
registerShot('s032', { draw(g, t, info) { legendStage(g, t, info, -1, { z: 1.0 + 0.06 * t / info.dur, x: 0, y: 40, marquee: ease.out(prog(t, 0, 0.8)) }); } });
registerShot('s033', { draw(g, t, info) { legendStage(g, t, info, 0); nameTag(g, t, E.W * 0.12, E.H * 0.2, 'PROFESSOR X', 0.15, { color: '#c9b0ff' }); } });
registerShot('s034', { draw(g, t, info) { legendStage(g, t, info, 1); nameTag(g, t, E.W * 0.12, E.H * 0.2, 'MAGNETO', 0.05, { color: '#ff8a9a' }); } });
registerShot('s035', { draw(g, t, info) { legendStage(g, t, info, 2); nameTag(g, t, E.W * 0.12, E.H * 0.2, 'CYCLOPS', 0.1, { color: '#ff6a5a' }); } });

// s036 — "That means the old Marvel universe could collide"  two universes drift together
registerShot('s036', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur)), cam = { z: 1 + 0.08 * k };
  cosmos(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    const d = lerp(560, 300, k), cy = E.H * 0.5, r = V(240, 200);
    universe(g, E.W / 2 - d, cy, r, { hue: '#d8a060', t, seed: 3, inner: '#2a1a0a' });
    universe(g, E.W / 2 + d, cy, r, { hue: '#4a7cff', t, seed: 4 });
    if (k > 0.5) { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 10; i++) { const y = cy + (i - 5) * 30; seg(g, [[E.W / 2 - d + r * 0.9, y], [E.W / 2 + d - r * 0.9, y + Math.sin(t * 20 + i) * 20]], 2, alpha('#ffffff', 0.25 * (k - 0.5) * 2)); } g.restore(); }
  });
  label(g, E.W / 2 - V(700, 420), E.H * 0.83, 'OLD MARVEL UNIVERSE', { a: ease.out(prog(t, 0.2, 0.6)), line: '#d8a060' });
  label(g, E.W / 2 + V(330, 120), E.H * 0.83, 'MCU', { a: ease.out(prog(t, tShot(info, 'collide', 2) - 0.6, tShot(info, 'collide', 2) - 0.2)), line: '#4a7cff' });
} });

// s037 — "with the MCU in a way we've never seen before."  impact + heroes face off
registerShot('s037', { draw(g, t, info) {
  const hit = 0.25, k = prog(t, hit, hit + 0.5), [sx, sy] = shake(t, 14 * Math.exp(-Math.max(0, t - hit) * 4) * (t > hit ? 1 : 0), 25);
  const cam = { z: 1.05 + 0.05 * t / info.dur, x: sx, y: sy + 60 };
  const { GY, CX } = cosmos(g, t, cam, { ground: true, tint: '#ffffff' });
  layer(g, cam, 0.4, (g) => {
    const d = lerp(300, 120, ease.out(prog(t, 0, hit))), cy = E.H * 0.3, r = V(170, 150);
    universe(g, E.W / 2 - d, cy, r, { hue: '#d8a060', t, seed: 3, inner: '#2a1a0a', crack: ease.out(k) });
    universe(g, E.W / 2 + d, cy, r, { hue: '#4a7cff', t, seed: 4, crack: ease.out(k) });
    if (t > hit) { FX.rings(g, E.W / 2, cy, t - hit, { count: 4, r0: 50, r1: 900, speed: 0.6, color: '#ffffff', a: 0.6 * (1 - prog(t, hit, 3)) }); glow(g, E.W / 2, cy, 500, '#ffffff', 0.6 * Math.exp(-(t - hit) * 3)); }
  });
  layer(g, cam, 1, (g) => {
    const kk = ease.out(prog(t, 0.6, 1.6));
    hero(g, 'CAP', { x: CX - 520 + (1 - kk) * -200, y: GY, s: 1.35, facing: 1, pose: breathe(POSES.ready, t), t, expr: 'determined', rim: { color: '#9fc0ff', dir: [0, -1] }, alpha: kk });
    hero(g, 'THOR', { x: CX - 330 + (1 - kk) * -200, y: GY, s: 1.35, facing: 1, pose: breathe(POSES.stand, t, 1, 2), t, expr: 'determined', rim: { color: '#9fc0ff', dir: [0, -1] }, alpha: kk });
    hero(g, 'WOLVERINE', { x: CX + 330 + (1 - kk) * 200, y: GY, s: 1.35, facing: -1, pose: breathe(POSES.ready, t), t, expr: 'angry', rim: { color: '#ffcf8a', dir: [0, -1] }, alpha: kk });
    hero(g, 'CYCLOPS', { x: CX + 520 + (1 - kk) * 200, y: GY, s: 1.35, facing: -1, pose: breathe(POSES.stand, t, 1, 3), t, expr: 'determined', rim: { color: '#ffcf8a', dir: [0, -1] }, alpha: kk });
  });
  if (t > hit) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,255,${0.8 * Math.exp(-(t - hit) * 6)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

// s038 — "And if you want to understand why these characters matter,"  reading the case
registerShot('s038', { draw(g, t, info) {
  couchShot(g, t, info, { expr: (t) => (t > 1.6 ? 'thinking' : 'neutral'), pose: { ...POSES.sit, eF: [22, -128], hF: [40, -150], eB: [16, -126], hB: [34, -146] }, look: [0.6, 0.3], z: 1.45, x: 80, y: 150,
    front: (g, GY, CX, t, fo) => { const [hx, hy] = wpt(fo, 'hF'); filmCase(g, hx + 30, hy - 40, 90, movie(5), { t, glowK: 0.5, tilt: 0.25, rank: false, title: false }); } });
} });

// s039 — "this is a great place to start."  the disc goes in, PLAY glows
registerShot('s039', { draw(g, t, info) {
  blurLayer(g, 12, (g) => living(g, t, { z: 1.7, x: 400, y: 200 }, {})); veil(g, '#06060e', 0.45);
  const cam = { z: 1 + 0.05 * t }, k = ease.inOut(prog(t, 0.1, 0.9)), cx = E.W / 2, cy = E.H * 0.62;
  layer(g, cam, 1, (g) => {
    rr(g, cx - 520, cy - 40, 1040, 170, 18); g.fillStyle = '#16141c'; g.fill(); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(cx - 500, cy - 36, 1000, 4);
    for (let i = 0; i < 5; i++) circle(g, cx + 300 + i * 34, cy + 60, 7, i === 0 ? '#5dff8a' : '#3a3a46');
    const trayX = cx - 120, out = 1 - k; rr(g, trayX - 220, cy - 30 + out * 0, 440, 22, 6); g.fillStyle = '#0c0b10'; g.fill();
    const dy = cy - 30 - out * 260, dx = trayX; g.save(); g.translate(dx, dy + out * 60); g.scale(1, 0.35 + out * 0.3);
    circle(g, 0, 0, 200, '#c9ced8'); g.fillStyle = 'conic-gradient' in g ? '#c9ced8' : '#c9ced8'; for (let i = 0; i < 6; i++) { g.fillStyle = alpha(['#ff6a8a', '#ffd36a', '#5aff9a', '#5a9aff', '#c06aff', '#ffffff'][i], 0.22); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 200, i, i + 0.5); g.fill(); } circle(g, 0, 0, 40, '#16141c'); ring(g, 0, 0, 70, 2, 'rgba(0,0,0,.3)'); g.restore();
    const pk = ease.outBack(prog(t, 1.0, 1.35)); if (pk > 0) { g.save(); g.translate(cx, E.H * 0.3); g.scale(pk, pk); glow(g, 0, 0, 180, '#ffd36a', 0.5); circle(g, 0, 0, 90, alpha('#ffd36a', 0.95)); poly(g, [[-26, -40], [-26, 40], [42, 0]], '#1a1206'); g.restore(); }
  });
  FX.dust(g, t, { count: 40, color: '#ffd36a', a: 0.35 });
} });
