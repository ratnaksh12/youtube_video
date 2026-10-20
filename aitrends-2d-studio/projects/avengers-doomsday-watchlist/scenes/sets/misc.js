// sets/misc.js — smaller locations: the TVA office, a black stage with spotlights, the Thunderbolts' vault,
// and a lakeside at golden hour.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const G = () => E.H * V(0.8, 0.68);

export function tvaClock(g, x, y, r, t) {
  circle(g, x, y, r * 1.12, '#3a2414'); circle(g, x, y, r, '#f2dcae'); ring(g, x, y, r, r * 0.05, '#6a4020');
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; seg(g, [[x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78], [x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92]], r * 0.05, '#6a4020'); }
  const a1 = t * 0.4 - Math.PI / 2, a2 = t * 2.4 - Math.PI / 2; seg(g, [[x, y], [x + Math.cos(a1) * r * 0.5, y + Math.sin(a1) * r * 0.5]], r * 0.07, '#3a2414'); seg(g, [[x, y], [x + Math.cos(a2) * r * 0.75, y + Math.sin(a2) * r * 0.75]], r * 0.04, '#b3302a'); circle(g, x, y, r * 0.06, '#3a2414');
}
export function tva(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), GY = G(), CX = E.W / 2;
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#2a160c', '#5a3218']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H + 10);
    for (let i = -8; i < 20; i++) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(i * 150, -E.H, 6, GY + E.H); }
    tvaClock(g, CX, GY - V(620, 980), V(130, 140), t);
    glow(g, CX, GY - V(620, 980), 300, '#ffcf8a', 0.18);
    if (o.screen) { const sx = CX - V(520, 400), sy = GY - V(440, 760), sw = V(1040, 800), sh = V(260, 300); rr(g, sx - 12, sy - 12, sw + 24, sh + 24, 10); g.fillStyle = '#2a1a10'; g.fill(); g.fillStyle = '#0e1a10'; g.fillRect(sx, sy, sw, sh); g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip(); o.screen(g, sx, sy, sw, sh); g.restore(); glow(g, CX, sy + sh / 2, sw * 0.6, '#ffb84a', 0.15); }
    for (const s of [-1, 1]) { const px = CX + s * V(820, 460); seg(g, [[px, -E.H], [px, GY - 200]], 26, '#6a4a2a'); seg(g, [[px - 6, -E.H], [px - 6, GY - 200]], 4, 'rgba(255,220,160,.25)'); }
  });
  layer(g, cam, 0.7, (g) => {
    for (let r = 0; r < 2; r++) for (let i = -3; i <= 3; i++) { const x = CX + i * V(300, 220) + r * 150, y = GY - 30 - r * 60; rr(g, x - 90, y - 70, 180, 20, 4); g.fillStyle = '#4a2a14'; g.fill(); seg(g, [[x - 80, y - 50], [x - 80, y]], 6, '#2a180c'); seg(g, [[x + 80, y - 50], [x + 80, y]], 6, '#2a180c');
      rr(g, x - 40, y - 150, 80, 70, 8); g.fillStyle = '#c9a070'; g.fill(); g.fillStyle = '#0e1a0e'; g.fillRect(x - 30, y - 140, 60, 46); for (let k = 0; k < 4; k++) { g.fillStyle = alpha('#ffb84a', 0.7); g.fillRect(x - 24, y - 134 + k * 10, 20 + ((i + k + r) * 13) % 26, 3); } glow(g, x, y - 117, 70, '#ffb84a', 0.15); }
    for (const x of [CX - V(500, 300), CX, CX + V(500, 300)]) { seg(g, [[x, -E.H], [x, GY - V(760, 1150)]], 3, '#1a0e06'); poly(g, [[x - 40, GY - V(760, 1150)], [x + 40, GY - V(760, 1150)], [x + 20, GY - V(790, 1180)], [x - 20, GY - V(790, 1180)]], '#2a180c'); FX.lightCone(g, x, GY - V(760, 1150), { len: 700, spread: 0.6, color: '#ffcf8a', a: 0.1 }); }
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 400, ['#3a2214', '#120a06']); g.fillRect(-E.W, GY - 30, E.W * 3, E.H * 2); for (let i = 0; i < 40; i++) { g.fillStyle = (i % 2) ? 'rgba(0,0,0,.18)' : 'rgba(255,200,140,.04)'; g.fillRect(-E.W + i * 120, GY - 30, 120, E.H); } FX.pool(g, CX, GY, 700, 70, '#ffcf8a', 0.15); });
  FX.dust(g, t, { count: 40, color: '#ffe2c0', a: 0.35 });
  return { GY, CX, M, rim: '#ffcf8a' };
}

