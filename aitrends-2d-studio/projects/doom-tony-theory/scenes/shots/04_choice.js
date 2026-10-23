// shots/04_choice.js — Howard's choice (prison or disappear), the escape to Latveria, and the different future:
// no Stark Industries, Latveria rises, the world takes the retro road that leads to the Fantastic Four.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { rooftop } from '/projects/avengers-doomsday-watchlist/scenes/sets/rooftop.js';
import { retroCity } from '/projects/avengers-doomsday-watchlist/scenes/sets/retro.js';
import { hero } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { nebula, label } from '/projects/avengers-doomsday-watchlist/scenes/props.js';
import { nameTag, tShot } from '/projects/avengers-doomsday-watchlist/scenes/tpl.js';
import { person, bigMan, briefcase, O70, GREEN } from '../kit70.js';
import { base70, home70, harbor, latveria, road } from '../sets70.js';
import { timeline } from './03_rule.js';

// t036 — "And here's what makes it hurt."  Howard, close
registerShot('t036', { draw(g, t, info) {
  blurLayer(g, 14, (g) => base70(g, t, { z: 1.5, y: -140 })); veil(g, '#120a06', 0.35);
  bigMan(g, E.W / 2 - V(80, 0), E.H * V(0.6, 0.55), V(300, 320) * (1 + 0.04 * t), { outfit: O70.HOWARD, beard: 'm', expr: 'worried', rimColor: '#ffd59a', rimSide: -1, look: [-0.3, 0.2], blink: (t % 3) > 2.9 });
} });
// t037 — "In that same scene, Howard talks to Tony about the baby on the way."
registerShot('t037', { draw(g, t, info) {
  const cam = { z: 1.45 + 0.05 * t / info.dur, y: 150 };
  const { GY, CX, rim } = base70(g, t, cam);
  layer(g, cam, 1, (g) => {
    person(g, 'HOWARD', { x: CX - 200, y: GY, s: 1.55, facing: 1, pose: breathe(posesAt(t, [[0, POSES.talk], [1.6, POSES.explain]]), t), t, expr: 'happy', talk: 0, rim: { color: rim, dir: [0.6, -1], w: 5 } });
    person(g, 'TONY70', { x: CX + 200, y: GY, s: 1.55, facing: -1, pose: breathe(POSES.stand, t, 1, 2), t, expr: t > 2.4 ? 'sad' : 'smile', rim: { color: rim, dir: [0.6, -1], w: 5 } });
    const k = ease.outBack(prog(t, tShot(info, 'baby', 2.9) - 0.2, tShot(info, 'baby', 2.9) + 0.2)); if (k > 0) { g.save(); g.translate(CX - 120, GY - 520); g.scale(k, k); UI.bubble(g, 0, 0, { w: 150, h: 110, dots: false }); g.fillStyle = '#e8d8c0'; g.beginPath(); g.ellipse(6, 10, 34, 22, 0, 0, 7); g.fill(); circle(g, -26, -6, 18, '#f2e2c8'); circle(g, -20, -10, 2.5, S().ink); g.restore(); }
  });
  nameTag(g, t, E.W * 0.1, E.H * 0.2, 'HOWARD & TONY · 1970', 0.2, { color: '#ffcf8a' });
} });
// t038 — "A father who would do anything for his unborn son."
registerShot('t038', { draw(g, t, info) {
  const cam = { z: 1.35 + 0.05 * t / info.dur, y: 120 };
  const { GY, CX, rim } = home70(g, t, cam);
  layer(g, cam, 1, (g) => {
    person(g, 'MARIA', { x: CX + 90, y: GY, s: 1.5, facing: -1, pose: breathe({ ...POSES.stand, eF: [16, -128], hF: [22, -112] }, t, 1, 1), t, expr: 'smile', rim: { color: rim, dir: [1, -0.6], w: 5 } });
    person(g, 'HOWARD', { x: CX - 110, y: GY, s: 1.55, facing: 1, pose: breathe({ ...POSES.reach, hF: [70, -150], eF: [40, -150] }, t), t, expr: 'happy', rim: { color: rim, dir: [1, -0.6], w: 5 } });
    const k = ease.outBack(prog(t, tShot(info, 'anything', 1.3), tShot(info, 'anything', 1.3) + 0.4)); if (k > 0) { g.save(); g.translate(CX, GY - 560); g.scale(k, k); glow(g, 0, 0, 140, '#ff8aa0', 0.6); g.fillStyle = '#ff6a8a'; g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-60, -10, -40, -60, 0, -30); g.bezierCurveTo(40, -60, 60, -10, 0, 30); g.fill(); g.restore(); }
  });
} });
// t039 — "So when he's forced to choose between a prison cell and disappearing,"
registerShot('t039', { draw(g, t, info) {
  const tP = tShot(info, 'prison', 2.0), tD = tShot(info, 'disappearing', 2.8);
  g.save(); g.beginPath(); g.rect(0, 0, E.W / 2, E.H); g.clip(); backdrop(g, ['#05070c', '#121a28', '#05070c']); glow(g, E.W * 0.25, E.H * 0.4, 500, '#7a9aff', 0.15 + 0.2 * ease.out(prog(t, tP, tP + 0.3))); for (let i = 0; i < 9; i++) { const x = 60 + i * 110; seg(g, [[x, 0], [x, E.H]], 18, '#2a3240'); seg(g, [[x - 4, 0], [x - 4, E.H]], 3, 'rgba(200,220,255,.2)'); } seg(g, [[0, E.H * 0.22], [E.W / 2, E.H * 0.22]], 14, '#2a3240'); g.restore();
  g.save(); g.beginPath(); g.rect(E.W / 2, 0, E.W / 2, E.H); g.clip(); road(g, t, { z: 1.0, x: -480 }, 0.6 + 0.4 * ease.out(prog(t, tD, tD + 0.3))); g.restore();
  seg(g, [[E.W / 2, 0], [E.W / 2, E.H]], 6, '#ffffff');
  person(g, 'HOWARD', { x: E.W / 2, y: E.H * 0.92, s: 1.9, facing: t < (tP + tD) / 2 ? -1 : 1, pose: breathe(POSES.stand, t), t, expr: 'worried', rim: { color: '#ffe2c0', dir: [0, -1], w: 6 } });
  label(g, E.W * 0.08, E.H * 0.85, 'PRISON', { a: ease.out(prog(t, tP, tP + 0.3)), line: '#7a9aff' });
  label(g, E.W * 0.92, E.H * 0.85, 'DISAPPEAR', { a: ease.out(prog(t, tD, tD + 0.3)), line: '#ffcf8a', align: 'right' });
} });
// t040 — "Howard chooses his family."
registerShot('t040', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.04 * t, y: 110 };
  const { GY, CX, rim } = home70(g, t, cam, { night: true });
  layer(g, cam, 1, (g) => { const k = ease.inOut(prog(t, 0.3, info.dur)); const h = person(g, 'HOWARD', { x: CX - 40 + k * 120, y: GY, s: 1.55, facing: 1, pose: breathe({ ...POSES.stand, eB: [-16, -128], hB: [-30, -112] }, t), t, expr: 'determined', rim: { color: rim, dir: [-1, -0.5], w: 5 } }); briefcase(g, CX + 20 + k * 120, GY - 110, 1.4); person(g, 'MARIA', { x: CX - 200 + k * 120, y: GY, s: 1.5, facing: 1, pose: breathe({ ...POSES.reach, hF: [64, -122], eF: [34, -130] }, t, 1, 2), t, expr: 'worried', rim: { color: rim, dir: [-1, -0.5], w: 5 } }); });
} });
// t041 — "He takes Maria, leaves America,"
registerShot('t041', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.04 * t, y: 40 };
  const r = harbor(g, t, cam);
  layer(g, cam, 0.9, (g) => { const bx = r.CX - 200 + t * 40; person(g, 'HOWARD', { x: bx + 140, y: r.deckY, s: 0.6, facing: -1, pose: POSES.stand, t, rim: { color: r.rim, dir: [-1, -0.5] }, shadow: false }); person(g, 'MARIA', { x: bx + 175, y: r.deckY, s: 0.58, facing: -1, pose: POSES.stand, t, rim: { color: r.rim, dir: [-1, -0.5] }, shadow: false, belly: false }); });
  label(g, E.W * 0.08, E.H * 0.2, 'LEAVING AMERICA', { a: ease.out(prog(t, 0.6, 1.0)), line: '#ffcf8a' });
} });
// t042 — "and starts over in a small country called Latveria."
registerShot('t042', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.08 * ease.inOut(t / info.dur), y: 10 };
  latveria(g, t, cam, {});
  nameTag(g, t, E.W * 0.1, E.H * 0.24, 'LATVERIA', tShot(info, 'Latveria', 2.2) - 0.1, { color: GREEN, size: V(52, 54) });
} });

