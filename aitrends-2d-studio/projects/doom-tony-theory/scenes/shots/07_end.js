// shots/07_end.js — Franklin and the power to rewrite reality, why RDJ's casting matters, the reprise of the
// unmasking, the theory disclaimer, the question, like/subscribe, the finale and the end screen.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, alpha, shade, mix, glow, seg, circle, ring, rr, poly, text, measure, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { throneHall, throneChair } from '/projects/avengers-doomsday-watchlist/scenes/sets/throne.js';
import { cosmos } from '/projects/avengers-doomsday-watchlist/scenes/sets/cosmos.js';
import { living } from '/projects/avengers-doomsday-watchlist/scenes/sets/living.js';
import { stage } from '/projects/avengers-doomsday-watchlist/scenes/sets/misc.js';
import { hero, bigDoom, bigIron, wpt, OUT } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { filmCase, movie, universe, cracks, nebula, stamp, label, thumbsUp, bell, subscribePill } from '/projects/avengers-doomsday-watchlist/scenes/props.js';
import { couchShot, nameTag, tShot } from '/projects/avengers-doomsday-watchlist/scenes/tpl.js';
import { person, maskPlate, O70, GREEN, CUBE } from '../kit70.js';
import { nursery } from '../sets70.js';
import { faceReveal } from './01_open.js';
import { desk } from './03_rule.js';

const TONY_RIM = '#ffd59a';
const HUES = ['#5a7cff', '#ff6a8a', '#3ad0c0', '#c06aff', '#ffd36a', '#9fc0ff', '#ff9a5a'];

// t082 — "And remember the end of The Fantastic Four: First Steps?"
registerShot('t082', { draw(g, t, info) {
  const m = movie(1), cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: -20 * t };
  layer(g, cam, 0.2, (g) => { backdrop(g, ['#05040a', shade(m.c1, -0.2), '#05040a']); nebula(g, t, { c1: m.accent, c2: shade(m.c1, 0.3), seed: 11 }); FX.stars(g, t, { count: 90, seed: 14, area: [0, 0, E.W, E.H] }); glow(g, E.W * 0.36, E.H * 0.5, 700, m.accent, 0.18); });
  const k = ease.out(prog(t, 0, 0.6));
  layer(g, cam, 1.1, (g) => filmCase(g, E.W * 0.34 + (1 - k) * 900, E.H * 0.52 + Math.sin(t * 1.6) * 8, V(400, 380), m, { t, glowK: 0.6, tilt: 0.05 * Math.sin(t * 0.9) - 0.04, a: k, rank: false }));
  const kT = ease.out(prog(t, 0.6, 1.1));
  text(g, 'THE ENDING', E.W * 0.7, E.H * 0.44, { size: V(110, 90), color: S().ui.cream, glow: 24, glowColor: alpha(m.accent, 0.7), alpha: kT, spacing: 6 });
  text(g, 'REMEMBER?', E.W * 0.7, E.H * 0.56, { size: V(44, 44), color: m.accent, font: FONTS.ui, weight: 900, alpha: ease.out(prog(t, 1.0, 1.5)), spacing: 12 });
  FX.dust(g, t, { count: 50, color: m.accent, a: 0.45 });
} });

