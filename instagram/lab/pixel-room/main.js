// Pixel Room: style test for a cosy pixel-art diorama look (lit 3D set + flat pixel sprites + kinetic captions), 1080×1920.
// The diorama tools (pixel textures, sprite billboards, depth of field + bloom) come from Lemo-Opuscar's HD-2D style (MIT).
import * as THREE from 'three';
import { makePost } from '/styles/hd-2d/demo/post_ts.js';
import { PX, ramp, h2, texOf, woodPlanks, billboard, glow, blob } from '/styles/hd-2d/demo/px.js';
import { mat, mesh, box } from '/styles/hd-2d/demo/kit.js';
import { flick } from '/styles/hd-2d/demo/fx.js';
import { drawCaptions, captionsReady, captionTexts } from './captions.js';

const W = 1080, H = 1920, Q = new URLSearchParams(location.search), SS = +(Q.get('ss') ?? 1);
const TL = await (await fetch('timeline.json')).json();
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
const camera = new THREE.PerspectiveCamera(36, W / H, .1, 200);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0b0716'); scene.fog = new THREE.Fog('#140b24', 9, 22);

// ---------------------------------------------------------------- textures
const BRAND = { violet: ['#140a26', '#2a1650', '#43248a', '#6440c0', '#8f6cf0'], lime: '#8bff47' };
function rugTex() {   // round rug: deep violet rings with a diamond band
  const N = 72, P = new PX(N, N), R = ramp(['#1a0b2c', '#2f1452', '#4a1f7a', '#6a2fa6', '#8c48c8'], .45), G = ramp(['#3a2a10', '#8a6a2a', '#d8b456'], .45);
  P.fill((x, y) => {
    const dx = x + .5 - N / 2, dy = y + .5 - N / 2, r = Math.hypot(dx, dy) / (N / 2); if (r > 1) return null;
    const a = Math.atan2(dy, dx), band = r > .62 && r < .78, edge = r > .92;
    if (edge) return R(.15 + h2(x, y, 4) * .2, x, y);
    if (band) { const d = Math.abs(((a / (Math.PI * 2) * 24) % 1) - .5) * 2, diamond = Math.abs((r - .7) / .08) + d * .9 < .9; return diamond ? G(.75, x, y) : R(.5, x, y); }
    if (Math.abs(r - .86) < .025 || Math.abs(r - .5) < .02) return G(.5, x, y);
    return R(.38 + .25 * (1 - r) + (h2(x, y, 9) - .5) * .18, x, y);
  });
  return P.done();
}
function screenTex(seed = 1) {   // code on a monitor: lines of pixel "text" in the brand colours
  const P = new PX(80, 48), E = new PX(80, 48), C = ['#8f6cf0', '#8bff47', '#5ad1ff', '#e8e4ff', '#ff7ab6'];
  P.fill((x, y) => (x < 2 || y < 2 || x > 77 || y > 45) ? '#1d1830' : '#0a0818');
  let yy = 5;
  for (let l = 0; l < 13 && yy < 44; l++, yy += 3) {
    let x = 5 + (h2(l, 1, seed) * 4 | 0) * 3;
    const words = 1 + (h2(l, 2, seed) * 4 | 0);
    for (let k = 0; k < words; k++) {
      const len = 3 + (h2(l, k + 3, seed) * 12 | 0), col = C[(h2(l, k + 9, seed) * C.length) | 0];
      for (let i = 0; i < len && x + i < 75; i++) { P.set(x + i, yy, col); E.set(x + i, yy, col); }
      x += len + 2;
    }
  }
  E.rect(5, 41, 3, 2, BRAND.lime); P.rect(5, 41, 3, 2, BRAND.lime);   // cursor
  return [P.done(), E.done()];
}
function shelfTex() {   // a bookcase front: dark frame, four shelves of coloured spines
  const w = 30, h = 50, P = new PX(w, h), F = ramp(['#160c08', '#2a1810', '#3e2618'], .45);
  const SP = [['#3b1f6b', '#5a35a0'], ['#6b1f2a', '#a33a3a'], ['#1f4a5a', '#2f7a8a'], ['#5a4a1f', '#9a7a2f'], ['#2a2a3a', '#4a4a64']];
  P.fill((x, y) => F(.3 + h2(x, y, 2) * .3, x, y));
  for (let s = 0; s < 4; s++) {
    const y1 = 3 + s * 12, y2 = y1 + 10; let x = 2;
    while (x < w - 2) {
      const bw = 1 + (h2(x, s, 5) * 3 | 0), bh = 6 + (h2(x, s, 6) * 4 | 0), sp = SP[(h2(x, s, 7) * SP.length) | 0];
      if (h2(x, s, 8) < .12) { x += 2; continue; }
      for (let i = 0; i < bw && x + i < w - 2; i++) for (let j = 0; j < bh; j++) P.set(x + i, y2 - 1 - j, j === bh - 2 ? '#d8c890' : sp[i === 0 ? 0 : 1]);
      x += bw;
    }
    for (let i = 1; i < w - 1; i++) P.set(i, y2, '#4e3020');
  }
  return P.done();
}
function windowTex() {   // night city through a window
  const P = new PX(32, 40), E = new PX(32, 40), S = ramp(['#0a0618', '#1b0f3a', '#33206a', '#5a3a9a'], .45);
  P.fill((x, y) => {
    if (x < 2 || x > 29 || y < 2 || y > 37 || x === 15 || x === 16 || y === 19) return '#2a1a12';
    const sky = S(.15 + (y / 40) * .7, x, y); E.set(x, y, sky); return sky;
  });
  for (let b = 0; b < 7; b++) {   // skyline
    const bx = 2 + b * 4 + (h2(b, 1, 3) * 2 | 0), bw = 3 + (h2(b, 2, 3) * 2 | 0), top = 22 + (h2(b, 3, 3) * 10 | 0);
    for (let x = bx; x < bx + bw && x < 30; x++) for (let y = top; y < 38; y++) {
      if (x === 15 || x === 16 || y === 19) continue;
      const lit = (x + y) % 2 === 0 && h2(x, y, 11) > .55, c = lit ? (h2(x, y, 12) > .5 ? '#ffc061' : BRAND.lime) : '#0c0814';
      P.set(x, y, c); E.set(x, y, lit ? c : '#000000');
    }
  }
  for (let i = 0; i < 9; i++) { const x = 3 + (h2(i, 5, 1) * 25 | 0), y = 3 + (h2(i, 6, 1) * 14 | 0); if (x !== 15 && x !== 16) { P.set(x, y, '#ffffff'); E.set(x, y, '#ffffff'); } }
  return [P.done(), E.done()];
}
function frameTex(col) { const P = new PX(16, 20), E = new PX(16, 20); P.fill((x, y) => (x < 1 || x > 14 || y < 1 || y > 18) ? '#1a120c' : col); E.fill((x, y) => (x < 2 || x > 13 || y < 2 || y > 17) ? null : col); return [P.done(), E.done()]; }

