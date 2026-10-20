// shots/06_endgame.js — #2 Avengers: Endgame: the conclusion, Tony's end, the shield passed on,
// the actor who becomes Doom, Tony ≠ Victor, the mystery board.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, measure, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { wasteland } from '../sets/wasteland.js';
import { throneHall, GREEN } from '../sets/throne.js';
import { stage, lake } from '../sets/misc.js';
import { living } from '../sets/living.js';
import { hero, bigDoom, bigIron, bigHero, gauntlet, shield, mandala, wpt, OUT } from '../cast.js';
import { icon, portal, label } from '../props.js';
import { filmCard, nameTag, bigHand, tShot } from '../tpl.js';

// s067 — "Of course, you can't skip Avengers: Endgame."  card + the SKIP button refuses
registerShot('s067', { draw(g, t, info) {
  const tS = tShot(info, 'skip', 1.1);
  filmCard(g, t, info, 2, { extra: (g, t) => { const k = ease.outBack(prog(t, tS - 0.3, tS)); if (k <= 0) return; const x = E.W - V(260, 200), y = E.H - V(190, 420), no = t > tS + 0.15;
    g.save(); g.translate(x, y); g.scale(k, k); rr(g, -130, -40, 260, 80, 40); g.fillStyle = no ? 'rgba(224,48,42,.9)' : 'rgba(255,255,255,.18)'; g.fill(); text(g, 'SKIP ▸▸', 0, 2, { size: 36, color: '#fff', font: FONTS.ui, weight: 900, spacing: 2 }); if (no) { seg(g, [[-120, -30], [120, 30]], 6, '#fff'); } g.restore(); } });
} });

// s068 — "This movie delivers the emotional conclusion to the Infinity Saga"  Avengers assembled at dusk
registerShot('s068', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.08 * ease.inOut(t / info.dur), y: 60 };
  const { GY, CX, rim } = wasteland(g, t, cam, { variant: 'dusk', sunX: 0 });
  layer(g, cam, 0.55, (g) => [[-620, 0.2], [-300, 0.5], [320, 0.8], [640, 1.1]].forEach(([dx, st], i) => portal(g, CX + dx, GY - 210, 90, 200, t + i, { k: ease.outBack(prog(t, st, st + 0.6)), color: '#ffae3a', a: 0.8 })));
  layer(g, cam, 1, (g) => ['STRANGE', 'THOR', 'CAP', 'IRON', 'SPIDEY'].forEach((id, i) => hero(g, id, { x: CX + (i - 2) * 190, y: GY, s: 1.3, facing: i < 2 ? 1 : i > 2 ? -1 : 1, pose: breathe(i === 2 ? POSES.ready : POSES.stand, t, 1, i), t, expr: 'determined', rim: { color: rim, dir: [0, -1], w: 5 }, wind: 1.2 })));
  FX.lensStreak(g, E.W / 2, E.H * 0.55, E.W * 1.3, '#ffd0a0', 0.3);
} });

// s069 — "and changes the future of the MCU forever."  the timeline bends at Endgame
registerShot('s069', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui, cam = { z: 1 + 0.05 * t / info.dur, x: 30 * t };
  layer(g, cam, 1, (g) => {
    const y = E.H * 0.6, x0 = V(140, 80), xm = E.W * 0.55, k1 = ease.inOut(prog(t, 0.1, 1.2)), k2 = ease.inOut(prog(t, 1.3, 3.2));
    seg(g, [[x0, y], [lerp(x0, xm, k1), y]], 8, ui.gold); glow(g, lerp(x0, xm, k1), y, 50, ui.gold, 0.6);
    for (let i = 0; i < 6; i++) { const x = lerp(x0 + 80, xm - 80, i / 5); if (x < lerp(x0, xm, k1)) { circle(g, x, y, 10, ui.gold); } }
    text(g, 'INFINITY SAGA', (x0 + xm) / 2, y + 70, { size: V(38, 40), color: ui.gold, font: FONTS.ui, weight: 900, spacing: 4, alpha: k1 });
    if (k1 >= 1) { const m = ease.outBack(prog(t, 1.15, 1.5)); g.save(); g.translate(xm, y); g.scale(m, m); ring(g, 0, 0, 34, 6, '#ffffff'); glow(g, 0, 0, 120, '#ffffff', 0.4); g.restore(); text(g, 'ENDGAME', xm, y - 80, { size: V(44, 46), color: ui.cream, glow: 16, glowColor: alpha(ui.cream, 0.6), spacing: 4, alpha: clamp(m) }); }
    if (k2 > 0) { g.strokeStyle = '#7fb0ff'; g.lineWidth = 8; g.beginPath(); g.moveTo(xm, y); const n = 40; for (let i = 1; i <= n * k2; i++) { const u = i / n; g.lineTo(xm + u * (E.W - xm + 100), y - Math.pow(u, 1.6) * 380); } g.stroke(); const u = k2; glow(g, xm + u * (E.W - xm + 100), y - Math.pow(u, 1.6) * 380, 60, '#7fb0ff', 0.7);
      text(g, 'MULTIVERSE SAGA', E.W * 0.8, y - 330, { size: V(38, 40), color: '#9fc0ff', font: FONTS.ui, weight: 900, spacing: 4, alpha: ease.out(prog(t, 2.4, 3)) }); }
  });
} });

