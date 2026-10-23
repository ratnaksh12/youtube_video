// sets70.js — locations for the Doom = Tony theory. All anchored to GY = E.H*V(0.8,0.68), CX = E.W/2.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, clamp, ease, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { alarmLight, pedestal, GREEN } from './kit70.js';

export const GY = () => E.H * V(0.8, 0.68);

// 1970 army base, golden afternoon. o.alarm (0..1) adds red alarm lights
export function base70(g, t, cam, o = {}) {
  const M = mood('golden'), gy = GY(), CX = E.W / 2, al = o.alarm || 0;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX + V(560, 240), gy - V(520, 800), 70, '#fff3dc', M.key, 5); FX.clouds(g, { y: gy - V(800, 1200), h: 260, color: '#fff0d8', a: 0.18, seed: 6 }); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: gy - V(140, 260), amp: 110, color: '#7a5a4a', seed: 5 }); for (let i = 0; i < 9; i++) FX.tree(g, -E.W * 0.3 + i * 330, gy - V(130, 250), 0.9, '#4a3a34'); });
  layer(g, cam, 0.55, (g) => {
    for (const [dx, w, h] of [[-820, 520, 230], [-160, 460, 260], [460, 560, 220]]) { const x = CX + dx; g.fillStyle = '#5a5a3e'; g.fillRect(x, gy - h, w, h); poly(g, [[x - 20, gy - h], [x + w + 20, gy - h], [x + w - 20, gy - h - 60], [x + 20, gy - h - 60]], '#3e3e2a');
      for (let k = 0; k < Math.floor(w / 90); k++) { g.fillStyle = '#2a2a1e'; g.fillRect(x + 30 + k * 90, gy - h + 60, 46, 60); g.fillStyle = alpha('#ffe2a8', 0.35); g.fillRect(x + 34 + k * 90, gy - h + 64, 38, 22); }
      g.fillStyle = '#2a2a1e'; g.fillRect(x + w / 2 - 30, gy - 110, 60, 110); }
    text(g, 'U.S. ARMY', CX - 160 + 230, gy - 290, { size: 30, color: '#f2e6c8', font: FONTS.ui, weight: 900, spacing: 6 });
    const fx = CX + V(330, 160); seg(g, [[fx, gy], [fx, gy - 420]], 6, '#d8d0c0'); for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#f2ece4' : '#b3302a'; const wv = Math.sin(t * 3 + i * 0.5) * 6; g.fillRect(fx + 3, gy - 420 + i * 12, 150 + wv, 12); } g.fillStyle = '#2a4fa0'; g.fillRect(fx + 3, gy - 420, 60, 48);
    seg(g, [[-E.W, gy - 60], [E.W * 2, gy - 60]], 3, '#8a8070'); for (let x = -E.W; x < E.W * 2; x += 60) seg(g, [[x, gy - 60], [x, gy]], 3, '#8a8070');
    if (al > 0) for (const x of [CX - 560, CX + 300]) alarmLight(g, x, gy - 300, 1, t, al);
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, gy - 30, 0, gy + 400, ['#a08060', '#4a3828']); g.fillRect(-E.W, gy - 30, E.W * 3, E.H * 2);
    const jx = CX - V(600, 300); rr(g, jx, gy - 90, 220, 70, 10); g.fillStyle = '#4a5530'; g.fill(); rr(g, jx + 120, gy - 140, 90, 54, 8); g.fill(); circle(g, jx + 40, gy - 18, 26, '#1a1a14'); circle(g, jx + 180, gy - 18, 26, '#1a1a14'); g.fillStyle = '#f2e6c8'; g.fillRect(jx + 60, gy - 70, 20, 20);
    FX.pool(g, CX, gy + 10, 700, 80, M.key, 0.2);
  });
  if (al > 0) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,40,30,${0.25 * al * (0.6 + 0.4 * Math.sin(t * 8))})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  FX.dust(g, t, { count: 50, color: '#ffe2bd', a: 0.4 });
  return { GY: gy, CX, M, rim: M.rim };
}