// ---------------------------------------------------------------- the mascot: BIT, a small robot in a violet hoodie with a screen for a face
const SPX = 1 / 46, FW = 40, FH = 48;
function drawBit(face = 'eyes', arm = 'down', bob = 0) {
  const P = new PX(FW, FH), E = new PX(FW, FH);
  const shell = ramp(['#2a2238', '#6e6888', '#b8b4cc', '#ecebf6'], .22), hood = ramp(['#170c2c', '#33196a', '#5232a2', '#7656cc'], .22);
  const y0 = 3 + bob;
  // antenna
  for (let y = y0; y < y0 + 4; y++) P.set(20, y, '#6e6888');
  P.set(20, y0 - 1, BRAND.lime); P.set(19, y0 - 1, BRAND.lime); E.set(20, y0 - 1, BRAND.lime); E.set(19, y0 - 1, BRAND.lime);
  // head: rounded shell + screen
  const hx0 = 7, hx1 = 33, hy0 = y0 + 4, hy1 = y0 + 22;
  P.fill((x, y) => { if (x < hx0 || x > hx1 || y < hy0 || y > hy1) return null; const cx = Math.min(x - hx0, hx1 - x), cy = Math.min(y - hy0, hy1 - y); if (cx + cy < 3) return null; return shell(.85 - (y - hy0) / 26 - (x > 28 ? .2 : 0), x, y); });
  for (let y = hy0 + 3; y <= hy1 - 3; y++) for (let x = hx0 + 3; x <= hx1 - 3; x++) { const corner = (x === hx0 + 3 || x === hx1 - 3) && (y === hy0 + 3 || y === hy1 - 3); if (!corner) P.set(x, y, '#0c0a1c'); }
  const lit = (x, y, c = BRAND.lime) => { P.set(x, y, c); E.set(x, y, c); };
  const ey = hy0 + 8;
  if (face === 'eyes') { for (const ex of [14, 24]) for (let j = 0; j < 4; j++) { lit(ex, ey + j); lit(ex + 1, ey + j); } lit(18, ey + 6); lit(19, ey + 7); lit(20, ey + 7); lit(21, ey + 6); }
  if (face === 'blink') { for (const ex of [14, 24]) { lit(ex, ey + 2); lit(ex + 1, ey + 2); lit(ex - 1, ey + 2); lit(ex + 2, ey + 2); } }
  if (face === 'q') for (const ex of [13, 23]) { const Q = ['.###.', '#...#', '...#.', '..#..', '.....', '..#..']; Q.forEach((r, j) => [...r].forEach((c, i) => c === '#' && lit(ex + i - 1, ey - 1 + j, '#ffc061'))); }
  if (face === 'dots') for (const ex of [13, 18, 23]) { lit(ex + 1, ey + 3); lit(ex + 2, ey + 3); lit(ex + 1, ey + 4); lit(ex + 2, ey + 4); }
  // hoodie body
  const by0 = hy1 + 1, by1 = by0 + 13;
  P.fill((x, y) => (x >= 10 && x <= 30 && y >= by0 && y <= by1) ? hood(.75 - (y - by0) / 22 - (x > 26 ? .2 : 0) + (x < 13 ? -.1 : 0), x, y) : null);
  for (let x = 15; x <= 25; x++) P.set(x, by0 + 8, '#1d0f3a');                 // pocket
  P.set(17, by0 + 1, '#ecebf6'); P.set(23, by0 + 1, '#ecebf6'); P.set(17, by0 + 2, '#b8b4cc'); P.set(23, by0 + 2, '#b8b4cc');   // drawstrings
  // arms
  const armCol = (x, y) => hood(.45 + (y % 3 === 0 ? .1 : 0), x, y);
  for (let y = by0 + 1; y <= by0 + 10; y++) for (let x = 6; x <= 9; x++) P.set(x, y, armCol(x, y));
  if (arm === 'up') {   // raised clear of the head: shoulder → upper arm out to the side → forearm up, a pointing finger on top
    for (let y = by0 + 1; y <= by0 + 4; y++) for (let x = 31; x <= 35; x++) P.set(x, y, armCol(x, y));
    for (let y = by0 - 10; y <= by0 + 1; y++) for (let x = 35; x <= 38; x++) P.set(x, y, armCol(x, y));
    for (let x = 35; x <= 38; x++) { P.set(x, by0 - 11, '#ecebf6'); P.set(x, by0 - 12, '#b8b4cc'); }
    P.set(36, by0 - 13, '#ecebf6'); P.set(36, by0 - 14, '#ecebf6'); P.set(36, by0 - 15, '#b8b4cc');
  }
  else for (let y = by0 + 1; y <= by0 + 10; y++) for (let x = 31; x <= 34; x++) P.set(x, y, armCol(x, y));
  for (const x of [6, 7, 8, 9]) P.set(x, by0 + 11, '#b8b4cc');
  if (arm !== 'up') for (const x of [31, 32, 33, 34]) P.set(x, by0 + 11, '#b8b4cc');
  // legs + shoes
  for (let y = by1 + 1; y <= by1 + 5 && y < FH - 2; y++) for (const x of [13, 14, 15, 16, 24, 25, 26, 27]) P.set(x, y, '#1c1828');
  for (const [x0, x1] of [[12, 17], [23, 28]]) for (let x = x0; x <= x1; x++) { P.set(x, Math.min(FH - 2, by1 + 6), '#ecebf6'); P.set(x, Math.min(FH - 1, by1 + 7), '#6e6888'); }
  P.outline(.3, [16, 10, 30]);
  return [P.done(), E.done()];
}
const BIT = {};
for (const [k, f, a, b] of [['idleA', 'eyes', 'down', 0], ['idleB', 'eyes', 'down', 1], ['blink', 'blink', 'down', 0], ['q', 'q', 'down', 0], ['qB', 'q', 'down', 1], ['dots', 'dots', 'down', 0], ['point', 'eyes', 'up', 0], ['pointB', 'eyes', 'up', 1]]) {
  const [c, e] = drawBit(f, a, b); BIT[k] = { map: texOf(c), em: texOf(e) };
}

