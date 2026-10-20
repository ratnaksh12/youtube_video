// sets/cosmos.js — the multiverse: deep violet/teal nebula, stars, floating universe bubbles and an optional
// glowing glass floor (ground) so heroes can stand "between realities".
import { E, V, mood, layer, backdrop, seg, circle, linGrad, radGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { universe, nebula } from '../props.js';

export const cosmosGround = () => E.H * V(0.8, 0.68);
export function cosmos(g, t, cam, o = {}) {
  const M = mood('void'), GY = cosmosGround(), CX = E.W / 2;
  const tint = o.tint || null;
  layer(g, cam, 0.08, (g) => {
    backdrop(g, tint ? [mix('#07061a', tint, 0.25), mix('#140c30', tint, 0.35), mix('#0a1a2a', tint, 0.2)] : ['#07061a', '#140c30', '#0a1a2a']);
    nebula(g, t, { c1: o.c1 || '#6a2a9a', c2: o.c2 || '#1a7a8a', seed: o.seed || 2 });
    FX.stars(g, t, { count: 260, seed: 9, area: [-E.W, -E.H, E.W * 3, E.H * 3] });
  });
  if (o.bubbles) layer(g, cam, o.bubbleDepth ?? 0.45, (g) => o.bubbles.forEach(b => universe(g, b.x, b.y, b.r, { t, ...b })));
  if (o.ground) layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 500, [alpha('#6a8aff', 0.35), alpha('#140c30', 0.9), '#07061a']); g.fillRect(-E.W, GY - 20, E.W * 3, E.H * 2);
    g.strokeStyle = alpha('#9fb8ff', 0.18); g.lineWidth = 1.5;
    for (let i = -24; i <= 24; i++) { g.beginPath(); g.moveTo(CX + i * 40, GY - 20); g.lineTo(CX + i * 260, GY + 600); g.stroke(); }
    for (let y = GY - 10, k = 0; y < GY + 600; y += 14 + k * 9, k++) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    FX.pool(g, CX, GY, 700, 70, '#9fb8ff', 0.2);
  });
  FX.dust(g, t, { count: 40, color: '#cfd8ff', a: 0.3 });
  return { GY, CX, M, rim: '#b8c8ff' };
}