// the storage vault where the Tesseract sits (cold light). o.alarm, o.cube (drawn by the shot)
export function vault70(g, t, cam, o = {}) {
  const M = mood('interiorCool'), gy = GY(), CX = E.W / 2, al = o.alarm || 0;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, gy, ['#14161e', '#2a2e3a']); g.fillRect(-E.W, -E.H, E.W * 3, gy + E.H + 10);
    for (let i = -6; i < 16; i++) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i * 180, -E.H, 4, gy + E.H); }
    for (const s of [-1, 1]) for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = CX + s * (420 + c * 130) - 55, y = gy - 120 - r * 120; rr(g, x, y, 110, 100, 4); g.fillStyle = shade('#5a5040', -0.2 - r * 0.05); g.fill(); seg(g, [[x, y], [x + 110, y + 100]], 2, 'rgba(0,0,0,.3)'); seg(g, [[x + 110, y], [x, y + 100]], 2, 'rgba(0,0,0,.3)'); }
    for (const x of [CX - 300, CX, CX + 300]) { rr(g, x - 90, gy - V(620, 960), 180, 14, 6); g.fillStyle = '#dfe8ff'; g.fill(); FX.lightCone(g, x, gy - V(610, 950), { len: 650, spread: 0.7, color: '#cfe0ff', a: 0.1 }); }
    if (al > 0) alarmLight(g, CX + 520, gy - V(560, 900), 1.2, t, al);
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, gy - 30, 0, gy + 400, ['#2a2e38', '#0c0e14']); g.fillRect(-E.W, gy - 30, E.W * 3, E.H * 2); FX.floorLines(g, gy - 30, gy + 500, 'rgba(0,0,0,.3)', 0.08); if (o.pedestal !== false) pedestal(g, CX, gy - 100, 1.2, o.glass !== false); FX.pool(g, CX, gy, 420, 60, o.cubeGlow ? '#6ab8ff' : '#cfe0ff', o.cubeGlow ? 0.35 : 0.12); });
  if (al > 0) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = `rgba(255,40,30,${0.3 * al * (0.6 + 0.4 * Math.sin(t * 8))})`; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  FX.dust(g, t, { count: 40, color: '#cfe0ff', a: 0.3 });
  return { GY: gy, CX, M, rim: '#cfe0ff', cubeY: gy - 100 - 1.2 * 110 };
}

export function interro(g, t, cam) {
  const gy = GY(), CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { g.fillStyle = '#0a0a0e'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); rr(g, CX + 380, gy - 520, 360, 200, 6); g.fillStyle = '#14161c'; g.fill(); g.fillStyle = 'rgba(140,160,190,.12)'; g.fillRect(CX + 390, gy - 510, 340, 180); });
  const sw = Math.sin(t * 1.3) * 18;
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = '#121216'; g.fillRect(-E.W, gy - 20, E.W * 3, E.H);
    seg(g, [[CX, -E.H], [CX + sw * 0.3, gy - 560]], 3, '#2a2a2e'); poly(g, [[CX - 60 + sw * 0.3, gy - 520], [CX + 60 + sw * 0.3, gy - 520], [CX + 30 + sw * 0.3, gy - 570], [CX - 30 + sw * 0.3, gy - 570]], '#3a3a40');
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, gy - 520, 0, gy, ['rgba(255,230,180,.28)', 'rgba(255,230,180,.06)']); g.beginPath(); g.moveTo(CX - 50 + sw * 0.3, gy - 520); g.lineTo(CX + 50 + sw * 0.3, gy - 520); g.lineTo(CX + 420, gy); g.lineTo(CX - 420, gy); g.closePath(); g.fill(); g.restore();
    rr(g, CX - 260, gy - 150, 520, 18, 4); g.fillStyle = '#3a3030'; g.fill(); seg(g, [[CX - 240, gy - 132], [CX - 240, gy]], 8, '#2a2222'); seg(g, [[CX + 240, gy - 132], [CX + 240, gy]], 8, '#2a2222');
    FX.pool(g, CX, gy + 10, 460, 60, '#ffe2b0', 0.3);
  });
  FX.dust(g, t, { count: 30, color: '#ffe2b0', a: 0.35, area: [CX - 400, 0, 800, E.H] });
  return { GY: gy, CX, rim: '#ffe2b0' };
}

