// shots/01_hook.js — cold open → title: the exhausted binge-watcher, the ticket, the mountain of movies,
// the heroes and Doom, the title card and the six cases.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { living, livingGround, TVC } from '../sets/living.js';
import { cinema } from '../sets/cinema.js';
import { throneHall, GREEN } from '../sets/throne.js';
import { rooftop } from '../sets/rooftop.js';
import { hero, bigHero, OUT, wpt } from '../cast.js';
import { filmCase, MOVIES, popcorn, ticket, calendar, caseStack } from '../props.js';
import { couchShot, fanFace, bigHand, tShot } from '../tpl.js';

// s001 — "Stop watching every single Marvel movie!"  popcorn bursts, FREEZE on "Stop"
registerShot('s001', { draw(g, t, info) {
  const stop = tShot(info, 'Stop', 0.35), fr = t > stop, tf = Math.min(t, stop);
  const [sx, sy] = fr ? [0, 0] : shake(t, 6, 3);
  const cam = { z: 1.3 + (fr ? 0.05 * ease.inOut(prog(t, stop, info.dur)) : 0), x: 40 + sx, y: 120 + sy, r: fr ? -0.012 * prog(t, stop, info.dur) : 0 };
  couchShot(g, t, info, { cam: () => cam, expr: 'shocked', pose: { ...POSES.sit, eF: [26, -140], hF: [40, -170], eB: [16, -124], hB: [30, -112] }, popcorn: true, flicker: fr ? 0 : 0.2,
    front: (g, GY, CX) => {
      const R = rng(4), ox = CX + 60, oy = GY - 200;
      for (let i = 0; i < 46; i++) { const a = -Math.PI / 2 + (R() - 0.5) * 2.4, sp = 300 + R() * 700, tt = tf + 0.25; const x = ox + Math.cos(a) * sp * tt + (fr ? Math.sin(t * 0.6 + i) * 3 : 0), y = oy + Math.sin(a) * sp * tt + 900 * tt * tt * 0.5 + (fr ? Math.cos(t * 0.5 + i) * 3 : 0); circle(g, x, y, 7 + R() * 5, '#fff1c8'); circle(g, x - 2, y - 2, 3, '#ffffff'); }
    } });
  if (fr) {
    const k = prog(t, stop, stop + 0.3);
    g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(80,120,255,${0.4 * k})`; g.fillRect(0, 0, E.W, E.H); g.restore();
    FX.rings(g, E.W / 2 + 60, E.H * 0.42, t - stop, { count: 3, r0: 100, r1: 600, speed: 0.4, color: '#e8f0ff', a: 0.3 * k });
    const px = E.W - V(170, 140), py = V(200, 330), pk = ease.outBack(prog(t, stop, stop + 0.35));
    g.save(); g.translate(px, py); g.scale(pk, pk); rr(g, -46, -56, 34, 112, 8); g.fillStyle = alpha('#ffffff', 0.92); g.fill(); rr(g, 12, -56, 34, 112, 8); g.fill(); g.restore();
    const by = E.H - V(120, 300); rr(g, 120, by, E.W - 240, 8, 4); g.fillStyle = alpha('#ffffff', 0.25 * k); g.fill(); rr(g, 120, by, (E.W - 240) * 0.83, 8, 4); g.fillStyle = alpha('#e0302a', 0.9 * k); g.fill(); circle(g, 120 + (E.W - 240) * 0.83, by + 4, 14 * k, '#e0302a');
  }
} });

// s002 — "Because if you're planning to watch Avengers: Doomsday,"  the ticket
registerShot('s002', { draw(g, t, info) {
  blurLayer(g, 12, (g) => living(g, t, { z: 1.6, x: 260, y: -160 }, {})); veil(g, '#06060e', 0.4);
  const tA = tShot(info, 'Avengers', 1.8), up = ease.out(prog(t, 0, 0.9));
  const x = E.W * V(0.52, 0.5), y = lerp(E.H * 1.1, E.H * V(0.48, 0.45), up) + Math.sin(t * 1.5) * 6;
  bigHand(g, x + V(240, 160), y + 60, V(1.25, 1.15), { dir: 1, grip: 'closed', ang: 0.55 });
  ticket(g, x, y, V(720, 640), { rot: -0.06 + 0.03 * Math.sin(t), glowK: 0.4 + 0.8 * ease.out(prog(t, tA, tA + 0.6)) });
  FX.dust(g, t, { count: 40, color: '#9dffb6', a: 0.35 });
  FX.lensStreak(g, x, y - 20, E.W, '#9dffb6', 0.25 * ease.out(prog(t, tA, tA + 0.5)));
} });

// s003 — "you don't need to spend weeks"  calendar pages tearing away
registerShot('s003', { draw(g, t, info) {
  blurLayer(g, 10, (g) => living(g, t, { z: 1.8, x: -500, y: -300 }, { couch: false })); veil(g, '#06060e', 0.35);
  const cam = { z: 1 + 0.06 * t, x: 0 };
  layer(g, cam, 1, (g) => {
    const per = info.dur / 4, i = Math.min(3, Math.floor(t / per)), tear = (t % per) / per, W = V(460, 520);
    calendar(g, E.W / 2, E.H * 0.5, W, `WEEK ${i + 2}`);
    if (i < 3) { const k = ease.in(prog(tear, 0.5, 1)); g.save(); g.translate(E.W / 2 + W / 2, E.H * 0.5 - W * 0.55); g.rotate(-k * 1.3); g.translate(k * 220, k * 380); g.translate(-(E.W / 2 + W / 2), -(E.H * 0.5 - W * 0.55)); g.globalAlpha *= 1 - k * 0.8; calendar(g, E.W / 2, E.H * 0.5, W, `WEEK ${i + 1}`); g.restore(); }
  });
  FX.dust(g, t, { count: 30 });
} });

// s004 — "rewatching the entire MCU."  the mountain of movies, tilt up
registerShot('s004', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0.05, info.dur)), cam = { z: 1.05, x: -60, y: lerp(60, -760, k) };
  const { GY, CX } = living(g, t, cam, { couch: false });
  layer(g, cam, 1, (g) => {
    const cols = [[-420, 70, 1], [-250, 92, 2], [-80, 104, 3], [90, 96, 5], [260, 80, 6], [420, 62, 8]];
    for (const [dx, n, seed] of cols) caseStack(g, CX + dx, GY, n, { w: 180, th: 18, seed, sway: 1, t });
    glow(g, CX, GY - 1900, 400, '#ffd36a', 0.2);
    hero(g, 'FAN', { x: CX - 640, y: GY, s: 1.0, facing: 1, pose: breathe(POSES.handsOnHead, t), expr: 'shocked', look: [0.4, -1], rim: { color: TVC, dir: [1, -0.4] } });
  });
  FX.dust(g, t, { count: 60, color: '#ffe9d2', a: 0.4 });
} });

// s005 — "But there are a few movies you absolutely should prioritize."  six cases float out, glowing
registerShot('s005', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * ease.inOut(t / info.dur), x: -120, y: -120 };
  const { GY, CX } = living(g, t, cam, { couch: false });
  const tp = tShot(info, 'prioritize', 2.5);
  layer(g, cam, 1, (g) => {
    for (const [dx, n, seed] of [[-560, 60, 2], [-380, 74, 3], [-200, 66, 5]]) caseStack(g, CX + dx, GY, n, { w: 170, th: 18, seed, t });
    hero(g, 'FAN', { x: CX + 80, y: GY, s: 1.35, facing: -1, pose: breathe(posesAt(t, [[0, POSES.reach], [1.1, POSES.point], [tp, POSES.cheer]]), t), expr: t > tp ? 'joy' : 'smile', look: [0.2, -0.6], rim: { color: TVC, dir: [1, -0.4] } });
  });
  layer(g, cam, 1.05, (g) => {
    MOVIES.slice().reverse().forEach((m, i) => { const st = 0.2 + i * 0.28, k = ease.outBack(prog(t, st, st + 0.6)); if (k <= 0) return;
      const tx = CX - 470 + (i - 2.5) * 140, ty = GY - 520 - Math.abs(i - 2.5) * 30 + Math.sin(t * 2 + i) * 8;
      const sx = CX - 380, sy = GY - 300; filmCase(g, lerp(sx, tx, k), lerp(sy, ty, k), 110, m, { t, glowK: 0.8, rank: false, title: false, tilt: (i - 2.5) * 0.06 }); });
  });
  FX.dust(g, t, { count: 50, color: '#ffd36a', a: 0.45 });
} });

// s006 — "From the return of legendary heroes"  silhouettes walk out of the fog
registerShot('s006', { draw(g, t, info) {
  const cam = { z: 1.08 + 0.05 * ease.inOut(t / info.dur), y: -30 };
  const { GY, CX, rim } = rooftop(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    const H = [['CAP', -330, 0.1], ['THOR', -110, 0], ['STRANGE', 110, 0.2], ['SPIDEY', 320, 0.3]];
    for (const [id, dx, d] of H) { const ph = (t + d) * Math.PI * 2 * 0.8; hero(g, id, { x: CX + dx, y: GY - 10, s: 1.25, facing: dx < 0 ? 1 : -1, pose: walkPose(ph), t, expr: 'determined', rim: { color: rim, dir: [0, -1], w: 5 }, alpha: clamp(0.25 + t * 0.6), wind: 1.4 }); }
  });
  FX.fog(g, GY - 200, 360, '#9fb0e0', 0.35 * (1 - t / info.dur * 0.6));
  FX.lensStreak(g, E.W / 2, E.H * 0.35, E.W * 1.4, '#dfe8ff', 0.2);
} });

// s007 — "to the arrival of Doctor Doom,"  the throne hall, lightning, the braziers flare
registerShot('s007', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.12 * ease.inOut(t / info.dur), y: 60 };
  const tD = tShot(info, 'Doom', 1.6);
  const { GY, CX, rim } = throneHall(g, t, cam, { flashes: [0.12, tD], fire: 0.6 + 0.8 * ease.out(prog(t, tD - 0.1, tD + 0.3)) });
  layer(g, cam, 1, (g) => hero(g, 'DOOM', { x: CX, y: GY + 30, s: 2.1, facing: 1, pose: breathe(POSES.stand, t, 0.6), t, eyes: ease.out(prog(t, tD - 0.2, tD + 0.3)), rim: { color: rim, dir: [0, -1], w: 5 } }));
  FX.rain(g, t, { count: 60, a: 0.12 });
} });

// s008 — "these movies could make a huge difference"  the fan's face: confused -> awe
registerShot('s008', { draw(g, t, info) {
  const tH = tShot(info, 'huge', 1.5);
  fanFace(g, t, info, { expr: (t) => (t < tH ? 'confused' : 'awe'), tvK: 1 + 1.5 * ease.out(prog(t, tH, tH + 0.4)), look: [0.5, -0.2], extra: (g, t) => { const k = ease.out(prog(t, tH, tH + 0.4)); glow(g, E.W, E.H * 0.4, 1000, TVC, 0.3 * k); } });
} });

// s010 — TITLE CARD "So, here are the 6 movies you should watch before Avengers: Doomsday!"
registerShot('s010', { draw(g, t, info) {
  const cam = { z: 1.08 - 0.06 * ease.inOut(t / info.dur) };
  const t6 = tShot(info, '6', 1.1);
  cinema(g, t, cam, { screenColor: '#5dff8a', screenGlow: 1.4, rows: 2, screen: (g, x, y, w, h, t) => {
    g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#04140a', '#0e3a1e', '#04140a']); g.fillRect(x, y, w, h);
    for (let i = 0; i < 8; i++) { const a = t * 0.2 + i * 0.8; g.fillStyle = alpha('#1c5a30', 0.35); g.beginPath(); g.ellipse(x + w / 2 + Math.cos(a) * 80, y + h * 0.5, 260 + i * 50, 70 + i * 12, a * 0.2, 0, 7); g.fill(); }
    const mx = x + w / 2, my = y + h * 0.5, r = h * 0.38; g.fillStyle = 'rgba(0,0,0,.35)'; rr(g, mx - r * 0.8, my - r, r * 1.6, r * 2, r * 0.4); g.fill(); for (const s of [-1, 1]) { rr(g, mx + (s > 0 ? r * 0.12 : -r * 0.62), my - r * 0.3, r * 0.5, r * 0.16, 8); g.fillStyle = alpha('#9dffb6', 0.5); g.fill(); }
  } });
  veil(g, '#000', 0.25);
  UI.titleCard(g, t, { lines: ['THE ONLY MOVIES TO WATCH BEFORE', 'AVENGERS: DOOMSDAY'], dur: info.dur, y: E.H * V(0.44, 0.4) });
  const k = ease.outBack(prog(t, t6 - 0.05, t6 + 0.35));
  if (k > 0) { text(g, '6', E.W / 2, E.H * V(0.27, 0.25), { size: 170 * k, color: S().ui.gold, glow: 40, glowColor: alpha(S().ui.gold, 0.8), font: FONTS.ui, weight: 900, alpha: clamp(k) * clamp((info.dur - t) / 0.5) }); }
  FX.dust(g, t, { count: 40, color: '#9dffb6', a: 0.35 });
} });

// s011 — "And trust me, the last one is especially important."  six cases on a shelf, #1 locked & pulsing
registerShot('s011', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0.2, info.dur)), cam = { z: 1 + 0.45 * k, x: 330 * k, y: -40 * k };
  blurLayer(g, 12, (g) => living(g, t, { z: 1.4, x: 300, y: -200 }, { couch: false })); veil(g, '#06060e', 0.45);
  layer(g, cam, 1, (g) => {
    const y = E.H * 0.52, sy = y + 140; rr(g, E.W * 0.1, sy, E.W * 0.8, 22, 6); g.fillStyle = '#2a1e26'; g.fill(); g.fillStyle = 'rgba(255,220,180,.15)'; g.fillRect(E.W * 0.1, sy, E.W * 0.8, 4);
    MOVIES.forEach((m, i) => { const x = E.W * 0.18 + i * E.W * 0.128, last = m.n === 1;
      filmCase(g, x, y + (last ? Math.sin(t * 3) * 4 : 0), 170, m, { t, glowK: last ? 0.9 + 0.3 * Math.sin(t * 5) : 0.2, lock: last ? 1 : 0, dim: last ? 0 : 0.45 * k, rank: true }); });
  });
  FX.dust(g, t, { count: 40, color: '#9dffb6', a: 0.3 });
} });
