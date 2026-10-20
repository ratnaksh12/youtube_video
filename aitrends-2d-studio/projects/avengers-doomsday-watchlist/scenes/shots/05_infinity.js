// shots/05_infinity.js — #3 Avengers: Infinity War: Thanos on Titan, the gauntlet over Earth and the
// galaxy, strength not enough, Doom as the next unifying threat, the heroes turn to dust.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { wasteland } from '../sets/wasteland.js';
import { throneHall, throneChair, GREEN } from '../sets/throne.js';
import { hero, gauntlet, shield, OUT, wpt } from '../cast.js';
import { globe, galaxy, icon, nebula } from '../props.js';
import { filmCard, fanFace, couchShot, tShot } from '../tpl.js';

// s055 — "If you haven't watched Avengers:"  a huge purple shadow looms over the couch
registerShot('s055', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  couchShot(g, t, info, { z: 1.2, x: 40, y: 60, expr: 'nervous', pose: breathe({ ...POSES.sit, head: [8, -168], sh: [3, -140] }, t), look: [-0.6, -0.4],
    behind: (g, GY, CX, t) => { glow(g, CX - 300, GY - 520, 600, '#8a5ad6', 0.25 * k); hero(g, 'THANOS', { x: CX - 330, y: GY + 30, s: 2.3, facing: 1, pose: { ...POSES.stand, eF: [30, -200], hF: [40, -250] }, t, outfit: { top: 'none' }, ink: '#120a1c', inkFar: '#120a1c', rim: { color: '#a07ae6', dir: [0, -1], w: 6 }, alpha: 0.35 + 0.6 * k, stones: k, shadow: false }); } });
} });

registerShot('s056', { draw(g, t, info) {
  const tS = tShot(info, 'stop', 1.0);
  filmCard(g, t, info, 3, { extra: (g, t) => { const k = ease.outBack(prog(t, tS, tS + 0.3)); if (k > 0) { g.save(); g.translate(E.W - V(160, 140), V(170, 300)); g.scale(k, k); rr(g, -50, -50, 100, 100, 14); g.fillStyle = alpha('#e0302a', 0.9); g.fill(); g.restore(); } } });
} });

// Titan battlefield
function titan(g, t, cam) { return wasteland(g, t, cam, { variant: 'titan', sunX: V(380, 140) }); }

// s057 — "This is where we see what happens when"  Thanos waits, the heroes approach
registerShot('s057', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.06 * ease.inOut(t / info.dur), x: lerp(-40, 40, t / info.dur), y: 30 };
  const { GY, CX, rim } = titan(g, t, cam);
  layer(g, cam, 1, (g) => {
    poly(g, [[CX + 200, GY], [CX + 700, GY], [CX + 620, GY - 90], [CX + 300, GY - 110]], '#1e0c10');
    hero(g, 'THANOS', { x: CX + 470, y: GY - 100, s: 1.2, facing: -1, pose: breathe(POSES.stand, t), t, expr: 'angry', rim: { color: rim, dir: [0.6, -1] } });
    ['CAP', 'THOR', 'IRON', 'STRANGE', 'SPIDEY'].forEach((id, i) => hero(g, id, { x: CX - 760 + i * 120 + t * 60, y: GY + 20, s: 0.95, facing: 1, pose: walkPose(t * 5 + i), t, expr: 'determined', rim: { color: rim, dir: [0.6, -1] } }));
  });
} });

