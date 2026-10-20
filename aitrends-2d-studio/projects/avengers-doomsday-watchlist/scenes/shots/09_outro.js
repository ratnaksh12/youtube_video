// shots/09_outro.js — the recap board, "six movies / one event / one villain", the honest disclaimer,
// the Doom vs Thanos question, like/subscribe, the finale and the end screen.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, measure, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { living, TVC } from '../sets/living.js';
import { cinema } from '../sets/cinema.js';
import { throneHall, GREEN } from '../sets/throne.js';
import { stage } from '../sets/misc.js';
import { hero, bigDoom, bigThanos, END_CAST, OUT } from '../cast.js';
import { filmCase, MOVIES, movie, icon, universe, ticket, stamp, thumbsUp, bell, subscribePill, nebula } from '../props.js';
import { couchShot, bigHand, tShot } from '../tpl.js';

// recap board: rows #6..#1, the current one highlighted
function recap(g, t, info, cur) {
  const ui = S().ui, m = movie(cur), cam = { z: 1.02 + 0.04 * t / info.dur, x: (cur - 3.5) * 6, y: (3.5 - cur) * 10 };
  backdrop(g, ['#05040a', shade(m.c1, -0.1), '#05040a']); nebula(g, t, { c1: m.accent, c2: shade(m.c1, 0.3), seed: cur + 10 }); glow(g, E.W * 0.75, E.H * 0.5, 700, m.accent, 0.15);
  layer(g, cam, 1, (g) => {
    const x = V(140, 80), y0 = V(110, 330), rh = V(146, 170), w = V(1040, 920);
    MOVIES.forEach((mv, i) => { const y = y0 + i * rh, on = mv.n === cur, past = mv.n > cur, k = on ? ease.outBack(prog(t, 0.05, 0.4)) : 0;
      g.save(); g.translate(x + (on ? 30 * k : 0), y); const sc = on ? 1 + 0.06 * k : 1; g.scale(sc, sc);
      rr(g, 0, 0, w, rh - 18, 16); g.fillStyle = on ? alpha(mv.accent, 0.2) : 'rgba(255,255,255,.04)'; g.fill(); if (on) { g.strokeStyle = mv.accent; g.lineWidth = 3; g.stroke(); glow(g, 60, (rh - 18) / 2, 120, mv.accent, 0.4); }
      const a = on ? 1 : past ? 0.75 : 0.3;
      text(g, '#' + mv.n, 60, (rh - 18) / 2, { size: V(56, 58), color: on ? ui.gold : alpha(ui.gold, a), font: FONTS.ui, weight: 900, glow: on ? 18 : 0, glowColor: alpha(ui.gold, 0.6) });
      icon(g, mv.icon, 170, (rh - 18) / 2, 34, alpha(mv.accent, a), t);
      const str = mv.lines.join(' '), sz = Math.min(V(40, 40), (w - 260) / Math.max(1, measure(g, str, 100) / 100)); text(g, str, 240, (rh - 18) / 2, { size: sz, color: alpha(ui.cream, a), font: FONTS.title, weight: 700, align: 'left', spacing: 1 });
      g.restore(); });
  });
  if (!E.vertical) layer(g, { z: 1 + 0.06 * t }, 1.1, (g) => filmCase(g, E.W * 0.82, E.H * 0.52 + Math.sin(t * 1.5) * 8, 330, m, { t, glowK: 0.7, tilt: -0.05, a: ease.out(prog(t, 0, 0.35)) }));
  FX.dust(g, t, { count: 40, color: m.accent, a: 0.4 });
}
[[6, 's106'], [5, 's107'], [4, 's108'], [3, 's109'], [2, 's110'], [1, 's111']].forEach(([n, id]) => registerShot(id, { draw(g, t, info) { recap(g, t, info, n); if (n === 1) { const k = ease.out(prog(t, 0.8, 1.4)); FX.godRays(g, E.W * 0.82, E.H * 0.52, { count: 14, angle: -Math.PI / 2, spread: Math.PI * 2, len: 900, a: 0.06 * k, t, color: '#ffd36a' }); } } }));

