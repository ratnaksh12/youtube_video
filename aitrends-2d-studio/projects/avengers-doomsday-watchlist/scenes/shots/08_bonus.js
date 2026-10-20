// shots/08_bonus.js — bonus: Spider-Man: No Way Home, and Loki seasons 1 & 2 (TVA, branching timelines,
// He Who Remains), then the Multiverse Saga background.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, measure, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { rooftop } from '../sets/rooftop.js';
import { tva, tvaClock } from '../sets/misc.js';
import { living, TVC } from '../sets/living.js';
import { hero, OUT } from '../cast.js';
import { universe, icon, label, tvSet } from '../props.js';
import { nameTag, tShot } from '../tpl.js';

function bonusBadge(g, t, at = 0.15) { const k = ease.outBack(prog(t, at, at + 0.4)); if (k <= 0) return; const ui = S().ui; g.save(); g.translate(V(220, 200), V(230, 330)); g.scale(k, k); g.rotate(-0.06); rr(g, -150, -46, 300, 92, 18); g.fillStyle = ui.gold; g.fill(); glow(g, 0, 0, 200, ui.gold, 0.35); text(g, 'BONUS', 0, 3, { size: 56, color: '#1a1206', font: FONTS.ui, weight: 900, spacing: 6 }); g.restore(); }

// s098 — "If you want a better understanding of the multiverse,"  cracks full of other worlds
registerShot('s098', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.06 * ease.inOut(t / info.dur), y: -40 };
  const { GY, CX } = rooftop(g, t, cam, { sky: 'crack', crackK: ease.out(prog(t, 0.2, 1.6)), crackColor: '#b48cff' });
  layer(g, cam, 0.2, (g) => [[-420, -620, '#5a7cff'], [260, -720, '#ff6a8a'], [520, -540, '#3ad0c0'], [-120, -820, '#ffd36a']].forEach(([dx, dy, h], i) => universe(g, CX + dx, GY + V(dy, dy * 1.3), 70 + i * 12, { hue: h, t, seed: 40 + i, a: ease.out(prog(t, 0.8 + i * 0.3, 1.4 + i * 0.3)) })));
  bonusBadge(g, t);
} });
// s099 — "watch Spider-Man: No Way Home as well."  three Spider-Men point at each other
registerShot('s099', { draw(g, t, info) {
  const cam = { z: 1.3, y: 130, x: -20 + 30 * t };
  const { GY, CX, rim } = rooftop(g, t, cam, {});
  const V3 = [{ ...OUT.SPIDEY }, { ...OUT.SPIDEY, color: '#a01820', legs: '#1a2a6a' }, { ...OUT.SPIDEY, color: '#d8343a', legs: '#3a5ad0' }];
  layer(g, cam, 1, (g) => { [[-300, 1], [300, -1], [0, 1]].forEach(([dx, f], i) => hero(g, 'SPIDEY', { x: CX + dx, y: GY + (i === 2 ? 40 : 0), s: 1.4, facing: f, outfit: V3[i], pose: breathe(POSES.point, t, 1, i), t, rim: { color: rim, dir: [0, -1], w: 5 } })); });
  const k = ease.out(prog(t, 0.2, 0.6));
  g.save(); g.globalAlpha *= k; rr(g, E.W / 2 - 330, E.H - V(200, 360), 660, 90, 14); g.fillStyle = 'rgba(8,8,14,.7)'; g.fill(); icon(g, 'spider', E.W / 2 - 270, E.H - V(155, 315), 34, '#ff4a6a', t); text(g, 'SPIDER-MAN: NO WAY HOME', E.W / 2 + 30, E.H - V(155, 315), { size: 38, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
  bonusBadge(g, t, -1);
} });

// s100 — "And if you want to understand the bigger story behind the TVA,"
registerShot('s100', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.08 * ease.inOut(t / info.dur), y: -20 };
  const { GY, CX, rim } = tva(g, t, cam, {});
  layer(g, cam, 1, (g) => [[-560, 1], [-200, -1], [200, 1], [560, -1]].forEach(([dx, f], i) => hero(g, 'AGENT', { x: CX + dx, y: GY, s: 1.0, facing: f, pose: i % 2 ? breathe(POSES.phone, t, 1, i) : walkPose(t * 4 + i), t, expr: 'neutral', rim: { color: rim, dir: [0, -1] }, prop: i % 2 ? { type: 'tablet', glow: '#ffb84a' } : null })));
  nameTag(g, t, E.W * 0.12, E.H * V(0.2, 0.2), 'TVA', tShot(info, 'TVA', 3.2) - 0.1, { color: '#ffb84a' });
} });

