// sets/rooftop.js — a New York rooftop at night. sky: 'night' | 'green' (Doom storm, mask in the clouds)
// | 'crack' (reality cracking, red light). Key light = moon / sky glow behind the heroes (rim from above).
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, clamp, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { cracks } from '../props.js';

export const roofGround = () => E.H * V(0.8, 0.68);
export function rooftop(g, t, cam, o = {}) {
  const M = mood('night'), GY = roofGround(), CX = E.W / 2, sky = o.sky || 'night';
  const gk = o.greenK ?? (sky === 'green' ? 1 : 0), ck = o.crackK ?? (sky === 'crack' ? 1 : 0);
  layer(g, cam, 0.1, (g) => {
    backdrop(g, [mix(M.sky[0], '#06140c', gk * 0.7), mix(M.sky[1], '#12402a', gk * 0.8), mix(M.sky[2], '#2a8a4a', gk * 0.6)]);
    FX.stars(g, t, { count: 160, seed: 7, area: [-E.W * 0.5, -E.H * 0.5, E.W * 2, E.H] });
    if (gk < 0.9) FX.moon(g, CX + V(520, 260), GY - V(720, 1200), 48);
    if (gk > 0) {
      g.save(); g.globalAlpha *= gk;
      for (let i = 0; i < 9; i++) { const a = t * 0.15 + i * 0.7, rr2 = 240 + i * 70; g.fillStyle = alpha(i % 2 ? '#1c4a2c' : '#0c2416', 0.55); g.beginPath(); g.ellipse(CX + Math.cos(a) * 60, GY - V(640, 1100) + Math.sin(a) * 30, rr2, rr2 * 0.32, a * 0.3, 0, 7); g.fill(); }
      const mk = o.maskK ?? 0; if (mk > 0) { const mx = CX, my = GY - V(640, 1100), r = 170; g.globalAlpha *= mk; g.fillStyle = 'rgba(10,30,18,.55)'; rr(g, mx - r * 0.8, my - r, r * 1.6, r * 2, r * 0.4); g.fill(); for (const s of [-1, 1]) { rr(g, mx + (s > 0 ? r * 0.12 : -r * 0.62), my - r * 0.3, r * 0.5, r * 0.16, 8); g.fillStyle = '#9dffb6'; g.fill(); glow(g, mx + s * r * 0.36, my - r * 0.22, 140, '#5dff8a', 0.6); } }
      g.restore();
    }
    if (ck > 0) { glow(g, CX + V(120, 0), GY - V(600, 1000), 700, '#ff3a2a', 0.25 * ck); cracks(g, CX + V(120, 0), GY - V(600, 1000), { len: 900 * ck, count: 8, seed: 11, glowC: o.crackColor || '#ff4a3a', a: clamp(ck * 2), w: 4 }); }
  });
  layer(g, cam, 0.25, (g) => FX.skyline(g, { x: -E.W, y: GY - V(200, 420), w: E.W * 3, minH: 120, maxH: V(520, 900), color: mix('#141a34', '#0a1a10', gk * 0.6), windowColor: alpha(M.practical, 0.55), lit: 0.22, seed: 21, minW: 50, maxW: 120 }));
  layer(g, cam, 0.45, (g) => { FX.skyline(g, { x: -E.W, y: GY - V(60, 200), w: E.W * 3, minH: 120, maxH: V(380, 700), color: mix('#0e1226', '#06120a', gk * 0.6), windowColor: alpha(M.practical, 0.85), lit: 0.3, seed: 5, minW: 60, maxW: 150 }); FX.fog(g, GY - V(240, 420), 220, mix(M.fog, '#2a6a4a', gk), 0.3); });
  layer(g, cam, 0.75, (g) => {
    const wx = CX + V(640, 330), wy = GY - 40;
    for (const dx of [-50, 50]) seg(g, [[wx + dx, wy], [wx + dx * 0.7, wy - 170]], 8, '#0b0c16');
    rr(g, wx - 80, wy - 330, 160, 170, 10); g.fillStyle = '#0d0f1c'; g.fill(); poly(g, [[wx - 90, wy - 330], [wx + 90, wy - 330], [wx, wy - 400]], '#0d0f1c');
    seg(g, [[CX - V(700, 380), GY - 40], [CX - V(700, 380), GY - 380]], 4, '#0b0c16'); circle(g, CX - V(700, 380), GY - 384, 6, '#ff3a3a'); glow(g, CX - V(700, 380), GY - 384, 30, '#ff3a3a', 0.5 + 0.5 * Math.sin(t * 3));
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 400, ['#1a1c2c', '#07080e']); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    g.fillStyle = '#10121e'; g.fillRect(-E.W, GY - 40, E.W * 3, 14);
    for (const x of [CX - V(420, 200), CX + V(260, 120)]) { rr(g, x, GY - 70, 90, 50, 6); g.fillStyle = '#12141f'; g.fill(); }
    FX.pool(g, CX, GY + 10, 600, 70, mix(M.key, '#5dff8a', gk), 0.14);
  });
  FX.dust(g, t, { count: 30, color: mix('#cfd8ff', '#9dffb6', gk), a: 0.25 });
  return { GY, CX, M, rim: mix(M.rim, '#7dffa0', gk * 0.7) };
}
