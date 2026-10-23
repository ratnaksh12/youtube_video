// thumb.js — YouTube thumbnail for "Is Doctor Doom Secretly Tony Stark?".
// Layout: one head split down the middle (Iron Man's helmet on the left, Doom's mask and hood on the right)
// joined by a glowing crack, "DOOM / IS / TONY?" on the right; the bottom-right corner stays clear for
// YouTube's duration badge. Doom is the video's own bigDoom; the helmet is drawn here to match its size.
import { E, S, registerShot, alpha, glow, seg, circle, ring, text, rr, poly, linGrad, radGrad, backdrop, rng, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { bigDoom } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { GREEN } from '/projects/doom-tony-theory/scenes/kit70.js';

// front-view Iron Man helmet + shoulders, centred on (cx, cy), roughly the size of bigDoom's mask at the same r
function ironHelmet(g, cx, cy, r) {
  const ink = '#0a0406';
  g.save(); g.translate(cx, cy);
  // armour shoulders and a half-glowing arc reactor at the seam
  g.fillStyle = linGrad(g, -r * 1.4, r * 1.2, r * 0.2, r * 2.4, ['#b8281f', '#6a120e']); g.beginPath(); g.ellipse(0, r * 1.78, r * 1.5, r * 0.95, 0, Math.PI, Math.PI * 2); g.fill();
  g.fillStyle = linGrad(g, 0, r * 1.0, 0, r * 1.6, ['#f2c24a', '#a8741a']); g.beginPath(); g.moveTo(-r * 0.42, r * 0.98); g.lineTo(r * 0.42, r * 0.98); g.lineTo(r * 0.3, r * 1.45); g.lineTo(-r * 0.3, r * 1.45); g.closePath(); g.fill();
  seg(g, [[-r * 1.1, r * 1.12], [-r * 0.5, r * 1.02]], r * 0.03, 'rgba(255,220,160,.5)');
  glow(g, 0, r * 1.62, r * 0.6, '#9fe6ff', 0.6); circle(g, 0, r * 1.62, r * 0.17, '#e8faff'); ring(g, 0, r * 1.62, r * 0.17, r * 0.035, '#7a8a96');
  // neck
  g.fillStyle = '#4a0c0a'; g.fillRect(-r * 0.45, r * 0.8, r * 0.9, r * 0.3);
  // red shell
  const shell = () => { g.beginPath(); g.moveTo(0, -r * 1.06); g.bezierCurveTo(r * 0.62, -r * 1.06, r * 0.92, -r * 0.7, r * 0.9, -r * 0.1); g.bezierCurveTo(r * 0.9, r * 0.35, r * 0.78, r * 0.7, r * 0.5, r * 0.92); g.lineTo(-r * 0.5, r * 0.92); g.bezierCurveTo(-r * 0.78, r * 0.7, -r * 0.9, r * 0.35, -r * 0.9, -r * 0.1); g.bezierCurveTo(-r * 0.92, -r * 0.7, -r * 0.62, -r * 1.06, 0, -r * 1.06); g.closePath(); };
  shell(); g.lineWidth = r * 0.07; g.strokeStyle = ink; g.stroke();
  shell(); g.fillStyle = linGrad(g, -r, -r, r * 0.6, r, ['#ef4a36', '#b8281f', '#6a120e']); g.fill();
  // gold faceplate
  const plate = () => { g.beginPath(); g.moveTo(0, -r * 0.8); g.lineTo(r * 0.6, -r * 0.7); g.lineTo(r * 0.66, -r * 0.05); g.lineTo(r * 0.5, r * 0.32); g.lineTo(r * 0.42, r * 0.86); g.lineTo(-r * 0.42, r * 0.86); g.lineTo(-r * 0.5, r * 0.32); g.lineTo(-r * 0.66, -r * 0.05); g.lineTo(-r * 0.6, -r * 0.7); g.closePath(); };
  plate(); g.fillStyle = linGrad(g, -r * 0.6, -r * 0.8, r * 0.3, r * 0.9, ['#ffe58a', '#f2b93a', '#b8801c']); g.fill(); g.lineWidth = r * 0.035; g.strokeStyle = 'rgba(90,50,8,.9)'; g.stroke();
  // panel lines: forehead peak, cheeks, mouth
  g.strokeStyle = 'rgba(110,60,10,.75)'; g.lineWidth = r * 0.025; g.lineCap = 'round';
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * r * 0.58, -r * 0.08); g.lineTo(s * r * 0.36, r * 0.2); g.lineTo(s * r * 0.34, r * 0.62); g.stroke(); }
  seg(g, [[-r * 0.28, r * 0.52], [r * 0.28, r * 0.52]], r * 0.03, 'rgba(90,45,6,.9)');
  for (const s of [-1, 1]) seg(g, [[s * r * 0.28, r * 0.48], [s * r * 0.28, r * 0.56]], r * 0.03, 'rgba(90,45,6,.9)');
  // glowing eyes
  for (const s of [-1, 1]) {
    poly(g, [[s * r * 0.1, -r * 0.27], [s * r * 0.54, -r * 0.33], [s * r * 0.5, -r * 0.17], [s * r * 0.13, -r * 0.13]], '#1a0a04');
    poly(g, [[s * r * 0.13, -r * 0.255], [s * r * 0.51, -r * 0.305], [s * r * 0.48, -r * 0.19], [s * r * 0.15, -r * 0.155]], '#f4feff');
    glow(g, s * r * 0.32, -r * 0.22, r * 0.5, '#9fe6ff', 0.55); g.save(); g.globalCompositeOperation = 'lighter'; glow(g, s * r * 0.32, -r * 0.22, r * 0.22, '#dff8ff', 0.35); g.restore();
  }
  // specular highlights
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.ellipse(-r * 0.66, -r * 0.5, r * 0.07, r * 0.24, -0.4, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,250,220,.4)'; g.beginPath(); g.ellipse(-r * 0.3, r * 0.05, r * 0.06, r * 0.2, -0.2, 0, 7); g.fill();
  g.restore();
}

