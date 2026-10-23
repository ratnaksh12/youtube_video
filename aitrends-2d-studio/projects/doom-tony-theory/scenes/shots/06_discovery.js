// shots/06_discovery.js — Doom traces his exile to 1970 and finds Tony Stark; the life he believes was stolen;
// the "stolen lives" line; maybe he means Tony.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { throneHall } from '/projects/avengers-doomsday-watchlist/scenes/sets/throne.js';
import { rooftop } from '/projects/avengers-doomsday-watchlist/scenes/sets/rooftop.js';
import { retroCity } from '/projects/avengers-doomsday-watchlist/scenes/sets/retro.js';
import { wasteland } from '/projects/avengers-doomsday-watchlist/scenes/sets/wasteland.js';
import { cinema } from '/projects/avengers-doomsday-watchlist/scenes/sets/cinema.js';
import { hero, bigDoom, bigIron, gauntlet } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { cracks, label } from '/projects/avengers-doomsday-watchlist/scenes/props.js';
import { nameTag, tShot } from '/projects/avengers-doomsday-watchlist/scenes/tpl.js';
import { person, bigMan, tesseract, briefcase, pedestal, photo, holo, asHolo, O70, GREEN } from '../kit70.js';
import { home70 } from '../sets70.js';
import { battle } from './01_open.js';

const holoBg = (g, t) => { backdrop(g, ['#010804', '#04180c', '#010804']); g.strokeStyle = 'rgba(93,255,138,.06)'; g.lineWidth = 1; for (let x = 0; x <= E.W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); } for (let y = 0; y <= E.H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); } FX.dust(g, t, { count: 40, color: '#9dffb6', a: 0.3 }); };
const PANEL = () => [E.W * 0.14, E.H * 0.16, E.W * 0.72, E.H * 0.66];