// ---------------------------------------------------------------- the room
const planks = mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 2, cols: ['#1c100b', '#2f1c12', '#47291a', '#603822', '#78492b'] }));
const panel = mat(woodPlanks(96, 96, { pw: 12, len: 96, seed: 7, nails: false, cols: ['#120a10', '#1e1018', '#2c1822', '#3a2030'] }));
const deskWood = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#2a160c', '#452614', '#5e3420', '#7a4628'] }));
const dark = new THREE.MeshStandardMaterial({ color: '#16121e', roughness: .7 });
const floor = mesh(new THREE.BoxGeometry(9, .1, 7).translate(0, -.05, 0), planks); scene.add(floor);
const back = box(9, 3.4, .2, panel); back.position.set(0, 0, -2.6); scene.add(back);
const left = box(.2, 3.4, 7, panel); left.position.set(-3.6, 0, 0); scene.add(left);
const rug = new THREE.Mesh(new THREE.CircleGeometry(1.45, 48), new THREE.MeshStandardMaterial({ map: texOf(rugTex()), roughness: 1 }));
rug.rotation.x = -Math.PI / 2; rug.position.set(-.1, .006, .35); rug.receiveShadow = true; scene.add(rug);
// bookcase
const shelfM = new THREE.MeshStandardMaterial({ map: texOf(shelfTex()), roughness: .9 });
const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.1, .38), [dark, dark, dark, dark, shelfM, dark]); shelf.geometry.translate(0, 1.05, 0);
shelf.position.set(-2.2, 0, -2.3); shelf.castShadow = shelf.receiveShadow = true; scene.add(shelf);
// window on the left wall
const [wc, we] = windowTex();
const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshStandardMaterial({ map: texOf(wc), emissiveMap: texOf(we), emissive: '#ffffff', emissiveIntensity: 1.6 }));
win.rotation.y = Math.PI / 2; win.position.set(-3.48, 1.75, -.6); scene.add(win);
// frames on the back wall
[['#ff5a6a', -.75, 2.3], ['#5ad1ff', -.25, 2.45], ['#8bff47', 2.2, 2.3]].forEach(([c, x, y]) => {
  const [fc, fe] = frameTex(c); const f = new THREE.Mesh(new THREE.PlaneGeometry(.3, .38), new THREE.MeshStandardMaterial({ map: texOf(fc), emissiveMap: texOf(fe), emissive: '#ffffff', emissiveIntensity: .25 }));
  f.position.set(x, y, -2.49); scene.add(f);
});
// desk, monitor, keyboard, lamp, plant, mug
const desk = new THREE.Group(); desk.position.set(1.05, 0, -1.75); scene.add(desk);
const top = box(1.9, .07, .8, deskWood); top.position.y = .76; desk.add(top);
for (const [x, z] of [[-.88, -.33], [.88, -.33], [-.88, .33], [.88, .33]]) { const l = box(.07, .76, .07, deskWood); l.position.set(x, 0, z); desk.add(l); }
const [sc, se] = screenTex(3);
const screenM = new THREE.MeshStandardMaterial({ map: texOf(sc), emissiveMap: texOf(se), emissive: '#ffffff', emissiveIntensity: 2.0 });
const mon = new THREE.Mesh(new THREE.BoxGeometry(1.02, .64, .05), [dark, dark, dark, dark, screenM, dark]); mon.position.set(-.05, 1.22, -.12); mon.castShadow = true; desk.add(mon);
const neck = box(.06, .4, .06, dark); neck.position.set(-.05, .79, -.16); desk.add(neck);
const kb = box(.62, .03, .2, new THREE.MeshStandardMaterial({ color: '#2a2438', roughness: .6 })); kb.position.set(-.05, .83, .2); desk.add(kb);
const mug = new THREE.Mesh(new THREE.CylinderGeometry(.05, .045, .11, 12), new THREE.MeshStandardMaterial({ color: '#8f6cf0', roughness: .5 })); mug.position.set(.62, .885, .18); mug.castShadow = true; desk.add(mug);
const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .03, 16), dark); lampBase.position.set(-.72, .815, .05); desk.add(lampBase);
const lampArm = box(.025, .5, .025, dark); lampArm.position.set(-.72, .83, .05); lampArm.rotation.z = -.25; desk.add(lampArm);
const shade = new THREE.Mesh(new THREE.ConeGeometry(.14, .18, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#ff8a3a', emissive: '#ff8a3a', emissiveIntensity: .5, side: THREE.DoubleSide })); shade.position.set(-.6, 1.33, .08); shade.rotation.z = -.5; desk.add(shade);
const lamp = new THREE.PointLight('#ffb05a', 6, 7, 1.6); lamp.position.set(-.55, 1.22, .15); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.002; desk.add(lamp);
const lampGlow = glow('#ffb05a', .9, 1.4); lampGlow.position.copy(lamp.position); desk.add(lampGlow);
const pot = new THREE.Mesh(new THREE.CylinderGeometry(.11, .09, .2, 12), new THREE.MeshStandardMaterial({ color: '#b0563a', roughness: .9 })); pot.position.set(.78, .9, -.2); desk.add(pot);
for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.09, .09, .09), new THREE.MeshStandardMaterial({ color: i % 3 ? '#3d8a3a' : '#5fb04a', roughness: .9 })); c.position.set(.78 + (h2(i, 1, 2) - .5) * .22, 1.04 + h2(i, 2, 2) * .22, -.2 + (h2(i, 3, 2) - .5) * .22); c.castShadow = true; desk.add(c); }
const chair = new THREE.Group(); chair.position.set(1.75, 0, -1.0); chair.rotation.y = -.9; scene.add(chair);
const seat = box(.5, .06, .5, dark); seat.position.y = .45; chair.add(seat); const backrest = box(.5, .55, .06, dark); backrest.position.set(0, .5, .22); chair.add(backrest);
const post0 = box(.06, .45, .06, dark); chair.add(post0);
// screen light spills onto the desk
const screenLight = new THREE.PointLight('#8f6cf0', 2.2, 3.2, 1.4); screenLight.position.set(1.0, 1.25, -1.45); scene.add(screenLight);