registerShot('thumb', { draw(g, _t, info) {
  const t = 0.4, ui = S().ui, ink = '#07040c', cx = 560, cy = 560, r = 390;

  // two worlds: Stark red-gold on the left, Latveria green on the right, split at the face
  g.save(); g.beginPath(); g.rect(0, 0, cx, E.H); g.clip(); backdrop(g, ['#1a0402', '#6a1a0c', '#1a0402']); glow(g, cx - 220, cy - 60, 760, '#ff8a3a', 0.5);
  FX.godRays(g, cx - 120, cy - 80, { count: 16, angle: -Math.PI / 2, spread: Math.PI * 2, len: 1300, a: 0.1, color: '#ffd59a' }); g.restore();
  g.save(); g.beginPath(); g.rect(cx, 0, E.W - cx, E.H); g.clip(); backdrop(g, ['#020a05', '#0c3a1c', '#020a05']); glow(g, cx + 260, cy - 80, 820, GREEN, 0.35);
  FX.godRays(g, cx + 120, cy - 80, { count: 16, angle: -Math.PI / 2, spread: Math.PI * 2, len: 1300, a: 0.08, color: '#b8ffcc' });
  FX.lightning(g, { x1: 960, y1: -20, x2: 830, y2: 300, seed: 5, a: 0.8, color: '#d8ffe4', w: 4 }); g.restore();

  // the head: Iron Man's half and Doom's half
  g.save(); g.beginPath(); g.rect(0, 0, cx, E.H); g.clip(); ironHelmet(g, cx, cy, r); g.restore();
  g.save(); g.beginPath(); g.rect(cx, 0, E.W - cx, E.H); g.clip();
  bigDoom(g, cx, cy, r, { eyes: 1, t, rimColor: '#c8ffd8', rimSide: 1 });
  g.save(); g.globalCompositeOperation = 'lighter'; glow(g, cx + r * 0.35, cy - r * 0.24, 190, '#9dffb6', 0.7); g.restore();
  g.restore();

  // the crack where the two halves meet, with sparks
  const R = rng(7), pts = []; for (let y = -20; y <= E.H + 20; y += 46) pts.push([cx + (R() - 0.5) * 34, y]);
  g.save(); g.globalCompositeOperation = 'lighter'; g.shadowColor = GREEN; g.shadowBlur = 34; seg(g, pts, 18, alpha(GREEN, 0.7)); g.shadowColor = '#ffcf8a'; seg(g, pts, 7, '#fff6e0'); g.shadowBlur = 0;
  for (let i = 0; i < 70; i++) { const y = 60 + R() * (E.H - 120), d = (R() - 0.5) * 260, x = cx + d, s = 2 + R() * 4; circle(g, x, y, s, alpha(d < 0 ? '#ffd27a' : '#b8ffcc', 0.4 + R() * 0.5)); }
  g.restore();

  if (!info.notext) {
    const stroke = { stroke: 26, strokeColor: ink };
    g.save(); g.translate(1450, 170); g.rotate(-0.03);
    rr(g, -390, -54, 780, 108, 18); g.fillStyle = '#e0302a'; g.fill(); g.strokeStyle = ink; g.lineWidth = 10; g.stroke();
    text(g, 'ENDGAME THEORY', 0, 4, { size: 62, color: '#ffffff', font: FONTS.ui, weight: 900, spacing: 4 });
    g.restore();
    text(g, 'DOOM', 1450, 380, { size: 230, color: '#b8ffcc', font: FONTS.title, weight: 700, spacing: 6, glow: 40, glowColor: 'rgba(93,255,138,.9)', ...stroke });
    text(g, 'IS', 1450, 545, { size: 120, color: '#ffffff', font: FONTS.title, weight: 700, spacing: 8, ...stroke, stroke: 18 });
    text(g, 'TONY?', 1450, 720, { size: 230, color: ui.gold, font: FONTS.title, weight: 700, spacing: 6, glow: 40, glowColor: alpha(ui.gold, 0.8), ...stroke });
  }

  FX.dust(g, t, { count: 50, color: '#ffe2b0', a: 0.35 });
} });