// s112 — "Six movies."  the cases stack
registerShot('s112', { draw(g, t, info) {
  blurLayer(g, 12, (g) => living(g, t, { z: 1.4, x: 300, y: -200 }, { couch: false })); veil(g, '#06060e', 0.5);
  MOVIES.forEach((m, i) => { const st = i * 0.12, k = ease.in(prog(t, st, st + 0.3)), y = lerp(-300, E.H * 0.82 - i * 40, k), bounce = t > st + 0.3 ? Math.sin((t - st - 0.3) * 18) * 8 * Math.exp(-(t - st - 0.3) * 8) : 0;
    g.save(); g.translate(E.W / 2 + (i % 2 ? 12 : -10), y + bounce); g.scale(1, 0.28); g.rotate((i - 2.5) * 0.04); filmCase(g, 0, 0, 380, m, { t, rank: false, title: false, glowK: 0.2 }); g.restore(); });
  const k = ease.outBack(prog(t, 0.6, 0.95)); if (k > 0) text(g, '6', E.W / 2, E.H * 0.3, { size: 200 * k, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 40, glowColor: alpha(S().ui.gold, 0.7), alpha: clamp(k) });
} });
// s113 — "One massive Marvel event."  the packed cinema
registerShot('s113', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * t };
  cinema(g, t, cam, { cheer: 1, screenColor: '#9dffb6', screenGlow: 1.6, screen: (g, x, y, w, h, t) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#062a12', '#14602e', '#062a12']); g.fillRect(x, y, w, h); text(g, 'AVENGERS: DOOMSDAY', x + w / 2, y + h / 2, { size: h * 0.14, color: '#e8fff0', glow: 30, glowColor: 'rgba(93,255,138,.9)', spacing: 6 }); } });
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 1.2, '#9dffb6', 0.25);
} });
// s114 — "And one villain who could change everything."
registerShot('s114', { draw(g, t, info) {
  blurLayer(g, 14, (g) => throneHall(g, t, { z: 1.5, y: -150 }, { flashes: [0.2] })); veil(g, '#020604', 0.35);
  bigDoom(g, E.W / 2, E.H * V(0.6, 0.55), V(310, 330) * (1 + 0.06 * t), { eyes: 0.5 + 0.5 * ease.out(prog(t, 1.2, 1.6)), t, rimSide: -1 });
  if (t > 0.2 && t < 0.5) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(200,255,220,${0.35 * (1 - prog(t, 0.2, 0.5))})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

// the watchlist paper on a desk (s115 / s116)
function desk(g, t, cam, slide = 0) {
  layer(g, cam, 0.8, (g) => { g.fillStyle = linGrad(g, 0, 0, E.W, E.H, ['#3a2618', '#24160e']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(-E.W, i * 60, E.W * 3, 3); } glow(g, E.W * 0.3, E.H * 0.2, 900, '#ffcf8a', 0.15); });
  layer(g, cam, 1, (g) => {
    ticket(g, E.W * 0.6, E.H * 0.5, 720, { rot: 0.04, glowK: 0.4 * slide });
    const px = E.W / 2 - 300 - slide * 1100, py = E.H * 0.1; g.save(); g.translate(px, py); g.rotate(-0.02);
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(14, 14, 620, 860); g.fillStyle = '#f2ead8'; g.fillRect(0, 0, 620, 860);
    text(g, 'WATCH BEFORE DOOMSDAY', 310, 80, { size: 36, color: '#2a2018', font: FONTS.ui, weight: 900, spacing: 2 }); seg(g, [[60, 120], [560, 120]], 3, '#c0262d');
    MOVIES.forEach((m, i) => { const y = 190 + i * 100; text(g, '#' + m.n, 80, y, { size: 36, color: '#b3302a', font: FONTS.ui, weight: 900 }); text(g, m.lines.join(' '), 130, y, { size: Math.min(30, 430 / Math.max(1, measure(g, m.lines.join(' '), 100) / 100)), color: '#2a2018', font: FONTS.ui, weight: 900, align: 'left' }); });
    g.restore();
  });
}
registerShot('s115', { draw(g, t, info) { const cam = { z: 1.0 + 0.04 * t }; desk(g, t, cam); const tR = tShot(info, 'recommended', 1.4); layer(g, cam, 1, (g) => stamp(g, E.W / 2 + 10, E.H * 0.52, 'RECOMMENDED', { col: '#d8a23a', k: prog(t, tR, tR + 0.25), rot: -0.2, size: 70 })); } });
registerShot('s116', { draw(g, t, info) {
  const tO = tShot(info, 'officially', 0.6), tA = tShot(info, 'Avengers', 3.8), sl = ease.inOut(prog(t, tA - 0.4, tA + 0.5)), cam = { z: 1.0 + 0.04 * t };
  desk(g, t, cam, sl);
  layer(g, cam, 1, (g) => { g.save(); g.translate(-sl * 1100, 0); stamp(g, E.W / 2 + 10, E.H * 0.52, 'RECOMMENDED', { col: '#d8a23a', k: 1, rot: -0.2, size: 70 }); stamp(g, E.W / 2 - 20, E.H * 0.74, 'NOT OFFICIAL', { col: '#d0302a', k: prog(t, tO, tO + 0.25), rot: 0.12, size: 64 }); g.restore(); });
} });

// s117 — "Now I have one question for you."  two spotlights snap on
registerShot('s117', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.04 * t, y: 80 }, a = t > 0.4 ? 1 : 0, b = t > 1.2 ? 1 : 0;
  const { GY, CX } = stage(g, t, cam, { spots: [{ x: E.W / 2 - 360, k: a, color: '#c58aff', w: 280 }, { x: E.W / 2 + 360, k: b, color: GREEN, w: 280 }] });
  layer(g, cam, 1, (g) => { hero(g, 'THANOS', { x: CX - 360, y: GY, s: 1.15, facing: 1, pose: breathe(POSES.crossArms, t), t, expr: 'angry', rim: { color: '#d8b0ff', dir: [0, -1] }, alpha: 0.15 + 0.85 * a }); hero(g, 'DOOM', { x: CX + 360, y: GY, s: 1.5, facing: -1, pose: breathe(POSES.stand, t, 1, 2), t, eyes: b, rim: { color: '#9dffb6', dir: [0, -1] }, alpha: 0.15 + 0.85 * b }); });
} });