// lights: dim cool key from the window, violet hemisphere, a cool front fill on Bit
const key = new THREE.DirectionalLight('#7f8cff', .55); key.position.set(-6, 6, 2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); scene.add(key);
scene.add(new THREE.HemisphereLight('#4a3480', '#140a10', 1.1));
const warmFill = new THREE.PointLight('#ff8a4a', 2.2, 7, 1.5); warmFill.position.set(-2.2, 1.6, 1.2); scene.add(warmFill);
const fill = new THREE.PointLight('#a99cff', 1.6, 6, 1.5); fill.position.set(.6, 1.6, 2.4); scene.add(fill);
const rimGlow = glow('#8f6cf0', 2.4, .35); rimGlow.position.set(1.0, 1.25, -1.9); scene.add(rimGlow);

// Bit on the rug
const bitMats = {}; for (const k in BIT) { const geoMat = billboard(BIT[k].map, FW * SPX, FH * SPX, { em: BIT[k].em, emCol: '#ffffff', emI: 1.4 }); bitMats[k] = geoMat; }
const bit = new THREE.Group(); bit.position.set(.05, 0, .55); scene.add(bit);
for (const k in bitMats) { bitMats[k].visible = false; bit.add(bitMats[k]); }
const shadowBlob = blob(.34, .55); shadowBlob.position.set(0, .012, 0); bit.add(shadowBlob);