// black stage, spotlights: spots = [{ x, k (0..1), color }]
export function stage(g, t, cam, o = {}) {
  const M = mood('void'), GY = G(), CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#040408', '#0c0a14']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.dust(g, t, { count: 30, color: '#cfd8ff', a: 0.15 }); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 400, ['#121018', '#040408']); g.fillRect(-E.W, GY - 20, E.W * 3, E.H * 2); });
  for (const sp of o.spots || []) { if (sp.k <= 0) continue; layer(g, cam, 0.95, (g) => {
    const c = sp.color || '#fff1dc'; g.save(); g.globalCompositeOperation = 'lighter';
    g.fillStyle = linGrad(g, 0, -100, 0, GY, [alpha(c, 0.22 * sp.k), alpha(c, 0.06 * sp.k)]); g.beginPath(); g.moveTo(sp.x - 30, -100); g.lineTo(sp.x + 30, -100); g.lineTo(sp.x + (sp.w || 230), GY); g.lineTo(sp.x - (sp.w || 230), GY); g.closePath(); g.fill(); g.restore();
    FX.pool(g, sp.x, GY + 10, (sp.w || 230) * 1.3, 50, c, 0.45 * sp.k); }); }
  return { GY, CX, M };
}

// concrete vault with red bulbs (the Thunderbolts' hideout)
export function vault(g, t, cam, o = {}) {
  const M = mood('night'), GY = G(), CX = E.W / 2, red = '#ff5a3a';
  layer(g, cam, 0.35, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#0e0c10', '#24201f']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H + 10);
    for (let i = -6; i < 20; i++) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i * 200, -E.H, 4, GY + E.H); } for (let j = 0; j < 8; j++) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-E.W, GY - j * 140, E.W * 3, 3); }
    circle(g, CX, GY - V(420, 700), V(200, 200), '#1a1716'); ring(g, CX, GY - V(420, 700), V(200, 200), 18, '#3a3532'); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2; seg(g, [[CX, GY - V(420, 700)], [CX + Math.cos(a) * 160, GY - V(420, 700) + Math.sin(a) * 160]], 8, '#2e2a28'); } circle(g, CX, GY - V(420, 700), 40, '#3a3532');
    if (o.sign != null) { const k = o.sign; const sy = GY - V(720, 1050); rr(g, CX - 330, sy - 60, 660, 120, 14); g.fillStyle = '#0c0a0a'; g.fill(); const on = k > 0 && (k > 0.6 || Math.sin(t * 40) > 0); text(g, 'NEW AVENGERS', CX, sy + 4, { size: 72, color: on ? '#ffe2a8' : '#3a3028', glow: on ? 34 : 0, glowColor: 'rgba(255,170,80,.9)', spacing: 6 }); if (on) glow(g, CX, sy, 500, '#ffb050', 0.18 * k); }
  });
  layer(g, cam, 0.6, (g) => { for (const x of [CX - V(560, 330), CX + V(560, 330)]) { seg(g, [[x, -E.H], [x, GY - V(600, 900)]], 2, '#0a0808'); circle(g, x, GY - V(590, 890), 12, '#ffc9a0'); glow(g, x, GY - V(590, 890), 240, red, 0.45); FX.lightCone(g, x, GY - V(590, 890), { len: 760, spread: 0.9, color: red, a: 0.12 }); } });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 400, ['#2a2422', '#080606']); g.fillRect(-E.W, GY - 30, E.W * 3, E.H * 2); FX.floorLines(g, GY - 30, GY + 500, 'rgba(0,0,0,.3)', 0.08); for (const x of [CX - V(560, 330), CX + V(560, 330)]) FX.pool(g, x, GY + 10, 420, 60, red, 0.25); });
  FX.dust(g, t, { count: 50, color: '#ffcfb0', a: 0.35 });
  return { GY, CX, M, rim: '#ff9a7a' };
}

export function lake(g, t, cam) {
  const M = mood('golden'), GY = G(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); FX.sun(g, CX + V(260, 100), GY - V(260, 420), 70, '#fff3dc', M.key, 5); FX.godRays(g, CX + V(260, 100), GY - V(260, 420), { count: 10, angle: -Math.PI / 2, spread: Math.PI * 1.6, len: 1400, a: 0.05, t }); });
  layer(g, cam, 0.3, (g) => { FX.hills(g, { y: GY - V(160, 300), amp: 120, color: '#5a4a5a', seed: 6 }); g.fillStyle = linGrad(g, 0, GY - V(150, 290), 0, GY - 40, [alpha(M.sky[2], 0.9), alpha('#c98a6a', 0.9)]); g.fillRect(-E.W, GY - V(150, 290), E.W * 3, V(110, 250)); for (let i = 0; i < 30; i++) FX.lensStreak(g, CX + V(260, 100) + Math.sin(i * 3.7) * 60, GY - V(140, 280) + i * 4, 120 + (i % 5) * 40, '#fff3dc', 0.3, 2); });
  layer(g, cam, 0.6, (g) => { for (const [x, s] of [[CX - V(760, 420), 1.6], [CX - V(560, 300), 1.2], [CX + V(760, 420), 1.8]]) FX.tree(g, x, GY - 30, s, '#2a1e22'); });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY - 40, 0, GY + 400, ['#4d6b3c', '#1e2614']); g.fillRect(-E.W, GY - 40, E.W * 3, E.H * 2); FX.pool(g, CX + 200, GY, 600, 70, M.key, 0.2); });
  FX.dust(g, t, { count: 40, color: '#ffe2bd', a: 0.4 });
  return { GY, CX, M, rim: M.rim };
}
