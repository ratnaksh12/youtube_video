// shots/04_strange.js — #4 Doctor Strange in the Multiverse of Madness: alternate universes, incursions
// (blueprint), the freeze, heroes from every reality vs one enemy, Doom's chessboard.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { rooftop } from '../sets/rooftop.js';
import { cosmos } from '../sets/cosmos.js';
import { throneHall, GREEN } from '../sets/throne.js';
import { hero, bigDoom, bigHero, mandala, OUT, shield } from '../cast.js';
import { universe, portal, cracks, icon, label } from '../props.js';
import { filmCard, fanFace, couchShot, nameTag, tShot } from '../tpl.js';
import { TVC } from '../sets/living.js';

// s040 — "Now things get dangerous."  the sky cracks like glass
registerShot('s040', { draw(g, t, info) {
  const k = ease.out(prog(t, 0.35, 1.4)), [sx, sy] = shake(t, 5 * k * (1 - prog(t, 1.4, 2.2)), 20);
  const cam = { z: 1.05 + 0.05 * t / info.dur, x: sx, y: sy - 60, r: -0.015 * k };
  const { GY, CX, rim } = rooftop(g, t, cam, { sky: 'crack', crackK: k });
  layer(g, cam, 1, (g) => hero(g, 'STRANGE', { x: CX - 380, y: GY, s: 1.1, facing: 1, pose: breathe(POSES.stand, t), t, expr: 'worried', look: [0.4, -1], rim: { color: '#ff8a7a', dir: [0.5, -1] }, wind: 1.5 }));
  FX.dust(g, t, { count: 40, color: '#ff9a8a', a: 0.35 });
} });

registerShot('s041', { draw(g, t, info) { filmCard(g, t, info, 4); } });

// s042 — "explores alternate universes,"  a portal flickering through other worlds
const ALT = [['#3a5a9a', '#ffd59a'], ['#8a2a4a', '#ff9a6a'], ['#2a7a5a', '#cfffb0'], ['#6a3a9a', '#ffb0f0'], ['#9a7a2a', '#fff0a0']];
registerShot('s042', { draw(g, t, info) {
  const cam = { z: 1.25 + 0.06 * t / info.dur, x: 80, y: 110 };
  const { GY, CX, rim } = rooftop(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    const px = CX + 200, py = GY - 260, open = ease.outBack(prog(t, 0.05, 0.6)), w = Math.floor(t * 2.6) % ALT.length, [c1, c2] = ALT[w];
    portal(g, px, py, 210, 250, t, { k: open, inside: (g, x, y, w2, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, [c1, c2]); g.fillRect(x, y, w2, h); FX.skyline(g, { x, y: y + h * 0.85, w: w2, maxH: h * 0.5, color: shade(c1, -0.5), windowColor: alpha(c2, 0.8), seed: 3 + Math.floor(t * 2.6), lit: 0.3 }); FX.sun(g, x + w2 * 0.7, y + h * 0.3, 30, '#fff', c2, 3); } });
    hero(g, 'STRANGE', { x: CX - 200, y: GY, s: 1.55, facing: 1, pose: breathe({ ...POSES.explain, hF: [56, -170], eF: [30, -150] }, t), t, expr: 'determined', magic: 1, magic2: 0.8, rim: { color: '#ffae3a', dir: [1, -0.3] } });
  });
} });

// s043 — "incursions, and the devastating"  another Earth fills the sky
registerShot('s043', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur)), cam = { z: 1.05, y: lerp(40, -60, k) };
  const { GY, CX } = rooftop(g, t, cam, { sky: 'crack', crackK: 0.4, crackColor: '#ff6a3a' });
  layer(g, cam, 0.15, (g) => universe(g, CX + 120, GY - V(700, 1100) + lerp(-200, 0, k), V(520, 420), { hue: '#ff5a3a', t, seed: 11, inner: '#2a0a06', crack: k * 0.8 }));
  layer(g, cam, 0.6, (g) => { const R = rng(3); for (let i = 0; i < 24; i++) { const x = CX - 900 + R() * 1800, y = GY - 100 - ((t * (60 + R() * 80) + R() * 600) % 700), s = 6 + R() * 18; g.save(); g.translate(x, y); g.rotate(t * (R() - 0.5) * 3); g.fillStyle = '#1a1420'; g.fillRect(-s, -s * 0.6, s * 2, s * 1.2); g.restore(); } });
  veil(g, '#3a0a06', 0.15, 'soft-light');
} });