// versus split (s118, s119)
function versus(g, t, hiD, hiT, dim = 0) {
  g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(E.W / 2 + 120, 0); g.lineTo(E.W / 2 - 120, E.H); g.lineTo(0, E.H); g.closePath(); g.clip();
  backdrop(g, ['#031008', '#0e3a1e', '#031008']); glow(g, E.W * 0.28, E.H * 0.5, 700, GREEN, 0.15 + 0.3 * hiD); bigDoom(g, E.W * 0.28, E.H * 0.58, V(280, 200) * (1 + 0.05 * hiD), { eyes: 0.4 + 0.6 * hiD, t, rimSide: -1 }); g.restore();
  g.save(); g.beginPath(); g.moveTo(E.W / 2 + 120, 0); g.lineTo(E.W, 0); g.lineTo(E.W, E.H); g.lineTo(E.W / 2 - 120, E.H); g.closePath(); g.clip();
  backdrop(g, ['#0c0614', '#2e1648', '#0c0614']); glow(g, E.W * 0.72, E.H * 0.5, 700, '#c58aff', 0.15 + 0.3 * hiT); bigThanos(g, E.W * 0.72, E.H * 0.58, V(280, 200) * (1 + 0.05 * hiT), { expr: 'angry', rimSide: 1, rimColor: '#e0c0ff' }); g.restore();
  seg(g, [[E.W / 2 + 120, 0], [E.W / 2 - 120, E.H]], 8, '#ffffff'); glow(g, E.W / 2, E.H / 2, 200, '#ffffff', 0.3);
  if (dim) veil(g, '#000', dim);
  text(g, 'VS', E.W / 2, E.H * 0.5, { size: 130, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 30, glowColor: alpha(S().ui.gold, 0.8), stroke: 10, strokeColor: '#1a1206' });
}
registerShot('s118', { draw(g, t, info) { const tD = tShot(info, 'Doom', 1.05), tT = tShot(info, 'Thanos', 2.77); versus(g, t, ease.out(prog(t, tD, tD + 0.3)) * (1 - 0.6 * ease.out(prog(t, tT, tT + 0.3))), ease.out(prog(t, tT, tT + 0.3))); } });
registerShot('s119', { draw(g, t, info) {
  versus(g, t, 0.5, 0.5, 0.45);
  [['DOOM, EASILY', 0.2, -1, 0.3], ['THANOS!', 0.5, 1, 0.42], ['TEAM DOOM', 0.8, -1, 0.62], ['BOTH?!', 1.1, 1, 0.74]].forEach(([str, at, side, yy]) => { const k = ease.outBack(prog(t, at, at + 0.3)); if (k <= 0) return; const x = E.W / 2 + side * V(420, 240), y = E.H * yy;
    g.save(); g.translate(x, y); g.scale(k, k); const w = measure(g, str, 40, FONTS.ui, 900) + 120; rr(g, -w / 2, -42, w, 84, 42); g.fillStyle = '#f4efe6'; g.fill(); poly(g, [[-w * 0.2, 38], [-w * 0.3, 64], [-w * 0.05, 38]], '#f4efe6'); circle(g, -w / 2 + 42, 0, 24, side < 0 ? '#2f8a45' : '#6b4a8a'); text(g, str, 20, 2, { size: 38, color: S().ink, font: FONTS.ui, weight: 900 }); g.restore(); });
} });