// s070 — "It gives us the end of Tony Stark's journey,"  the arc reactor fades
registerShot('s070', { draw(g, t, info) {
  const cam = { z: 1.55 + 0.06 * t / info.dur, x: -60, y: 210 };
  const { GY, CX, rim } = wasteland(g, t, cam, { variant: 'dusk', sunX: V(260, 100) });
  layer(g, cam, 1, (g) => {
    poly(g, [[CX - 160, GY], [CX + 60, GY], [CX + 30, GY - 150], [CX - 120, GY - 190]], '#1a1420');
    const fade = 1 - ease.inOut(prog(t, 0.6, info.dur));
    const o = hero(g, 'IRON', { x: CX + 40, y: GY, s: 1.45, facing: 1, pose: { ...POSES.sitBack, head: [-6, -170], hF: [30, -40], eF: [20, -80] }, t, reactor: 0.15 + 0.85 * fade, rim: { color: rim, dir: [0.6, -1], w: 5 }, shadow: false });
    const [hx, hy] = wpt(o, 'hF'); gauntlet(g, hx, hy, 16, t, 0.6 * fade);
  });
  FX.dust(g, t, { count: 60, color: '#ffd0a0', a: 0.4, speed: 4 });
} });

// s071 — "the consequences of Thanos's actions,"  ghosts of the vanished among the living
registerShot('s071', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * t / info.dur, x: 40 * t, y: 80 };
  const { GY, CX, rim } = wasteland(g, t, cam, { variant: 'dusk' });
  layer(g, cam, 1, (g) => { const outs = [{ top: 'hoodie', color: '#4a4a5a' }, { top: 'tshirt', color: '#5a4a3a' }, { top: 'dress', color: '#5a3a4a', head: 'ponytail' }, { top: 'suit', color: '#2a2a33' }, { top: 'tshirt', color: '#3a4a5a', kid: true }, { top: 'hoodie', color: '#4a3a3a' }, { top: 'tshirt', color: '#3a3a4a' }];
    outs.forEach((of, i) => { const ghost = i % 2 === 1, x = CX - 600 + i * 200; hero(g, 'FAN', { x, y: GY, s: 1.25, facing: i % 3 ? 1 : -1, outfit: of, pose: breathe(ghost ? POSES.stand : POSES.sad, t, 1, i), t, expr: ghost ? 'neutral' : 'sad', rim: { color: ghost ? '#cfe0ff' : rim, dir: [0, -1], w: 4 }, alpha: ghost ? 0.18 + 0.06 * Math.sin(t * 3 + i) : 1, shadow: !ghost }); if (ghost) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x, GY - 150, 120, '#cfe0ff', 0.15); g.restore(); } }); });
  FX.dust(g, t, { count: 60, color: '#e0a070', a: 0.4, speed: 3 });
} });

// s072 — "and a major turning point for the Avengers."  the shield is passed on by the lake
registerShot('s072', { draw(g, t, info) {
  const cam = { z: 1.35 + 0.05 * t / info.dur, x: -40, y: 160 };
  const { GY, CX, rim } = lake(g, t, cam);
  const k = ease.inOut(prog(t, 0.5, 1.6));
  layer(g, cam, 1, (g) => {
    rr(g, CX - 380, GY - 82, 240, 14, 4); g.fillStyle = '#3a2a20'; g.fill(); seg(g, [[CX - 360, GY - 70], [CX - 360, GY]], 8, '#2a1e18'); seg(g, [[CX - 160, GY - 70], [CX - 160, GY]], 8, '#2a1e18');
    const st = hero(g, 'STEVE', { x: CX - 260, y: GY, s: 1.35, facing: 1, pose: breathe({ ...POSES.sit, eF: [26, -128], hF: lerp(30, 60, k) ? [lerp(36, 66, k), -136] : [36, -136] }, t), t, expr: 'smile', rim: { color: rim, dir: [0.6, -1] }, shadow: false });
    const sam = hero(g, 'CAP', { x: CX + 120, y: GY, s: 1.35, facing: -1, pose: breathe(posesAt(t, [[0, POSES.stand], [0.8, POSES.holdFront]]), t), t, expr: t > 1.6 ? 'awe' : 'surprised', rim: { color: rim, dir: [0.6, -1] }, shield: false });
    const [ax, ay] = wpt(st, 'hF'), [bx, by] = wpt(sam, 'hF'); shield(g, lerp(ax + 20, bx - 10, k), lerp(ay - 10, by - 6, k), 42, 0);
    if (t > 1.6) FX.rings(g, bx - 10, by - 6, t - 1.6, { count: 2, r0: 40, r1: 200, speed: 0.8, color: '#fff3dc', a: 0.4 });
  });
} });

