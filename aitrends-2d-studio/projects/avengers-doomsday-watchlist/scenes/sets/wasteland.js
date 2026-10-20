// sets/wasteland.js — open battlefields under a low sun. variant: 'void' (yellow desert, wrecks),
// 'titan' (red-orange sky, tilted ruins, floating debris), 'dusk' (purple-orange battlefield with smoke).
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const wasteGround = () => E.H * V(0.8, 0.68);
const SKIES = {
  void: ['#5a4a6a', '#c98a4a', '#f2c46a', '#f7dc9a'],
  titan: ['#3a1a2a', '#8a2a2a', '#e0643a', '#f2a65a'],
  dusk: ['#2a2350', '#6a3a6a', '#d0704a', '#f2b070'],
};
export function wasteland(g, t, cam, o = {}) {
  const v = o.variant || 'dusk', M = mood(v === 'void' ? 'golden' : 'dusk'), GY = wasteGround(), CX = E.W / 2, sky = SKIES[v];
  const ground = v === 'void' ? '#4a3424' : v === 'titan' ? '#3a1c18' : '#2a1e2a';
  const sunX = CX + (o.sunX ?? V(-380, -140)), sunY = GY - V(260, 420);
  layer(g, cam, 0.1, (g) => {
    backdrop(g, sky);
    FX.sun(g, sunX, sunY, V(70, 80), '#fff3dc', sky[3], 6);
    FX.godRays(g, sunX, sunY, { count: 12, angle: -Math.PI / 2, spread: Math.PI * 1.7, len: 1600, a: 0.05, t, color: sky[3] });
    FX.clouds(g, { y: GY - V(700, 1100), h: 300, color: sky[3], a: 0.12, seed: 4 });
    if (v === 'titan') for (let i = 0; i < 9; i++) { const x = (i * 263) % E.W, y = GY - 500 - (i * 97) % 300 + Math.sin(t * 0.4 + i) * 8; poly(g, [[x - 40, y], [x + 50, y - 20], [x + 30, y + 30], [x - 30, y + 26]], alpha('#2a1018', 0.85)); }
  });
  layer(g, cam, 0.3, (g) => FX.hills(g, { y: GY - V(90, 200), amp: 140, color: mix(sky[1], ground, 0.55), seed: 3 }));
  layer(g, cam, 0.5, (g) => {
    const R = rng(v.length * 7);
    if (v === 'titan') for (let i = 0; i < 6; i++) { const x = CX - 1000 + i * 420 + R() * 100, h = 260 + R() * 260, a = (R() - 0.5) * 0.5; g.save(); g.translate(x, GY - 60); g.rotate(a); g.fillStyle = mix('#1e0c12', sky[1], 0.25); g.fillRect(-40, -h, 80, h); poly(g, [[-40, -h], [40, -h], [0, -h - 70]], mix('#1e0c12', sky[1], 0.25)); g.restore(); }
    if (v === 'void') for (let i = 0; i < 5; i++) { const x = CX - 900 + i * 460 + R() * 120; rr(g, x, GY - 120 - R() * 60, 140 + R() * 120, 60, 8); g.fillStyle = mix('#2a1a12', sky[1], 0.3); g.fill(); seg(g, [[x + 30, GY - 60], [x + 10, GY - 240]], 8, mix('#2a1a12', sky[1], 0.3)); }
    if (v === 'dusk') { for (let i = 0; i < 4; i++) { const x = CX - 800 + i * 520 + R() * 100; g.fillStyle = alpha('#2a2030', 0.5); g.beginPath(); g.ellipse(x, GY - 300, 60, 260, 0.1, 0, 7); g.fill(); } FX.skyline(g, { x: -E.W, y: GY - 40, w: E.W * 3, minH: 40, maxH: 220, color: mix('#1a1420', sky[1], 0.25), windowColor: alpha('#ff9a5a', 0.4), lit: 0.08, seed: 33 }); }
    FX.fog(g, GY - 160, 200, sky[2], 0.22);
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 400, [shade(ground, 0.12), shade(ground, -0.55)]); g.fillRect(-E.W, GY - 30, E.W * 3, E.H * 2);
    const R = rng(5); for (let i = 0; i < 26; i++) { const x = -E.W * 0.3 + R() * E.W * 1.6, y = GY + R() * 260, w = 20 + R() * 60; g.fillStyle = alpha(shade(ground, -0.4), 0.8); g.beginPath(); g.ellipse(x, y, w, w * 0.3, 0, 0, 7); g.fill(); }
    FX.pool(g, sunX + 200, GY + 10, 800, 80, sky[3], 0.12);
  });
  FX.dust(g, t, { count: 60, color: sky[3], a: 0.4, speed: 6 });
  return { GY, CX, M, sky, rim: mix(sky[3], '#ffffff', 0.25), sunX, sunY };
}