// s120 — "And if you're a true Marvel fan, hit that like button,"
registerShot('s120', { draw(g, t, info) {
  const tL = tShot(info, 'like', 2.4);
  couchShot(g, t, info, { z: 1.25, x: 60, y: 120, expr: (t) => (t > tL ? 'joy' : 'happy'), pose: (t) => breathe(posesAt(t, [[0, POSES.sit], [tL - 0.4, { ...POSES.sit, eF: [30, -150], hF: [56, -170] }]]), t) });
  const k = ease.outBack(prog(t, tL, tL + 0.35)); if (k > 0) { g.save(); g.translate(E.W * 0.68, E.H * 0.38); g.scale(k, k); circle(g, 0, 0, 130, '#e0302a'); glow(g, 0, 0, 260, '#ff6a5a', 0.4); thumbsUp(g, -6, -6, 1.15, '#ffffff'); g.restore(); FX.rings(g, E.W * 0.68, E.H * 0.38, t - tL, { count: 3, r0: 140, r1: 400, speed: 1.2, color: '#ffffff', a: 0.4 }); }
} });
// s121 — "subscribe for more MCU updates, and turn on notifications."
registerShot('s121', { draw(g, t, info) {
  blurLayer(g, 12, (g) => living(g, t, { z: 1.4, x: 200, y: 100 }, {})); veil(g, '#04040a', 0.4);
  const tS = tShot(info, 'subscribe', 0.15), tN = tShot(info, 'notifications', 3.2), cam = { z: 1 + 0.03 * t };
  layer(g, cam, 1, (g) => {
    const k = ease.outBack(prog(t, tS, tS + 0.35)), pressed = t > tS + 0.9 ? 1 : 0; if (k > 0) { g.save(); g.translate(E.W * 0.42, E.H * 0.5); g.scale(k * 1.6, k * 1.6); subscribePill(g, 0, 0, 1, pressed); g.restore(); }
    if (t > tS + 0.6 && t < tS + 1.2) bigHand(g, E.W * 0.42 + 120, E.H * 0.5 + 40 + (1 - ease.out(prog(t, tS + 0.6, tS + 0.9))) * 200, 0.9, { dir: 1, grip: 'closed', ang: 0.9 });
    const b = ease.outBack(prog(t, tN - 0.6, tN - 0.2)); if (b > 0) { g.save(); g.translate(E.W * 0.75, E.H * 0.5); g.scale(b, b); circle(g, 0, 0, 120, 'rgba(255,255,255,.12)'); bell(g, 0, 0, 1.2, Math.max(0, t - tN + 0.2), '#ffffff'); g.restore(); if (t > tN - 0.2) FX.rings(g, E.W * 0.75, E.H * 0.5, t - tN, { count: 3, r0: 130, r1: 340, speed: 1.4, color: '#ffd36a', a: 0.5 }); }
  });
} });