// s058 — "an enemy is powerful enough to defeat the Avengers at their own game."  the shockwave
registerShot('s058', { draw(g, t, info) {
  const hit = 1.9, after = t > hit, [sx, sy] = after ? shake(t, 14 * Math.exp(-(t - hit) * 2.5), 20) : [0, 0];
  const cam = { z: 1.15 + 0.04 * t, x: 120 + sx, y: 90 + sy };
  const { GY, CX, rim } = titan(g, t, cam);
  layer(g, cam, 1, (g) => {
    const th = hero(g, 'THANOS', { x: CX + 300, y: GY, s: 1.35, facing: -1, pose: breathe(posesAt(t, [[0, POSES.stand], [1.2, POSES.pointUp], [hit, POSES.point]]), t), t, expr: 'angry', rim: { color: rim, dir: [0.6, -1] }, stones: 1 + 2 * ease.out(prog(t, 1.2, hit)) });
    const [gx, gy] = wpt(th, 'hF'); if (t > 1.2) glow(g, gx, gy, 200 * ease.out(prog(t, 1.2, hit)), '#c58aff', 0.6);
    ['CAP', 'THOR', 'IRON', 'SPIDEY'].forEach((id, i) => { const fl = ease.out(prog(t, hit + i * 0.05, hit + 0.8 + i * 0.05)), x = CX - 200 - i * 150 - fl * (300 + i * 80), y = GY - Math.sin(fl * Math.PI) * 140;
      hero(g, id, { x, y, s: 1.2, facing: 1, pose: after ? POSES.fall : POSES.ready, rot: after ? -fl * 1.2 : 0, t, expr: after ? 'shocked' : 'determined', rim: { color: rim, dir: [0.6, -1] } }); });
    if (after) { FX.rings(g, gx, gy, t - hit, { count: 4, r0: 30, r1: 1100, speed: 0.8, color: '#e8c8ff', a: 0.7 * Math.exp(-(t - hit) * 1.5) }); FX.speedLines(g, t, { cx: gx, cy: gy, a: 0.35 * Math.exp(-(t - hit) * 2) }); }
  });
  if (after) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(200,150,255,${0.5 * Math.exp(-(t - hit) * 6)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

function space(g, t, cam) { layer(g, cam, 0.1, (g) => { backdrop(g, ['#04030a', '#0c0820', '#04030a']); nebula(g, t, { c1: '#4a2a7a', c2: '#1a3a6a', seed: 7 }); FX.stars(g, t, { count: 300, seed: 3, area: [-E.W, -E.H, E.W * 3, E.H * 3] }); }); }
// s059 — "Thanos doesn't just threaten the world."  the gauntlet over Earth
registerShot('s059', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.08 * t / info.dur };
  space(g, t, cam);
  layer(g, cam, 0.8, (g) => globe(g, E.W * V(0.4, 0.5), E.H * V(0.6, 0.62), V(240, 220), t));
  layer(g, cam, 1.1, (g) => { const k = ease.out(prog(t, 0, 1.2)); g.save(); g.translate(E.W * V(0.72, 0.6) + (1 - k) * 400, E.H * V(0.3, 0.3)); g.rotate(-0.3); icon(g, 'gauntlet', 0, 0, V(260, 220), '#c58aff', t); g.restore(); });
  FX.dust(g, t, { count: 40, color: '#c58aff', a: 0.3 });
} });
// s060 — "He threatens the entire universe."  pull out to the galaxy
registerShot('s060', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur)), cam = { z: lerp(2.6, 1, k) };
  space(g, t, cam);
  layer(g, cam, 1, (g) => { galaxy(g, E.W / 2, E.H * 0.55, V(620, 480), t); globe(g, E.W / 2 + 120, E.H * 0.55 + 40, 14, t); });
  layer(g, { z: 1 + 0.05 * k }, 1, (g) => { const a = ease.out(prog(t, 0.8, 1.6)); g.save(); g.globalAlpha *= 0.6 * a; g.translate(E.W * 0.5, E.H * 0.42); icon(g, 'gauntlet', 0, 0, V(420, 360), '#c58aff', t); g.restore(); });
} });

