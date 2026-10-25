// Pixel Room: the account's cosy pixel-diorama set (night study, violet ambience, a warm desk lamp, a live monitor) and BIT, the mascot.
// buildRoom() → { renderer, scene, camera, post, bit, monitor, lamp, frame(t) }. A reel adds its own props to room.scene and moves room.camera.
// Pixel textures, sprite billboards and the depth-of-field + bloom post come from Lemo-Opuscar's HD-2D style (vendor/, MIT).
import * as THREE from 'three';
import { makePost } from './vendor/post_ts.js';
import { PX, ramp, h2, texOf, woodPlanks, billboard, glow, blob } from './vendor/px.js';
import { mat, mesh, box } from './vendor/kit.js';
import { flick } from './vendor/fx.js';

export const LIME = '#8bff47', AMBER = '#ffc061', VIOLET = '#8f6cf0';
export const W = 1080, H = 1920;

// ---------------------------------------------------------------- textures
function rugTex() {   // round rug: deep violet rings with a gold diamond band
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
function shelfTex() {
  const w = 30, h = 50, P = new PX(w, h), F = ramp(['#160c08', '#2a1810', '#3e2618'], .45);
  const SP = [['#3b1f6b', '#5a35a0'], ['#6b1f2a', '#a33a3a'], ['#1f4a5a', '#2f7a8a'], ['#5a4a1f', '#9a7a2f'], ['#2a2a3a', '#4a4a64']];
  P.fill((x, y) => F(.3 + h2(x, y, 2) * .3, x, y));
  for (let s = 0; s < 4; s++) {
    const y2 = 13 + s * 12; let x = 2;
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
  P.fill((x, y) => { if (x < 2 || x > 29 || y < 2 || y > 37 || x === 15 || x === 16 || y === 19) return '#2a1a12'; const sky = S(.15 + (y / 40) * .7, x, y); E.set(x, y, sky); return sky; });
  for (let b = 0; b < 7; b++) {
    const bx = 2 + b * 4 + (h2(b, 1, 3) * 2 | 0), bw = 3 + (h2(b, 2, 3) * 2 | 0), top = 22 + (h2(b, 3, 3) * 10 | 0);
    for (let x = bx; x < bx + bw && x < 30; x++) for (let y = top; y < 38; y++) {
      if (x === 15 || x === 16 || y === 19) continue;
      const lit = (x + y) % 2 === 0 && h2(x, y, 11) > .55, c = lit ? (h2(x, y, 12) > .5 ? AMBER : LIME) : '#0c0814';
      P.set(x, y, c); E.set(x, y, lit ? c : '#000000');
    }
  }
  for (let i = 0; i < 9; i++) { const x = 3 + (h2(i, 5, 1) * 25 | 0), y = 3 + (h2(i, 6, 1) * 14 | 0); if (x !== 15 && x !== 16) { P.set(x, y, '#ffffff'); E.set(x, y, '#ffffff'); } }
  return [P.done(), E.done()];
}
function frameTex(col) { const P = new PX(16, 20), E = new PX(16, 20); P.fill((x, y) => (x < 1 || x > 14 || y < 1 || y > 18) ? '#1a120c' : col); E.fill((x, y) => (x < 2 || x > 13 || y < 2 || y > 17) ? null : col); return [P.done(), E.done()]; }

// ---------------------------------------------------------------- BIT: a small robot in a violet hoodie with a screen for a face
// faces: eyes, blink, happy, q (two question marks), dots, flat (unimpressed), wide; arms: down, up (pointing), wave
const FW = 40, FH = 48;
export function drawBit(face = 'eyes', arm = 'down', bob = 0) {
  const P = new PX(FW, FH), E = new PX(FW, FH);
  const shell = ramp(['#2a2238', '#6e6888', '#b8b4cc', '#ecebf6'], .22), hood = ramp(['#170c2c', '#33196a', '#5232a2', '#7656cc'], .22);
  const y0 = 3 + bob, lit = (x, y, c = LIME) => { P.set(x, y, c); E.set(x, y, c); };
  for (let y = y0; y < y0 + 4; y++) P.set(20, y, '#6e6888');
  lit(20, y0 - 1); lit(19, y0 - 1);
  const hx0 = 7, hx1 = 33, hy0 = y0 + 4, hy1 = y0 + 22;
  P.fill((x, y) => { if (x < hx0 || x > hx1 || y < hy0 || y > hy1) return null; const cx = Math.min(x - hx0, hx1 - x), cy = Math.min(y - hy0, hy1 - y); if (cx + cy < 3) return null; return shell(.85 - (y - hy0) / 26 - (x > 28 ? .2 : 0), x, y); });
  for (let y = hy0 + 3; y <= hy1 - 3; y++) for (let x = hx0 + 3; x <= hx1 - 3; x++) { const corner = (x === hx0 + 3 || x === hx1 - 3) && (y === hy0 + 3 || y === hy1 - 3); if (!corner) P.set(x, y, '#0c0a1c'); }
  const ey = hy0 + 8, glyph = (rows, ex, ey0, c) => rows.forEach((r, j) => [...r].forEach((ch, i) => ch === '#' && lit(ex + i, ey0 + j, c)));
  if (face === 'eyes' || face === 'wide') { const hgt = face === 'wide' ? 5 : 4; for (const ex of [14, 24]) for (let j = 0; j < hgt; j++) { lit(ex, ey + j - (face === 'wide' ? 1 : 0)); lit(ex + 1, ey + j - (face === 'wide' ? 1 : 0)); } if (face === 'eyes') { lit(18, ey + 6); lit(19, ey + 7); lit(20, ey + 7); lit(21, ey + 6); } else { lit(19, ey + 6); lit(20, ey + 6); lit(19, ey + 7); lit(20, ey + 7); } }
  if (face === 'blink') for (const ex of [14, 24]) for (let i = -1; i < 3; i++) lit(ex + i, ey + 2);
  if (face === 'happy') for (const ex of [13, 23]) glyph(['.##.', '#..#'], ex, ey + 1);
  if (face === 'q') for (const ex of [12, 22]) glyph(['.###.', '#...#', '...#.', '..#..', '.....', '..#..'], ex, ey - 1, AMBER);
  if (face === 'dots') for (const ex of [13, 18, 23]) { lit(ex + 1, ey + 3); lit(ex + 2, ey + 3); lit(ex + 1, ey + 4); lit(ex + 2, ey + 4); }
  if (face === 'flat') { for (const ex of [13, 23]) { for (let i = 0; i < 4; i++) lit(ex + i, ey + 2); } for (let i = 17; i < 23; i++) lit(i, ey + 7); }
  const by0 = hy1 + 1, by1 = by0 + 13;
  P.fill((x, y) => (x >= 10 && x <= 30 && y >= by0 && y <= by1) ? hood(.75 - (y - by0) / 22 - (x > 26 ? .2 : 0) + (x < 13 ? -.1 : 0), x, y) : null);
  for (let x = 15; x <= 25; x++) P.set(x, by0 + 8, '#1d0f3a');
  P.set(17, by0 + 1, '#ecebf6'); P.set(23, by0 + 1, '#ecebf6'); P.set(17, by0 + 2, '#b8b4cc'); P.set(23, by0 + 2, '#b8b4cc');
  const armCol = (x, y) => hood(.45 + (y % 3 === 0 ? .1 : 0), x, y);
  for (let y = by0 + 1; y <= by0 + 10; y++) for (let x = 6; x <= 9; x++) P.set(x, y, armCol(x, y));
  for (const x of [6, 7, 8, 9]) P.set(x, by0 + 11, '#b8b4cc');
  if (arm === 'up' || arm === 'wave') {   // raised clear of the head
    const lean = arm === 'wave' ? 1 : 0;
    for (let y = by0 + 1; y <= by0 + 4; y++) for (let x = 31; x <= 35; x++) P.set(x, y, armCol(x, y));
    for (let y = by0 - 10; y <= by0 + 1; y++) for (let x = 35; x <= 38; x++) P.set(x + (y < by0 - 5 ? lean : 0), y, armCol(x, y));
    for (let x = 35; x <= 38; x++) { P.set(x + lean, by0 - 11, '#ecebf6'); P.set(x + lean, by0 - 12, '#b8b4cc'); }
    if (arm === 'up') { P.set(36, by0 - 13, '#ecebf6'); P.set(36, by0 - 14, '#ecebf6'); P.set(36, by0 - 15, '#b8b4cc'); }
  } else { for (let y = by0 + 1; y <= by0 + 10; y++) for (let x = 31; x <= 34; x++) P.set(x, y, armCol(x, y)); for (const x of [31, 32, 33, 34]) P.set(x, by0 + 11, '#b8b4cc'); }
  for (let y = by1 + 1; y <= by1 + 5 && y < FH - 2; y++) for (const x of [13, 14, 15, 16, 24, 25, 26, 27]) P.set(x, y, '#1c1828');
  for (const [x0, x1] of [[12, 17], [23, 28]]) for (let x = x0; x <= x1; x++) { P.set(x, Math.min(FH - 2, by1 + 6), '#ecebf6'); P.set(x, Math.min(FH - 1, by1 + 7), '#6e6888'); }
  P.outline(.3, [16, 10, 30]);
  return [P.done(), E.done()];
}
function makeBit(scene, pos, spx = 1 / 46) {
  const g = new THREE.Group(); g.position.set(...pos); scene.add(g);
  const sh = blob(.34, .55); sh.position.set(0, .012, 0); g.add(sh);
  const cache = {}; let cur = null;
  const get = k => {
    if (cache[k]) return cache[k];
    const [face, arm, bob] = k.split('|'), [c, e] = drawBit(face, arm, +bob);
    const m = billboard(texOf(c), FW * spx, FH * spx, { em: texOf(e), emCol: '#ffffff', emI: 1.4 }); m.visible = false; g.add(m);
    return (cache[k] = m);
  };
  return {
    group: g,
    // per frame: a face, an arm, the idle bob (2 Hz) and a blink every ~3 s unless the face is held
    set(t, face = 'eyes', arm = 'down', camera) {
      const blink = face === 'eyes' && (t % 3.1) > 2.95, bob = Math.floor(t * 2) % 2;
      const m = get(`${blink ? 'blink' : face}|${arm}|${bob}`);
      if (cur && cur !== m) cur.visible = false; m.visible = true; cur = m;
      if (camera) g.rotation.y = Math.atan2(camera.position.x - g.position.x, camera.position.z - g.position.z);
    },
    headWorld: () => new THREE.Vector3(g.position.x, FH * spx * .72, g.position.z),
  };
}

// ---------------------------------------------------------------- the room
export function buildRoom(o = {}) {
  const ss = o.ssaa ?? 1;
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.3;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  (o.mount || document.getElementById('stage')).appendChild(renderer.domElement);
  renderer.domElement.style.width = W + 'px'; renderer.domElement.style.height = H + 'px';
  const camera = new THREE.PerspectiveCamera(36, W / H, .05, 200);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b0716'); scene.fog = new THREE.Fog('#140b24', 9, 22);

  const planks = mat(woodPlanks(96, 96, { pw: 6, len: 48, seed: 2, cols: ['#1c100b', '#2f1c12', '#47291a', '#603822', '#78492b'] }));
  const panel = mat(woodPlanks(96, 96, { pw: 12, len: 96, seed: 7, nails: false, cols: ['#120a10', '#1e1018', '#2c1822', '#3a2030'] }));
  const deskWood = mat(woodPlanks(48, 48, { pw: 48, len: 96, seed: 6, nails: false, cols: ['#2a160c', '#452614', '#5e3420', '#7a4628'] }));
  const dark = new THREE.MeshStandardMaterial({ color: '#16121e', roughness: .7 });
  scene.add(mesh(new THREE.BoxGeometry(9, .1, 7).translate(0, -.05, 0), planks));
  const back = box(9, 3.4, .2, panel); back.position.set(0, 0, -2.6); scene.add(back);
  const left = box(.2, 3.4, 7, panel); left.position.set(-3.6, 0, 0); scene.add(left);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.45, 48), new THREE.MeshStandardMaterial({ map: texOf(rugTex()), roughness: 1 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(-.1, .006, .35); rug.receiveShadow = true; scene.add(rug);
  const shelfM = new THREE.MeshStandardMaterial({ map: texOf(shelfTex()), roughness: .9 });
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.1, .38), [dark, dark, dark, dark, shelfM, dark]); shelf.geometry.translate(0, 1.05, 0);
  shelf.position.set(-2.2, 0, -2.3); shelf.castShadow = shelf.receiveShadow = true; scene.add(shelf);
  const [wc, we] = windowTex();
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.4), new THREE.MeshStandardMaterial({ map: texOf(wc), emissiveMap: texOf(we), emissive: '#ffffff', emissiveIntensity: 1.6 }));
  win.rotation.y = Math.PI / 2; win.position.set(-3.48, 1.75, -.6); scene.add(win);
  [['#b05a8a', -.75, 2.3], ['#5a8ab0', -.25, 2.45], [LIME, 2.2, 2.3]].forEach(([c, x, y]) => {
    const [fc, fe] = frameTex(c); const f = new THREE.Mesh(new THREE.PlaneGeometry(.3, .38), new THREE.MeshStandardMaterial({ map: texOf(fc), emissiveMap: texOf(fe), emissive: '#ffffff', emissiveIntensity: .12 }));
    f.position.set(x, y, -2.49); scene.add(f);
  });
  // desk with a live monitor
  const desk = new THREE.Group(); desk.position.set(1.05, 0, -1.75); scene.add(desk);
  const top = box(1.9, .07, .8, deskWood); top.position.y = .76; desk.add(top);
  for (const [x, z] of [[-.88, -.33], [.88, -.33], [-.88, .33], [.88, .33]]) { const l = box(.07, .76, .07, deskWood); l.position.set(x, 0, z); desk.add(l); }
  const SW = 400, SH = 250, sc = document.createElement('canvas'); sc.width = SW; sc.height = SH;
  const stex = new THREE.CanvasTexture(sc); stex.colorSpace = THREE.SRGBColorSpace; stex.magFilter = THREE.NearestFilter; stex.minFilter = THREE.LinearFilter;
  const screenM = new THREE.MeshStandardMaterial({ map: stex, emissiveMap: stex, emissive: '#ffffff', emissiveIntensity: 1.6, roughness: .5, color: '#000000' });
  const MON = { w: 1.02, h: .64 };
  const mon = new THREE.Mesh(new THREE.BoxGeometry(MON.w + .04, MON.h + .04, .05), [dark, dark, dark, dark, screenM, dark]); mon.position.set(-.05, 1.22, -.12); mon.castShadow = true; desk.add(mon);
  const neck = box(.06, .4, .06, dark); neck.position.set(-.05, .79, -.16); desk.add(neck);
  const kb = box(.62, .03, .2, new THREE.MeshStandardMaterial({ color: '#2a2438', roughness: .6 })); kb.position.set(-.05, .83, .2); desk.add(kb);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(.05, .045, .11, 12), new THREE.MeshStandardMaterial({ color: VIOLET, roughness: .5 })); mug.position.set(.62, .885, .18); mug.castShadow = true; desk.add(mug);
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .03, 16), dark); lampBase.position.set(-.72, .815, .05); desk.add(lampBase);
  const lampArm = box(.025, .5, .025, dark); lampArm.position.set(-.72, .83, .05); lampArm.rotation.z = -.25; desk.add(lampArm);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.14, .18, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#ff8a3a', emissive: '#ff8a3a', emissiveIntensity: .5, side: THREE.DoubleSide })); shade.position.set(-.6, 1.33, .08); shade.rotation.z = -.5; desk.add(shade);
  const lamp = new THREE.PointLight('#ffb05a', 6, 7, 1.6); lamp.position.set(-.55, 1.22, .15); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -.002; desk.add(lamp);
  const lampGlow = glow('#ffb05a', .9, 1.4); lampGlow.position.copy(lamp.position); desk.add(lampGlow);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(.11, .09, .2, 12), new THREE.MeshStandardMaterial({ color: '#b0563a', roughness: .9 })); pot.position.set(.78, .9, -.2); desk.add(pot);
  for (let i = 0; i < 9; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(.09, .09, .09), new THREE.MeshStandardMaterial({ color: i % 3 ? '#3d8a3a' : '#5fb04a', roughness: .9 })); c.position.set(.78 + (h2(i, 1, 2) - .5) * .22, 1.04 + h2(i, 2, 2) * .22, -.2 + (h2(i, 3, 2) - .5) * .22); c.castShadow = true; desk.add(c); }
  const chair = new THREE.Group(); chair.position.set(1.75, 0, -1.0); chair.rotation.y = -.9; scene.add(chair);
  const seat = box(.5, .06, .5, dark); seat.position.y = .45; chair.add(seat); const backrest = box(.5, .55, .06, dark); backrest.position.set(0, .5, .22); chair.add(backrest); chair.add(box(.06, .45, .06, dark));
  const screenLight = new THREE.PointLight(VIOLET, 2.2, 3.2, 1.4); screenLight.position.set(1.0, 1.25, -1.45); scene.add(screenLight);
  // lights
  const key = new THREE.DirectionalLight('#7f8cff', .55); key.position.set(-6, 6, 2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); scene.add(key);
  scene.add(new THREE.HemisphereLight('#4a3480', '#140a10', 1.1));
  const warmFill = new THREE.PointLight('#ff8a4a', 2.2, 7, 1.5); warmFill.position.set(-2.2, 1.6, 1.2); scene.add(warmFill);
  const fill = new THREE.PointLight('#a99cff', 1.6, 6, 1.5); fill.position.set(.6, 1.6, 2.4); scene.add(fill);
  const rimGlow = glow(VIOLET, 2.4, .35); rimGlow.position.set(1.0, 1.25, -1.9); scene.add(rimGlow);
  // dust in the lamp light
  const dustG = new THREE.BufferGeometry(), DN = 140, dp = new Float32Array(DN * 3);
  dustG.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  scene.add(new THREE.Points(dustG, new THREE.PointsMaterial({ color: '#ffd9a0', size: .02, transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending })));

  const bit = makeBit(scene, o.bitPos || [-.45, 0, .55]);
  const post = makePost(renderer, scene, camera, W, H, { ssaa: ss });
  post.bloom.strength = .6; post.bloom.radius = .7; post.bloom.threshold = .8;
  const V = post.vig.uniforms; V.amt.value = .55; V.warm.value = .12; V.contrast.value = .22; V.sat.value = 1.12;

  // the monitor: a reel draws on monitor.ctx (400×250 px) each frame; the default is lines of code
  const sctx = sc.getContext('2d');
  const codeScreen = (t) => {
    sctx.fillStyle = '#0a0818'; sctx.fillRect(0, 0, SW, SH); const C = [VIOLET, LIME, '#5ad1ff', '#e8e4ff', '#ff7ab6'];
    for (let l = 0; l < 14; l++) { let x = 18 + (h2(l, 1, 3) * 4 | 0) * 14; const words = 1 + (h2(l, 2, 3) * 4 | 0); for (let k = 0; k < words; k++) { const len = 14 + (h2(l, k + 3, 3) * 60 | 0); sctx.fillStyle = C[(h2(l, k + 9, 3) * C.length) | 0]; sctx.fillRect(x, 16 + l * 16, len, 6); x += len + 10; } }
    if (Math.floor(t * 2) % 2) { sctx.fillStyle = LIME; sctx.fillRect(18, 16 + 14 * 16 - 4, 12, 8); }
  };
  const monitor = {
    ctx: sctx, w: SW, h: SH, size: MON,
    center: () => { const v = new THREE.Vector3(); mon.getWorldPosition(v); v.z += .03; return v; },
    draw: codeScreen,
  };
  const target = new THREE.Vector3();
  return {
    renderer, scene, camera, post, bit, monitor, lamp, desk,
    // set the camera from a look-at target, yaw, height and distance
    look(tx, ty, tz, yaw, h, dist) { target.set(tx, ty, tz); camera.position.set(tx + Math.sin(yaw) * dist, h, tz + Math.cos(yaw) * dist); camera.lookAt(target); camera.updateMatrixWorld(); },
    // per frame: screen, lamp, dust, focus, then render
    frame(t, o = {}) {
      (o.screen || codeScreen)(t, sctx, SW, SH); stex.needsUpdate = true;
      const fl = flick(t, 1) * .5 + .5; lamp.intensity = 6 * (.9 + .1 * fl);
      for (let i = 0; i < DN; i++) { const a = h2(i, 1, 7), b = h2(i, 2, 7), c = h2(i, 3, 7); dp[i * 3] = .1 + (a - .5) * 1.4 + Math.sin(t * .3 + i) * .05; dp[i * 3 + 1] = .2 + ((b + t * .03 * (.5 + c)) % 1) * 1.6; dp[i * 3 + 2] = -1.2 + (c - .5) * 1.2; }
      dustG.attributes.position.needsUpdate = true;
      post.dof.focus = o.focus ?? camera.position.distanceTo(bit.headWorld()); post.dof.aper = o.aper ?? 150; post.dof.maxCoc = 16;
      post.vig.uniforms.fade.value = o.fade ?? 1;
      screenM.emissiveIntensity = o.screenGlow ?? 1.6; lampGlow.scale.setScalar(.9 * (o.lampGlow ?? 1));   // close on the monitor: dim it so its text reads
      post.bloom.strength = o.bloom ?? .6; post.bloom.threshold = o.bloomThreshold ?? .8;
      post.composer.render();
    },
  };
}