// ---------- Franklin ----------
// t083 — "Doom quietly visits Reed and Sue's son, Franklin."  Victor kneels, mask in hand
registerShot('t083', { draw(g, t, info) {
  const cam = { z: 1.6 + 0.06 * ease.inOut(t / info.dur), x: 140, y: 200 };
  const { GY, CX, rim } = nursery(g, t, cam), tF = tShot(info, 'Franklin.', 2.5);
  layer(g, cam, 1, (g) => {
    const f = person(g, 'FRANKLIN', { x: CX - 10, y: GY, s: 1.4, facing: 1, pose: breathe(t > tF - 0.4 ? { ...POSES.reach, eF: [26, -170], hF: [46, -190] } : POSES.stand, t), t, expr: t > tF - 0.4 ? 'happy' : 'surprised', look: [0.6, -0.5], rim: { color: rim, dir: [1, -0.6], w: 4 } });
    glow(g, f.x, GY - 140, 160, '#7fd0ff', 0.12 + 0.08 * Math.sin(t * 3));
    const v = person(g, 'VICTOR', { x: CX + 300, y: GY, s: 1.6, facing: -1, pose: breathe({ ...POSES.kneel, eF: [30, -112], hF: [56, -124] }, t, 0.5), t, expr: 'sad', hood: true, look: [0.6, 0.2], rim: { color: rim, dir: [-1, -0.6], w: 5 } });
    const [hx, hy] = wpt(v, 'hB'); glow(g, hx, hy - 16, 70, GREEN, 0.25); maskPlate(g, hx, hy - 16, 32, { eyes: 0.3, t });
  });
  veil(g, '#040814', 0.2);
} });
// the picture bends like a heat haze (copies the frame back in shifted strips)
let _wc = null;
function warp(g, amp, t) {
  if (amp < 0.5) return; const c = g.canvas, W = c.width, H = c.height, sc = W / E.W;
  if (!_wc || _wc.width !== W || _wc.height !== H) { _wc = document.createElement('canvas'); _wc.width = W; _wc.height = H; }
  const x = _wc.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H); x.drawImage(c, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const step = Math.max(2, Math.round(10 * sc));
  for (let y = 0; y < H; y += step) { const dx = Math.sin(y / sc * 0.011 + t * 4) * amp * sc; g.drawImage(_wc, 0, y, W, step, dx, y, W, step); }
  g.restore();
}
// t084 — "In the comics, Franklin can reshape reality itself."
registerShot('t084', { draw(g, t, info) {
  const tR = tShot(info, 'reshape', 1.74), k = ease.inOut(prog(t, tR - 0.8, tR + 0.6));
  const cam = { z: 1.8 + 0.08 * t / info.dur, x: 20, y: 250, r: 0.03 * k * Math.sin(t * 1.4) };
  const { GY, CX } = nursery(g, t, cam);
  layer(g, cam, 1, (g) => {
    const R = rng(8); for (let i = 0; i < 9; i++) { const a = t * (0.6 + R() * 0.5) + i * 0.7, rad = 150 + R() * 140, x = CX + 20 + Math.cos(a) * rad, y = GY - 170 - k * 80 + Math.sin(a) * rad * 0.45 - R() * 40, s = (18 + R() * 16) * k; if (s < 1) continue; g.save(); g.translate(x, y); g.rotate(t * (1 + R()) + i); rr(g, -s, -s, s * 2, s * 2, s * 0.3); g.fillStyle = HUES[i % HUES.length]; g.fill(); g.restore(); }
    const f = person(g, 'FRANKLIN', { x: CX + 20, y: GY, s: 1.4, facing: 1, pose: breathe(k > 0.2 ? POSES.cheer : POSES.holdFront, t), t, expr: k > 0.3 ? 'awe' : 'happy', look: [0.2, -0.8], rim: { color: '#bfe8ff', dir: [0, -1], w: 4 } });
    for (const h of ['hF', 'hB']) { const [x, y] = wpt(f, h); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, x, y, 40 + 140 * k, '#7fd0ff', 0.5 + 0.4 * k); g.restore(); circle(g, x, y, 6 + 4 * k, '#ffffff'); }
    FX.rings(g, CX + 20, GY - 150, t, { count: 4, r0: 60, r1: 520, speed: 0.6, color: '#bfe8ff', a: 0.35 * k });
  });
  warp(g, 22 * k, t);
  if (k > 0) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(120,200,255,${0.3 * k})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });

// ---------- what Doom really wants ----------
function bubbleWheel(g, t, cx, cy, dim = 0) {
  for (let i = 0; i < 7; i++) { const a = t * 0.35 + i * (Math.PI * 2 / 7);
    universe(g, cx + Math.cos(a) * V(560, 380), cy + Math.sin(a) * V(210, 300), 70, { hue: HUES[i], t, seed: i + 3, a: 0.92, dim: 0.6 * dim }); }
}
// t085 — "What if Doom doesn't want to rule the multiverse at all?"
registerShot('t085', { draw(g, t, info) {
  const cam = { z: 1.15 + 0.05 * ease.inOut(t / info.dur), y: 40 };
  const { GY, CX } = throneHall(g, t, cam, { throne: false, flashes: [0.3] });
  const tA = tShot(info, 'all?', 2.6), dim = ease.inOut(prog(t, tA - 0.9, tA));
  layer(g, cam, 1, (g) => {
    bubbleWheel(g, t, CX, GY - 470, dim);
    const seat = throneChair(g, CX, GY - 40, 1);
    hero(g, 'DOOM', { x: CX, y: seat + 72 * 1.6, s: 1.6, facing: 1, pose: breathe(POSES.sit, t, 0.5), t, eyes: 1, look: [lerp(0.6, -0.4, dim), 0], rim: { color: GREEN, dir: [0, -1], w: 5 } });
  });
} });
// Doom's gauntlet: green sleeve from the right, palm, four fingers that curl as `close` -> 1
function gauntletHand(g, x, y, s, close = 0) {
  for (const [dx, dy, c] of [[-6, -6, '#9dffb6'], [0, 0, null]]) {
    g.save(); g.translate(dx, dy);
    seg(g, [[x + 150 * s, y + 50 * s], [E.W + 700, y + 460 * s]], 160 * s, c || '#24603a');
    seg(g, [[x + 70 * s, y + 18 * s], [x + 230 * s, y + 80 * s]], 128 * s, c || '#8d949c');
    for (let i = 0; i < 4; i++) {
      const fy = y - 40 * s + i * 38 * s, L = (140 - i * 10) * s * (1 - 0.5 * close), a1 = Math.PI + (i - 1.2) * 0.2 * (1 - close), a2 = a1 - close * 1.5;
      const p0 = [x - 60 * s, fy], p1 = [p0[0] + Math.cos(a1) * L * 0.55, p0[1] + Math.sin(a1) * L * 0.55], p2 = [p1[0] + Math.cos(a2) * L * 0.5, p1[1] + Math.sin(a2) * L * 0.5];
      seg(g, [p0, p1, p2], 30 * s, c || '#b8bec6');
    }
    const ta = -Math.PI * 0.72 - close * 0.25; seg(g, [[x - 30 * s, y - 60 * s], [x - 30 * s + Math.cos(ta) * 100 * s, y - 60 * s + Math.sin(ta) * 100 * s]], 34 * s, c || '#b8bec6');
    rr(g, x - 80 * s, y - 80 * s, 170 * s, 170 * s, 46 * s); g.fillStyle = c || '#a7aeb6'; g.fill();
    if (!c) { g.fillStyle = 'rgba(255,255,255,.2)'; rr(g, x - 64 * s, y - 70 * s, 50 * s, 140 * s, 20 * s); g.fill(); }
    g.restore();
  }
}
// t086 — "What if he wants to rewrite it, and take back the life he believes was his?"
registerShot('t086', { draw(g, t, info) {
  const d = info.dur, cam = { z: 1.0 + 0.1 * ease.inOut(t / d) };
  const tR = tShot(info, 'rewrite', 1.2), tB = tShot(info, 'back', 2.6), tH = tShot(info, 'his?', 3.9);
  const R0 = rng(5), bubbles = Array.from({ length: 9 }, (_, i) => ({ x: R0() * E.W, y: R0() * E.H, r: 40 + R0() * 60, hue: HUES[i % HUES.length], seed: 30 + i, a: 0.6, dim: 0.4 }));
  cosmos(g, t, cam, { bubbles, bubbleDepth: 0.4 });
  const cx = E.W * 0.4, cy = E.H * 0.5, R = V(240, 200), rw = ease.inOut(prog(t, tR, tR + 1.4)), close = ease.inOut(prog(t, tB, tH));
  layer(g, cam, 1, (g) => {
    universe(g, cx, cy, R, { hue: '#ffb050', t, seed: 21, inner: '#2a1a0a' });
    g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip(); const gy = cy + R * 0.46;
    person(g, 'TONY', { x: cx - 70, y: gy, s: 0.95, facing: 1, pose: breathe(POSES.relaxed, t), t, expr: 'smile', rim: { color: TONY_RIM, dir: [0, -1] } });
    hero(g, 'FAN', { x: cx + 10, y: gy, s: 0.95, facing: -1, outfit: { top: 'tshirt', color: '#c0302a', kid: true }, pose: breathe(POSES.cheer, t, 1, 2), t, expr: 'joy', rim: { color: TONY_RIM, dir: [0, -1] } });
    person(g, 'PEPPER', { x: cx + 80, y: gy, s: 0.92, facing: -1, pose: breathe(POSES.relaxed, t, 1, 3), t, expr: 'smile', rim: { color: TONY_RIM, dir: [0, -1] } });
    if (rw > 0) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(60,220,110,${0.22 * rw})`; g.fillRect(cx - R, cy - R, R * 2, R * 2); }
    g.restore();
    if (rw > 0) cracks(g, cx, cy, { seed: 6, len: R * 1.1 * rw, count: 6, color: '#e8fff0', glowC: GREEN, a: clamp(rw * 1.5) });
  });
  const reach = ease.inOut(prog(t, 0.1, tB));
  gauntletHand(g, lerp(E.W + 260, cx + R + 70, reach), cy + 30, 1.3, close);
  if (close > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, cx + R * 0.6, cy, 400, GREEN, 0.25 * close); g.restore(); }
} });

// ---------- the casting ----------
// t087 — "That's what could make Robert Downey Jr.'s casting so meaningful."
const HOLD2 = { ...POSES.stand, eF: [30, -150], hF: [58, -168], eB: [-30, -150], hB: [-58, -168] };
registerShot('t087', { draw(g, t, info) {
  const cam = { z: 1.35 + 0.06 * ease.inOut(t / info.dur), y: 120 }, on = t > 0.2 ? 1 : 0;
  const { GY, CX } = stage(g, t, cam, { spots: [{ x: E.W / 2 + 130, k: on, color: '#ffcf8a', w: 260 }, { x: E.W / 2 - 130, k: on, color: GREEN, w: 260 }] });
  layer(g, cam, 1, (g) => {
    const a = person(g, 'TONY', { x: CX, y: GY, s: 1.6, facing: 1, pose: breathe(HOLD2, t, 0.6), t, expr: 'smirk', reactor: 0, rim: { color: '#ffe8c8', dir: [0, -1], w: 5 }, alpha: 0.2 + 0.8 * on });
    const [fx, fy] = wpt(a, 'hF'), [bx, by] = wpt(a, 'hB');
    g.save(); g.globalAlpha *= 0.2 + 0.8 * on; glow(g, fx + 10, fy - 50, 160, '#ffb050', 0.3); bigIron(g, fx + 10, fy - 50, 48, { t, empty: true, rimSide: 1 });
    glow(g, bx - 10, by - 54, 160, GREEN, 0.3); maskPlate(g, bx - 10, by - 54, 40, { eyes: 0.8, t }); g.restore();
  });
  nameTag(g, t, E.W * 0.62, E.H * 0.24, 'ROBERT DOWNEY JR.', tShot(info, 'Robert', 1.15) - 0.05, { color: '#ffcf8a' });
} });
// t088 — "When the mask comes off, the Avengers see Tony Stark."  (reprise)
registerShot('t088', { draw(g, t, info) {
  faceReveal(g, t, info, 'tony');
  const r = V(300, 320) * (1 + 0.035 * t); maskPlate(g, E.W / 2, E.H * V(0.6, 0.55), r, { lift: ease.inOut(prog(t, tShot(info, 'comes', 0.75) - 0.1, tShot(info, 'off,', 1.05) + 0.4)), t });
} });
// t089 — "Reed and Sue see Victor von Doom."  (reprise)
registerShot('t089', { draw(g, t, info) {
  faceReveal(g, t, info, 'victor');
  const sw = prog(t, 0.1, 0.7); if (sw > 0 && sw < 1) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(E.W / 2, E.H / 2); g.rotate(0.4); g.fillStyle = linGrad(g, -80, 0, 80, 0, ['rgba(93,255,138,0)', 'rgba(160,255,190,.4)', 'rgba(93,255,138,0)']); g.fillRect(-80 + (sw - 0.5) * 2600, -1400, 160, 2800); g.restore(); }
} });
// t090 — "And stolen lives stops being just a line."  the theory notes on the desk
registerShot('t090', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * t }, tS = tShot(info, 'stolen', 0.4), tL = tShot(info, 'line.', 2.2), hk = ease.inOut(prog(t, tS, tS + 0.45)), gk = ease.out(prog(t, tL - 0.4, tL + 0.2));
  desk(g, t, cam);
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(-0.025); const w = 760, h = 900;
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-w / 2 + 16, -h / 2 + 16, w, h); g.fillStyle = '#f2ead8'; g.fillRect(-w / 2, -h / 2, w, h);
    for (let y = -h / 2 + 150; y < h / 2 - 30; y += 46) seg(g, [[-w / 2 + 30, y], [w / 2 - 30, y]], 2, 'rgba(90,120,170,.25)'); seg(g, [[-w / 2 + 90, -h / 2], [-w / 2 + 90, h / 2]], 2, 'rgba(200,60,60,.35)');
    text(g, 'THE THEORY', 0, -h / 2 + 80, { size: 44, color: '#2a2018', font: FONTS.ui, weight: 900, spacing: 6 });
    const R = rng(3); for (let i = 0; i < 5; i++) { const y = -h / 2 + 150 + i * 46 - 12; g.fillStyle = 'rgba(40,32,26,.55)'; g.fillRect(-w / 2 + 110, y, 200 + R() * 360, 10); }
    for (let i = 0; i < 4; i++) { const y = h / 2 - 300 + i * 46 + 34; g.fillStyle = 'rgba(40,32,26,.55)'; g.fillRect(-w / 2 + 110, y, 160 + R() * 380, 10); }
    const tw = measure(g, 'STOLEN LIVES', 96, FONTS.ui, 900), hy = -10;
    if (hk > 0) { g.fillStyle = 'rgba(93,255,138,.55)'; g.fillRect(-tw / 2 - 20, hy - 46, (tw + 40) * hk, 92); }
    text(g, 'STOLEN LIVES', 0, hy, { size: 96, color: gk > 0 ? mix('#2a2018', '#0a3a1a', gk) : '#2a2018', font: FONTS.ui, weight: 900, spacing: 4 });
    if (gk > 0) { g.save(); g.globalCompositeOperation = 'lighter'; glow(g, 0, hy, 520, GREEN, 0.35 * gk); g.restore(); }
    g.restore();
  });
  FX.dust(g, t, { count: 40, color: '#ffe2b0', a: 0.4 });
} });

// t091 — "It becomes the tragedy that connects the entire story."  3D: two universes, one thread through the Tesseract
registerShot('t091', {
  kind: '3d',
  init(T) {
    const { THREE } = T, R = rng(31), C = (c) => new THREE.Color(c);
    const st = T.stage({ mood: 'void', fov: V(40, 58), fog: [14, 60], keyPos: [6, 8, 6], keyIntensity: 1.2, ambient: 0.5, sky: ['#040a06', '#08140c', '#060a14'], bloom: 1.0, bloomThreshold: 0.55 });
    const pos = new Float32Array(900 * 3); for (let i = 0; i < 900; i++) { const r = 40 + R() * 30, a = R() * 6.28, b = (R() - 0.5) * 3; pos.set([Math.cos(a) * r, Math.sin(b) * r * 0.6, Math.sin(a) * r], i * 3); }
    const gp = new THREE.BufferGeometry(); gp.setAttribute('position', new THREE.BufferAttribute(pos, 3)); st.add(new THREE.Points(gp, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, fog: false })));
    const figTex = (id, rim, f) => T.canvasTex(256, 512, (g, w, h) => person(g, id, { x: w / 2, y: h - 16, s: 2.1, facing: f, pose: POSES.stand, t: 0, expr: 'neutral', hood: true, rim: { color: rim, dir: [0, -1], w: 6 } }));
    const uni = (x, hue, id, rim, f) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(2.4, 40, 28), new THREE.MeshStandardMaterial({ color: C(hue), emissive: C(hue), emissiveIntensity: 0.45, roughness: 0.35, transparent: true, opacity: 0.55, depthWrite: false })); m.position.set(x, 0, 0); st.add(m);
      const ringM = new THREE.Mesh(new THREE.TorusGeometry(2.62, 0.035, 8, 96), new THREE.MeshBasicMaterial({ color: C(hue) })); ringM.position.copy(m.position); ringM.rotation.x = 1.2; st.add(ringM);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: figTex(id, rim, f), transparent: true, depthTest: false })); sp.scale.set(1.6, 3.2, 1); sp.position.set(x, -0.3, 0); sp.renderOrder = 10; st.add(sp);
      return { m, ringM };
    };
    const A = uni(-7, '#ffb050', 'TONY', TONY_RIM, 1), B = uni(7, '#3ad07a', 'VICTOR', '#c8ffd8', -1);
    const cubeG = new THREE.BoxGeometry(1.3, 1.3, 1.3), cube = new THREE.Mesh(cubeG, new THREE.MeshStandardMaterial({ color: C(CUBE), emissive: C(CUBE), emissiveIntensity: 1.1, roughness: 0.1, transparent: true, opacity: 0.8 })); st.add(cube);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cubeG), new THREE.LineBasicMaterial({ color: 0xe8f6ff })); cube.add(edges);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); st.add(core);
    const pl = new THREE.PointLight(C(CUBE), 30, 20, 1.6); st.add(pl);
    const curve = new THREE.CatmullRomCurve3([[-4.7, 0.3, 0], [-2.6, 1.3, 0.6], [0, 0, 0], [2.6, -1.3, -0.6], [4.7, -0.3, 0]].map(p => new THREE.Vector3(...p)));
    const thread = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.06, 8, false), new THREE.MeshBasicMaterial({ color: C('#e8fff0') })); st.add(thread);
    const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 160, 0.2, 8, false), new THREE.MeshBasicMaterial({ color: C(GREEN), transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })); st.add(halo);
    const pulses = Array.from({ length: 5 }, () => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); st.add(p); return p; });
    return { stage: st, A, B, cube, thread, halo, pulses, curve };
  },
  draw(s, t, info, T) {
    const k = clamp((t - 0.2) / 1.4);
    for (const m of [s.thread, s.halo]) m.geometry.setDrawRange(0, Math.floor(m.geometry.index.count * k / 3) * 3);
    s.cube.rotation.set(t * 0.6, t * 0.9, 0); s.A.ringM.rotation.z = t * 0.4; s.B.ringM.rotation.z = -t * 0.4; s.A.m.rotation.y = t * 0.2; s.B.m.rotation.y = -t * 0.2;
    s.pulses.forEach((p, i) => { const u = (t * 0.35 + i / 5) % 1; p.visible = k >= 1 || u < k; p.position.copy(s.curve.getPointAt(u)); });
    T.orbit(s.stage.camera, t, { target: [0, 0, 0], radius: [V(19, 26), V(15, 21)], height: [2.5, 4], from: -0.45, to: 0.3, dur: info.dur });
  },
  overlay(g, t) { FX.dust(g, t, { count: 30, color: '#cfffd8', a: 0.25 }); label(g, E.W / 2, E.H * 0.86, 'ONE FACE · TWO LIVES', { a: ease.out(prog(t, 1.6, 2.0)), line: GREEN, align: 'center' }); },
});

// ---------- the honest part ----------
const SHRUG_SIT = { ...POSES.sit, eF: [28, -128], hF: [50, -150], eB: [-22, -128], hB: [-44, -150] };
// t092 — "Of course, this is only a theory."
registerShot('t092', { draw(g, t, info) {
  const tT = tShot(info, 'theory.', 1.7);
  couchShot(g, t, info, { z: 1.3, x: 60, y: 130, expr: (t) => (t > 0.5 ? 'smirk' : 'neutral'), pose: (t) => breathe(posesAt(t, [[0, POSES.sit], [0.5, SHRUG_SIT]]), t), look: [0.3, -0.2] });
  stamp(g, E.W * 0.68, E.H * 0.38, 'THEORY', { col: '#e8b53a', k: prog(t, tT, tT + 0.25), rot: -0.14, size: 96 });
} });
// t093 — "Marvel hasn't confirmed anything, yet."
registerShot('t093', { draw(g, t, info) {
  const tC = tShot(info, 'confirmed', 0.8), tY = tShot(info, 'yet.', 2.03);
  couchShot(g, t, info, { z: 1.45, x: 80, y: 150, expr: (t) => (t > tY ? 'smirk' : 'thinking'), pose: (t) => breathe(POSES.sit, t), look: [0.5, -0.3] });
  stamp(g, E.W * 0.66, E.H * 0.36, 'NOT CONFIRMED', { col: '#d0302a', k: prog(t, tC, tC + 0.25), rot: 0.08, size: 72 });
  const k = ease.outBack(prog(t, tY, tY + 0.3)); if (k > 0) text(g, '...YET', E.W * 0.72, E.H * 0.56, { size: 120 * k, color: GREEN, font: FONTS.ui, weight: 900, glow: 30, glowColor: alpha(GREEN, 0.8), alpha: clamp(k), stroke: 8, strokeColor: '#020604' });
} });

// versus split: Iron Man helmet (left) vs Doom's mask (right)
function versus(g, t, hiL, hiR, dim = 0) {
  g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(E.W / 2 + 120, 0); g.lineTo(E.W / 2 - 120, E.H); g.lineTo(0, E.H); g.closePath(); g.clip();
  backdrop(g, ['#1a0806', '#4a1a10', '#1a0806']); glow(g, E.W * 0.27, E.H * 0.5, 700, '#ffb050', 0.15 + 0.3 * hiL); bigIron(g, E.W * 0.27, E.H * 0.56, V(250, 190) * (1 + 0.05 * hiL), { t, eyes: 0.4 + 0.6 * hiL, rimSide: 1 }); g.restore();
  g.save(); g.beginPath(); g.moveTo(E.W / 2 + 120, 0); g.lineTo(E.W, 0); g.lineTo(E.W, E.H); g.lineTo(E.W / 2 - 120, E.H); g.closePath(); g.clip();
  backdrop(g, ['#031008', '#0e3a1e', '#031008']); glow(g, E.W * 0.73, E.H * 0.5, 700, GREEN, 0.15 + 0.3 * hiR); bigDoom(g, E.W * 0.73, E.H * 0.56, V(250, 190) * (1 + 0.05 * hiR), { eyes: 0.4 + 0.6 * hiR, t, rimSide: -1 }); g.restore();
  seg(g, [[E.W / 2 + 120, 0], [E.W / 2 - 120, E.H]], 8, '#ffffff'); glow(g, E.W / 2, E.H / 2, 200, '#ffffff', 0.3);
  if (dim) veil(g, '#000', dim);
}
// t094 — "So tell me in the comments: is Doctor Doom secretly a version of Tony Stark?"
registerShot('t094', { draw(g, t, info) {
  const tD = tShot(info, 'Doom', 2.44), tS = tShot(info, 'secretly', 2.67), tT = tShot(info, 'Tony', 4.02);
  versus(g, t, ease.out(prog(t, tT - 0.2, tT + 0.2)), ease.out(prog(t, tD - 0.2, tD + 0.2)));
  label(g, V(80, 60), E.H * 0.12, 'TELL ME IN THE COMMENTS', { a: ease.out(prog(t, 0.3, 0.7)) });
  const k = ease.outBack(prog(t, tS, tS + 0.3)); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.5); g.scale(k, k); circle(g, 0, 0, 84, '#0a0610'); ring(g, 0, 0, 84, 5, '#ffffff'); seg(g, [[-36, -16], [36, -16]], 12, '#ffffff'); seg(g, [[-36, 16], [36, 16]], 12, '#ffffff'); g.restore(); }
  const q = ease.outBack(prog(t, tT, tT + 0.3)); if (q > 0) text(g, '?', E.W / 2 + 80, E.H * 0.5 - 110, { size: 150 * q, color: S().ui.gold, glow: 30, glowColor: alpha(S().ui.gold, 0.7), alpha: clamp(q), stroke: 8, strokeColor: '#1a1206' });
} });
// t095 — "Or is the casting just a coincidence?"  comment bubbles
registerShot('t095', { draw(g, t, info) {
  versus(g, t, 0.5, 0.5, 0.45);
  const tC = tShot(info, 'coincidence?', 1.8);
  [['SAME MAN!', 0.2, -1, 0.28], ['TONY = DOOM', 0.6, 1, 0.42], ['MIND BLOWN', 1.0, -1, 0.62], ['JUST A COINCIDENCE?', tC, 1, 0.76]].forEach(([str, at, side, yy]) => { const k = ease.outBack(prog(t, at, at + 0.3)); if (k <= 0) return; const x = E.W / 2 + side * V(420, 240), y = E.H * yy;
    g.save(); g.translate(x, y); g.scale(k, k); const w = measure(g, str, 40, FONTS.ui, 900) + 120; rr(g, -w / 2, -42, w, 84, 42); g.fillStyle = '#f4efe6'; g.fill(); poly(g, [[-w * 0.2, 38], [-w * 0.3, 64], [-w * 0.05, 38]], '#f4efe6'); circle(g, -w / 2 + 42, 0, 24, side < 0 ? '#b3302a' : '#2f8a45'); text(g, str, 20, 2, { size: 38, color: S().ink, font: FONTS.ui, weight: 900 }); g.restore(); });
} });
// t096 — "If you enjoyed this theory, hit like, subscribe, and turn on notifications."
registerShot('t096', { draw(g, t, info) {
  const tL = tShot(info, 'like,', 1.8), tS = tShot(info, 'subscribe,', 2.46), tN = tShot(info, 'notifications.', 3.76);
  blurLayer(g, 12, (g) => living(g, t, { z: 1.4, x: 200, y: 100 }, {})); veil(g, '#04040a', 0.45);
  text(g, 'ENJOYED THE THEORY?', E.W / 2, E.H * 0.24, { size: V(70, 64), color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 4, alpha: ease.out(prog(t, 0.2, 0.6)), glow: 18, glowColor: alpha(GREEN, 0.5) });
  const cam = { z: 1 + 0.03 * t }, y = E.H * 0.56;
  layer(g, cam, 1, (g) => {
    const a = ease.outBack(prog(t, tL, tL + 0.35)); if (a > 0) { g.save(); g.translate(E.W * 0.22, y); g.scale(a, a); circle(g, 0, 0, 120, '#e0302a'); glow(g, 0, 0, 240, '#ff6a5a', 0.35); thumbsUp(g, -6, -6, 1.05, '#ffffff'); g.restore(); }
    const b = ease.outBack(prog(t, tS, tS + 0.35)); if (b > 0) { g.save(); g.translate(E.W * 0.5, y); g.scale(b * 1.3, b * 1.3); subscribePill(g, 0, 0, 1, t > tS + 0.7 ? 1 : 0); g.restore(); }
    const c = ease.outBack(prog(t, tN - 0.2, tN + 0.15)); if (c > 0) { g.save(); g.translate(E.W * 0.78, y); g.scale(c, c); circle(g, 0, 0, 120, 'rgba(255,255,255,.12)'); bell(g, 0, 0, 1.2, Math.max(0, t - tN), '#ffffff'); g.restore(); if (t > tN) FX.rings(g, E.W * 0.78, y, t - tN, { count: 3, r0: 130, r1: 340, speed: 1.4, color: '#ffd36a', a: 0.5 }); }
  });
} });

// ---------- finale ----------
// t097 — "Because when Doom arrives…"
registerShot('t097', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.2 * k, y: lerp(60, 120, k) };
  const { GY, CX, rim } = throneHall(g, t, cam, { flashes: [0.3], fire: 1.3 });
  layer(g, cam, 1, (g) => hero(g, 'DOOM', { x: CX, y: GY + 30 + k * 40, s: lerp(1.6, 2.2, k), facing: 1, pose: walkPose(t * 3, { stride: 18 }), t, eyes: 1, rim: { color: rim, dir: [0, -1], w: 5 }, wind: 1.6 }));
  FX.fog(g, E.H * 0.7, 300, '#3a8a5a', 0.35);
} });
// t098 — "Nothing in the multiverse is safe."  the universe cracks green, the title
registerShot('t098', { draw(g, t, info) {
  const hit = 1.6, c = ease.inOut(prog(t, 0.2, hit)), after = t > hit, [sx, sy] = after ? shake(t, 10 * Math.exp(-(t - hit) * 3), 20) : [0, 0];
  const cam = { z: 1.0 + 0.08 * t / info.dur, x: sx, y: sy };
  layer(g, cam, 0.1, (g) => { backdrop(g, ['#020604', '#06140c', '#020604']); nebula(g, t, { c1: '#1a6a3a', c2: '#0a3a2a', seed: 5 }); FX.stars(g, t, { count: 220, seed: 4, area: [-E.W, -E.H, E.W * 3, E.H * 3] }); });
  layer(g, cam, 1, (g) => { universe(g, E.W / 2, E.H * 0.5, V(330, 300), { hue: '#ffb050', t, seed: 9, inner: '#2a1a0a', crack: c }); if (c > 0) { cracks(g, E.W / 2, E.H * 0.5, { seed: 12, len: 420 * c, count: 7, color: '#e8fff0', glowC: GREEN, a: clamp(c * 1.5) }); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, E.W / 2, E.H * 0.5, 600 * c, GREEN, 0.4 * c); g.restore(); } });
  if (after) { const k = ease.out(prog(t, hit, hit + 0.5)); veil(g, '#000', 0.45 * k); text(g, 'AVENGERS: DOOMSDAY', E.W / 2, E.H * 0.46, { size: V(110, 80) * (0.9 + 0.1 * k), color: '#e8fff0', glow: 40, glowColor: 'rgba(93,255,138,.95)', spacing: 8, alpha: k }); text(g, 'DECEMBER 18', E.W / 2, E.H * 0.58, { size: V(46, 50), color: S().ui.gold, font: FONTS.ui, weight: 900, spacing: 12, alpha: ease.out(prog(t, hit + 0.3, hit + 0.8)) }); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(160,255,190,${0.6 * Math.exp(-(t - hit) * 6)})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
} });
// t099 — end screen
registerShot('t099', { draw(g, t, info) {
  UI.endScreen(g, t, { question: 'Is Doom secretly Tony Stark?', cast: [OUT.FAN, O70.HOWARD, O70.MARIA, O70.TONY, OUT.REED, OUT.SUE, OUT.DOOM], moodColors: ['#05100a', '#0e2418', '#1a3a26'], rim: '#9dffb6' });
  FX.dust(g, t, { count: 40, color: '#9dffb6', a: 0.35 });
} });