// warm 1970s home. o.night -> fireplace light
export function home70(g, t, cam, o = {}) {
  const gy = GY(), CX = E.W / 2, night = !!o.night, key = night ? '#ff9a4a' : '#ffcf8a';
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = night ? '#2a1a14' : '#6a4a34'; g.fillRect(-E.W, -E.H, E.W * 3, gy + E.H + 10);
    for (let x = -E.W; x < E.W * 2; x += 70) { g.fillStyle = alpha(night ? '#3a241a' : '#7a5a40', 0.6); g.fillRect(x, -E.H, 30, gy + E.H); }
    const wx = CX + V(260, 120), wy = gy - V(560, 860);
    FX.windowFrame(g, { x: wx, y: wy, w: 380, h: 300, cols: 2, rows: 2, frame: '#3a2418', bar: 10 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, night ? ['#0b1028', '#2a2a5a'] : ['#e8a060', '#ffd9a0']); g.fillRect(x, y, w, h); if (night) FX.stars(g, t, { area: [x, y, w, h], count: 30, seed: 4 }); else FX.sun(g, x + w * 0.6, y + h * 0.5, 30, '#fff3dc', '#ffd59a', 3); });
    if (!night) FX.godRays(g, wx + 190, wy + 150, { count: 6, angle: Math.PI * 0.62, spread: 0.6, len: 900, a: 0.06, t });
    for (const [px, ph] of [[CX - V(520, 300), 0], [CX - V(320, 120), 1]]) { rr(g, px, gy - V(560, 860), 150, 190, 4); g.fillStyle = '#3a2418'; g.fill(); g.fillStyle = ph ? '#c9a070' : '#a07a5a'; g.fillRect(px + 12, gy - V(548, 848), 126, 166); }
  });
  layer(g, cam, 0.7, (g) => {
    if (night) { const fx = CX - V(560, 320); rr(g, fx - 150, gy - 280, 300, 280, 10); g.fillStyle = '#4a3024'; g.fill(); rr(g, fx - 100, gy - 180, 200, 180, 10); g.fillStyle = '#120806'; g.fill(); for (let i = 0; i < 5; i++) { const ph = t * 8 + i, h = 70 + 30 * Math.sin(ph); g.fillStyle = i % 2 ? 'rgba(255,200,80,.85)' : 'rgba(255,110,40,.8)'; g.beginPath(); g.moveTo(fx - 60 + i * 30, gy - 10); g.quadraticCurveTo(fx - 50 + i * 30, gy - 10 - h * 0.6, fx - 45 + i * 30 + Math.sin(ph) * 5, gy - 10 - h); g.quadraticCurveTo(fx - 40 + i * 30, gy - 10 - h * 0.5, fx - 30 + i * 30, gy - 10); g.fill(); } glow(g, fx, gy - 80, 500, key, 0.45); }
    else { const lx = CX - V(700, 400); seg(g, [[lx, gy], [lx, gy - 280]], 5, '#2a1a12'); poly(g, [[lx - 50, gy - 280], [lx + 50, gy - 280], [lx + 32, gy - 340], [lx - 32, gy - 340]], '#e8c08a'); glow(g, lx, gy - 300, 200, key, 0.3); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, gy - 30, 0, gy + 400, [night ? '#3a2418' : '#5a3a24', '#1a0e08']); g.fillRect(-E.W, gy - 30, E.W * 3, E.H * 2); g.fillStyle = alpha('#8a3a2a', 0.5); g.beginPath(); g.ellipse(CX, gy + 40, 500, 60, 0, 0, 7); g.fill(); FX.pool(g, CX, gy + 10, 600, 80, key, 0.25); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.4 });
  return { GY: gy, CX, rim: night ? '#ffb070' : '#ffd6a8', key };
}