// s044 — "consequences of messing with realities beyond your own."  hands twist reality shards
registerShot('s044', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * t, r: 0.02 * Math.sin(t) };
  cosmos(g, t, { z: 1.4 }, { tint: '#ff6a3a' }); veil(g, '#000', 0.25);
  const crackT = 1.6, c = ease.out(prog(t, crackT, crackT + 0.6));
  layer(g, cam, 1, (g) => {
    const R = rng(6), cx = E.W / 2, cy = E.H * 0.45;
    for (let i = 0; i < 7; i++) { const a = t * 0.4 * (i % 2 ? 1 : -1) + i * 0.9, d = 120 + R() * 160 + c * 80, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.6, s = 60 + R() * 50, [c1, c2] = ALT[i % ALT.length];
      g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(-s, -s * 0.5); g.lineTo(s * 0.7, -s * 0.8); g.lineTo(s, s * 0.4); g.lineTo(-s * 0.4, s * 0.8); g.closePath(); g.save(); g.clip(); g.fillStyle = linGrad(g, 0, -s, 0, s, [c1, c2]); g.fillRect(-s, -s, s * 2, s * 2); FX.skyline(g, { x: -s, y: s * 0.8, w: s * 2, maxH: s, color: shade(c1, -0.5), windowColor: alpha(c2, 0.8), seed: i, lit: 0.3 }); g.restore();
      g.strokeStyle = alpha('#ffe2a0', 0.8); g.lineWidth = 3; g.stroke(); g.restore(); glow(g, x, y, 90, ALT[i % ALT.length][1], 0.2); }
    mandala(g, cx, cy, 140, t, '#ffae3a', 0.8);
    if (c > 0) cracks(g, cx, cy, { len: 600 * c, count: 9, seed: 5, glowC: '#ff5a3a', a: c, w: 4 });
    for (const s of [-1, 1]) { const hx = cx + s * 300, hy = cy + 140; for (const [dx, dy, col] of [[-5 * s, -5, '#ffae3a'], [0, 0, null]]) { g.save(); g.translate(dx, dy); seg(g, [[hx, hy], [hx + s * 600, hy + 420]], 80, col || '#b02a2a'); seg(g, [[hx, hy], [hx + s * 220, hy + 160]], 60, col || '#273c78'); circle(g, hx, hy, 42, col || S().ink); for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 - s * 0.8 + i * 0.3 * s; seg(g, [[hx, hy], [hx + Math.cos(a) * 80, hy + Math.sin(a) * 80]], 17, col || S().ink); } g.restore(); } mandala(g, hx - s * 30, hy - 70, 60, t + s, '#ffae3a', 0.9); }
  });
  if (c > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,120,80,${0.3 * Math.exp(-(t - crackT) * 4)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

// blueprint incursion diagram (s045 approach, s046 destruction)
function incursion(g, t, info, phase) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui, cy = E.H * 0.52, r = V(220, 200);
  const cam = { z: phase ? 1.08 + 0.04 * t : 1 + 0.04 * t };
  layer(g, cam, 1, (g) => {
    text(g, 'INCURSION', E.W / 2, E.H * 0.16, { size: V(64, 70), color: ui.gold, glow: 20, glowColor: alpha(ui.gold, 0.6), spacing: 8, alpha: ease.out(prog(t, 0, 0.4)) * (phase ? 1 : 1) });
    let d, tD = 99, tO = 99, tB = 99;
    if (!phase) d = lerp(560, r * 1.02, ease.inOut(prog(t, 0.2, info.dur)));
    else { d = lerp(r * 1.02, r * 0.7, ease.out(prog(t, 0, 1.2))); tD = tShot(info, 'destroy', 1.5); tO = tShot(info, 'one', 1.85); tB = tShot(info, 'both', 2.45); }
    const A = [E.W / 2 - d, cy], B = [E.W / 2 + d, cy];
    const aGone = ease.in(prog(t, tO, tO + 0.5)), bGone = ease.in(prog(t, tB, tB + 0.5));
    const drawU = (P, lab, gone, crackK, seed) => { g.save(); g.globalAlpha *= 1 - gone * 0.85; ring(g, P[0], P[1], r, 4, c); g.setLineDash([8, 10]); ring(g, P[0], P[1], r * 0.7, 2, alpha(c, 0.5)); g.setLineDash([]); FX.skyline(g, { x: P[0] - r * 0.6, y: P[1] + r * 0.45, w: r * 1.2, minH: 10, maxH: r * 0.6, color: alpha(c, 0.25), windowColor: alpha(c, 0.6), lit: 0.3, seed }); text(g, lab, P[0], P[1] - r - 40, { size: V(32, 36), color: c, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); if (crackK > 0) cracks(g, P[0], P[1], { len: r * 1.3 * crackK, count: 7, seed, color: '#ffffff', glowC: ui.accent, a: crackK * (1 - gone), w: 3 }); if (gone > 0) { const R = rng(seed); for (let i = 0; i < 26; i++) { const a = R() * 6.28, dd = r * (0.3 + gone * (0.8 + R())); rr(g, P[0] + Math.cos(a) * dd, P[1] + Math.sin(a) * dd, 14, 8, 2); g.fillStyle = alpha(c, 0.7 * (1 - gone * 0.6)); g.fill(); } } };
    drawU(A, 'UNIVERSE A', aGone, ease.out(prog(t, tD, tD + 0.4)), 3);
    drawU(B, 'UNIVERSE B', bGone, ease.out(prog(t, tB - 0.3, tB)), 4);
    if (d < r * 1.1) { const ov = clamp((r * 1.1 - d) / (r * 0.4)); glow(g, E.W / 2, cy, r * 0.8, ui.accent, 0.6 * ov); FX.rings(g, E.W / 2, cy, t, { count: 3, r0: 30, r1: r * 1.5, speed: 0.8, color: ui.accent, a: 0.5 * ov }); }
    if (!phase) { const k = ease.out(prog(t, 0.2, 0.6)); for (const s of [-1, 1]) { const x = E.W / 2 + s * (d + r + 70); seg(g, [[x, cy], [x - s * 70 * k, cy]], 4, ui.gold); poly(g, [[x - s * 70 * k, cy], [x - s * 70 * k + s * 18, cy - 12], [x - s * 70 * k + s * 18, cy + 12]], ui.gold); } }
    if (phase) { UI.readout(g, { label: 'DESTROYED:', value: t > tB ? 'BOTH' : t > tO ? 'ONE' : '—', x: E.W / 2, y: E.H * 0.86, align: 'center', a: ease.out(prog(t, tD, tD + 0.3)), color: ui.accent }); }
  });
}
registerShot('s045', { draw(g, t, info) { incursion(g, t, info, 0); } });
registerShot('s046', { draw(g, t, info) { incursion(g, t, info, 1); } });

// s047 — FREEZE "Think about that for a second."  frozen shards around the fan's face
registerShot('s047', { draw(g, t, info) {
  blurLayer(g, 12, (g) => cosmos(g, 0, { z: 1.4 }, { tint: '#ff6a3a' })); veil(g, '#04040c', 0.3);
  const r = V(280, 310), cx = E.W / 2, cy = E.H * V(0.6, 0.55), cam = { z: 1 + 0.03 * t, r: 0.01 * t };
  layer(g, cam, 1, (g) => {
    FX.drops(g, t, { count: 40, color: '#d8e4ff', rMax: 12, drift: 2 });
    const R = rng(8); for (let i = 0; i < 14; i++) { const a = R() * 6.28, d = r * (1.4 + R() * 1.2), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.7, s = 20 + R() * 30; g.save(); g.translate(x + Math.sin(t * 0.5 + i) * 3, y); g.rotate(a + t * 0.05); poly(g, [[-s, -s * 0.4], [s * 0.6, -s * 0.7], [s, s * 0.3], [-s * 0.3, s * 0.7]], alpha('#ffb08a', 0.75)); g.restore(); }
    bigHero(g, 'FAN', cx, cy, r, { expr: 'awe', look: [0, -0.3], rimColor: '#cfe0ff', rimSide: 1 });
  });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,120,255,.4)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  FX.rings(g, cx, cy, t, { count: 3, r0: r * 1.2, r1: r * 2.4, speed: 0.35, color: '#e8f0ff', a: 0.3 });
  UI.badge(g, { str: '1 SECOND', y: V(210, 300), a: ease.out(prog(t, 0.3, 0.7)) });
} });

// s049 — "and the most powerful heroes from different"  portals open, heroes step out
registerShot('s049', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.04 * t / info.dur, y: 50 };
  const { GY, CX } = cosmos(g, t, cam, { ground: true });
  const H = [['CAP', '#4a7cff'], ['THOR', '#ff6a5a'], ['WOLVERINE', '#ffcf3a'], ['SPIDEY', '#ff4a6a'], ['REED', '#7fb0ff']];
  layer(g, cam, 1, (g) => H.forEach(([id, col], i) => {
    const x = CX + (i - 2) * V(330, 200), st = 0.1 + i * 0.25, k = ease.outBack(prog(t, st, st + 0.4)), out = ease.out(prog(t, st + 0.3, st + 1.1));
    portal(g, x, GY - 170, 80, 170, t + i, { color: col, k: Math.max(0.01, k), a: 1 - out * 0.4 });
    if (out > 0) hero(g, id, { x: x + out * 20, y: GY, s: 1.2, facing: 1, pose: out < 1 ? walkPose(t * 5) : breathe(POSES.ready, t, 1, i), t, expr: 'determined', rim: { color: col, dir: [0, -1], w: 5 }, alpha: out, claws: 1 });
  }));
} });