// the actor on a black stage
function actorStage(g, t, info, spots, cam) { return stage(g, t, cam, { spots }); }
// s073 — "And now, Robert Downey Jr."
registerShot('s073', { draw(g, t, info) {
  const cam = { z: 1.25 + 0.05 * t / info.dur, y: 110 }, k = ease.out(prog(t, 0, 1.1));
  const { GY, CX } = actorStage(g, t, info, [{ x: E.W / 2, k: ease.out(prog(t, 0, 0.3)), color: '#fff1dc', w: 260 }], cam);
  layer(g, cam, 1, (g) => hero(g, 'ACTOR', { x: CX - 300 + k * 300, y: GY, s: 1.5, facing: 1, pose: k < 1 ? walkPose(t * 5) : breathe(POSES.stand, t), t, expr: 'smile', rim: { color: '#fff1dc', dir: [0, -1], w: 5 } }));
  nameTag(g, t, E.W * V(0.6, 0.15), E.H * V(0.42, 0.25), 'ROBERT DOWNEY JR.', 0.25);
} });
// s074 — "is returning to Marvel as Doctor Doom."  the mask goes on
registerShot('s074', { draw(g, t, info) {
  const on = 1.1, cam = { z: 1.35 + 0.08 * ease.inOut(t / info.dur), y: 130 }, m = ease.out(prog(t, on, on + 0.35));
  const { GY, CX } = actorStage(g, t, info, [{ x: E.W / 2, k: 1, color: t > on ? GREEN : '#fff1dc', w: 260 }], cam);
  layer(g, cam, 1, (g) => {
    const raise = ease.inOut(prog(t, 0.2, on));
    if (m < 1) { g.save(); g.globalAlpha *= 1 - m; const o = hero(g, 'ACTOR', { x: CX, y: GY, s: 1.5, facing: 1, pose: breathe({ ...POSES.stand, eF: [24, lerp(-136, -168, raise)], hF: [lerp(40, 34, raise), lerp(-130, -204, raise)] }, t), t, expr: 'determined', rim: { color: '#fff1dc', dir: [0, -1], w: 5 } }); const [hx, hy] = wpt(o, 'hF'); icon(g, 'mask', hx + 6, hy - 4, 26, '#5dff8a', t); g.restore(); }
    if (m > 0) { g.save(); g.globalAlpha *= m; hero(g, 'DOOM', { x: CX, y: GY, s: 1.5, facing: 1, pose: breathe(POSES.stand, t), t, eyes: m, rim: { color: '#9dffb6', dir: [0, -1], w: 5 } }); g.restore(); }
    if (t > on) { glow(g, CX + 20, GY - 320, 400 * Math.exp(-(t - on) * 1.5) + 120, GREEN, 0.5); FX.rings(g, CX + 20, GY - 320, t - on, { count: 3, r0: 40, r1: 500, speed: 0.9, color: '#9dffb6', a: 0.5 * Math.exp(-(t - on)) }); }
  });
  if (t > on + 0.6 && t < on + 0.9) FX.lightning(g, { x1: E.W * 0.75, y1: 0, x2: E.W * 0.62, y2: E.H * 0.5, seed: 7, a: 1 - prog(t, on + 0.6, on + 0.9), color: '#cfffd8' });
  if (t > on) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(120,255,160,${0.35 * Math.exp(-(t - on) * 6)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

// s075 — "Yes, the same actor who played Iron Man"  Iron Man and Doom, same silhouette
registerShot('s075', { draw(g, t, info) {
  const tI = tShot(info, 'Iron', 1.5), cam = { z: 1.2 + 0.04 * t, y: 100 }, hi = ease.out(prog(t, tI - 0.1, tI + 0.2));
  const { GY, CX } = stage(g, t, cam, { spots: [{ x: E.W / 2 - 330, k: 0.5 + 0.5 * hi, color: '#ffcf8a', w: 260 }, { x: E.W / 2 + 330, k: 1 - 0.5 * hi, color: GREEN, w: 260 }] });
  layer(g, cam, 1, (g) => {
    hero(g, 'IRON', { x: CX - 330, y: GY, s: 1.5, facing: 1, pose: breathe(POSES.stand, t), t, rim: { color: '#ffcf8a', dir: [0, -1], w: 5 }, alpha: 0.6 + 0.4 * hi });
    hero(g, 'DOOM', { x: CX + 330, y: GY, s: 1.5, facing: -1, pose: breathe(POSES.stand, t, 1, 2), t, rim: { color: '#9dffb6', dir: [0, -1], w: 5 }, alpha: 1 - 0.4 * hi });
    g.setLineDash([10, 12]); seg(g, [[CX - 260, GY - 330], [CX + 260, GY - 330]], 3, alpha('#ffffff', 0.4 * ease.out(prog(t, 0.3, 0.8)))); g.setLineDash([]);
  });
} });

// s076 — "is stepping into the role of one of Marvel's most dangerous villains."  Doom walks at us
registerShot('s076', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.25 * k, y: lerp(40, 120, k) };
  const { GY, CX, rim } = throneHall(g, t, cam, { flashes: [0.4, 3.0], fire: 1.2 });
  layer(g, cam, 1, (g) => hero(g, 'DOOM', { x: CX, y: GY + 20 + k * 60, s: lerp(1.3, 2.1, k), facing: 1, pose: walkPose(t * 3.2, { stride: 18 }), t, eyes: 1, rim: { color: rim, dir: [0, -1], w: 5 }, wind: 1.5 }));
  FX.fog(g, E.H * 0.7, 300, '#3a8a5a', 0.3);
} });
// s077 — "But remember:"  Doom's mask, eyes ignite
registerShot('s077', { draw(g, t, info) {
  blurLayer(g, 14, (g) => throneHall(g, t, { z: 1.5, y: -150 }, {})); veil(g, '#020604', 0.4);
  bigDoom(g, E.W / 2, E.H * V(0.6, 0.55), V(300, 330) * (1 + 0.05 * t), { eyes: ease.out(prog(t, 0.2, 0.5)), t, rimSide: 1 });
} });

// s078 — "Tony Stark and Victor von Doom are not automatically the same character."
registerShot('s078', { draw(g, t, info) {
  const ui = S().ui, tT = tShot(info, 'Tony', 0.15), tV = tShot(info, 'Victor', 0.95), tN = tShot(info, 'not', 1.97), cam = { z: 1 + 0.04 * t };
  stage(g, t, { z: 1.1 }, { spots: [{ x: E.W / 2 - 420, k: 1, color: '#ffcf8a', w: 300 }, { x: E.W / 2 + 420, k: 1, color: GREEN, w: 300 }] });
  layer(g, cam, 1, (g) => {
    const r = V(200, 150), y = E.H * 0.47;
    bigIron(g, E.W / 2 - V(420, 260), y, r, { t, rimSide: -1, rimColor: '#ffcf8a', eyes: ease.out(prog(t, tT, tT + 0.3)) });
    bigDoom(g, E.W / 2 + V(420, 260), y, r, { t, rimSide: 1, eyes: ease.out(prog(t, tV, tV + 0.3)) });
    text(g, 'TONY STARK', E.W / 2 - V(420, 260), y + r * 1.25 + 40, { size: V(40, 40), color: ui.cream, font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, tT, tT + 0.3)) });
    text(g, 'VICTOR VON DOOM', E.W / 2 + V(420, 260), y + r * 1.25 + 40, { size: V(40, 40), color: '#9dffb6', font: FONTS.ui, weight: 900, spacing: 3, alpha: ease.out(prog(t, tV, tV + 0.3)) });
    const k = ease.outBack(prog(t, tN, tN + 0.3)); if (k > 0) { g.save(); g.translate(E.W / 2, y); g.scale(k, k); glow(g, 0, 0, 160, ui.gold, 0.5); seg(g, [[-70, -28], [70, -28]], 18, ui.gold); seg(g, [[-70, 28], [70, 28]], 18, ui.gold); seg(g, [[40, -80], [-40, 80]], 16, ui.gold); g.restore(); }
  });
} });

