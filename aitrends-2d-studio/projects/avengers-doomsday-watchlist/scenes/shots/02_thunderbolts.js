// shots/02_thunderbolts.js — #6 Thunderbolts*: a new team, morally grey, the New Avengers, Doom knocking.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { rooftop } from '../sets/rooftop.js';
import { vault } from '../sets/misc.js';
import { throneHall, GREEN } from '../sets/throne.js';
import { hero, bigHero, wpt } from '../cast.js';
import { filmCard, fanFace, nameTag, tShot } from '../tpl.js';

registerShot('s012', { draw(g, t, info) { filmCard(g, t, info, 6); } });
registerShot('s013', { draw(g, t, info) { fanFace(g, t, info, { expr: 'confused', q: 1, qAt: 0.05, look: [0.3, -0.4] }); } });

// s014 — "Because the Avengers aren't the only team in the game anymore."
registerShot('s014', { draw(g, t, info) {
  const cam = { z: 1.12, x: lerp(-60, 60, ease.inOut(t / info.dur)), y: 40 };
  const { GY, CX, rim } = rooftop(g, t, cam, {});
  const tT = tShot(info, 'team', 2.0);
  layer(g, cam, 1, (g) => {
    const r = { color: rim, dir: [0, -1] };
    hero(g, 'CAP', { x: CX - 560, y: GY, s: 1.45, facing: 1, pose: breathe(POSES.stand, t), t, expr: 'neutral', rim: r, dim: 1 });
    hero(g, 'THOR', { x: CX - 400, y: GY, s: 1.45, facing: 1, pose: breathe(POSES.crossArms, t, 1, 2), t, expr: t > tT ? 'surprised' : 'neutral', rim: r });
    const ent = ease.out(prog(t, 0.2, 2.2));
    [['YELENA', 160, 0], ['BUCKY', 330, 0.25], ['REDG', 520, 0.5]].forEach(([id, dx, d]) => {
      const k = ease.out(prog(t, 0.2 + d, 2.0 + d)), walking = k < 1, ph = t * Math.PI * 2 * 0.9 + d * 4;
      hero(g, id, { x: CX + dx + (1 - k) * 700, y: GY, s: 1.45, facing: -1, pose: walking ? walkPose(ph) : breathe(POSES.stand, t, 1, d * 3), t, expr: 'smirk', rim: r });
    });
  });
  FX.fog(g, GY - 60, 160, '#9fb0e0', 0.2);
} });

// s015 — "This movie brings together a group of"  the vault, they arrive one by one
registerShot('s015', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * ease.inOut(t / info.dur), y: 70 };
  const { GY, CX, rim } = vault(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    const r = { color: rim, dir: [0, -1] };
    hero(g, 'YELENA', { x: CX - 120, y: GY, s: 1.5, facing: 1, pose: breathe(POSES.crossArms, t), t, expr: 'determined', rim: r });
    const kB = ease.out(prog(t, 0, 1.1)); hero(g, 'BUCKY', { x: CX - 620 + kB * 300, y: GY, s: 1.5, facing: 1, pose: kB < 1 ? walkPose(t * 5.5) : breathe(POSES.stand, t), t, expr: 'neutral', rim: r });
    const kR = ease.out(prog(t, 0.3, 1.4)); hero(g, 'REDG', { x: CX + 640 - kR * 300, y: GY, s: 1.5, facing: -1, pose: kR < 1 ? walkPose(t * 5.5) : breathe(POSES.relaxed, t), t, expr: 'smile', rim: r });
    const kS = ease.out(prog(t, 0.8, 1.6)); if (kS > 0) hero(g, 'SENTRY', { x: CX + 120, y: GY, s: 1.5, facing: -1, pose: breathe(POSES.stand, t), t, expr: 'worried', rim: { color: '#ffd36a', dir: [0, -1] }, alpha: kS, aura: kS });
  });
} });