// t062 — "Then Doom discovers the truth."
registerShot('t062', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.06 * ease.inOut(t / info.dur), y: 60 };
  const { GY, CX, rim } = throneHall(g, t, cam, { flashes: [0.3], throne: false });
  layer(g, cam, 1, (g) => { holo(g, CX + 40, GY - 560, 560, 360, t, (g, x, y, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = alpha(GREEN, 0.5); g.fillRect(x + 30, y + 40 + i * 38, 120 + ((i * 53) % 300), 8); } }, ease.out(prog(t, 0, 0.6))); hero(g, 'DOOM', { x: CX - 220, y: GY, s: 1.6, facing: 1, pose: breathe(POSES.stand, t, 0.6), t, eyes: 1, rim: { color: GREEN, dir: [1, -0.4], w: 5 } }); });
} });
// t063 — "He traces his family's exile back to one moment:"
registerShot('t063', { draw(g, t, info) {
  holoBg(g, t); const cam = { z: 1 + 0.04 * t };
  layer(g, cam, 1, (g) => { const y = E.H * 0.5, x0 = E.W * 0.9, x1 = E.W * 0.12, k = ease.inOut(prog(t, 0.2, 2.8)), x = lerp(x0, x1, k);
    seg(g, [[x1, y], [x0, y]], 4, alpha(GREEN, 0.35)); for (let i = 0; i <= 10; i++) circle(g, lerp(x1, x0, i / 10), y, 6, alpha(GREEN, 0.5)); seg(g, [[x, y], [x0, y]], 8, GREEN); glow(g, x, y, 80, GREEN, 0.8);
    text(g, 'NOW', x0, y + 60, { size: 34, color: GREEN, font: FONTS.ui, weight: 900, spacing: 4 });
    const a = ease.outBack(prog(t, 2.6, 3.0)); if (a > 0) { g.save(); g.translate(x1, y); g.scale(a, a); ring(g, 0, 0, 40, 6, '#e8fff0'); glow(g, 0, 0, 160, '#e8fff0', 0.5); g.restore(); text(g, '1970', x1, y - 80, { size: 60, color: '#e8fff0', font: FONTS.ui, weight: 900, glow: 20, glowColor: 'rgba(93,255,138,.8)', alpha: clamp(a) }); } });
  label(g, E.W * 0.08, E.H * 0.18, "TRACING THE EXILE", { a: ease.out(prog(t, 0.2, 0.5)), line: GREEN });
} });
// t064 — "the 1970 Tesseract incident."
registerShot('t064', { draw(g, t, info) {
  holoBg(g, t); const [x, y, w, h] = PANEL(), cam = { z: 1 + 0.05 * t };
  layer(g, cam, 1, (g) => holo(g, x, y, w, h, t, (g, x, y, w, h) => asHolo(g, (g) => { pedestal(g, x + w / 2, y + h - 120, 1.4); tesseract(g, x + w / 2, y + h - 300, 1.3, t); })));
  label(g, E.W * 0.16, E.H * 0.88, '1970 · THE TESSERACT INCIDENT', { a: ease.out(prog(t, 0.2, 0.5)), line: GREEN });
} });
// t065 — "And he finds the man who caused it."
registerShot('t065', { draw(g, t, info) {
  holoBg(g, t); const [x, y, w, h] = PANEL(), cam = { z: 1 + 0.05 * t };
  layer(g, cam, 1, (g) => { holo(g, x, y, w, h, t, (g, x, y, w, h) => asHolo(g, (g) => { const px = x + w * 0.3 + t * 90; const p = person(g, 'TONY70', { x: px, y: y + h - 30, s: 1.6, facing: 1, pose: walkPose(t * 5), t, expr: 'smirk', rim: false }); briefcase(g, px + 40, y + h - 170, 1.2); }));
    const tk = ease.out(prog(t, 0.9, 1.3)); if (tk > 0) { const px = x + w * 0.3 + t * 90; g.strokeStyle = alpha('#ff4a3a', tk); g.lineWidth = 5; g.strokeRect(px - 120, y + h - 470, 240, 450); text(g, 'MATCH', px, y + h - 500, { size: 34, color: '#ff6a5a', font: FONTS.ui, weight: 900, spacing: 6, alpha: tk }); } });
} });
// t066 — "A man with his face."
registerShot('t066', { draw(g, t, info) {
  const r = V(220, 170), y = E.H * 0.55;
  g.save(); g.beginPath(); g.rect(0, 0, E.W / 2, E.H); g.clip(); backdrop(g, ['#031008', '#0e3a1e', '#031008']); bigMan(g, E.W * 0.25, y, r, { outfit: { top: 'trench', color: '#1e4a2a' }, hood: '#2a6a3a', expr: 'shocked', rimColor: '#c8ffd8', rimSide: 1 }); g.restore();
  g.save(); g.beginPath(); g.rect(E.W / 2, 0, E.W / 2, E.H); g.clip(); holoBg(g, t); asHolo(g, (g) => bigMan(g, E.W * 0.75, y, r, { outfit: O70.TONY70, glasses: true, expr: 'smirk', rimSide: -1 })); g.restore();
  seg(g, [[E.W / 2, 0], [E.W / 2, E.H]], 6, GREEN); const sy = ((t * 600) % (E.H + 200)) - 100; g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(93,255,138,.25)'; g.fillRect(0, sy, E.W, 6); g.restore();
} });
// t067 — "His father's name. His mother's love."
registerShot('t067', { draw(g, t, info) {
  holoBg(g, t); const [x, y, w, h] = PANEL(), tm = tShot(info, "mother's", 1.45), cam = { z: 1 + 0.04 * t };
  layer(g, cam, 1, (g) => holo(g, x, y, w, h, t, (g, x, y, w, h) => {
    const a = 1 - ease.inOut(prog(t, tm - 0.4, tm)); if (a > 0) { g.save(); g.globalAlpha *= a; text(g, 'STARK', x + w / 2, y + h / 2, { size: 200, color: '#e8fff0', glow: 40, glowColor: 'rgba(93,255,138,.9)', spacing: 20 }); g.restore(); }
    const b = ease.inOut(prog(t, tm - 0.2, tm + 0.3)); if (b > 0) { g.save(); g.globalAlpha *= b; asHolo(g, (g) => { person(g, 'MARIA', { x: x + w / 2 - 60, y: y + h - 20, s: 1.6, facing: 1, pose: { ...POSES.reach, hF: [60, -120], eF: [30, -130] }, t, expr: 'happy', belly: false, rim: false }); hero(g, 'FAN', { x: x + w / 2 + 70, y: y + h - 20, s: 1.6, facing: -1, outfit: { top: 'tshirt', color: '#c0302a', kid: true }, pose: POSES.cheer, t, expr: 'joy', rim: false }); }); g.restore(); glow(g, x + w / 2, y + h / 2, 300, '#ff8aa0', 0.2 * b); }
  }));
} });
// t068 — "Tony Stark."  Iron Man reflected in Doom's eyes
registerShot('t068', { draw(g, t, info) {
  blurLayer(g, 14, (g) => throneHall(g, t, { z: 1.5, y: -150 }, {})); veil(g, '#020604', 0.4);
  const r = V(320, 330) * (1 + 0.05 * t), cx = E.W / 2, cy = E.H * V(0.6, 0.55);
  bigDoom(g, cx, cy, r, { eyes: 0.5, t, rimSide: -1 });
  for (const sx of [-1, 1]) { const ex = cx + (sx > 0 ? r * 0.16 : -r * 0.54), ey = cy - r * 0.32; g.save(); g.beginPath(); rr(g, ex - r * 0.06, ey, r * 0.5, r * 0.17, r * 0.06); g.clip(); g.fillStyle = '#1a0806'; g.fillRect(ex - r * 0.06, ey, r * 0.5, r * 0.17); bigIron(g, ex + r * 0.19, ey + r * 0.1, r * 0.1, { t, eyes: 1 }); g.restore(); }
  nameTag(g, t, cx + r * 1.0, cy - r * 0.9, 'TONY STARK', 0.15, { color: '#ffcf8a', size: V(46, 48) });
} });

