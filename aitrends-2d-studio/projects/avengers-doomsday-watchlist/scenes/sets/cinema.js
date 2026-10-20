// sets/cinema.js — a dark auditorium. Key light = the giant screen (content via o.screen), projector beam
// from behind, rows of audience heads in silhouette with a rim from the screen.
import { E, V, mood, layer, rr, seg, circle, linGrad, radGrad, glow, alpha, shade, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const cinemaGround = () => E.H * V(0.8, 0.68);
export function cinema(g, t, cam, o = {}) {
  const M = mood('void'), GY = cinemaGround(), CX = E.W / 2;
  const scr = { x: CX - V(700, 470), y: V(70, 300), w: V(1400, 940), h: V(560, 560) };
  const sc = o.screenColor || '#8fb8ff';
  layer(g, cam, 0.4, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#06060c', '#0e0c18']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    for (let i = -3; i <= 3; i++) { if (!i) continue; const x = CX + i * V(330, 260); rr(g, x - 10, GY - 520, 20, 50, 6); g.fillStyle = '#ffcf8a'; g.fill(); glow(g, x, GY - 500, 90, '#ffcf8a', 0.25); }
    rr(g, scr.x - 20, scr.y - 20, scr.w + 40, scr.h + 40, 6); g.fillStyle = '#05050a'; g.fill();
    g.save(); g.beginPath(); g.rect(scr.x, scr.y, scr.w, scr.h); g.clip();
    g.fillStyle = linGrad(g, 0, scr.y, 0, scr.y + scr.h, [shade(sc, -0.55), shade(sc, -0.75)]); g.fillRect(scr.x, scr.y, scr.w, scr.h);
    o.screen?.(g, scr.x, scr.y, scr.w, scr.h, t);
    g.restore();
    glow(g, CX, scr.y + scr.h / 2, scr.w * 0.75, sc, 0.18 * (o.screenGlow ?? 1));
    g.fillStyle = '#5a0f1a'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(CX + s * (scr.w / 2 + 20), scr.y - 40); g.lineTo(CX + s * (scr.w / 2 + 160), scr.y - 40); g.lineTo(CX + s * (scr.w / 2 + 210), GY); g.lineTo(CX + s * (scr.w / 2 + 40), GY); g.closePath(); g.fill(); }
  });
  layer(g, cam, 0.75, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 200, 0, GY + 300, ['#120f1c', '#07060c']); g.fillRect(-E.W, GY - 200, E.W * 3, E.H * 2);
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, CX, E.H + 300, CX, scr.y + scr.h / 2, [alpha('#dfe8ff', 0.0), alpha('#dfe8ff', 0.05)]);
    g.beginPath(); g.moveTo(CX - 30, E.H + 300); g.lineTo(scr.x + 60, scr.y + 20); g.lineTo(scr.x + scr.w - 60, scr.y + scr.h - 20); g.closePath(); g.fill(); g.restore();
  });
  // audience rows (foreground)
  const rows = o.rows ?? 3, R = rng(9);
  for (let j = 0; j < rows; j++) {
    const d = 0.95 + j * 0.25, y = GY + 20 + j * V(110, 150), s = 1 + j * 0.45;
    layer(g, cam, d, (g) => {
      for (let x = -E.W * 0.4 + R() * 40; x < E.W * 1.4; x += 78 * s) {
        const bob = (o.cheer ? Math.max(0, Math.sin(t * 7 + x)) * 10 * o.cheer : 0), hx = x + (R() - 0.5) * 20 * s, hy = y - 60 * s - bob - R() * 10 * s;
        rr(g, x - 34 * s, y - 40 * s, 68 * s, 90 * s, 12 * s); g.fillStyle = '#2a0a12'; g.fill();
        g.fillStyle = '#07060a'; g.beginPath(); g.ellipse(hx, hy + 48 * s, 30 * s, 26 * s, 0, Math.PI, 0); g.fill(); circle(g, hx, hy, 22 * s, '#07060a');
        g.strokeStyle = alpha(sc, 0.55); g.lineWidth = 3 * s; g.beginPath(); g.arc(hx, hy, 22 * s, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
        if (o.cheer && R() < 0.25) seg(g, [[hx + 18 * s, hy + 30 * s], [hx + 34 * s, hy - 30 * s - bob]], 9 * s, '#07060a');
      }
    });
  }
  FX.dust(g, t, { count: 50, color: '#dfe8ff', a: 0.3, area: [scr.x, scr.y, scr.w, E.H] });
  return { GY, CX, M, scr };
}