// Latveria: mountains, a castle on the hill, a village. o.night, o.tech (0..1: green high-tech spires)
export function latveria(g, t, cam, o = {}) {
  const gy = GY(), CX = E.W / 2, night = !!o.night, tk = o.tech || 0;
  const sky = night ? ['#060a14', '#10202a', '#1a3a3a'] : ['#2a2a4a', '#5a5a7a', '#c08a7a', '#e8b890'];
  layer(g, cam, 0.08, (g) => { backdrop(g, sky); if (night) { FX.stars(g, t, { count: 160, seed: 3, area: [-E.W, -E.H, E.W * 3, E.H] }); FX.moon(g, CX - V(560, 260), gy - V(700, 1100), 46, '#e8f0ec'); } else FX.sun(g, CX + V(500, 200), gy - V(380, 560), 60, '#fff3dc', '#ffcf9a', 4); });
  layer(g, cam, 0.2, (g) => { g.fillStyle = night ? '#16222a' : '#4a4a62'; g.beginPath(); g.moveTo(-E.W, gy); for (let x = -E.W; x <= E.W * 2; x += 120) g.lineTo(x, gy - 360 - Math.abs(Math.sin(x * 0.0031)) * 380 - (x % 240 ? 0 : 60)); g.lineTo(E.W * 2, gy); g.fill(); g.fillStyle = alpha('#e8eef0', 0.5); for (let x = -E.W; x <= E.W * 2; x += 240) { const h = 360 + Math.abs(Math.sin(x * 0.0031)) * 380 + 60; poly(g, [[x - 40, gy - h + 70], [x, gy - h], [x + 40, gy - h + 70]], alpha('#e8eef0', 0.5)); } });
  layer(g, cam, 0.4, (g) => {
    const hx = CX + V(80, 0); g.fillStyle = night ? '#0e1a14' : '#3a4038'; g.beginPath(); g.moveTo(hx - 700, gy - 60); g.quadraticCurveTo(hx, gy - 420, hx + 700, gy - 60); g.lineTo(hx + 700, gy); g.lineTo(hx - 700, gy); g.fill();
    const cy = gy - 360, cc = night ? '#141e18' : '#4a4e46';
    g.fillStyle = cc; g.fillRect(hx - 170, cy - 140, 340, 160);
    for (const [dx, h, w] of [[-190, 300, 70], [190, 300, 70], [-60, 380, 60], [60, 420, 66], [0, 470, 44]]) { g.fillStyle = cc; g.fillRect(hx + dx - w / 2, cy - h + 20, w, h); poly(g, [[hx + dx - w / 2 - 8, cy - h + 20], [hx + dx + w / 2 + 8, cy - h + 20], [hx + dx, cy - h - 60]], shade(cc, -0.2)); g.fillStyle = night ? alpha('#ffcf8a', 0.85) : alpha('#ffe2a8', 0.5); g.fillRect(hx + dx - 7, cy - h + 70, 14, 24); }
    for (const dx of [-120, 120]) { g.fillStyle = '#1f5a30'; poly(g, [[hx + dx - 22, cy - 120], [hx + dx + 22, cy - 120], [hx + dx + 22, cy - 20], [hx + dx, cy - 36], [hx + dx - 22, cy - 20]], '#1f5a30'); }
    if (tk > 0) { g.save(); g.globalAlpha *= tk; for (const [dx, h] of [[-420, 360], [-300, 480], [300, 520], [430, 380]]) { const x = hx + dx, b = gy - 120; poly(g, [[x - 24, b], [x + 24, b], [x + 6, b - h * tk], [x - 6, b - h * tk]], night ? '#16261c' : '#3a4a40'); circle(g, x, b - h * tk, 9, GREEN); glow(g, x, b - h * tk, 120, GREEN, 0.5); for (let k = 1; k < 6; k++) circle(g, x, b - (h * tk * k) / 6, 4, alpha(GREEN, 0.8)); } g.restore(); glow(g, hx, cy - 200, 700, GREEN, 0.15 * tk); }
    glow(g, hx, cy - 100, 400, night ? '#ffcf8a' : '#ffe2a8', night ? 0.15 : 0.08);
  });
  layer(g, cam, 0.7, (g) => { const R = rng(5); for (let i = 0; i < 18; i++) { const x = -E.W * 0.3 + i * 150 + R() * 40, w = 90 + R() * 50, h = 80 + R() * 60, y = gy - 20; g.fillStyle = night ? '#120e0c' : '#5a4034'; g.fillRect(x, y - h, w, h); poly(g, [[x - 10, y - h], [x + w + 10, y - h], [x + w / 2, y - h - 50]], night ? '#1e1410' : '#7a3a2a'); if (R() < 0.7) { g.fillStyle = night ? '#ffcf8a' : alpha('#ffe2a8', 0.6); g.fillRect(x + w * 0.35, y - h * 0.6, 18, 22); if (night) glow(g, x + w * 0.35 + 9, y - h * 0.6 + 11, 50, '#ffcf8a', 0.3); } } });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, gy - 30, 0, gy + 400, [night ? '#1a1612' : '#5a4a3a', '#0a0806']); g.fillRect(-E.W, gy - 30, E.W * 3, E.H * 2); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-E.W + i * 110, gy - 30, 4, E.H); } FX.pool(g, CX, gy, 700, 70, night ? '#ffcf8a' : '#ffd6a8', 0.15); });
  FX.fog(g, gy - 200, 260, night ? '#2a3a3a' : '#c8a8a0', 0.25);
  FX.dust(g, t, { count: 40, color: night ? '#cfe8d8' : '#ffe2bd', a: 0.35 });
  return { GY: gy, CX, rim: night ? '#bfe8d0' : '#ffd6a8' };
}