// dust in the lamp light
const dustG = new THREE.BufferGeometry(), DN = 140, dp = new Float32Array(DN * 3);
dustG.setAttribute('position', new THREE.BufferAttribute(dp, 3));
const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: '#ffd9a0', size: .02, transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(dust);

// ---------------------------------------------------------------- post: depth of field + bloom + grade
const post = makePost(renderer, scene, camera, W, H, { ssaa: SS });
post.bloom.strength = .6; post.bloom.radius = .7; post.bloom.threshold = .8;
const V = post.vig.uniforms; V.amt.value = .55; V.warm.value = .12; V.contrast.value = .22; V.sat.value = 1.12;
await captionsReady();

// ---------------------------------------------------------------- time
const w = (id, word) => TL.lines.find(l => l.id === id).words.find(x => x.w.toLowerCase().replace(/[^a-z']/g, '').startsWith(word)).t0;
const K = { know: w('l01', 'know'), say: w('l01', 'say'), l02: TL.lines[1].t0, one: w('l02', 'one'), time: w('l02', 'time') };
const lerp = (a, b, t) => a + (b - a) * t, cl = x => Math.max(0, Math.min(1, x)), ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function frameOf(t) {
  if (t >= K.one - .05) return Math.floor(t * 2) % 2 ? 'pointB' : 'point';
  if (t >= K.say + .3 && t < K.one - .05) return 'dots';
  if (t >= K.know - .05) return Math.floor(t * 2) % 2 ? 'qB' : 'q';
  if ((t % 3.1) > 2.95) return 'blink';
  return Math.floor(t * 2) % 2 ? 'idleB' : 'idleA';
}
window.DUR = TL.dur;
window.TEXTS = t => captionTexts(TL, t);
window.EV = (() => {
  const E = [], ev = (t, type, o = {}) => E.push({ t: +t.toFixed(3), type, ...o });
  ev(0, 'scramble', { t1: .3 }); ev(K.know, 'lock', { first: true }); ev(K.say, 'confirm');
  ev(K.l02 - .25, 'whip'); ev(K.one, 'dock');
  TL.lines[1].words.slice(3).forEach(x => ev(x.t0, 'pulse', { dir: 1 }));
  ev(K.time + .3, 'confirm', { final: true });
  return E;
})();
window.render = t => {
  // camera: a slow push in, a little drift; a quick swing at the second line
  const k = ease(cl(t / TL.dur)), swing = ease(cl((t - (K.l02 - .3)) / .6));
  const yaw = lerp(.36, .24, k) - .14 * swing, dist = lerp(6.9, 5.9, k), h = lerp(3.6, 3.25, k);
  const target = new THREE.Vector3(.35, .55, -.55);
  camera.position.set(target.x + Math.sin(yaw) * dist, h, target.z + Math.cos(yaw) * dist); camera.lookAt(target);
  camera.updateMatrixWorld();
  // Bit faces the camera
  const f = frameOf(t); for (const kk in bitMats) bitMats[kk].visible = kk === f;
  bit.rotation.y = Math.atan2(camera.position.x - bit.position.x, camera.position.z - bit.position.z);
  // the lamp breathes, dust drifts
  const fl = flick(t, 1) * .5 + .5; lamp.intensity = 6 * (.9 + .1 * fl); lampGlow.material.opacity = .85 + .15 * fl;
  for (let i = 0; i < DN; i++) { const a = h2(i, 1, 7), b = h2(i, 2, 7), c = h2(i, 3, 7); dp[i * 3] = .1 + (a - .5) * 1.4 + Math.sin(t * .3 + i) * .05; dp[i * 3 + 1] = .2 + ((b + t * .03 * (.5 + c)) % 1) * 1.6; dp[i * 3 + 2] = -1.2 + (c - .5) * 1.2; }
  dustG.attributes.position.needsUpdate = true;
  // focus on Bit
  post.dof.focus = camera.position.distanceTo(new THREE.Vector3(bit.position.x, .7, bit.position.z));
  post.dof.aper = 150; post.dof.maxCoc = 16;
  post.composer.render();
  drawCaptions(document.getElementById('ov').getContext('2d'), TL, t);
};
window.READY = true;