// s016 — "morally complicated characters"  the moral compass can't decide
registerShot('s016', { draw(g, t, info) {
  blurLayer(g, 12, (g) => vault(g, t, { z: 1.5, x: 0, y: -100 }, {})); veil(g, '#08060a', 0.4);
  const ui = S().ui, cx = E.W / 2, cy = E.H * 0.52, R = V(290, 330), cam = { z: 1 + 0.06 * t };
  layer(g, cam, 1, (g) => {
    glow(g, cx, cy, R * 1.6, '#ff9a5a', 0.15);
    circle(g, cx, cy, R * 1.08, '#3a2a1a'); circle(g, cx, cy, R, '#e9dcc0'); ring(g, cx, cy, R * 0.92, 3, 'rgba(60,40,20,.5)');
    for (let i = 0; i < 36; i++) { const a = i * Math.PI / 18; seg(g, [[cx + Math.cos(a) * R * 0.84, cy + Math.sin(a) * R * 0.84], [cx + Math.cos(a) * R * (i % 9 ? 0.9 : 0.78), cy + Math.sin(a) * R * (i % 9 ? 0.9 : 0.78)]], i % 9 ? 2 : 4, '#5a4020'); }
    text(g, 'HERO', cx - R * 0.48, cy, { size: V(44, 48), color: '#2c4f9e', font: FONTS.ui, weight: 900 });
    text(g, 'VILLAIN', cx + R * 0.45, cy, { size: V(40, 44), color: '#b3262e', font: FONTS.ui, weight: 900 });
    const a = Math.sin(t * 5.2) * 1.3 * Math.exp(-t * 0.15) + Math.sin(t * 13) * 0.08;
    g.save(); g.translate(cx, cy); g.rotate(a - Math.PI / 2);
    poly(g, [[0, -R * 0.78], [R * 0.07, 0], [-R * 0.07, 0]], '#c0262d'); poly(g, [[0, R * 0.78], [R * 0.07, 0], [-R * 0.07, 0]], '#2a2630'); circle(g, 0, 0, R * 0.06, '#e8b53a'); g.restore();
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.ellipse(cx - R * 0.4, cy - R * 0.5, R * 0.35, R * 0.18, -0.6, 0, 7); g.fill();
  });
  FX.dust(g, t, { count: 40, color: '#ffcfb0', a: 0.35 });
} });

// s017 — "who eventually become the New Avengers."  lineup, the sign flickers on, tilt up
registerShot('s017', { draw(g, t, info) {
  const tN = tShot(info, 'New', 2.0), k = ease.inOut(prog(t, 0.3, info.dur)), cam = { z: 1.05, y: lerp(80, -120, k) };
  const { GY, CX, rim } = vault(g, t, cam, { sign: ease.out(prog(t, tN - 0.3, tN + 0.25)) });
  layer(g, cam, 1, (g) => {
    const r = { color: rim, dir: [0, -1] };
    [['BUCKY', -420, 1], ['YELENA', -150, 1], ['REDG', 140, -1], ['SENTRY', 420, -1]].forEach(([id, dx, f], i) => hero(g, id, { x: CX + dx, y: GY, s: 1.45, facing: f, pose: breathe(t > tN ? POSES.crossArms : POSES.stand, t, 1, i), t, expr: t > tN ? 'smirk' : 'neutral', look: [0, -0.6], rim: id === 'SENTRY' ? { color: '#ffd36a', dir: [0, -1] } : r }));
  });
} });

// s018 — "And with characters like Yelena Belova,"
registerShot('s018', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.06 * ease.inOut(t / info.dur), x: -260, y: 170 };
  const { GY, CX, rim } = rooftop(g, t, cam, {});
  layer(g, cam, 1, (g) => hero(g, 'YELENA', { x: CX - 300, y: GY, s: 1.6, facing: 1, pose: breathe(posesAt(t, [[0, POSES.stand], [1.0, POSES.crossArms]]), t), t, expr: 'determined', rim: { color: rim, dir: [0, -1], w: 5 }, blink: (t % 3) > 2.9 }));
  FX.rain(g, t, { count: 80, a: 0.12 });
  nameTag(g, t, E.W * V(0.55, 0.2), E.H * V(0.56, 0.7), 'YELENA BELOVA', tShot(info, 'Yelena', 1.3) - 0.1, { color: '#a9b45a' });
} });

// s019 — "Bucky Barnes,"  metal arm glint
registerShot('s019', { draw(g, t, info) {
  const cam = { z: 1.55 + 0.08 * t, x: 220, y: 170 };
  const { GY, CX, rim } = rooftop(g, t, cam, {});
  layer(g, cam, 1, (g) => { const o = hero(g, 'BUCKY', { x: CX + 280, y: GY, s: 1.6, facing: -1, pose: breathe({ ...POSES.stand, eF: [24, -150], hF: [36, -186] }, t), t, expr: 'determined', rim: { color: rim, dir: [0, -1], w: 5 } }); const [hx, hy] = wpt(o, 'hF'); FX.sparkle(g, hx, hy, 40 * (0.6 + 0.4 * Math.sin(t * 9)), '#ffffff', 0.9); });
  nameTag(g, t, E.W * V(0.2, 0.2), E.H * V(0.56, 0.7), 'BUCKY BARNES', 0.1, { color: '#b9c0c9' });
} });