// a ship leaving New York harbour at dusk
export function harbor(g, t, cam) {
  const M = mood('dusk'), gy = GY(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX - V(500, 200), gy - V(180, 300), 60, '#fff3dc', M.key, 5); });
  layer(g, cam, 0.3, (g) => { FX.skyline(g, { x: -E.W * 0.6, y: gy - 150, w: E.W * 1.2, minH: 80, maxH: 380, color: '#2a2040', windowColor: alpha(M.practical, 0.7), lit: 0.3, seed: 9 }); const sx = CX + V(560, 300), sy = gy - 150; poly(g, [[sx - 40, sy], [sx + 40, sy], [sx + 22, sy - 60], [sx - 22, sy - 60]], '#2a2040'); g.fillStyle = '#2a2040'; g.fillRect(sx - 10, sy - 200, 20, 140); circle(g, sx, sy - 210, 14, '#2a2040'); seg(g, [[sx + 8, sy - 200], [sx + 30, sy - 280]], 7, '#2a2040'); circle(g, sx + 32, sy - 290, 9, '#ffcf8a'); glow(g, sx + 32, sy - 290, 50, '#ffcf8a', 0.5); });
  layer(g, cam, 0.6, (g) => { g.fillStyle = linGrad(g, 0, gy - 150, 0, gy + 300, ['#5a3a5a', '#1a1428']); g.fillRect(-E.W, gy - 150, E.W * 3, E.H); for (let i = 0; i < 40; i++) FX.lensStreak(g, CX - V(500, 200) + Math.sin(i * 2.7) * 80, gy - 140 + i * 6, 160 + (i % 4) * 60, '#ffd6a8', 0.25, 2); });
  layer(g, cam, 0.9, (g) => { const bx = CX - 200 + t * 40, by = gy + 40; poly(g, [[bx - 420, by - 90], [bx + 380, by - 90], [bx + 300, by], [bx - 380, by]], '#14101c'); g.fillStyle = '#1c1624'; g.fillRect(bx - 200, by - 180, 300, 90); g.fillRect(bx - 80, by - 270, 60, 90); g.fillStyle = '#b3302a'; g.fillRect(bx - 80, by - 270, 60, 16); for (let i = 0; i < 8; i++) { g.fillStyle = alpha('#ffcf8a', 0.85); g.fillRect(bx - 180 + i * 36, by - 150, 14, 14); } for (let i = 0; i < 6; i++) { const k = (t * 0.6 + i / 6) % 1; circle(g, bx - 50 - k * 160, by - 290 - k * 200, 20 + k * 50, alpha('#3a3048', 0.5 * (1 - k))); } });
  FX.dust(g, t, { count: 30, color: '#ffd6a8', a: 0.3 });
  return { GY: gy, CX, rim: M.rim, deckY: gy + 40 - 90 };
}