// ---------- a different future ----------
registerShot('t043', { draw(g, t, info) {
  UI.blueprint(g); const cam = { z: 1 + 0.03 * t };
  layer(g, cam, 1, (g) => timeline(g, t, info, { mainLabel: 'OUR WORLD', branch: 1, branchLabel: 0.2, branchText: 'THE BRANCH' }));
} });
// t044 — "Howard's genius never builds American weapons."
registerShot('t044', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui, cam = { z: 1 + 0.04 * t };
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 3; i++) { const x = E.W * (0.3 + i * 0.2), y = E.H * 0.52, k = ease.out(prog(t, 0.1 + i * 0.2, 0.6 + i * 0.2)); g.save(); g.globalAlpha *= k; g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y - 230); g.quadraticCurveTo(x + 40, y - 180, x + 40, y - 120); g.lineTo(x + 40, y + 150); g.lineTo(x - 40, y + 150); g.lineTo(x - 40, y - 120); g.quadraticCurveTo(x - 40, y - 180, x, y - 230); g.stroke(); poly(g, [[x - 40, y + 150], [x - 90, y + 210], [x - 40, y + 90]], alpha(c, 0.3)); poly(g, [[x + 40, y + 150], [x + 90, y + 210], [x + 40, y + 90]], alpha(c, 0.3)); g.setLineDash([6, 8]); seg(g, [[x - 40, y], [x + 40, y]], 2, c); g.setLineDash([]); g.restore(); }
    text(g, 'STARK WEAPONS', E.W / 2, E.H * 0.16, { size: V(44, 48), color: c, font: FONTS.ui, weight: 900, spacing: 6 });
    const tn = tShot(info, 'never', 1.0), x = ease.out(prog(t, tn, tn + 0.3)); if (x > 0) { seg(g, [[E.W * 0.2, E.H * 0.25], [lerp(E.W * 0.2, E.W * 0.8, x), lerp(E.H * 0.25, E.H * 0.82, x)]], 22, ui.accent); if (x > 0.5) seg(g, [[E.W * 0.8, E.H * 0.25], [lerp(E.W * 0.8, E.W * 0.2, (x - 0.5) * 2), lerp(E.H * 0.25, E.H * 0.82, (x - 0.5) * 2)]], 22, ui.accent); }
  });
} });
// t045 — "There is no Stark Industries."  the sign glitches out of existence
registerShot('t045', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.04 * t, y: -160 };
  const { GY, CX } = rooftop(g, t, cam, {});
  const gone = ease.in(prog(t, 0.5, 1.4));
  layer(g, cam, 0.6, (g) => { g.save(); g.globalAlpha *= 1 - gone; const tx = CX, ty = GY - 200; g.fillStyle = '#141826'; g.fillRect(tx - 160, ty - 900, 320, 900); for (let r = 0; r < 26; r++) for (let c = 0; c < 6; c++) if ((r * 7 + c * 3) % 5) { g.fillStyle = alpha('#ffd59a', 0.6); g.fillRect(tx - 140 + c * 50, ty - 880 + r * 33, 26, 16); }
    const jit = gone > 0 ? (Math.sin(t * 90) * 14 * gone) : 0; for (const [dx, col] of [[-6, 'rgba(255,60,60,.6)'], [6, 'rgba(60,200,255,.6)'], [0, '#e8f0ff']]) text(g, 'STARK INDUSTRIES', tx + jit + (gone > 0 ? dx * gone * 3 : 0), ty - 940, { size: 70, color: col, spacing: 6, glow: dx ? 0 : 24, glowColor: 'rgba(160,200,255,.8)' }); g.restore();
    if (gone > 0 && gone < 1) for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(200,230,255,${0.5 * (1 - gone)})`; g.fillRect(tx - 400 + ((i * 97 + Math.floor(t * 30) * 53) % 800), ty - 980 + i * 120, 120 + (i * 37) % 200, 8); } });
} });
// t046 — "Instead, his mind builds Latveria."
registerShot('t046', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.06 * t / info.dur, y: -30 };
  latveria(g, t, cam, { night: true, tech: ease.inOut(prog(t, 0.2, info.dur)) });
} });
// t047 — "And without Stark, the whole world takes a different road."
registerShot('t047', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.06 * t };
  const { GY, CX } = road(g, t, cam, 0.4 + 0.6 * ease.out(prog(t, 0.5, 2)));
  layer(g, cam, 0.9, (g) => { const k = ease.inOut(prog(t, 0.2, info.dur)), x = lerp(CX, CX - 470, k), y = lerp(E.H * 1.0, GY + 30, k), s = lerp(1.4, 0.35, k); rr(g, x - 60 * s, y - 40 * s, 120 * s, 40 * s, 12 * s); g.fillStyle = '#c0302a'; g.fill(); rr(g, x - 36 * s, y - 64 * s, 72 * s, 30 * s, 10 * s); g.fill(); circle(g, x - 36 * s, y, 13 * s, '#111'); circle(g, x + 36 * s, y, 13 * s, '#111'); glow(g, x - 60 * s, y - 20 * s, 60 * s, '#ffcf8a', 0.6); });
} });
// t048 — "A bright, retro, space age future."
registerShot('t048', { draw(g, t, info) {
  const cam = { z: 1.0 + 0.05 * t / info.dur, y: 60 };
  const { GY, CX } = retroCity(g, t, cam);
  layer(g, cam, 0.6, (g) => { const k = ease.in(prog(t, 0.4, info.dur)), x = CX + 300, y = GY - 200 - k * 900; rr(g, x - 26, y - 140, 52, 150, 22); g.fillStyle = '#e8eef4'; g.fill(); poly(g, [[x - 26, y - 110], [x, y - 190], [x + 26, y - 110]], '#c0302a'); poly(g, [[x - 26, y], [x - 54, y + 40], [x - 26, y - 30]], '#c0302a'); poly(g, [[x + 26, y], [x + 54, y + 40], [x + 26, y - 30]], '#c0302a'); for (let i = 0; i < 6; i++) circle(g, x + Math.sin(t * 30 + i) * 8, y + 20 + i * 22, 22 - i * 3, alpha(i % 2 ? '#ffd27a' : '#ff7a2a', 0.9)); glow(g, x, y + 40, 200, '#ff9a4a', 0.6); for (let i = 0; i < 10; i++) circle(g, x + Math.sin(i * 2.3) * 60, y + 200 + i * 60 + k * 100, 30 + i * 6, alpha('#e8e0f0', 0.25 * (1 - i / 10))); });
  label(g, E.W * 0.08, E.H * 0.2, 'A RETRO FUTURE', { a: ease.out(prog(t, tShot(info, 'retro', 0.5), tShot(info, 'retro', 0.5) + 0.3)), line: '#7fb0ff' });
} });
// t049 — "The kind of world where four astronauts"  the cosmic storm
registerShot('t049', { draw(g, t, info) {
  backdrop(g, ['#04030a', '#120a28', '#04030a']); nebula(g, t, { c1: '#ff6a3a', c2: '#6a3aff', seed: 4 }); FX.stars(g, t, { count: 200, seed: 6 });
  const cam = { z: 1 + 0.1 * t };
  layer(g, cam, 1, (g) => { const x = E.W * 0.35 + t * 120, y = E.H * 0.55 - t * 30; g.save(); g.translate(x, y); g.rotate(-0.5); rr(g, -30, -120, 60, 160, 26); g.fillStyle = '#e8eef4'; g.fill(); poly(g, [[-30, -90], [0, -170], [30, -90]], '#c0302a'); for (let i = 0; i < 4; i++) circle(g, 0, -70 + i * 30, 8, '#7fd0ff'); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const yy = (i * 53 + t * 900) % (E.H + 400) - 200; seg(g, [[E.W + 100 - ((i * 97) % 600), yy], [E.W * 0.2 - ((i * 37) % 300), yy + 300]], 2 + (i % 3), alpha(i % 2 ? '#ff8a5a' : '#c08aff', 0.35)); } g.restore();
    glow(g, x, y, 200, '#ffb07a', 0.4 + 0.3 * Math.sin(t * 12)); });
  label(g, E.W * 0.08, E.H * 0.2, 'COSMIC RAYS', { a: ease.out(prog(t, 0.6, 1.0)), line: '#ff8a5a' });
} });
// t050 — "become the Fantastic Four."
registerShot('t050', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * t / info.dur, y: 90 };
  const { GY, CX, rim } = retroCity(g, t, cam);
  layer(g, cam, 1, (g) => [['SUE', -330], ['REED', -110], ['JOHNNY', 110], ['BEN', 340]].forEach(([id, dx], i) => { const k = ease.outBack(prog(t, i * 0.15, i * 0.15 + 0.4)); hero(g, id, { x: CX + dx, y: GY + (1 - k) * 60, s: 1.35, facing: i < 2 ? 1 : -1, pose: breathe(i === 2 ? POSES.cheer : POSES.ready, t, 1, i), t, expr: 'determined', rim: { color: rim, dir: [0, -1], w: 5 }, flame: id === 'JOHNNY' ? 1 : 0, alpha: clamp(k) }); }));
  nameTag(g, t, E.W * 0.1, E.H * 0.22, 'THE FANTASTIC FOUR', tShot(info, 'Fantastic', 0.8) - 0.1, { color: '#7fb0ff' });
} });