// s122 — "Because when Doom arrives…"
registerShot('s122', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.2 * k, y: lerp(60, 120, k) };
  const { GY, CX, rim } = throneHall(g, t, cam, { flashes: [0.3], fire: 1.3 });
  layer(g, cam, 1, (g) => hero(g, 'DOOM', { x: CX, y: GY + 30 + k * 40, s: lerp(1.6, 2.2, k), facing: 1, pose: walkPose(t * 3, { stride: 18 }), t, eyes: 1, rim: { color: rim, dir: [0, -1], w: 5 }, wind: 1.6 }));
  FX.fog(g, E.H * 0.7, 300, '#3a8a5a', 0.35);
} });
// s123 — "The entire Marvel universe could change forever."  the universe cracks green, title
registerShot('s123', { draw(g, t, info) {
  const hit = 1.6, c = ease.inOut(prog(t, 0.2, hit)), after = t > hit, [sx, sy] = after ? shake(t, 10 * Math.exp(-(t - hit) * 3), 20) : [0, 0];
  const cam = { z: 1.0 + 0.08 * t / info.dur, x: sx, y: sy };
  layer(g, cam, 0.1, (g) => { backdrop(g, ['#020604', '#06140c', '#020604']); nebula(g, t, { c1: '#1a6a3a', c2: '#0a3a2a', seed: 5 }); FX.stars(g, t, { count: 220, seed: 4, area: [-E.W, -E.H, E.W * 3, E.H * 3] }); });
  layer(g, cam, 1, (g) => { universe(g, E.W / 2, E.H * 0.5, V(330, 300), { hue: '#4a7cff', t, seed: 9, crack: c }); if (c > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W / 2, E.H * 0.5, 600 * c, GREEN, 0.4 * c); g.restore(); } });
  if (after) { const k = ease.out(prog(t, hit, hit + 0.5)); veil(g, '#000', 0.45 * k); text(g, 'AVENGERS: DOOMSDAY', E.W / 2, E.H * 0.46, { size: V(110, 80) * (0.9 + 0.1 * k), color: '#e8fff0', glow: 40, glowColor: 'rgba(93,255,138,.95)', spacing: 8, alpha: k }); text(g, 'DECEMBER 18', E.W / 2, E.H * 0.58, { size: V(46, 50), color: S().ui.gold, font: FONTS.ui, weight: 900, spacing: 12, alpha: ease.out(prog(t, hit + 0.3, hit + 0.8)) }); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(160,255,190,${0.6 * Math.exp(-(t - hit) * 6)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

// s124 — "See you in the next video!"  end screen
registerShot('s124', { draw(g, t, info) {
  UI.endScreen(g, t, { question: 'Is Doom more dangerous than Thanos?', cast: END_CAST, moodColors: ['#05100a', '#0e2418', '#1a3a26'], rim: '#9dffb6' });
  FX.dust(g, t, { count: 40, color: '#9dffb6', a: 0.35 });
} });