// s101 — "branching timelines, and He Who Remains,"  the sacred timeline splits; at its end, a figure
registerShot('s101', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur)), cam = { z: 1.0 + 0.15 * k, x: lerp(-100, 260, k) };
  layer(g, cam, 0.5, (g) => { backdrop(g, ['#0a0604', '#2a1608', '#0a0604']); FX.stars(g, t, { count: 140, seed: 6, area: [-E.W, -E.H, E.W * 3, E.H * 3], color: '#ffe2b0' }); });
  const tH = tShot(info, 'He', 1.5);
  layer(g, cam, 1, (g) => {
    const y0 = E.H * 0.55, x0 = -100, x1 = E.W * 0.82, grow = ease.out(prog(t, 0, 1.4));
    g.save(); g.globalCompositeOperation = 'lighter';
    seg(g, [[x0, y0], [lerp(x0, x1, grow), y0]], 10, alpha('#ffb84a', 0.9)); glow(g, lerp(x0, x1, grow), y0, 60, '#ffb84a', 0.6);
    const R = rng(3); for (let i = 0; i < 18; i++) { const bx = lerp(x0 + 200, x1 - 100, R()), dir = R() < 0.5 ? -1 : 1, b = ease.out(prog(t, 0.2 + R() * 0.8, 1.4 + R() * 0.8)); if (b <= 0 || bx > lerp(x0, x1, grow)) continue; const ex = bx + 300 * b, ey = y0 + dir * (80 + R() * 260) * b; g.strokeStyle = alpha(i % 3 ? '#ffb84a' : '#ff6a3a', 0.7); g.lineWidth = 3; g.beginPath(); g.moveTo(bx, y0); g.quadraticCurveTo(bx + 80, y0, ex, ey); g.stroke(); circle(g, ex, ey, 5, '#ffe2b0'); }
    g.restore();
    const ck = ease.out(prog(t, tH - 0.6, tH)); g.save(); g.globalAlpha *= ck; const cx = x1 + 160; poly(g, [[cx - 160, y0 + 140], [cx + 160, y0 + 140], [cx + 120, y0 - 180], [cx + 40, y0 - 300], [cx, y0 - 420], [cx - 40, y0 - 300], [cx - 120, y0 - 180]], '#1a0e08'); glow(g, cx, y0 - 140, 260, '#ffb84a', 0.25); g.restore();
    if (ck > 0) hero(g, 'HWR', { x: x1 + 160, y: y0 + 140, s: 1.1, facing: -1, pose: breathe(POSES.crossArms, t), t, expr: 'smirk', rim: { color: '#ffb84a', dir: [0, -1] }, alpha: ck });
  });
  nameTag(g, t, E.W * V(0.55, 0.15), E.H * V(0.84, 0.75), 'HE WHO REMAINS', tShot(info, 'He', 1.5), { color: '#ffb84a' });
} });