// ---------- stolen lives ----------
registerShot('t069', { draw(g, t, info) {
  g.save(); g.beginPath(); g.rect(0, 0, E.W / 2, E.H); g.clip(); const a = home70(g, t, { z: 1.25, x: -260, y: 120 }, {}); layer(g, { z: 1.25, x: -260, y: 120 }, 1, (g) => person(g, 'TONY', { x: E.W / 2 - 640, y: a.GY, s: 1.5, facing: 1, pose: breathe(POSES.cheer, t), t, expr: 'joy', rim: { color: '#ffd59a', dir: [1, -0.5], w: 5 } })); g.restore();
  g.save(); g.beginPath(); g.rect(E.W / 2, 0, E.W / 2, E.H); g.clip(); const b = throneHall(g, t, { z: 1.25, x: 260, y: 120 }, { flashes: [0.5] }); layer(g, { z: 1.25, x: 260, y: 120 }, 1, (g) => person(g, 'VICTOR', { x: E.W / 2 + 640, y: b.GY, s: 1.5, facing: -1, pose: breathe(POSES.sad, t), t, expr: 'sad', hood: true, rim: { color: '#c8ffd8', dir: [0, -1], w: 5 } })); g.restore();
  seg(g, [[E.W / 2, 0], [E.W / 2, E.H]], 6, '#ffffff');
  label(g, E.W * 0.06, E.H * 0.2, 'GIVEN', { a: ease.out(prog(t, 0.6, 0.9)), line: '#ffcf8a' }); label(g, E.W * 0.94, E.H * 0.2, 'DENIED', { a: ease.out(prog(t, tShot(info, 'denied', 2.2), tShot(info, 'denied', 2.2) + 0.3)), line: GREEN, align: 'right' });
} });
// golden memory vignettes (t070–t072)
function memory(g, t, fn) {
  backdrop(g, ['#1a0e06', '#3a2410', '#1a0e06']); glow(g, E.W / 2, E.H / 2, 900, '#ffcf8a', 0.25);
  const cam = { z: 1.4 + 0.06 * t, y: 170 }; layer(g, cam, 1, (g) => { FX.pool(g, E.W / 2, E.H * 0.83, 520, 70, '#ffcf8a', 0.35); glow(g, E.W / 2, E.H * 0.62, 420, '#fff1d0', 0.25); fn(g); });
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255,200,140,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  g.fillStyle = radGrad(g, E.W / 2, E.H / 2, E.H * 0.45, E.W * 0.7, ['rgba(0,0,0,0)', 'rgba(20,10,4,.7)']); g.fillRect(0, 0, E.W, E.H);
  FX.dust(g, t, { count: 40, color: '#ffe2b0', a: 0.5 });
}
registerShot('t070', { draw(g, t, info) { memory(g, t, (g) => { const GY = E.H * 0.82; person(g, 'HOWARD', { x: E.W / 2 - 80, y: GY, s: 1.6, facing: 1, pose: breathe({ ...POSES.reach, hF: [60, -150] }, t), t, expr: 'happy', rim: { color: '#ffd59a', dir: [0, -1], w: 5 } }); hero(g, 'FAN', { x: E.W / 2 + 90, y: GY, s: 1.6, facing: -1, outfit: { top: 'tshirt', color: '#c0302a', kid: true }, pose: breathe(POSES.cheer, t, 1, 2), t, expr: 'joy', rim: { color: '#ffd59a', dir: [0, -1], w: 4 } }); }); } });
registerShot('t071', { draw(g, t, info) { memory(g, t, (g) => { const GY = E.H * 0.82; person(g, 'TONY', { x: E.W / 2 - 110, y: GY, s: 1.6, facing: 1, pose: breathe(POSES.relaxed, t), t, expr: 'smile', rim: { color: '#ffd59a', dir: [0, -1], w: 5 } }); person(g, 'PEPPER', { x: E.W / 2 + 110, y: GY, s: 1.55, facing: -1, pose: breathe(POSES.relaxed, t, 1, 2), t, expr: 'smile', rim: { color: '#ffd59a', dir: [0, -1], w: 5 } }); glow(g, E.W / 2, GY - 460, 120, '#ff8aa0', 0.5); }); } });
registerShot('t072', { draw(g, t, info) { memory(g, t, (g) => { const GY = E.H * 0.84; ['THOR', 'CAP', 'IRON', 'STRANGE', 'SPIDEY'].forEach((id, i) => hero(g, id, { x: E.W / 2 + (i - 2) * 200, y: GY, s: id === 'IRON' ? 1.45 : 1.3, facing: i < 2 ? 1 : -1, pose: breathe(id === 'IRON' ? POSES.cheer : POSES.stand, t, 1, i), t, expr: 'smile', rim: { color: '#ffd59a', dir: [0, -1], w: 5 } })); }); } });
// t073 — "The Stark legacy."
registerShot('t073', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.05 * t, y: -160 };
  const { GY, CX } = rooftop(g, t, cam, {});
  layer(g, cam, 0.6, (g) => { const tx = CX, ty = GY - 200; g.fillStyle = '#141826'; g.fillRect(tx - 160, ty - 900, 320, 900); for (let r = 0; r < 26; r++) for (let c = 0; c < 6; c++) if ((r * 7 + c * 3) % 5) { g.fillStyle = alpha('#ffd59a', 0.6); g.fillRect(tx - 140 + c * 50, ty - 880 + r * 33, 26, 16); } text(g, 'STARK', tx, ty - 940, { size: 110, color: '#e8f0ff', spacing: 14, glow: 30, glowColor: 'rgba(160,200,255,.9)' }); glow(g, tx, ty - 940, 400, '#9fc0ff', 0.25); });
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255,200,140,.25)'; g.fillRect(0, 0, E.W, E.H); g.restore();
} });
// t074 — "A hero's ending."
registerShot('t074', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.05 * t / info.dur, x: -60, y: 200 };
  const { GY, CX, rim } = wasteland(g, t, cam, { variant: 'dusk', sunX: V(260, 100) });
  layer(g, cam, 1, (g) => { poly(g, [[CX - 160, GY], [CX + 60, GY], [CX + 30, GY - 150], [CX - 120, GY - 190]], '#1a1420'); hero(g, 'IRON', { x: CX + 40, y: GY, s: 1.45, facing: 1, pose: { ...POSES.sitBack, head: [-6, -170] }, t, reactor: 0.3, rim: { color: rim, dir: [0.6, -1], w: 5 }, shadow: false }); });
  FX.dust(g, t, { count: 60, color: '#ffd0a0', a: 0.4, speed: 4 });
} });
// t075 — "To Victor, that life wasn't just different."  memories orbit Doom
registerShot('t075', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.05 * t / info.dur, y: 70 };
  const { GY, CX, rim } = throneHall(g, t, cam, { throne: false });
  layer(g, cam, 1, (g) => { hero(g, 'DOOM', { x: CX, y: GY, s: 1.6, facing: 1, pose: breathe(POSES.stand, t, 0.6), t, eyes: 1, rim: { color: GREEN, dir: [0, -1], w: 5 } });
    for (let i = 0; i < 4; i++) { const a = t * 0.6 + i * Math.PI / 2, x = CX + Math.cos(a) * 420, y = GY - 320 + Math.sin(a) * 90, s = 0.75 + 0.15 * Math.sin(a); g.save(); g.globalAlpha *= 0.85; photo(g, x, y, 220 * s, 170 * s, (g, px, py, w, h) => { g.fillStyle = ['#f2c98a', '#e8b07a', '#d8a06a', '#f0d0a0'][i]; g.fillRect(px, py, w, h); glow(g, px + w / 2, py + h / 2, w, '#fff1d0', 0.5); }, { rot: Math.sin(a) * 0.1 }); g.restore(); glow(g, x, y, 160, '#ffcf8a', 0.25); } });
} });
// t076 — "It was stolen."  the fist closes, the memory shatters
registerShot('t076', { draw(g, t, info) {
  const hit = 0.4, after = t > hit, e = Math.exp(-Math.max(0, t - hit) * 4), [sx, sy] = shake(t, 16 * e * (after ? 1 : 0), 25);
  blurLayer(g, 12, (g) => throneHall(g, t, { z: 1.4, x: sx, y: -100 + sy }, { flashes: [hit] })); veil(g, '#020604', 0.35);
  const cx = E.W / 2, cy = E.H * 0.5;
  if (!after) photo(g, cx, cy, 420, 320, (g, px, py, w, h) => { g.fillStyle = '#f2c98a'; g.fillRect(px, py, w, h); person(g, 'TONY', { x: px + w / 2, y: py + h + 60, s: 1.2, facing: 1, pose: POSES.cheer, t, expr: 'joy', rim: false }); });
  else { const R = rng(4); for (let i = 0; i < 24; i++) { const a = R() * 6.28, d = (t - hit) * (300 + R() * 700); g.save(); g.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d); g.rotate(a + (t - hit) * 4); poly(g, [[-20, -14], [24, -8], [10, 18]], alpha('#f2c98a', 1 - prog(t, hit, info.dur))); g.restore(); } FX.rings(g, cx, cy, t - hit, { count: 3, r0: 40, r1: 700, speed: 1, color: '#c8ffd8', a: 0.6 * e }); }
  const close = ease.in(prog(t, 0, hit)); for (const [dx, dy, c] of [[-6, -6, '#9dffb6'], [0, 0, null]]) { g.save(); g.translate(dx, dy); const fx = cx + 260 - close * 200; seg(g, [[fx + 60, cy + 40], [E.W + 300, cy + 300]], 130, c || '#24603a'); seg(g, [[fx + 30, cy + 20], [fx + 260, cy + 110]], 120, c || '#8d949c'); rr(g, fx - 90, cy - 80, 180, 160, 50); g.fillStyle = c || '#a7aeb6'; g.fill(); g.restore(); }
} });
// t077 — "And that could completely change one of Doom's most chilling lines."
registerShot('t077', { draw(g, t, info) {
  cinema(g, t, { z: 1.0 + 0.05 * t }, { screenColor: '#5dff8a', screenGlow: 1.2, rows: 3, screen: (g, x, y, w, h, t) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#020a04', '#0a2a14', '#020a04']); g.fillRect(x, y, w, h); g.save(); g.globalAlpha *= 0.9; bigDoom(g, x + w / 2, y + h * 0.62, h * 0.34, { eyes: 1, t }); g.restore(); } });
} });
// t078 — "In the Doomsday trailer, he tells the heroes they have lived"
registerShot('t078', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * t / info.dur, y: 40 };
  const { GY, CX, rim } = throneHall(g, t, cam, { flashes: [0.4] });
  layer(g, cam, 1, (g) => { hero(g, 'DOOM', { x: CX + 280, y: GY - 40, s: 1.55, facing: -1, pose: breathe(POSES.point, t, 0.6), t, eyes: 1, rim: { color: rim, dir: [0, -1], w: 5 } });
    [['CAP', -520], ['THOR', -360], ['SPIDEY', -200], ['REED', -40]].forEach(([id, dx], i) => hero(g, id, { x: CX + dx, y: GY + 20, s: 1.2, facing: 1, pose: breathe(POSES.kneel, t, 1, i), t, expr: 'worried', look: [0.6, -0.4], rim: { color: rim, dir: [0.6, -1] } })); });
} });
// t079 — "stolen lives, and now they must give them back."
registerShot('t079', { draw(g, t, info) {
  blurLayer(g, 14, (g) => throneHall(g, t, { z: 1.5, y: -150 }, { flashes: [0.15] })); veil(g, '#020604', 0.45);
  bigDoom(g, E.W / 2, E.H * V(0.56, 0.5), V(260, 300) * (1 + 0.04 * t), { eyes: 1, t, rimSide: -1 });
  const k = ease.out(prog(t, 0.05, 0.6)); text(g, 'STOLEN LIVES', E.W / 2, E.H * 0.78, { size: V(120, 96) * (0.9 + 0.1 * k), color: '#e8fff0', glow: 40, glowColor: 'rgba(93,255,138,.95)', spacing: 10, alpha: k * (1 - prog(t, info.dur - 0.3, info.dur)), stroke: 10, strokeColor: '#020604' });
} });
// t080 — "Maybe he isn't only talking about the Fantastic Four."
registerShot('t080', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.04 * t, y: 90 };
  const { GY, CX, rim } = retroCity(g, t, cam);
  const sh = ease.inOut(prog(t, 0.2, info.dur));
  layer(g, cam, 1, (g) => [['SUE', -330], ['REED', -110], ['JOHNNY', 110], ['BEN', 340]].forEach(([id, dx], i) => hero(g, id, { x: CX + dx, y: GY, s: 1.35, facing: 1, pose: breathe(POSES.ready, t, 1, i), t, expr: 'worried', look: [0.6, -0.6], rim: { color: rim, dir: [0, -1], w: 5 }, flame: 0 })));
  g.save(); g.globalAlpha *= 0.75 * sh; g.fillStyle = linGrad(g, E.W, 0, E.W * 0.2, 0, ['rgba(2,10,4,1)', 'rgba(2,10,4,0)']); g.fillRect(0, 0, E.W, E.H); bigDoom(g, E.W * 0.85, E.H * 0.45, V(380, 300), { eyes: 1, t }); g.restore();
} });
// t081 — "Maybe he's talking about Tony."
registerShot('t081', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.06 * t / info.dur, y: 60 };
  const { GY, CX } = battle(g, t, cam);
  layer(g, cam, 0.3, (g) => { g.save(); g.globalAlpha *= 0.8 * ease.out(prog(t, 0, 1.0)); bigDoom(g, CX, GY - V(520, 900), V(380, 320), { eyes: ease.out(prog(t, 0.9, 1.3)), t }); g.restore(); glow(g, CX, GY - 600, 700, GREEN, 0.2); });
  layer(g, cam, 1, (g) => hero(g, 'IRON', { x: CX, y: GY, s: 1.0, facing: 1, pose: breathe(POSES.ready, t), t, rim: { color: '#9dffb6', dir: [0, -1], w: 4 } }));
  nameTag(g, t, E.W * 0.6, E.H * 0.7, 'TONY', tShot(info, 'Tony', 1.5) - 0.1, { color: '#ffcf8a' });
} });
