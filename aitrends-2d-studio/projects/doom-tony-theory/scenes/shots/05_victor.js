// shots/05_victor.js — Howard's son is born in Latveria and becomes Victor: brilliant, proud, raised on the
// story of the stolen cube; he befriends the Four, loses everything, and Doom is forged.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { lab } from '/projects/avengers-doomsday-watchlist/scenes/sets/retro.js';
import { hero, bigIron } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { nameTag, tShot } from '/projects/avengers-doomsday-watchlist/scenes/tpl.js';
import { person, tesseract, photo, maskPlate, O70, GREEN } from '../kit70.js';
import { home70, latveria, forge, anvil, sparks } from '../sets70.js';

const bundle = (g, x, y, s = 1) => { g.fillStyle = '#e8dcc8'; g.beginPath(); g.ellipse(x, y, 26 * s, 16 * s, -0.2, 0, 7); g.fill(); circle(g, x - 18 * s, y - 8 * s, 11 * s, '#f2e4cc'); circle(g, x - 21 * s, y - 10 * s, 1.8 * s, S().ink); };

// t051 — "Howard's son is born in that world."
registerShot('t051', { draw(g, t, info) {
  const cam = { z: 1.35 + 0.05 * t / info.dur, y: 120 };
  const { GY, CX, rim } = home70(g, t, cam, { night: true });
  layer(g, cam, 1, (g) => { person(g, 'HOWARD', { x: CX + 130, y: GY, s: 1.5, facing: -1, pose: breathe(POSES.stand, t, 1, 1), t, expr: 'happy', look: [0.4, 0.5], rim: { color: rim, dir: [-1, -0.5], w: 5 } }); const m = person(g, 'MARIA', { x: CX - 60, y: GY, s: 1.48, facing: 1, pose: breathe(POSES.holdFront, t), t, expr: 'happy', belly: false, look: [0.4, 0.6], rim: { color: rim, dir: [-1, -0.5], w: 5 } }); bundle(g, CX - 60 + 34 * 1.48, GY - 155 * 1.48 / 1.0 * 0.95 + 4, 1.1); glow(g, CX - 10, GY - 230, 160, '#ffcf8a', 0.25); });
  nameTag(g, t, E.W * 0.1, E.H * 0.2, 'LATVERIA', 0.2, { color: GREEN });
} });
// t052 — "But he never becomes Tony Stark."
registerShot('t052', { draw(g, t, info) {
  const cam = { z: 1.2 + 0.04 * t, y: 80 };
  const { GY, CX, rim } = latveria(g, t, cam, {});
  const fade = 1 - ease.inOut(prog(t, 0.4, 1.8));
  if (fade > 0) { g.save(); g.globalAlpha *= 0.55 * fade; bigIron(g, E.W / 2, E.H * 0.36, V(200, 180), { t, eyes: fade }); g.restore(); FX.dust(g, t, { count: 40, color: '#ffcf8a', a: 0.5 * fade, area: [E.W / 2 - 300, E.H * 0.1, 600, 500] }); }
  layer(g, cam, 1, (g) => person(g, 'VKID', { x: CX, y: GY, s: 1.5, facing: 1, pose: breathe(POSES.stand, t), t, expr: 'neutral', look: [0, -1], rim: { color: rim, dir: [0, -1], w: 4 } }));
} });
// t053 — "He becomes Victor von Doom."
registerShot('t053', { draw(g, t, info) {
  const cam = { z: 1.45 + 0.05 * t, x: -60, y: 150 };
  const { GY, CX, rim } = latveria(g, t, cam, {});
  layer(g, cam, 1, (g) => person(g, 'VKID', { x: CX - 80, y: GY, s: 1.7, facing: 1, pose: breathe(POSES.crossArms, t), t, expr: 'determined', rim: { color: '#c8ffd8', dir: [0, -1], w: 5 } }));
  nameTag(g, t, E.W * 0.58, E.H * 0.34, 'VICTOR VON DOOM', tShot(info, 'Victor', 0.9) - 0.1, { color: GREEN, size: V(46, 48) });
} });
// t054 — "Brilliant."  building a machine
registerShot('t054', { draw(g, t, info) {
  const cam = { z: 1.35, y: 120 };
  const { GY, CX, rim } = forge(g, t, cam);
  layer(g, cam, 1, (g) => { rr(g, CX - 40, GY - 150, 360, 20, 6); g.fillStyle = '#3a2a22'; g.fill(); seg(g, [[CX - 20, GY - 130], [CX - 20, GY]], 10, '#2a1e18'); seg(g, [[CX + 300, GY - 130], [CX + 300, GY]], 10, '#2a1e18');
    const mx = CX + 150, my = GY - 230; for (let i = 0; i < 3; i++) { g.save(); g.translate(mx - 70 + i * 70, my + (i % 2) * 20); g.rotate(t * (i % 2 ? -2 : 2)); ring(g, 0, 0, 30, 10, '#8a8f99'); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; seg(g, [[Math.cos(a) * 30, Math.sin(a) * 30], [Math.cos(a) * 42, Math.sin(a) * 42]], 8, '#8a8f99'); } g.restore(); } circle(g, mx, my - 70, 24, GREEN); glow(g, mx, my - 70, 120, GREEN, 0.6);
    person(g, 'VICTOR', { x: CX - 200, y: GY, s: 1.5, facing: 1, pose: breathe({ ...POSES.reach, hF: [70, -150] }, t), t, expr: 'determined', rim: { color: rim, dir: [1, -0.5], w: 5 } });
    sparks(g, mx - 40, my, t, 1, 3); });
} });
// t055 — "Proud."
registerShot('t055', { draw(g, t, info) {
  const cam = { z: 1.4, y: 260 };
  const { GY, CX } = latveria(g, t, cam, {});
  layer(g, cam, 1, (g) => { rr(g, CX - 260, GY - 40, 520, 40, 4); g.fillStyle = '#3a3a36'; g.fill(); for (let i = 0; i < 9; i++) seg(g, [[CX - 240 + i * 60, GY - 40], [CX - 240 + i * 60, GY - 110]], 10, '#3a3a36'); seg(g, [[CX - 260, GY - 112], [CX + 260, GY - 112]], 14, '#4a4a46');
    person(g, 'VICTOR', { x: CX, y: GY - 40, s: 1.6, facing: 1, pose: breathe(POSES.crossArms, t), t, expr: 'smirk', hood: true, rim: { color: '#ffd6a8', dir: [0.6, -1], w: 5 }, shadow: false }); });
} });
// t056 — "Raised on stories of a stolen cube, and a country that turned its back on his father."
registerShot('t056', { draw(g, t, info) {
  const cam = { z: 1.3 + 0.05 * t / info.dur, x: -150, y: 120 };
  const { GY, CX, rim } = home70(g, t, cam, { night: true });
  layer(g, cam, 1, (g) => {
    const fx = CX - V(560, 320); const tc = tShot(info, 'cube', 1.9), tb = tShot(info, 'country', 2.6);
    const a1 = ease.out(prog(t, tc - 0.3, tc + 0.3)); if (a1 > 0) { g.save(); g.globalAlpha *= 0.8 * a1; tesseract(g, fx + 20, GY - 470 - t * 10, 0.9, t); g.restore(); }
    const a2 = ease.out(prog(t, tb - 0.2, tb + 0.4)); if (a2 > 0) { g.save(); g.globalAlpha *= 0.55 * a2; for (const dx of [-90, 0, 90]) person(g, 'AGENT70', { x: fx + 240 + dx, y: GY - 260, s: 0.8, facing: 1, pose: POSES.crossArms, t, rim: false, shadow: false }); g.restore(); }
    person(g, 'HOWARD', { x: CX - 40, y: GY, s: 1.5, facing: -1, pose: breathe({ ...POSES.sit, eF: [28, -150], hF: [56, -164] }, t), t, expr: 'sad', old: true, rim: { color: rim, dir: [-1, -0.5], w: 5 }, shadow: false });
    person(g, 'VKID', { x: CX - 300, y: GY, s: 1.3, facing: 1, pose: breathe(POSES.sit, t, 1, 2), t, expr: 'determined', look: [0.4, -0.5], rim: { color: rim, dir: [-1, -0.5], w: 4 }, shadow: false });
  });
} });
// t057 — "He meets Reed Richards."
registerShot('t057', { draw(g, t, info) {
  const cam = { z: 1.35, y: 120 };
  const { GY, CX, rim } = lab(g, t, cam);
  const shake2 = ease.inOut(prog(t, 0.4, 0.9));
  layer(g, cam, 1, (g) => { person(g, 'VICTOR', { x: CX - 120, y: GY, s: 1.55, facing: 1, pose: breathe({ ...POSES.reach, hF: [64 - 10 * shake2, -140 + Math.sin(t * 14) * 4 * shake2], eF: [36, -150] }, t), t, expr: 'smile', rim: { color: rim, dir: [0, -1], w: 5 } }); hero(g, 'REED', { x: CX + 120, y: GY, s: 1.55, facing: -1, pose: breathe({ ...POSES.reach, hF: [64 - 10 * shake2, -140 + Math.sin(t * 14) * 4 * shake2], eF: [36, -150] }, t, 1, 2), t, expr: 'happy', rim: { color: rim, dir: [0, -1], w: 5 } }); });
  nameTag(g, t, E.W * 0.6, E.H * 0.86, 'REED RICHARDS', tShot(info, 'Reed', 0.6) - 0.1, { color: '#7fb0ff' });
} });
// t058 — "Sue Storm. Johnny Storm. Ben Grimm."
registerShot('t058', { draw(g, t, info) {
  const cam = { z: 1.1, y: 70 };
  const { GY, CX, rim } = lab(g, t, cam);
  const at = [tShot(info, 'Sue', 0.15), tShot(info, 'Johnny', 1.26), tShot(info, 'Ben', 2.49)];
  layer(g, cam, 1, (g) => {
    person(g, 'VICTOR', { x: CX - 470, y: GY, s: 1.3, facing: 1, pose: breathe(POSES.stand, t), t, expr: 'smile', rim: { color: rim, dir: [0, -1] } }); hero(g, 'REED', { x: CX - 270, y: GY, s: 1.3, facing: 1, pose: breathe(POSES.relaxed, t, 1, 2), t, expr: 'happy', rim: { color: rim, dir: [0, -1] } });
    [['SUE', -40], ['JOHNNY', 190], ['BEN', 430]].forEach(([id, dx], i) => { const k = ease.outBack(prog(t, at[i] - 0.1, at[i] + 0.3)); if (k <= 0) return; hero(g, id, { x: CX + dx, y: GY + (1 - k) * 40, s: 1.3, facing: -1, pose: breathe(i === 1 ? POSES.wave : POSES.relaxed, t, 1, i), t, expr: 'happy', rim: { color: rim, dir: [0, -1] }, alpha: clamp(k), flame: id === 'JOHNNY' ? 0.6 : 0 }); });
  });
  [['SUE STORM', 0], ['JOHNNY STORM', 1], ['BEN GRIMM', 2]].forEach(([s, i]) => nameTag(g, t, E.W * (0.3 + i * 0.22), E.H * 0.9, s, at[i], { color: '#7fb0ff', size: V(32, 36) }));
} });
// t059 — "The same kind of bonds the Fantastic Four share in their own world."  the photo
function friendsPhoto(g, t, cx, cy, o = {}) {
  photo(g, cx, cy, 760, 560, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#f2c98a', '#c98a5a']); g.fillRect(x, y, w, h); glow(g, x + w * 0.7, y + h * 0.3, 300, '#fff1d0', 0.4); const gy = y + h - 10;
    person(g, 'VICTOR', { x: x + 120, y: gy, s: 1.2, facing: 1, pose: POSES.relaxed, t: 0, expr: 'happy', rim: false });
    [['REED', 250], ['SUE', 370], ['JOHNNY', 490], ['BEN', 620]].forEach(([id, dx], i) => hero(g, id, { x: x + dx, y: gy, s: id === 'BEN' ? 1.0 : 1.2, facing: -1, pose: i === 2 ? POSES.cheer : POSES.relaxed, t: 0, expr: 'happy', rim: false })); }, { rot: o.rot ?? -0.04, label: 'BEST FRIENDS', burn: o.burn });
}
registerShot('t059', { draw(g, t, info) {
  blurLayer(g, 12, (g) => lab(g, t, { z: 1.4, y: 80 })); veil(g, '#0a0806', 0.4);
  layer(g, { z: 1 + 0.05 * t }, 1, (g) => friendsPhoto(g, t, E.W / 2, E.H * 0.52, {}));
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.4 });
} });
// t060 — "But Victor loses everything."  the experiment explodes
registerShot('t060', { draw(g, t, info) {
  const hit = 0.2, e = Math.exp(-Math.max(0, t - hit) * 2), [sx, sy] = shake(t, 18 * e, 25);
  const cam = { z: 1.2, x: sx, y: 100 + sy };
  const { GY, CX } = lab(g, t, cam);
  layer(g, cam, 1, (g) => { const fl = ease.out(prog(t, hit, hit + 0.8)); person(g, 'VICTOR', { x: CX - 100 - fl * 300, y: GY - Math.sin(fl * Math.PI) * 120, s: 1.5, facing: 1, pose: POSES.fall, rot: -fl * 1.2, t, expr: 'shocked', rim: { color: '#9dffb6', dir: [1, -0.4], w: 5 } });
    glow(g, CX + 260, GY - 250, 700 * e + 200, GREEN, 0.8); FX.rings(g, CX + 260, GY - 250, t - hit, { count: 4, r0: 40, r1: 900, speed: 1, color: '#c8ffd8', a: 0.6 * e }); FX.speedLines(g, t, { cx: CX + 260, cy: GY - 250, a: 0.4 * e }); });
  g.save(); g.translate(E.W * 0.78, E.H * 0.72); g.scale(0.38, 0.38); friendsPhoto(g, t, 0, 0, { rot: 0.1, burn: ease.in(prog(t, 0.6, info.dur)) }); g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(160,255,190,${0.7 * Math.exp(-(t - hit) * 6) * (t > hit ? 1 : 0)})`; g.fillRect(0, 0, E.W, E.H); g.restore();
} });
// t061 — "And from that loss, Doctor Doom is born."  the mask is forged
registerShot('t061', { draw(g, t, info) {
  const cam = { z: 1.4 + 0.06 * t / info.dur, y: 160 };
  const { GY, CX } = forge(g, t, cam);
  const hits = [0.6, 1.4, 2.2], h = hits.reduce((m, k) => Math.max(m, t > k ? Math.exp(-(t - k) * 8) : 0), 0), cool = ease.inOut(prog(t, 1.6, info.dur));
  layer(g, cam, 1, (g) => { anvil(g, CX, GY, 1.3); const mx = CX - 10, my = GY - 200;
    g.save(); g.translate(mx, my); g.scale(1, 0.7); maskPlate(g, 0, 0, 70, { eyes: cool, t }); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= 1 - cool; g.fillStyle = 'rgba(255,120,40,.55)'; rr(g, mx - 58, my - 70, 116, 136, 30); g.fill(); g.restore(); glow(g, mx, my, 220, cool > 0.5 ? GREEN : '#ff8a3a', 0.5);
    const back = hits.reduce((m, k) => Math.min(m, Math.abs(t - k)), 9), up = Math.min(1, back * 4);
    g.save(); g.translate(mx + 160, my - 40 - up * 160); g.rotate(-0.6 + up * 0.5); seg(g, [[0, 0], [140, 200]], 16, '#3a2a20'); rr(g, -50, -40, 100, 60, 8); g.fillStyle = '#5a5e66'; g.fill(); g.restore();
    if (h > 0.05) { sparks(g, mx + 40, my - 30, t, h, Math.floor(t * 3)); FX.rings(g, mx + 40, my - 30, 1 - h, { count: 2, r0: 20, r1: 200, speed: 1, color: '#ffd27a', a: 0.6 * h }); } });
} });