// s102 — "watch Loki Seasons 1 and 2."  Loki holds the timelines
registerShot('s102', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * t / info.dur, y: 40 };
  layer(g, cam, 0.3, (g) => { backdrop(g, ['#05080a', '#0e2420', '#05080a']); FX.stars(g, t, { count: 160, seed: 9, area: [-E.W, -E.H, E.W * 3, E.H * 3], color: '#c8ffe8' }); });
  const GY = E.H * 0.82;
  layer(g, cam, 0.8, (g) => { g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const x = E.W / 2 + (i - 6.5) * 60, sway = Math.sin(t * 1.2 + i) * 20; g.strokeStyle = alpha(i % 2 ? '#7fffd0' : '#ffd36a', 0.55); g.lineWidth = 4; g.beginPath(); g.moveTo(E.W / 2, GY - 260); g.quadraticCurveTo(x + sway, GY - 600, x * 1.3 - E.W * 0.15 + sway, -100); g.stroke(); } g.restore(); glow(g, E.W / 2, GY - 300, 400, '#7fffd0', 0.3); });
  layer(g, cam, 1, (g) => { poly(g, [[E.W / 2 - 140, GY], [E.W / 2 + 140, GY], [E.W / 2 + 90, GY - 60], [E.W / 2 - 90, GY - 60]], '#1a2a26'); hero(g, 'LOKI', { x: E.W / 2, y: GY - 60, s: 1.4, facing: 1, pose: breathe({ ...POSES.stand, eF: [26, -186], hF: [30, -236], eB: [-22, -186], hB: [-28, -236] }, t), t, expr: 'sad', rim: { color: '#9fffe0', dir: [0, -1], w: 5 }, wind: 0.6 }); });
  const ui = S().ui, k = ease.out(prog(t, 0.2, 0.6)), t1 = tShot(info, '1', 1.27), t2 = tShot(info, '2', 1.8);
  g.save(); g.globalAlpha *= k; rr(g, E.W / 2 - 360, E.H - V(220, 380), 720, 100, 14); g.fillStyle = 'rgba(8,8,14,.7)'; g.fill(); icon(g, 'horns', E.W / 2 - 300, E.H - V(170, 330), 34, '#e8b53a', t);
  text(g, 'LOKI · SEASONS', E.W / 2 - 40, E.H - V(170, 330), { size: 40, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 2 });
  const a1 = ease.outBack(prog(t, t1, t1 + 0.3)), a2 = ease.outBack(prog(t, t2, t2 + 0.3));
  text(g, '1', E.W / 2 + 200, E.H - V(170, 330), { size: 52 * a1, color: ui.gold, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(ui.gold, 0.6) }); text(g, '&', E.W / 2 + 245, E.H - V(170, 330), { size: 36, color: ui.cream, font: FONTS.ui, weight: 900, alpha: clamp(a2 * 2) }); text(g, '2', E.W / 2 + 290, E.H - V(170, 330), { size: 52 * a2, color: ui.gold, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(ui.gold, 0.6) });
  g.restore();
} });

// s103 — "They're not movies,"  a TV set, not a cinema screen
registerShot('s103', { draw(g, t, info) {
  const cam = { z: 1.9 + 0.06 * t, x: 640, y: 180 };
  living(g, t, cam, { tv: true, couch: false, tvContent: (g, x, y, w, h) => { g.fillStyle = '#3a2410'; g.fillRect(x, y, w, h); tvaClock(g, x + w / 2, y + h / 2, h * 0.32, t); g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < h; i += 4) g.fillRect(x, y + i, w, 1); } });
  label(g, E.W * 0.1, E.H * 0.25, 'TV SERIES', { a: ease.out(prog(t, 0.2, 0.5)), line: '#ffb84a' });
} });
// s104 — "but they provide useful background for the Multiverse Saga."
registerShot('s104', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui, cam = { z: 1 + 0.04 * t, x: 20 * t }, tM = tShot(info, 'Multiverse', 2.4);
  layer(g, cam, 1, (g) => {
    const y = E.H * 0.42, x0 = V(160, 80), x1 = E.W - V(160, 80);
    seg(g, [[x0, y], [x1, y]], 6, '#7fb0ff'); for (let i = 0; i < 9; i++) { const x = lerp(x0 + 60, x1 - 60, i / 8); circle(g, x, y, 12, '#7fb0ff'); }
    text(g, 'MULTIVERSE SAGA', E.W / 2, y - 90, { size: V(56, 58), color: '#9fc0ff', glow: 18, glowColor: 'rgba(120,170,255,.6)', spacing: 6, alpha: ease.out(prog(t, tM - 0.2, tM + 0.3)) });
    [['spider', '#ff4a6a', 0.6, 0.3], ['horns', '#e8b53a', 1.6, 0.7]].forEach(([ic, col, at, u]) => { const k = ease.outBack(prog(t, at, at + 0.4)), x = lerp(x0, x1, u), yy = y + 200 + (1 - k) * 200; if (k <= 0) return; seg(g, [[x, y + 14], [x, yy - 80]], 3, alpha(c, 0.6)); g.save(); g.translate(x, yy); g.scale(k, k); rr(g, -150, -80, 300, 160, 16); g.fillStyle = 'rgba(14,22,40,.9)'; g.fill(); g.strokeStyle = alpha(col, 0.6); g.lineWidth = 3; g.stroke(); icon(g, ic, -80, 0, 44, col, t); text(g, ic === 'spider' ? 'NO WAY HOME' : 'LOKI', 40, 0, { size: 28, color: ui.cream, font: FONTS.ui, weight: 900 }); g.restore(); });
    text(g, 'BACKGROUND', E.W / 2, E.H * 0.86, { size: V(34, 38), color: alpha(ui.cream, 0.7), font: FONTS.ui, weight: 900, spacing: 8, alpha: ease.out(prog(t, tShot(info, 'background', 1.8), tShot(info, 'background', 1.8) + 0.3)) });
  });
} });