// s050 — "realities are forced to face the same enemy?"  a giant Doom in the sky
registerShot('s050', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.06 * ease.inOut(t / info.dur), y: -20 };
  const { GY, CX } = cosmos(g, t, cam, { ground: true, tint: '#2a8a4a', c1: '#1a5a3a', c2: '#0a3a2a' });
  layer(g, cam, 0.3, (g) => { const k = ease.out(prog(t, 0.2, 1.4)); g.save(); g.globalAlpha *= 0.85 * k; bigDoom(g, CX + V(380, 0), GY - V(480, 900), V(330, 300), { eyes: ease.out(prog(t, 1.0, 1.5)), t, rimColor: '#7dffa0', rimSide: -1 }); g.restore(); glow(g, CX + V(380, 0), GY - V(560, 980), 600, GREEN, 0.2 * k); });
  layer(g, cam, 1, (g) => ['CAP', 'THOR', 'WOLVERINE', 'SPIDEY', 'REED', 'STRANGE'].forEach((id, i) => hero(g, id, { x: CX - V(820, 400) + i * V(150, 120), y: GY + 40, s: 1.0, facing: 1, pose: breathe(POSES.ready, t, 1, i), t, expr: 'scared', look: [0.6, -0.8], rim: { color: '#9dffb6', dir: [1, -0.6], w: 4 }, claws: 1 })));
  FX.dust(g, t, { count: 50, color: '#9dffb6', a: 0.35 });
} });