// a road forking at dusk: left toward a glowing retro future, right into the dark
export function road(g, t, cam, k = 1) {
  const M = mood('dusk'), gy = E.H * 0.52, CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); glow(g, CX - 520, gy - 40, 600, '#7fd0ff', 0.25 * k); glow(g, CX + 520, gy - 40, 500, '#3a2a40', 0.3); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: gy, amp: 70, color: '#3a2a40', seed: 2 }); g.save(); g.globalAlpha *= k; for (let i = 0; i < 7; i++) { const x = CX - 760 + i * 70, h = 60 + (i % 3) * 50; g.fillStyle = '#5a6a9a'; g.fillRect(x, gy - h, 24, h); g.beginPath(); g.ellipse(x + 12, gy - h * 0.8, 34, 6, 0, 0, 7); g.fill(); } g.restore(); });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = '#2a2232'; g.fillRect(-E.W, gy, E.W * 3, E.H);
    poly(g, [[CX - 120, E.H + 50], [CX + 120, E.H + 50], [CX + 20, gy + 200], [CX - 20, gy + 200]], '#3a3444');
    poly(g, [[CX - 20, gy + 210], [CX + 10, gy + 210], [CX - 560, gy + 4], [CX - 590, gy + 4]], alpha('#7fd0ff', 0.25 + 0.35 * k)); poly(g, [[CX - 10, gy + 210], [CX + 20, gy + 210], [CX + 590, gy + 4], [CX + 560, gy + 4]], '#26202e');
    seg(g, [[CX, E.H + 50], [CX, gy + 210]], 4, alpha('#f2e6c8', 0.5));
    seg(g, [[CX + 140, gy + 250], [CX + 140, gy + 120]], 6, '#1a141e'); poly(g, [[CX + 140, gy + 120], [CX + 40, gy + 110], [CX + 30, gy + 130], [CX + 140, gy + 140]], '#d8d0c0'); poly(g, [[CX + 140, gy + 150], [CX + 240, gy + 140], [CX + 250, gy + 160], [CX + 140, gy + 170]], '#8a8070');
  });
  return { GY: gy, CX };
}

// workshop forge: anvil, furnace, sparks
export function forge(g, t, cam, o = {}) {
  const gy = GY(), CX = E.W / 2, heat = o.heat ?? 1;
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, gy, ['#0a0606', '#1e120c']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i * 200 - 300, -E.H, 6, gy + E.H); } const fx = CX + 520; rr(g, fx - 160, gy - 420, 320, 420, 20); g.fillStyle = '#2a1a14'; g.fill(); rr(g, fx - 90, gy - 260, 180, 150, 60); g.fillStyle = '#ff7a2a'; g.fill(); glow(g, fx, gy - 190, 420, '#ff8a3a', 0.45 * heat); glow(g, fx, gy - 190, 200, GREEN, 0.2 * heat); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, gy - 30, 0, gy + 400, ['#2a1a12', '#080404']); g.fillRect(-E.W, gy - 30, E.W * 3, E.H * 2); FX.pool(g, CX + 300, gy, 600, 70, '#ff8a3a', 0.25 * heat); });
  FX.dust(g, t, { count: 50, color: '#ffb070', a: 0.5, speed: 30 });
  return { GY: gy, CX, rim: '#ffb070' };
}
export function anvil(g, x, y, s = 1) { poly(g, [[x - 160 * s, y - 120 * s], [x + 120 * s, y - 120 * s], [x + 170 * s, y - 100 * s], [x + 60 * s, y - 80 * s], [x + 50 * s, y - 40 * s], [x + 90 * s, y], [x - 90 * s, y], [x - 50 * s, y - 40 * s], [x - 60 * s, y - 80 * s]], '#2a2a30'); seg(g, [[x - 150 * s, y - 118 * s], [x + 110 * s, y - 118 * s]], 4 * s, 'rgba(255,255,255,.2)'); }
export function sparks(g, x, y, t, k = 1, seed = 1) { const R = rng(seed); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const a = -Math.PI / 2 + (R() - 0.5) * 2.6, sp = 200 + R() * 500, tt = (t * 1.5 + R()) % 0.6; const px = x + Math.cos(a) * sp * tt, py = y + Math.sin(a) * sp * tt + 900 * tt * tt; seg(g, [[px, py], [px - Math.cos(a) * 12, py - Math.sin(a) * 12]], 3, alpha(i % 3 ? '#ffd27a' : '#9dffb6', k * (1 - tt / 0.6))); } g.restore(); }

