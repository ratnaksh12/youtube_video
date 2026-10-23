// thumb.js — YouTube thumbnail for "Is Doctor Doom Secretly Tony Stark?".
// Reuses the video's own faces so the thumbnail matches the video exactly.
// Layout: one face split down the middle (Tony on the left, Doom's mask on the right) joined by a glowing crack,
// "DOOM / IS / TONY?" on the right; the bottom-right corner stays clear for YouTube's duration badge.
import { E, S, registerShot, alpha, glow, seg, text, rr, linGrad, backdrop, rng, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { bigDoom } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { bigMan, GREEN } from '/projects/doom-tony-theory/scenes/kit70.js';

registerShot('thumb', { draw(g, _t, info) {
  const t = 0.4, ui = S().ui, ink = '#07040c', cx = 560, cy = 600, r = 370;

  // two worlds: Stark warm on the left, Latveria green on the right, split at the face
  g.save(); g.beginPath(); g.rect(0, 0, cx, E.H); g.clip(); backdrop(g, ['#1a0604', '#6a2410', '#1a0604']); glow(g, cx - 200, cy - 80, 700, '#ffb050', 0.45); g.restore();
  g.save(); g.beginPath(); g.rect(cx, 0, E.W - cx, E.H); g.clip(); backdrop(g, ['#020a05', '#0c3a1c', '#020a05']); glow(g, cx + 260, cy - 80, 800, GREEN, 0.35);
  FX.lightning(g, { x1: 960, y1: -20, x2: 820, y2: 330, seed: 5, a: 0.8, color: '#d8ffe4', w: 4 }); g.restore();
  FX.godRays(g, cx, cy - 80, { count: 18, angle: -Math.PI / 2, spread: Math.PI * 2, len: 1300, a: 0.08, color: '#ffe2b0' });

  // the face: Tony's half and Doom's half
  g.save(); g.beginPath(); g.rect(0, 0, cx, E.H); g.clip();
  bigMan(g, cx, cy, r, { outfit: { top: 'suit', color: '#1d1d26' }, expr: 'determined', rimColor: '#ffd59a', rimSide: -1, look: [0.15, 0] });
  g.restore();
  g.save(); g.beginPath(); g.rect(cx, 0, E.W - cx, E.H); g.clip();
  bigDoom(g, cx, cy, r, { eyes: 1, t, rimColor: '#c8ffd8', rimSide: 1 });
  glow(g, cx + r * 0.35, cy - r * 0.24, 170, '#9dffb6', 0.6);
  g.restore();

  // the crack where the two halves meet
  const R = rng(7), pts = []; for (let y = cy - r * 1.5; y <= E.H + 20; y += 46) pts.push([cx + (R() - 0.5) * 34, y]);
  g.save(); g.globalCompositeOperation = 'lighter'; g.shadowColor = GREEN; g.shadowBlur = 30; seg(g, pts, 16, alpha(GREEN, 0.7)); g.shadowColor = '#ffcf8a'; seg(g, pts, 6, '#fff6e0'); g.restore();

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
