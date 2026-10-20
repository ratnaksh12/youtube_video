// thumb.js — YouTube thumbnail for "6 Movies You MUST Watch Before Avengers: Doomsday".
// Reuses the video's own cast, sets and props so the thumbnail matches the video exactly.
// Layout: Doom's glowing mask on the left (the face/emotion), "6 MOVIES / BEFORE DOOMSDAY" on the right,
// the six film cases fanned underneath; the bottom-right corner stays clear for YouTube's duration badge.
import { E, S, registerShot, blurLayer, veil, alpha, glow, text, rr, poly, linGrad, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { throneHall, GREEN } from '/projects/avengers-doomsday-watchlist/scenes/sets/throne.js';
import { bigDoom } from '/projects/avengers-doomsday-watchlist/scenes/cast.js';
import { filmCase, MOVIES } from '/projects/avengers-doomsday-watchlist/scenes/props.js';

registerShot('thumb', { draw(g, _t, info) {
  const t = 0.4, ui = S().ui, ink = '#07040c';
  blurLayer(g, 7, (g) => throneHall(g, t, { z: 1.3, x: -300, y: -80 }, { flashes: [0.3] }));
  veil(g, '#020604', 0.3);
  g.fillStyle = linGrad(g, 900, 0, 1920, 0, ['rgba(4,2,10,0)', 'rgba(4,2,10,.55)']); g.fillRect(900, 0, 1020, 1080);

  // Doom: green burst, lightning, the mask
  const dx = 520, dy = 590, r = 380;
  FX.godRays(g, dx, dy - 60, { count: 18, angle: -Math.PI / 2, spread: Math.PI * 2, len: 1300, a: 0.09, color: '#7dffa0' });
  glow(g, dx, dy - 40, 820, GREEN, 0.4);
  FX.lightning(g, { x1: 170, y1: -20, x2: 300, y2: 420, seed: 5, a: 0.9, color: '#d8ffe4', w: 4 });
  bigDoom(g, dx, dy, r, { eyes: 1, t, rimColor: '#c8ffd8', rimSide: 1, tilt: -0.06 });
  for (const s of [-1, 1]) glow(g, dx + s * r * 0.36 - 20, dy - r * 0.28, 150, '#9dffb6', 0.55);

  // the six cases, fanned (bottom centre, clear of the duration badge)
  MOVIES.forEach((m, i) => { const k = i - 2.5; filmCase(g, 1260 + k * 112, 915 + Math.abs(k) * 14, 150, m, { t, rank: false, title: false, glowK: 0.55, tilt: k * 0.13 }); });

  // text: 6 MOVIES / BEFORE DOOMSDAY (skipped with params.notext for a clean art reference)
  if (!info.notext) {
  const stroke = { stroke: 30, strokeColor: ink };
  text(g, '6', 1075, 330, { size: 480, color: ui.gold, font: FONTS.ui, weight: 900, glow: 50, glowColor: alpha(ui.gold, 0.75), ...stroke });
  text(g, 'MOVIES', 1215, 330, { size: 150, color: '#ffffff', font: FONTS.title, weight: 700, align: 'left', spacing: 4, ...stroke, stroke: 22 });
  g.save(); g.translate(1400, 610); g.rotate(-0.04);
  rr(g, -400, -62, 800, 124, 18); g.fillStyle = '#e0302a'; g.fill(); g.strokeStyle = ink; g.lineWidth = 10; g.stroke();
  text(g, 'BEFORE', 0, 4, { size: 104, color: '#ffffff', font: FONTS.title, weight: 700, spacing: 10, stroke: 14, strokeColor: ink });
  g.restore();
  text(g, 'DOOMSDAY', 1400, 760, { size: 150, color: '#b8ffcc', font: FONTS.title, weight: 700, spacing: 6, glow: 40, glowColor: 'rgba(93,255,138,.9)', stroke: 24, strokeColor: ink });
  }

  FX.dust(g, t, { count: 50, color: '#9dffb6', a: 0.4 });
} });