// nursery at night (retro-future)
export function nursery(g, t, cam) {
  const gy = GY(), CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, gy, ['#0c1424', '#1c2a40']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); const wx = CX - 420, wy = gy - 560; g.save(); g.beginPath(); g.arc(wx, wy, 180, 0, 7); g.clip(); backdrop(g, ['#060a1a', '#1a2050'], [wx - 180, wy - 180, 360, 360]); FX.stars(g, t, { area: [wx - 180, wy - 180, 360, 360], count: 40, seed: 2 }); FX.moon(g, wx + 60, wy - 50, 30); g.restore(); ring(g, wx, wy, 180, 18, '#3a4a60'); for (let i = 0; i < 9; i++) { const a = t * 0.2 + i * 0.7; circle(g, CX + 200 + Math.cos(a) * 160, gy - 620 + Math.sin(a) * 40, 10, ['#ffd36a', '#7fb0ff', '#ff8a9a'][i % 3]); } seg(g, [[CX + 200, -E.H], [CX + 200, gy - 640]], 2, '#3a4a60'); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, gy - 30, 0, gy + 400, ['#1c2638', '#06080e']); g.fillRect(-E.W, gy - 30, E.W * 3, E.H * 2); const bx = CX - 40; rr(g, bx - 170, gy - 150, 340, 20, 8); g.fillStyle = '#d8e2f0'; g.fill(); for (let i = 0; i <= 8; i++) seg(g, [[bx - 160 + i * 40, gy - 130], [bx - 160 + i * 40, gy - 20]], 5, '#c8d2e0'); rr(g, bx - 170, gy - 30, 340, 16, 6); g.fill(); glow(g, CX + 380, gy - 100, 200, '#ffcf8a', 0.3); circle(g, CX + 380, gy - 100, 14, '#ffe2a8'); FX.pool(g, CX, gy, 500, 60, '#9fc0ff', 0.15); });
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.3 });
  return { GY: gy, CX, rim: '#bcd0ff' };
}

// the quantum tunnel: rushing rings of light
export function tunnel(g, t, o = {}) {
  backdrop(g, ['#05040e', '#140a2a', '#05040e']); const cx = E.W / 2, cy = E.H / 2;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) { const k = ((i / 26) + t * 0.9) % 1, r = 20 + k * k * 1400; g.strokeStyle = alpha(i % 3 ? '#ff6ad0' : '#6ad0ff', 0.5 * (1 - k * 0.6)); g.lineWidth = 2 + k * 10; g.beginPath(); g.ellipse(cx + Math.sin(t + i) * 20 * k, cy, r, r * 0.62, 0, 0, 7); g.stroke(); }
  FX.speedLines(g, t, { cx, cy, count: 80, color: '#ffffff', a: 0.3, inner: 120 });
  glow(g, cx, cy, 260, '#ffffff', 0.5); g.restore();
}