// mystery board (s079 / s080)
function board(g, t, cam, qK) {
  layer(g, cam, 0.5, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#120e14', '#1e1820']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); });
  layer(g, cam, 0.85, (g) => {
    const bx = E.W / 2 - 620, by = E.H * 0.12, bw = 1240, bh = E.H * 0.72;
    rr(g, bx - 16, by - 16, bw + 32, bh + 32, 10); g.fillStyle = '#3a2618'; g.fill(); g.fillStyle = '#8a6a44'; g.fillRect(bx, by, bw, bh);
    const R = rng(2); for (let i = 0; i < 300; i++) circle(g, bx + R() * bw, by + R() * bh, 1.5, 'rgba(60,40,20,.35)');
    const cards = [[bx + 220, by + 160, 'iron'], [bx + bw - 220, by + 160, 'doom'], [bx + 230, by + bh - 150, 'portal'], [bx + bw - 230, by + bh - 150, 'eg']];
    const C = [E.W / 2, by + bh / 2];
    cards.forEach(([x, y]) => { g.strokeStyle = '#c0262d'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo((x + C[0]) / 2, (y + C[1]) / 2 + 30, C[0], C[1]); g.stroke(); });
    seg(g, [[cards[0][0], cards[0][1]], [cards[1][0], cards[1][1]]], 3, '#c0262d');
    cards.forEach(([x, y, k], i) => { g.save(); g.translate(x, y); g.rotate((i - 1.5) * 0.06); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-110, -80, 230, 180); g.fillStyle = '#efe6d2'; g.fillRect(-120, -90, 230, 180); g.fillStyle = '#1a1420'; g.fillRect(-108, -78, 206, 130);
      if (k === 'iron') bigIron(g, -5, -10, 50, { t }); else if (k === 'doom') bigDoom(g, -5, -10, 50, { t }); else if (k === 'portal') mandala(g, -5, -13, 50, t, '#ffae3a'); else icon(g, 'hourglass', -5, -13, 44, '#9fc0ff', t);
      circle(g, 0, -84, 9, '#e0302a'); g.restore(); });
    if (qK > 0) { glow(g, C[0], C[1], 260 * qK, '#ffd36a', 0.45 * qK); text(g, '?', C[0], C[1], { size: 220 * qK, color: '#ffd36a', glow: 40, glowColor: 'rgba(255,200,80,.9)' }); } else circle(g, C[0], C[1], 12, '#e0302a');
  });
}
registerShot('s079', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * t / info.dur, x: -30 };
  board(g, t, cam, 0);
  layer(g, cam, 1, (g) => { const o = hero(g, 'FAN', { x: E.W * 0.14, y: E.H * 0.98, s: 1.5, facing: 1, pose: breathe({ ...POSES.stand, eF: [26, -150], hF: [50, -160] }, t), t, expr: 'thinking', look: [0.6, -0.4], rim: { color: '#ffe2a8', dir: [1, -0.5] }, prop: 'flashlight' }); });
  g.save(); g.globalCompositeOperation = 'lighter'; const lx = E.W * 0.5 + Math.sin(t * 1.3) * 200, ly = E.H * 0.4 + Math.cos(t) * 80; g.fillStyle = radGrad(g, lx, ly, 0, 260, ['rgba(255,240,200,.28)', 'rgba(255,240,200,0)']); g.fillRect(0, 0, E.W, E.H); g.restore();
  veil(g, '#000', 0.25);
} });
registerShot('s080', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 + 0.45 * k, y: -20 * k };
  board(g, t, cam, ease.outBack(prog(t, 0.4, 1.0)));
  FX.dust(g, t, { count: 40, color: '#ffe2a8', a: 0.35 });
} });