// s020 — "and Sentry entering the bigger picture,"  golden hover, pull out
registerShot('s020', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: lerp(1.6, 1.0, k), y: -40 };
  layer(g, cam, 0.1, (g) => { backdrop(g, ['#1a1440', '#4a3a7a', '#e0a060', '#ffe2a0']); FX.godRays(g, E.W / 2, E.H * 0.42, { count: 16, angle: -Math.PI / 2, spread: Math.PI * 2, len: 1800, a: 0.08, t, color: '#ffe2a0' }); });
  layer(g, cam, 0.4, (g) => { FX.clouds(g, { y: E.H * 0.65, h: 260, color: '#ffe8c8', a: 0.25, seed: 5, count: 9 }); FX.clouds(g, { y: E.H * 0.1, h: 160, color: '#ffe8c8', a: 0.18, seed: 2 }); });
  layer(g, cam, 1, (g) => { const y = E.H * 0.62 + Math.sin(t * 1.8) * 10; glow(g, E.W / 2, y - 140, 360, '#ffd36a', 0.6); hero(g, 'SENTRY', { x: E.W / 2, y, s: 1.5, facing: 1, pose: breathe({ ...POSES.stand, eF: [24, -156], hF: [44, -170], eB: [-20, -156], hB: [-42, -170], fF: [6, 6], fB: [-8, 4] }, t), t, expr: 'awe', rim: { color: '#fff1c8', dir: [0, -1], w: 6 }, shadow: false, aura: 1.4, wind: 0.6 }); });
  layer(g, cam, 1.4, (g) => { g.strokeStyle = alpha('#ffe2a0', 0.6 * k); g.lineWidth = 8; g.strokeRect(E.W * 0.32, E.H * 0.18, E.W * 0.36, E.H * 0.64); });
  FX.dust(g, t, { count: 60, color: '#ffe2a0', a: 0.5 });
  nameTag(g, t, E.W * V(0.62, 0.2), E.H * V(0.3, 0.3), 'SENTRY', tShot(info, 'Sentry', 0.2), { color: '#ffd36a' });
} });

// s021 — "this team could be extremely important"  wide rooftop lineup
registerShot('s021', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * ease.inOut(t / info.dur), x: -30 };
  const { GY, CX, rim } = rooftop(g, t, cam, {});
  layer(g, cam, 1, (g) => [['BUCKY', -330, 1], ['YELENA', -120, 1], ['REDG', 110, -1], ['SENTRY', 330, -1]].forEach(([id, dx, f], i) => hero(g, id, { x: CX + dx, y: GY, s: 1.1, facing: f, pose: breathe(POSES.stand, t, 1, i), t, expr: 'determined', rim: id === 'SENTRY' ? { color: '#ffd36a', dir: [0, -1] } : { color: rim, dir: [0, -1] }, wind: 1.3 })));
  FX.lensStreak(g, E.W / 2, E.H * 0.25, E.W, '#dfe8ff', 0.15);
} });

// s022 — "when the next major threat arrives."  the sky turns green, a mask in the storm
registerShot('s022', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, 1.4)), cam = { z: 1.05, y: lerp(40, -160, ease.inOut(t / info.dur)) };
  const { GY, CX, rim } = rooftop(g, t, cam, { sky: 'green', greenK: k, maskK: ease.out(prog(t, 0.9, 1.9)) });
  layer(g, cam, 1, (g) => [['BUCKY', -330, 1], ['YELENA', -120, 1], ['REDG', 110, -1], ['SENTRY', 330, -1]].forEach(([id, dx, f], i) => hero(g, id, { x: CX + dx, y: GY, s: 1.1, facing: f, pose: breathe(t > 0.6 ? POSES.ready : POSES.stand, t, 1, i), t, expr: t > 0.8 ? 'scared' : 'surprised', look: [0, -1], rim: { color: rim, dir: [0, -1] }, wind: 2 })));
  if (t > 0.35 && t < 0.6) FX.lightning(g, { x1: E.W * 0.7, y1: 0, x2: E.W * 0.6, y2: E.H * 0.45, seed: 3, a: 1 - prog(t, 0.35, 0.6) });
  FX.rain(g, t, { count: 160, a: 0.18, color: '#cfffd8' });
} });