// s051 — "Could they work together?"  fists from four realities meet
registerShot('s051', { draw(g, t, info) {
  cosmos(g, t, { z: 1.3 }, {}); veil(g, '#000', 0.2);
  const hit = 0.7, k = ease.inOut(prog(t, 0, hit)), cx = E.W / 2, cy = E.H * 0.5, ink = S().ink;
  const arms = [[-1, -0.35, '#2c4f9e'], [1, -0.35, '#f2c21a'], [-1, 0.45, '#c0262d'], [1, 0.45, '#2f6bd6']];
  for (const [sx, sy, col] of arms) { const ang = Math.atan2(sy, sx), d = lerp(700, 120, k), fx = cx + Math.cos(ang) * d, fy = cy + Math.sin(ang) * d;
    for (const [dx, dy, c] of [[-5, -5, '#cfe0ff'], [0, 0, null]]) { g.save(); g.translate(dx, dy); seg(g, [[fx, fy], [fx + Math.cos(ang) * 1200, fy + Math.sin(ang) * 1200]], 110, c || col); circle(g, fx, fy, 70, c || ink); for (let i = 0; i < 4; i++) circle(g, fx - Math.cos(ang) * 40 + Math.sin(ang) * (i - 1.5) * 28, fy - Math.sin(ang) * 40 - Math.cos(ang) * (i - 1.5) * 28, 24, c || ink); g.restore(); } }
  if (t > hit) { FX.rings(g, cx, cy, t - hit, { count: 3, r0: 60, r1: 500, speed: 1.2, color: '#ffffff', a: 0.6 * (1 - prog(t, hit, hit + 0.8)) }); glow(g, cx, cy, 300, '#ffe2a0', 0.6 * Math.exp(-(t - hit) * 3)); }
} });