// s061 — "...even their combined strength might not be enough."  the strength bars
registerShot('s061', { draw(g, t, info) {
  blurLayer(g, 14, (g) => titan(g, t, { z: 1.3, y: 60 })); veil(g, '#0a0408', 0.45);
  const ui = S().ui, tC = tShot(info, 'combined', 2.1), tN = tShot(info, 'not', 3.3), x0 = V(560, 160), w = V(1000, 760), cam = { z: 1 + 0.03 * t };
  layer(g, cam, 1, (g) => {
    const row = (y, lab, v, col, ic) => { text(g, lab, x0, y - 60, { size: V(40, 44), color: col, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 }); rr(g, x0, y - 26, w, 52, 26); g.fillStyle = alpha(col, 0.12); g.fill(); rr(g, x0, y - 26, Math.max(52, w * v), 52, 26); g.fillStyle = col; g.fill(); glow(g, x0 + w * v, y, 70, col, 0.5); if (!E.vertical) ic(g, x0 - 150, y); };
    const vA = 0.82 * ease.inOut(prog(t, tC - 0.6, tC + 0.9)), vT = ease.inOut(prog(t, 0.2, 1.4)), fail = t > tN;
    row(E.H * 0.38, 'THANOS', vT, '#c58aff', (g, x, y) => gauntlet(g, x, y, 46, t));
    row(E.H * 0.64, 'THE AVENGERS COMBINED', vA, fail ? (Math.floor(t * 8) % 2 ? ui.accent : '#ff9a8a') : ui.blueprint, (g, x, y) => shield(g, x, y, 50));
    if (fail) { const k = ease.outBack(prog(t, tN, tN + 0.35)); text(g, 'NOT ENOUGH', x0 + w * 0.82 + 30, E.H * 0.64 + 80, { size: 50 * k, color: ui.accent, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(ui.accent, 0.7), align: 'right', alpha: clamp(k) }); }
  });
} });

registerShot('s062', { draw(g, t, info) { fanFace(g, t, info, { expr: 'thinking', q: 1, qAt: 0.2, look: [0.5, -0.6], rings: 1 }); } });

// s063 — "Because Doctor Doom is another villain whose threat"  Doom on the throne, Thanos' ghost behind
registerShot('s063', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.06 * ease.inOut(t / info.dur), y: 40 };
  const o = { flashes: [0.3], throne: false };
  const { GY, CX, rim } = throneHall(g, t, cam, o);
  layer(g, cam, 0.6, (g) => { const k = ease.out(prog(t, 0.6, 2.0)); g.save(); g.globalAlpha *= 0.35 * k; hero(g, 'THANOS', { x: CX + 40, y: GY - 60, s: 2.0, facing: -1, pose: POSES.crossArms, t, expr: 'angry', rim: false }); g.restore(); glow(g, CX, GY - 500, 500, '#9a6aff', 0.18 * k); });
  layer(g, cam, 0.7, (g) => { const seat = throneChair(g, CX, GY - V(30, 40), V(1, 0.9)); hero(g, 'DOOM', { x: CX + 6, y: seat + 72 * 1.6 - 4, s: 1.6, facing: 1, pose: breathe(POSES.sitBack, t, 0.5), t, eyes: 1, rim: { color: rim, dir: [0, -1] }, shadow: false, wind: 0.3 }); });
  FX.rain(g, t, { count: 50, a: 0.1 });
} });

