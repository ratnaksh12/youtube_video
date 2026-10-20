// sets/living.js — the fan's apartment at night. Key light = the TV (off-frame right, cool cyan);
// accents: window skyline + moon, a warm lamp far left. Optional tower of movie cases, couch, visible TV.
import { E, V, mood, layer, backdrop, rr, seg, circle, linGrad, radGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { couch, caseStack, tvSet } from '../props.js';

export const livingGround = () => E.H * V(0.8, 0.68);
export const TVC = '#7fd8ff';
export function living(g, t, cam, o = {}) {
  const M = mood('night'), GY = livingGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.25), wallDark = shade(M.wall, -0.55);
  const flick = 1 + (o.flicker ?? 0.08) * Math.sin(t * 23) * Math.sin(t * 7.3);
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [wallDark, wall]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H + 10);
    const wx = CX - V(760, 420), wy = GY - V(620, 900), ww = V(560, 460), wh = V(400, 520);
    FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 3, rows: 2, frame: shade(wall, -0.5), bar: 10 }, (g, x, y, w, h) => {
      g.fillStyle = linGrad(g, 0, y, 0, y + h, M.sky); g.fillRect(x, y, w, h);
      FX.stars(g, t, { area: [x, y, w, h * 0.6], count: 40, seed: 3 });
      FX.moon(g, x + w * 0.75, y + h * 0.25, 26);
      FX.skyline(g, { x: x - 20, y: y + h, w: w + 40, minH: 60, maxH: h * 0.7, color: shade(M.sky[0], -0.3), windowColor: alpha(M.practical, 0.75), lit: 0.3, seed: 12 });
    });
    glow(g, wx + ww / 2, wy + wh / 2, ww * 0.8, M.key, 0.08);
    // poster frames on the wall
    for (const [px, ph] of [[CX + V(80, 120), 0], [CX + V(330, 360), 1]]) { rr(g, px, GY - V(560, 860), 170, 240, 6); g.fillStyle = shade(wall, -0.45); g.fill(); g.fillStyle = linGrad(g, 0, GY - V(550, 850), 0, GY - V(330, 630), [alpha(ph ? '#c0262d' : '#2f6bd6', 0.35), alpha('#000', 0.2)]); g.fillRect(px + 10, GY - V(550, 850), 150, 220); circle(g, px + 85, GY - V(450, 750), 30, alpha(ph ? '#ffd36a' : '#9fc0ff', 0.35)); }
    // shelf of movies on the right
    const sx = CX + V(560, 300);
    for (let k = 0; k < 4; k++) { const sy = GY - 140 - k * 120; g.fillStyle = shade(wall, -0.6); g.fillRect(sx, sy, 300, 10); for (let i = 0; i < 16; i++) { g.fillStyle = shade(['#c0262d', '#2c4f9e', '#e3b23c', '#2f8a45', '#7a3aa8', '#b8bec8'][(i * 7 + k * 3) % 6], -0.35); g.fillRect(sx + 8 + i * 18, sy - 70 + ((i * 13 + k) % 3) * 6, 14, 70 - ((i * 13 + k) % 3) * 6); } }
  });
  layer(g, cam, 0.7, (g) => {
    // warm lamp, far left
    const lx = CX - V(880, 470); seg(g, [[lx, GY], [lx, GY - 300]], 6, '#141018'); rr(g, lx - 40, GY - 360, 80, 64, 12); g.fillStyle = '#f2c98a'; g.fill(); glow(g, lx, GY - 330, 220, M.practical, 0.35);
    FX.lightCone(g, lx, GY - 300, { angle: Math.PI / 2, spread: 0.9, len: 360, color: M.practical, a: 0.12 });
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, 0.05), shade(M.dark, -0.3)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.08);
    g.fillStyle = alpha(shade('#3a2f4a', -0.2), 0.8); g.beginPath(); g.ellipse(CX, GY + 40, 520, 60, 0, 0, 7); g.fill();
    if (o.stack) caseStack(g, CX - V(430, 300), GY, o.stack, { w: 170, th: 18, seed: 4, sway: 0.4, t });
    FX.pool(g, CX + 260, GY + 20, 600, 90, TVC, 0.18 * flick);
  });
  if (o.couch !== false) layer(g, cam, 1, (g) => couch(g, CX + (o.couchX ?? 0), GY, V(560, 520), '#3a2f4a'));
  if (o.tv) layer(g, cam, 1, (g) => tvSet(g, CX + V(700, 330), GY - V(200, 260), V(360, 300), V(210, 180), o.tvContent, TVC, 0.35 * flick));
  // the TV's light washing in from the right
  layer(g, cam, 1, (g) => { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = radGrad(g, E.W + 150, GY - 260, 0, E.W * 0.9, [alpha(TVC, 0.22 * flick), alpha(TVC, 0)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); });
  return { GY, CX, M, flick };
}