// s052 — "Or could they end up destroying each other?"  hammer vs claws
registerShot('s052', { draw(g, t, info) {
  const hit = 0.75, after = t > hit, [sx, sy] = after ? shake(t, 16 * Math.exp(-(t - hit) * 3), 25) : [0, 0];
  const cam = { z: 1.25, x: sx, y: sy + 80 };
  const { GY, CX } = cosmos(g, t, cam, { ground: true, tint: '#ff3a2a' });
  const k = ease.in(prog(t, 0, hit)), jump = (x) => Math.sin(Math.min(1, x) * Math.PI) * 120;
  layer(g, cam, 1, (g) => {
    const tx = after ? 60 + (t - hit) * 30 : lerp(340, 60, k);
    hero(g, 'THOR', { x: CX - tx, y: GY - jump(k), s: 1.5, facing: 1, pose: after ? POSES.ready : POSES.jump, t, expr: 'angry', rim: { color: '#ffb0a0', dir: [0, -1] }, hammerUp: !after });
    hero(g, 'WOLVERINE', { x: CX + tx, y: GY - jump(k), s: 1.5, facing: -1, pose: after ? POSES.ready : POSES.jump, t, expr: 'angry', rim: { color: '#ffb0a0', dir: [0, -1] }, claws: 1 });
    if (after) { const e = Math.exp(-(t - hit) * 3); FX.rings(g, CX, GY - 250, t - hit, { count: 3, r0: 40, r1: 600, speed: 1, color: '#ffe2a0', a: 0.6 * e }); FX.speedLines(g, t, { cx: CX, cy: GY - 250, a: 0.4 * e }); for (let i = 0; i < 18; i++) { const a = i * 0.35 + (t - hit) * 2, d = 40 + (t - hit) * 500; FX.sparkle(g, CX + Math.cos(a) * d, GY - 250 + Math.sin(a) * d * 0.6, 14 * e + 2, '#fff0c0', e); } }
  });
  if (after) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,240,220,${0.6 * Math.exp(-(t - hit) * 8)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

// s053 — "With the multiverse playing such a major role in this saga,"  Doom moves the pieces
registerShot('s053', { draw(g, t, info) {
  blurLayer(g, 12, (g) => throneHall(g, t, { z: 1.4, y: -60 }, {})); veil(g, '#020604', 0.35);
  const cam = { z: 1.0 + 0.06 * t / info.dur, x: -20 * t };
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, top = E.H * 0.42, bot = E.H * 0.95, wT = 700, wB = 1500, N = 8;
    const P = (u, v) => { const y = lerp(top, bot, v), w = lerp(wT, wB, v); return [cx - w / 2 + u * w, y]; };
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const a = P(i / N, j / N), b = P((i + 1) / N, j / N), c = P((i + 1) / N, (j + 1) / N), d = P(i / N, (j + 1) / N); poly(g, [a, b, c, d], (i + j) % 2 ? '#1a2a22' : '#c8d2cc'); }
    glow(g, cx, E.H * 0.7, 700, GREEN, 0.15);
    const pieces = [['CAP', 1, 6], ['THOR', 3, 6], ['SPIDEY', 5, 5], ['WOLVERINE', 6, 6], ['REED', 2, 5], ['STRANGE', 4, 4]];
    const mv = ease.inOut(prog(t, 0.6, 1.8));
    pieces.forEach(([id, i, j], n) => { let u = (i + 0.5) / N, v = (j + 0.5) / N; if (n === 4) { u = lerp(u, (3.5) / N, mv); v = lerp(v, 3.5 / N, mv); } const [x, y] = P(u, v); const s = lerp(0.35, 0.75, v); hero(g, id, { x, y: y - (n === 4 ? Math.sin(mv * Math.PI) * 60 : 0), s, facing: -1, pose: POSES.stand, t, rim: { color: '#9dffb6', dir: [0, -1], w: 2 }, claws: 1 }); });
    const [hx, hy] = P(lerp(2.5, 3.5, mv) / N, lerp(5.5, 3.5, mv) / N);
    for (const [dx, dy, c] of [[-5, -5, '#9dffb6'], [0, 0, null]]) { g.save(); g.translate(dx, dy); seg(g, [[hx + 30, hy - 230], [hx + 700, hy - 700]], 110, c || '#24603a'); seg(g, [[hx + 20, hy - 220], [hx + 200, hy - 380]], 100, c || '#8d949c'); circle(g, hx + 10, hy - 200, 60, c || '#a7aeb6'); for (let i = 0; i < 3; i++) seg(g, [[hx + 10 - 20 + i * 20, hy - 190], [hx - 10 + i * 18, hy - 120]], 18, c || '#8d949c'); g.restore(); }
  });
  FX.dust(g, t, { count: 40, color: '#9dffb6', a: 0.35 });
} });

// s054 — "this movie gives you some valuable context."  the fan takes notes
registerShot('s054', { draw(g, t, info) {
  couchShot(g, t, info, { tv: true, z: 1.15, x: 160, y: 110, tvContent: (g, x, y, w, h) => { g.fillStyle = '#1a0f2e'; g.fillRect(x, y, w, h); mandala(g, x + w / 2, y + h / 2, h * 0.35, t, '#ffae3a'); },
    pose: (t) => breathe({ ...POSES.sit, eF: [22, -128], hF: [36, -120 + Math.sin(t * 10) * 3], eB: [16, -126], hB: [30, -116], head: [6, -178 + Math.sin(t * 3) * 3] }, t), expr: (t) => (t > 1.6 ? 'smile' : 'thinking'), prop: { type: 'paper', hand: 'B' }, look: [0.6, 0.2] });
} });
