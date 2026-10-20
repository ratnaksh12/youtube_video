// shots/10_3d.js — low-poly 3D shots: the packed cinema (s009), universes collapsing (s048),
// and the hall of six giant movie cases for the recap (s105).
import { E, V, S, registerShot, ease, prog, clamp, lerp, rng, alpha, shade, glow, text, linGrad, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { filmCase, MOVIES } from '../props.js';

// s009 — "in how you experience Marvel's next massive crossover."  orbit behind a packed audience
registerShot('s009', {
  kind: '3d',
  init(T) {
    const { THREE } = T;
    const st = T.stage({ mood: 'void', fov: V(38, 55), fog: [10, 48], keyPos: [0, 8, 10], keyIntensity: 0.6, ambient: 0.5, sky: '#05050a' });
    st.add(T.ground(80, 80, '#0c0a12'));
    const scr = T.canvasTex(1024, 432, (g, w, h) => { g.fillStyle = g.createLinearGradient(0, 0, 0, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#062a12'); gr.addColorStop(0.5, '#1a7a3e'); gr.addColorStop(1, '#062a12'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(10,40,20,.35)'; g.beginPath(); g.ellipse(w / 2, h / 2, 200 + i * 60, 60 + i * 14, 0, 0, 7); g.fill(); }
      g.font = '700 64px Fredoka'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(93,255,138,.9)'; g.shadowBlur = 30; g.fillStyle = '#e8fff0'; g.fillText('AVENGERS: DOOMSDAY', w / 2, h / 2); });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(19, 8), new THREE.MeshBasicMaterial({ map: scr, color: new THREE.Color(1.15, 1.15, 1.15) })); screen.position.set(0, 5.6, 9); screen.rotation.y = Math.PI; st.add(screen);
    st.add(T.box(22, 10, 0.4, '#0a0810', 0, 5, 9.4));
    for (const s of [-1, 1]) st.add(T.box(2.2, 10, 0.6, '#3a0a14', s * 11, 5, 8.8));
    const crowd = T.crowd3D({ rows: 12, perRow: 34, width: 22, step: 1.05, rise: 0.38, colors: ['#08070c', '#0c0a12', '#100c16'], z0: 6, y0: 0 }); crowd.rotation.y = 0; st.add(crowd);
    const glowLight = new THREE.PointLight(new THREE.Color('#5dff8a'), 40, 30, 1.6); glowLight.position.set(0, 5, 7); st.add(glowLight);
    const beam = T.shaft(3.5, 22, '#dfe8ff', 0.05); beam.position.set(0, 7.5, -2); beam.rotation.x = Math.PI / 2 + 0.12; st.add(beam);
    return { stage: st };
  },
  draw(s, t, info, T) { T.orbit(s.stage.camera, t, { target: [0, 3.6, 5], radius: V(17, 21), height: [8, 5.6], from: Math.PI - 0.55, to: Math.PI + 0.25, dur: info.dur }); },
  overlay(g, t) { FX.dust(g, t, { count: 40, color: '#cfffd8', a: 0.3 }); },
});

// s048 — "What happens when multiple universes begin collapsing,"
registerShot('s048', {
  kind: '3d',
  init(T) {
    const { THREE } = T, R = rng(12);
    const st = T.stage({ mood: 'void', fov: V(40, 58), fog: [14, 60], keyPos: [6, 8, 6], keyIntensity: 1.4, ambient: 0.6, sky: ['#0a0620', '#140c30', '#081624'], bloom: 0.9, bloomThreshold: 0.6 });
    const sp = []; const pos = new Float32Array(900 * 3); for (let i = 0; i < 900; i++) { const r = 40 + R() * 30, a = R() * 6.28, b = (R() - 0.5) * 3; pos.set([Math.cos(a) * r, Math.sin(b) * r * 0.6, Math.sin(a) * r], i * 3); }
    const gp = new THREE.BufferGeometry(); gp.setAttribute('position', new THREE.BufferAttribute(pos, 3)); st.add(new THREE.Points(gp, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, fog: false })));
    const hues = ['#5a7cff', '#ff6a8a', '#3ad0c0', '#c06aff', '#ffd36a', '#7aff9a', '#ff9a5a', '#9fc0ff'];
    for (let i = 0; i < 14; i++) {
      const r = 0.8 + R() * 1.6, x = (R() - 0.5) * 22, y = (R() - 0.5) * 8, z = (R() - 0.5) * 22, h = hues[i % hues.length];
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), new THREE.MeshStandardMaterial({ color: new THREE.Color(h), emissive: new THREE.Color(h), emissiveIntensity: 0.55, roughness: 0.35, metalness: 0.1, transparent: true, opacity: 0.92 }));
      m.position.set(x, y, z); st.add(m);
      const ringM = new THREE.Mesh(new THREE.TorusGeometry(r * 1.06, 0.03, 8, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(h) })); ringM.position.copy(m.position); ringM.rotation.x = R() * 3; st.add(ringM);
      const collapse = i % 3 === 0 ? 0.5 + R() * 2.2 : null, frags = [];
      if (collapse != null) for (let k = 0; k < 40; k++) { const f = T.box(0.18 + R() * 0.25, 0.12 + R() * 0.2, 0.1, new THREE.MeshStandardMaterial({ color: new THREE.Color(h), emissive: new THREE.Color(h), emissiveIntensity: 0.8 })); f.visible = false; const d = new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize(); f.userData = { d, sp: 2 + R() * 4, rs: [R() * 4, R() * 4] }; f.position.copy(m.position); st.add(f); frags.push(f); }
      sp.push({ m, ringM, r, collapse, frags, ph: R() * 6 });
    }
    return { stage: st, sp };
  },
  draw(s, t, info, T) {
    for (const u of s.sp) { u.m.rotation.y = t * 0.3 + u.ph; u.ringM.rotation.z = t * 0.4 + u.ph;
      if (u.collapse != null) { const k = clamp((t - u.collapse) / 0.6); u.m.scale.setScalar(Math.max(0.001, 1 - k)); u.ringM.scale.setScalar(Math.max(0.001, 1 + k * 1.5)); u.ringM.material.opacity = 1 - k; u.ringM.material.transparent = true;
        const dt = Math.max(0, t - u.collapse); for (const f of u.frags) { f.visible = t > u.collapse; f.position.copy(u.m.position).addScaledVector(f.userData.d, u.r * 0.6 + dt * f.userData.sp); f.rotation.set(dt * f.userData.rs[0], dt * f.userData.rs[1], 0); } } }
    T.orbit(s.stage.camera, t, { target: [0, 0, 0], radius: [V(20, 26), V(15, 20)], height: [3, 5], from: -0.7, to: 0.35, dur: info.dur });
  },
  overlay(g, t) { FX.dust(g, t, { count: 30, color: '#cfd8ff', a: 0.25 }); },
});

