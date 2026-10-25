// Pixel Room props: word blocks (a token, a word, a label as a lit block), bars that grow, a cloud of tiny cubes, a thermometer.
import * as THREE from 'three';
import { LIME, AMBER, VIOLET } from './room.js';

// text drawn small and thresholded, so its edges stay hard pixels when magnified
function faceCanvas(text, o = {}) {
  const h = o.h ?? 38, size = o.size ?? 22, pad = 10, font = `800 ${size}px Montserrat`;
  const meas = document.createElement('canvas').getContext('2d'); meas.font = font;
  const w = Math.max(h, Math.ceil(meas.measureText(text).width) + pad * 2);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const tc = document.createElement('canvas'); tc.width = w; tc.height = h; const tg = tc.getContext('2d');
  tg.font = font; tg.textAlign = 'center'; tg.textBaseline = 'middle'; tg.fillStyle = '#fff'; tg.fillText(text, w / 2, h / 2 + 1);
  const d = tg.getImageData(0, 0, w, h); for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0; tg.putImageData(d, 0, 0);
  tg.globalCompositeOperation = 'source-in'; tg.fillStyle = o.ink ?? '#f4f1ff'; tg.fillRect(0, 0, w, h);
  g.fillStyle = o.bg ?? '#1a1030'; g.fillRect(0, 0, w, h);
  g.fillStyle = o.edge ?? '#5232a2'; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2); g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h);
  g.drawImage(tc, 0, 0);
  return c;
}
const darkSide = new THREE.MeshStandardMaterial({ color: '#130b24', roughness: .6 });
export function wordBlock(text, o = {}) {
  const c = faceCanvas(text, o), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.LinearFilter;
  const hM = o.hM ?? .24, wM = c.width / c.height * hM, dM = o.dM ?? .12;
  const face = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: o.glow ?? .9, roughness: .5 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(wM, hM, dM), [darkSide, darkSide, darkSide, darkSide, face, darkSide]);
  m.castShadow = true;
  const g = new THREE.Group(); g.add(m); g.userData = { w: wM, h: hM, face, text };
  return g;
}
// a bar that grows from the floor: set(k) with k = height in metres
export function growBar(col = LIME, w = .26, d = .26) {
  const geo = new THREE.BoxGeometry(w, 1, d); geo.translate(0, .5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: .55, roughness: .4, transparent: true, opacity: .92 }));
  m.castShadow = true; m.scale.y = .001;
  const g = new THREE.Group(); g.add(m);
  return { group: g, mesh: m, set(hgt) { m.scale.y = Math.max(.001, hgt); m.visible = hgt > .002; } };
}
// a swarm of tiny glowing cubes ("every token it knows"); place(i, t) → [x, y, z] or null to hide
export function cubeCloud(n = 260) {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(.035, .035, .035), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), n);
  const cols = [LIME, VIOLET, '#5ad1ff', AMBER, '#f4f1ff', '#ff7ab6'], c = new THREE.Color(), M = new THREE.Matrix4(), Z = new THREE.Matrix4().makeScale(0, 0, 0);
  for (let i = 0; i < n; i++) { im.setColorAt(i, c.set(cols[i % cols.length]).multiplyScalar(1.6)); im.setMatrixAt(i, Z); }
  return {
    mesh: im,
    update(place) { for (let i = 0; i < n; i++) { const p = place(i); if (p) { M.makeTranslation(p[0], p[1], p[2]); if (p[3] != null) M.scale(new THREE.Vector3(p[3], p[3], p[3])); im.setMatrixAt(i, M); } else im.setMatrixAt(i, Z); } im.instanceMatrix.needsUpdate = true; },
  };
}
// a glass thermometer: set(k) fills it 0..1
export function thermometer(hgt = .9) {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, hgt, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#c8c0ff', transparent: true, opacity: .25, roughness: .1, side: THREE.DoubleSide }));
  glass.position.y = .12 + hgt / 2; g.add(glass);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 12), new THREE.MeshStandardMaterial({ color: '#ff4a3a', emissive: '#ff4a3a', emissiveIntensity: .8 })); bulb.position.y = .1; g.add(bulb);
  const fg = new THREE.CylinderGeometry(.035, .035, 1, 12); fg.translate(0, .5, 0);
  const fill = new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ color: '#ff4a3a', emissive: '#ff4a3a', emissiveIntensity: .9 })); fill.position.y = .12; g.add(fill);
  for (let i = 1; i < 6; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(.05, .008, .008), new THREE.MeshBasicMaterial({ color: '#c8c0ff' })); tk.position.set(.08, .12 + i * hgt / 6, 0); g.add(tk); }
  return { group: g, set(k) { fill.scale.y = Math.max(.01, k * hgt); } };
}