// s081 — "And Endgame makes that mystery even more fascinating."  green eyes in an empty helmet
registerShot('s081', { draw(g, t, info) {
  blurLayer(g, 12, (g) => wasteland(g, t, { z: 1.4, y: 160 }, { variant: 'dusk' })); veil(g, '#0a0608', 0.35);
  const cam = { z: 1.0 + 0.1 * ease.inOut(t / info.dur) }, gk = ease.inOut(prog(t, 1.2, 2.4));
  layer(g, cam, 1, (g) => {
    g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(E.W / 2, E.H * 0.82, 360, 50, 0, 0, 7); g.fill();
    bigIron(g, E.W / 2, E.H * 0.6, V(250, 260), { empty: true, tilt: -0.25, rimColor: '#ffd0a0', rimSide: -1, t });
    if (gk > 0) { for (const s of [-1, 1]) { const x = E.W / 2 + s * 70 - 30, y = E.H * 0.6 - 60 + s * 18; g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x, y, 90, GREEN, 0.8 * gk); g.restore(); rr(g, x - 30, y - 6, 60, 12, 5); g.fillStyle = alpha('#b8ffcc', gk); g.fill(); } }
  });
  FX.dust(g, t, { count: 50, color: '#e0a070', a: 0.4, speed: 3 });
} });