// s023 — "Because when Doctor Doom comes knocking,"  the gauntlet knocks
registerShot('s023', { draw(g, t, info) {
  const knocks = [1.35, 1.65, 1.95], hit = knocks.reduce((m, k) => Math.max(m, t > k ? Math.exp(-(t - k) * 14) : 0), 0);
  const [sx, sy] = shake(t, 10 * hit, 30), cam = { z: 1.05 + 0.04 * t, x: sx, y: sy };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0c120e', '#1a2420']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    const dx = E.W / 2 - 330, dw = 660, dt = E.H * 0.08, db = E.H * 0.9;
    g.fillStyle = '#2a1e16'; g.beginPath(); g.moveTo(dx, db); g.lineTo(dx, dt + 200); g.arc(E.W / 2, dt + 200 + 130, 330, Math.PI, 0); g.lineTo(dx + dw, db); g.closePath(); g.fill();
    for (let i = 1; i < 6; i++) seg(g, [[dx + i * dw / 6, dt + 60], [dx + i * dw / 6, db]], 3, 'rgba(0,0,0,.35)');
    for (const y of [dt + 260, db - 160]) { g.fillStyle = '#3a3e42'; g.fillRect(dx, y, dw, 34); for (let i = 0; i < 8; i++) circle(g, dx + 30 + i * 86, y + 17, 6, '#6a7076'); }
    ring(g, E.W / 2 + 200, E.H * 0.55, 40, 8, '#6a7076');
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, db, 0, db + 160, [alpha(GREEN, 0.7 + hit * 0.3), alpha(GREEN, 0)]); g.fillRect(dx - 60, db, dw + 120, 160); g.restore();
    g.fillStyle = '#060a07'; g.fillRect(-E.W, db + 6, E.W * 3, E.H);
    FX.pool(g, E.W / 2, db + 40, 500, 60, GREEN, 0.4 + hit * 0.3);
  });
  // the gauntlet fist
  const back = knocks.reduce((m, k) => Math.min(m, Math.abs(t - k)), 9), push = Math.exp(-back * 9);
  const fx = E.W / 2 + 60 + (1 - push) * 120, fy = E.H * 0.45;
  layer(g, cam, 1.2, (g) => {
    for (const [dx, dy, c] of [[-6, -6, '#9dffb6'], [0, 0, null]]) { g.save(); g.translate(dx, dy);
      seg(g, [[fx + 60, fy + 40], [E.W + 300, fy + 260]], 120, c || '#24603a'); seg(g, [[fx + 30, fy + 20], [fx + 250, fy + 110]], 110, c || '#8d949c');
      rr(g, fx - 80, fy - 70, 170, 150, 46); g.fillStyle = c || '#a7aeb6'; g.fill(); if (!c) { for (let i = 0; i < 4; i++) { rr(g, fx - 92, fy - 62 + i * 36, 40, 30, 12); g.fillStyle = '#8d949c'; g.fill(); } g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(fx - 40, fy - 60, 90, 8); }
      g.restore(); }
    if (hit > 0.2) FX.rings(g, fx - 100, fy, 1 - hit, { count: 2, r0: 40, r1: 260, speed: 1, color: '#ffffff', a: 0.5 * hit });
  });
  FX.dust(g, t, { count: 50, color: '#9dffb6', a: 0.3 + hit * 0.3 });
} });

// s024 — "the world might need a very different kind of hero."  Yelena close-up, half shadow
registerShot('s024', { draw(g, t, info) {
  blurLayer(g, 14, (g) => rooftop(g, t, { z: 1.5, x: 200, y: -200 }, { sky: 'green', greenK: 0.6 })); veil(g, '#04060a', 0.35);
  const r = V(300, 330) * (1 + 0.04 * t), cx = E.W / 2 + V(140, 0), cy = E.H * V(0.6, 0.55);
  bigHero(g, 'YELENA', cx, cy, r, { expr: t > 1.2 ? 'smirk' : 'determined', rimColor: '#9dffb6', rimSide: -1, blink: (t % 3) > 2.9, look: [-0.3, 0] });
  g.fillStyle = linGrad(g, cx - r * 0.2, 0, cx + r * 1.4, 0, ['rgba(0,0,0,0)', 'rgba(0,0,0,.55)']); g.fillRect(cx - r * 0.2, 0, E.W, E.H);
  FX.rain(g, t, { count: 90, a: 0.15, color: '#cfffd8' });
} });
