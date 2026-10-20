// sets/throne.js — Doom's castle hall: gothic arched windows on a storm (lightning flashes), green
// braziers, banners, a metal throne on steps, polished stone floor with green reflections and fog.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, radGrad, glow, alpha, shade, mix, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const throneGround = () => E.H * V(0.8, 0.68);
export const GREEN = '#5dff8a';
export function flashAt(t, times = []) { let k = 0; for (const lt of times) if (t >= lt) k = Math.max(k, Math.exp(-(t - lt) * 7) * (0.7 + 0.3 * Math.sin((t - lt) * 60))); return clamp(k); }
export function brazier(g, x, y, t, s = 1, k = 1) {
  poly(g, [[x - 40 * s, y - 120 * s], [x + 40 * s, y - 120 * s], [x + 22 * s, y - 80 * s], [x - 22 * s, y - 80 * s]], '#2a302c');
  seg(g, [[x, y - 80 * s], [x, y]], 10 * s, '#1c201e'); seg(g, [[x - 34 * s, y], [x + 34 * s, y]], 8 * s, '#1c201e');
  glow(g, x, y - 150 * s, 260 * s * k, GREEN, 0.45 * k);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const ph = t * 8 + i * 1.3, h = (70 + 30 * Math.sin(ph)) * s * k, w = (22 - i * 2) * s, dx = (i - 2.5) * 9 * s;
    g.fillStyle = i % 2 ? 'rgba(150,255,170,.7)' : 'rgba(60,220,110,.6)'; g.beginPath(); g.moveTo(x + dx - w, y - 120 * s); g.quadraticCurveTo(x + dx, y - 120 * s - h * 0.6, x + dx + Math.sin(ph) * 6 * s, y - 120 * s - h); g.quadraticCurveTo(x + dx + w * 0.4, y - 120 * s - h * 0.5, x + dx + w, y - 120 * s); g.fill(); }
  g.restore();
}
export function throneChair(g, x, y, s = 1) {
  poly(g, [[x - 230 * s, y], [x + 230 * s, y], [x + 190 * s, y - 40 * s], [x - 190 * s, y - 40 * s]], '#2a302e');
  poly(g, [[x - 170 * s, y - 40 * s], [x + 170 * s, y - 40 * s], [x + 140 * s, y - 80 * s], [x - 140 * s, y - 80 * s]], '#323a37');
  const ty = y - 80 * s; g.fillStyle = linGrad(g, x - 100 * s, 0, x + 100 * s, 0, ['#3a423f', '#6a726e', '#3a423f']);
  g.beginPath(); g.moveTo(x - 90 * s, ty); g.lineTo(x - 100 * s, ty - 360 * s); g.lineTo(x - 60 * s, ty - 430 * s); g.lineTo(x, ty - 480 * s); g.lineTo(x + 60 * s, ty - 430 * s); g.lineTo(x + 100 * s, ty - 360 * s); g.lineTo(x + 90 * s, ty); g.closePath(); g.fill();
  rr(g, x - 120 * s, ty - 130 * s, 240 * s, 30 * s, 8 * s); g.fillStyle = '#4a524e'; g.fill();
  rr(g, x - 100 * s, ty - 100 * s, 200 * s, 100 * s, 6 * s); g.fillStyle = '#2b3230'; g.fill();
  circle(g, x, ty - 300 * s, 34 * s, '#1f4a2c'); glow(g, x, ty - 300 * s, 90 * s, GREEN, 0.4);
  return ty - 100 * s;   // seat height
}
export function throneHall(g, t, cam, o = {}) {
  const M = mood('storm'), GY = throneGround(), CX = E.W / 2;
  const fl = flashAt(t, o.flashes || []);
  const stone = '#1a2420', stoneD = '#0e1512';
  layer(g, cam, 0.3, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [stoneD, stone]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H + 10);
    for (let r = 0; r < 18; r++) for (let c = -6; c < 26; c++) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(c * 120 + (r % 2) * 60, GY - r * 60, 2, 60); g.fillRect(c * 120, GY - r * 60, 120, 2); }
    for (const i of [-2, -1, 0, 1, 2]) {
      const ww = V(190, 160), wh = V(560, 760), wx = CX + i * V(420, 300) - ww / 2, wy = GY - V(760, 1000);
      FX.windowFrame(g, { x: wx, y: wy, w: ww, h: wh, cols: 2, rows: 3, frame: '#0b100e', bar: 8, arch: true }, (g, x, y, w, h) => {
        g.fillStyle = linGrad(g, 0, y, 0, y + h, [mix(M.sky[0], '#ffffff', fl * 0.6), mix(M.sky[1], '#cfe8ff', fl * 0.5), mix(M.sky[2], '#5dff8a', 0.15)]); g.fillRect(x, y, w, h);
        FX.rain(g, t, { count: 40, area: [x, y, w, h], a: 0.25, seed: 30 + i });
        if (fl > 0.3 && i === (o.boltWin ?? 1)) FX.lightning(g, { x1: x + w * 0.6, y1: y, x2: x + w * 0.3, y2: y + h * 0.8, seed: 4, a: fl, w: 3 });
      });
      glow(g, wx + ww / 2, wy + wh / 2, wh * 0.6, M.key, 0.06 + fl * 0.25);
      if (i !== 0 && Math.abs(i) === 1) { const bx = CX + i * V(210, 150); g.fillStyle = '#163a22'; g.beginPath(); g.moveTo(bx - 50, GY - V(700, 950)); g.lineTo(bx + 50, GY - V(700, 950)); g.lineTo(bx + 50, GY - V(330, 520)); g.lineTo(bx, GY - V(290, 480)); g.lineTo(bx - 50, GY - V(330, 520)); g.closePath(); g.fill(); circle(g, bx, GY - V(560, 790), 26, '#8d949c'); for (const dx of [-8, 8]) g.fillStyle = '#0c120e', g.fillRect(bx + dx - 4, GY - V(566, 796), 9, 4); }
    }
  });
  if (o.throne !== false) layer(g, cam, 0.7, (g) => { o.seatY = throneChair(g, CX + (o.throneX ?? 0), GY - V(30, 40), V(1, 0.9)); });
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 500, ['#18211d', '#060a08']); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2);
    FX.floorLines(g, GY - 40, GY + 600, 'rgba(0,0,0,.3)', 0.08);
    FX.pool(g, CX, GY + 10, 700, 110, GREEN, 0.12); FX.pool(g, CX, GY + 40, 500, 60, '#cfe8ff', 0.06 + fl * 0.2);
    for (const s of [-1, 1]) brazier(g, CX + s * V(620, 380), GY, t + s, V(1, 0.9), o.fire ?? 1);
  });
  FX.fog(g, GY - 120, 260, '#3a6a4a', 0.25);
  if (fl > 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(200,230,255,${0.12 * fl})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
  return { GY, CX, M, fl, rim: mix(M.rim, GREEN, 0.35) };
}