// s064 — "could bring heroes from different corners of Marvel together."  the map
registerShot('s064', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui, cx = E.W / 2, cy = E.H * 0.52, cam = { z: 1 + 0.05 * t / info.dur };
  layer(g, cam, 1, (g) => {
    g.strokeStyle = alpha(c, 0.35); g.lineWidth = 2; const R = rng(4); for (let k = 0; k < 6; k++) { const bx = cx + (R() - 0.5) * 1300, by = cy + (R() - 0.5) * 600; g.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * 6.28, rr2 = 70 + R() * 70; g.lineTo(bx + Math.cos(a) * rr2 * 1.4, by + Math.sin(a) * rr2); } g.closePath(); g.stroke(); }
    const corners = [[V(220, 160), V(170, 300), 'shield'], [E.W - V(220, 160), V(170, 300), 'swords'], [V(220, 160), E.H - V(170, 300), 'four'], [E.W - V(220, 160), E.H - V(170, 300), 'spider']];
    const tT = tShot(info, 'together', 2.6);
    corners.forEach(([x, y, ic], i) => { const st = 0.2 + i * 0.35, k = ease.inOut(prog(t, st, tT)), px = lerp(x, cx, k * 0.78), py = lerp(y, cy, k * 0.78);
      g.setLineDash([10, 12]); seg(g, [[x, y], [cx, cy]], 3, alpha(ui.gold, 0.35)); g.setLineDash([]); seg(g, [[x, y], [px, py]], 4, ui.gold);
      const a = ease.outBack(prog(t, st, st + 0.35)); g.save(); g.translate(x, y); g.scale(a, a); ring(g, 0, 0, 58, 4, c); icon(g, ic, 0, 0, 40, ui.gold, t); g.restore(); glow(g, px, py, 40, ui.gold, 0.8 * clamp(k * 3)); });
    const m = ease.outBack(prog(t, 0, 0.5)); g.save(); g.translate(cx, cy); g.scale(m, m); glow(g, 0, 0, 200, GREEN, 0.4); ring(g, 0, 0, 100, 5, '#9dffb6'); icon(g, 'mask', 0, 0, 70, '#5dff8a', t); g.restore();
    if (t > tT) FX.rings(g, cx, cy, t - tT, { count: 3, r0: 100, r1: 400, speed: 1, color: ui.gold, a: 0.6 });
  });
} });

// s065 — "Infinity War reminds us that sometimes, the heroes don't win."  turning to dust
function dustFigure(g, id, o, k, seed) {
  if (k < 1) { g.save(); g.globalAlpha *= 1 - k; hero(g, id, o); g.restore(); }
  if (k > 0) { const R = rng(seed); for (let i = 0; i < 90; i++) { const sx = o.x + (R() - 0.5) * 70 * o.s, sy = o.y - R() * 230 * o.s, d = k * (120 + R() * 380); circle(g, sx + d, sy - d * 0.35 - Math.sin(i + k * 6) * 10, 2.5 + R() * 3, alpha(i % 3 ? '#2a1a1a' : '#e0a070', 0.85 * (1 - k * 0.8))); } }
}
registerShot('s065', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.05 * t / info.dur, y: 90 };
  const { GY, CX, rim } = wasteland(g, t, cam, { variant: 'dusk' });
  const tW = tShot(info, "don't", 3.3);
  layer(g, cam, 1, (g) => [['SPIDEY', -420, 1.0], ['STRANGE', -170, 1.5], ['BUCKY', 90, 2.0], ['CAP', 340, 2.6]].forEach(([id, dx, st], i) => dustFigure(g, id, { x: CX + dx, y: GY, s: 1.4, facing: i % 2 ? -1 : 1, pose: breathe(POSES.sad, t, 1, i), t, expr: 'sad', rim: { color: rim, dir: [-0.6, -1] } }, ease.inOut(prog(t, st, st + 1.4)), i + 3)));
  FX.dust(g, t, { count: 80, color: '#e0a070', a: 0.45, speed: 4 });
} });

// s066 — "And sometimes, the consequences change everything."  the fallen shield in an empty field
registerShot('s066', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.1 * ease.inOut(t / info.dur), y: 150, x: -60 };
  const { GY, CX, rim } = wasteland(g, t, cam, { variant: 'dusk', sunX: V(-200, -80) });
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(CX - 40, GY + 30); g.scale(1, 0.35); g.rotate(0.2); g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.arc(14, 30, 110, 0, 7); g.fill(); shield(g, 0, 0, 110); g.restore();
    FX.pool(g, CX - 40, GY + 20, 260, 40, rim, 0.25);
  });
  FX.dust(g, t, { count: 90, color: '#e0a070', a: 0.45, speed: 3 });
  FX.lensStreak(g, E.W * 0.4, E.H * 0.5, E.W, '#ffd0a0', 0.2);
} });
