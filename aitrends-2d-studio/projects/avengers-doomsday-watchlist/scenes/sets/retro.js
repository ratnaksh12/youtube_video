// sets/retro.js — the Fantastic Four's retro-future world: lab(...) is Reed's 60s-style lab (round window,
// chalkboards, dial consoles); retroCity(...) is the googie skyline with spires, monorail and flying cars.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const retroGround = () => E.H * V(0.8, 0.68);
const RSKY = ['#2a2a5a', '#5a4a8a', '#e08a6a', '#f7c98a'];
export function spires(g, t, x0, y, w, o = {}) {
  const R = rng(o.seed || 3), col = o.color || '#1e2240', win = o.win || '#ffd59a';
  for (let x = x0; x < x0 + w; x += 120 + R() * 140) {
    const h = 200 + R() * (o.maxH || 420), bw = 30 + R() * 40;
    g.fillStyle = col; poly(g, [[x - bw / 2, y], [x + bw / 2, y], [x + bw * 0.2, y - h], [x - bw * 0.2, y - h]], col);
    g.fillStyle = col; g.beginPath(); g.ellipse(x, y - h * 0.82, bw * 1.6, 12, 0, 0, 7); g.fill(); seg(g, [[x, y - h], [x, y - h - 60]], 3, col); circle(g, x, y - h - 62, 5, '#ff8a6a');
    for (let k = 0; k < 6; k++) if (R() < 0.5) { g.fillStyle = alpha(win, 0.8); g.fillRect(x - 3, y - h * (0.2 + k * 0.1), 6, 8); }
  }
}
export function flyingCar(g, x, y, s = 1, col = '#d8e2f0') { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, 34 * s, 10 * s, 0, 0, 7); g.fill(); g.fillStyle = alpha('#9fe0ff', 0.8); g.beginPath(); g.ellipse(x, y - 8 * s, 14 * s, 9 * s, 0, Math.PI, 0); g.fill(); glow(g, x - 30 * s, y, 20 * s, '#ff9a6a', 0.6); }
export function retroCity(g, t, cam, o = {}) {
  const M = mood('dusk'), GY = retroGround(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, RSKY); FX.sun(g, CX + V(300, 120), GY - V(380, 600), 80, '#fff3dc', '#f7c98a', 5); FX.clouds(g, { y: GY - V(800, 1200), h: 260, color: '#ffe2c0', a: 0.15, seed: 8 }); });
  layer(g, cam, 0.3, (g) => spires(g, t, -E.W * 0.6, GY - V(120, 240), E.W * 2.2, { seed: 4, color: '#3a3460', maxH: 520 }));
  layer(g, cam, 0.5, (g) => {
    spires(g, t, -E.W * 0.6, GY - 40, E.W * 2.2, { seed: 9, color: '#232244', maxH: 380 });
    g.strokeStyle = '#1a1a34'; g.lineWidth = 10; g.beginPath(); g.moveTo(-E.W, GY - 260); g.quadraticCurveTo(CX, GY - 340, E.W * 2, GY - 250); g.stroke();
    const mx = ((t * 260) % (E.W * 2.4)) - E.W * 0.4; rr(g, mx, GY - 330, 260, 34, 16); g.fillStyle = '#d8e2f0'; g.fill(); for (let i = 0; i < 6; i++) { g.fillStyle = '#ffd59a'; g.fillRect(mx + 20 + i * 38, GY - 322, 20, 10); }
    for (let i = 0; i < 4; i++) flyingCar(g, ((t * (120 + i * 40) + i * 500) % (E.W * 1.6)) - E.W * 0.3, GY - 480 - i * 70, 0.9 + i * 0.1, ['#d8e2f0', '#ffcf9a', '#9fd0ff', '#f2a6c0'][i]);
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 400, ['#3a3050', '#141024']); g.fillRect(-E.W, GY - 30, E.W * 3, E.H * 2); g.strokeStyle = 'rgba(255,220,180,.15)'; g.lineWidth = 2; for (let i = -10; i < 30; i++) { g.beginPath(); g.moveTo(i * 120, GY - 30); g.lineTo(i * 180 - 400, GY + 600); g.stroke(); } FX.pool(g, CX + 200, GY, 700, 70, '#f7c98a', 0.18); });
  FX.dust(g, t, { count: 30, color: '#ffe2c0', a: 0.3 });
  return { GY, CX, M, rim: '#ffd6a8' };
}
export function chalkboard(g, x, y, w, h, t, seed = 1, k = 1) {
  rr(g, x - 8, y - 8, w + 16, h + 16, 6); g.fillStyle = '#3a2a20'; g.fill(); g.fillStyle = '#1e2a26'; g.fillRect(x, y, w, h);
  const R = rng(seed); g.strokeStyle = 'rgba(230,240,230,.7)'; g.lineWidth = 2.5; g.lineCap = 'round';
  const n = Math.floor(10 * k);
  for (let i = 0; i < n; i++) { const yy = y + 24 + i * (h - 40) / 10, xx = x + 20 + R() * 30, len = w * (0.3 + R() * 0.5); g.beginPath(); g.moveTo(xx, yy); for (let s = 0; s < len; s += 12) g.lineTo(xx + s, yy + Math.sin(s * 0.3 + i) * 5 + (R() - 0.5) * 3); g.stroke(); if (R() < 0.4) { g.beginPath(); g.arc(xx + len + 20, yy, 8, 0, 7); g.stroke(); } }
}
export function lab(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = retroGround(), CX = E.W / 2;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#1a2430', '#2a3440']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H + 10);
    const wr = V(250, 220), wx = CX, wy = GY - V(500, 860);
    g.save(); g.beginPath(); g.arc(wx, wy, wr, 0, 7); g.clip(); backdrop(g, RSKY, [wx - wr, wy - wr, wr * 2, wr * 2]); FX.sun(g, wx + 60, wy + 40, 40, '#fff3dc', '#f7c98a', 4); spires(g, t, wx - wr, wy + wr, wr * 2, { seed: 2, color: '#2a2850', maxH: 260 }); flyingCar(g, wx - wr + ((t * 90) % (wr * 2)), wy - 60, 0.8); g.restore();
    ring(g, wx, wy, wr, 22, '#3a4a5a'); ring(g, wx, wy, wr - 12, 4, '#5a6a7a'); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; circle(g, wx + Math.cos(a) * (wr + 1), wy + Math.sin(a) * (wr + 1), 5, '#7a8a9a'); }
    glow(g, wx, wy, wr * 1.6, '#f7c98a', 0.18);
    if (o.boards !== false) { chalkboard(g, CX - V(820, 470), GY - V(560, 900), V(420, 300), V(260, 240), t, 3, o.boardK ?? 1); chalkboard(g, CX + V(400, 170), GY - V(560, 900), V(420, 300), V(260, 240), t, 5, o.boardK ?? 1); }
  });
  layer(g, cam, 0.7, (g) => {
    for (const s of [-1, 1]) { const x = CX + s * V(620, 380) - 130; rr(g, x, GY - 200, 260, 160, 12); g.fillStyle = '#3a4250'; g.fill(); for (let i = 0; i < 4; i++) { circle(g, x + 40 + i * 60, GY - 150, 18, '#1a2028'); seg(g, [[x + 40 + i * 60, GY - 150], [x + 40 + i * 60 + Math.cos(t * (1 + i) + i) * 14, GY - 150 + Math.sin(t * (1 + i) + i) * 14]], 3, '#f7c98a'); } for (let i = 0; i < 8; i++) circle(g, x + 24 + i * 30, GY - 90, 6, (Math.floor(t * 3 + i) % 3) ? '#5aff9a' : '#ff6a5a'); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 400, ['#2a3440', '#0e1218']); g.fillRect(-E.W, GY - 30, E.W * 3, E.H * 2); for (let i = -12; i < 30; i++) { g.strokeStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.moveTo(i * 120, GY - 30); g.lineTo(i * 180 - 300, GY + 600); g.stroke(); } FX.pool(g, CX, GY + 10, 600, 80, '#f7c98a', 0.2); });
  FX.dust(g, t, { count: 40, color: '#ffe2c0', a: 0.35 });
  return { GY, CX, M, rim: '#ffd6a8' };
}