// s105 — "So, let's recap your essential movie watchlist:"  dolly past six giant cases
registerShot('s105', {
  kind: '3d',
  init(T) {
    const { THREE } = T;
    const st = T.stage({ mood: 'void', fov: V(40, 58), fog: [8, 40], keyPos: [-4, 10, 8], keyIntensity: 0.8, ambient: 0.4, sky: '#040408', bloom: 0.8, bloomThreshold: 0.7 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: new THREE.Color('#0c0c14'), roughness: 0.25, metalness: 0.6 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; st.add(floor);
    const cases = [];
    MOVIES.forEach((m, i) => {
      const tex = T.canvasTex(512, 728, (g, w, h) => { g.save(); g.scale(w / 380, w / 380); filmCase(g, 190, 270, 360, m, { t: 0, glowK: 0, rank: true }); g.restore(); });
      const front = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.55, roughness: 0.5 }), side = T.mat('#16141c');
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 3.12, 0.3), [side, side, side, side, front, side]); b.castShadow = true; b.position.set(-8.5 + i * 3.4, 1.6, 0); b.rotation.y = 0.12; st.add(b);
      const sh = T.shaft(2.6, 9, m.accent, 0.06); sh.position.set(b.position.x, 5, 0.6); st.add(sh);
      const pl = new THREE.PointLight(new THREE.Color(m.accent), 10, 7, 1.8); pl.position.set(b.position.x, 2, 2); st.add(pl);
      cases.push(b);
    });
    return { stage: st, cases };
  },
  draw(s, t, info, T) {
    const k = ease.inOut(clamp(t / info.dur));
    s.cases.forEach((b, i) => { b.position.y = 1.6 + Math.sin(t * 1.2 + i) * 0.05; });
    T.dolly(s.stage.camera, k * info.dur, [[0, { pos: [-11, 1.6, 6.5], look: [-6, 1.7, 0] }], [info.dur, { pos: [6, 2.2, 7.5], look: [9, 1.7, 0] }]]);
  },
  overlay(g, t) { FX.dust(g, t, { count: 40, color: '#ffe2a8', a: 0.3 }); },
});
