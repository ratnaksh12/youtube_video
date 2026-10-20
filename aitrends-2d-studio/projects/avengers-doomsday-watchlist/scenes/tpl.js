// tpl.js — shot templates reused across the video: the countdown film card, the fan's giant face,
// the fan on the couch, a gloved hand, and name labels.
import { E, V, S, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, key, wordTime, alpha, shade, mix, glow, seg, circle, rr, poly, text, measure, backdrop, linGrad, radGrad, FONTS } from '/engine/core.js';
import { POSES, breathe, posesAt } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { living, livingGround, TVC } from './sets/living.js';
import { hero, bigHero, OUT, wpt } from './cast.js';
import { filmCase, movie, popcorn, nebula } from './props.js';

export const tShot = (info, w, fb = 0.3) => { const g0 = info.shot.start; const x = wordTime(w, g0); return x == null ? fb : x - g0; };

// ---------- countdown film card ----------
export function filmCard(g, t, info, n, o = {}) {
  const m = movie(n), ui = S().ui, d = info.dur;
  const cam = { z: 1 + 0.07 * ease.inOut(t / d), x: -20 * t };
  layer(g, cam, 0.2, (g) => {
    backdrop(g, ['#05040a', shade(m.c1, -0.2), '#05040a']); nebula(g, t, { c1: m.accent, c2: shade(m.c1, 0.3), seed: n });
    glow(g, E.W * 0.68, E.H * 0.48, 700, m.accent, 0.18);
    FX.stars(g, t, { count: 90, seed: n + 3, area: [0, 0, E.W, E.H] });
  });
  // big rank number + title
  const kN = ease.outBack(prog(t, 0.08, 0.5)), kT = ease.out(prog(t, 0.3, 0.8));
  layer(g, cam, 0.9, (g) => {
    const nx = V(E.W * 0.27, E.W / 2), ny = V(E.H * 0.42, E.H * 0.24);
    g.save(); g.translate(nx, ny); g.scale(0.4 + 0.6 * kN, 0.4 + 0.6 * kN); g.globalAlpha *= clamp(kN * 1.5);
    text(g, '#' + n, 0, 0, { size: V(300, 260), color: ui.gold, glow: 50, glowColor: alpha(ui.gold, 0.7), font: FONTS.ui, weight: 900 }); g.restore();
    const L = m.lines; let yy = ny + V(210, 180);
    L.forEach((ln, i) => { const sz = Math.min(V(64, 60), (V(760, 940)) / Math.max(1, measure(g, ln, 100) / 100)); text(g, ln, nx + (1 - kT) * -40, yy, { size: sz, color: i === L.length - 1 ? m.accent : ui.cream, glow: 18, glowColor: alpha(m.accent, 0.6), alpha: kT, spacing: 2 }); yy += sz * 1.15; });
    text(g, m.year, nx, yy + 10, { size: V(30, 34), color: alpha(ui.cream, 0.6), font: FONTS.ui, weight: 900, alpha: kT, spacing: 6 });
  });
  const kC = ease.out(prog(t, 0, 0.6));
  layer(g, cam, 1.1, (g) => {
    const cx = V(E.W * 0.7, E.W / 2) + (1 - kC) * 500, cy = V(E.H * 0.5, E.H * 0.62) + Math.sin(t * 1.6) * 8;
    filmCase(g, cx, cy, V(380, 400), m, { t, glowK: 0.6, tilt: 0.05 * Math.sin(t * 0.9) - 0.04, a: kC, rank: false });
    const sw = prog(t, 0.5, 1.4); if (sw > 0 && sw < 1) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(cx, cy); g.rotate(0.5); g.fillStyle = linGrad(g, -60, 0, 60, 0, ['rgba(255,255,255,0)', 'rgba(255,255,255,.35)', 'rgba(255,255,255,0)']); g.fillRect(-60 + (sw - 0.5) * 900, -500, 120, 1000); g.restore(); }
  });
  FX.dust(g, t, { count: 50, color: m.accent, a: 0.45 });
  FX.lensStreak(g, E.W * 0.7, E.H * 0.48, E.W * 1.2, m.accent, 0.2 * kC);
  o.extra?.(g, t);
}

// ---------- the fan ----------
export function fanFace(g, t, info, o = {}) {
  const cam = { z: 1.5, x: o.bx ?? 140, y: -150 };
  blurLayer(g, 14, (g) => living(g, t, cam, { tv: false })); veil(g, '#06060e', 0.35);
  const r = V(300, 330) * (1 + 0.04 * t / info.dur * 3), cx = E.W / 2 + (o.dx ?? V(-120, 0)), cy = E.H * V(0.6, 0.55);
  const expr = typeof o.expr === 'function' ? o.expr(t) : o.expr || 'neutral';
  glow(g, E.W + 100, cy - 100, 900, TVC, 0.18 * (o.tvK ?? 1));
  bigHero(g, 'FAN', cx, cy, r, { expr, look: o.look || [0.4, -0.1], rimColor: TVC, rimSide: 1, blink: (t % 3.3) > 3.2, tilt: o.tilt ?? 0 });
  if (o.rings) FX.rings(g, cx, cy, t, { count: 3, r0: r * 1.15, r1: r * 1.7, color: '#dff4ff', a: 0.35 * o.rings });
  if (o.q) { const k = ease.outBack(prog(t, o.qAt ?? 0.1, (o.qAt ?? 0.1) + 0.35)); text(g, '?', cx + r * 1.15, cy - r * 0.9, { size: 160 * k, color: S().ui.gold, glow: 30, glowColor: alpha(S().ui.gold, 0.7), alpha: clamp(k) }); }
  o.extra?.(g, t, cx, cy, r);
}
// fan sitting on the couch, TV light from the right
export function couchShot(g, t, info, o = {}) {
  const d = info.dur, cam = o.cam ? o.cam(t, d) : { z: (o.z ?? 1.25) + 0.05 * ease.inOut(t / d), x: o.x ?? 60, y: o.y ?? 120 };
  const { GY, CX, M, flick } = living(g, t, cam, { tv: o.tv, tvContent: o.tvContent, stack: o.stack, flicker: o.flicker });
  const s = V(1.3, 1.4), fx = CX + (o.fanX ?? 0);
  layer(g, cam, 1, (g) => {
    o.behind?.(g, GY, CX, t);
    const pose = o.pose ? (typeof o.pose === 'function' ? o.pose(t) : o.pose) : POSES.sit;
    const fo = hero(g, 'FAN', { x: fx, y: GY, s, facing: o.facing ?? 1, pose: breathe(pose, t, 1, 1), expr: typeof o.expr === 'function' ? o.expr(t) : o.expr || 'neutral', look: o.look, rim: { color: TVC, dir: [1, -0.35], w: 5 }, prop: o.prop, blink: (t % 3.4) > 3.3, shadow: false });
    if (o.popcorn) { const [hx, hy] = wpt(fo, 'hB'); popcorn(g, hx + 6, hy + 18, 0.75); }
    o.front?.(g, GY, CX, t, fo);
  });
  blurLayer(g, 10, (g) => { g.fillStyle = 'rgba(20,16,30,.9)'; rr(g, E.W * 0.86, E.H * 0.7, 300, 400, 30); g.fill(); }, cam, 1.6);
  FX.dust(g, t, { count: 40, color: '#cfe8ff', a: 0.3 });
  return { GY, CX, M, flick };
}

// a big inky hand + sleeve reaching in from an edge (for inserts). dir: 1 = from the right, -1 = from the left
export function bigHand(g, x, y, s, o = {}) {
  const { sleeve = OUT.FAN.color, dir = 1, grip = 'open', rim = TVC, ang = 0.35 } = o, ink = S().ink;
  const ex = x + dir * 900 * Math.cos(ang), ey = y + 900 * Math.sin(ang);
  for (const [dx, dy, c] of [[-5 * dir, -5, rim], [0, 0, null]]) {
    g.save(); g.translate(dx, dy);
    seg(g, [[x, y], [ex, ey]], 64 * s, c || ink); seg(g, [[lerp(x, ex, 0.18), lerp(y, ey, 0.18)], [ex, ey]], 92 * s, c || sleeve);
    circle(g, x, y, 40 * s, c || ink);
    if (grip === 'open') for (let i = 0; i < 4; i++) { const a = -Math.PI / 2 - dir * 0.5 + i * 0.32 * -dir + (dir > 0 ? 0 : Math.PI); seg(g, [[x, y], [x + Math.cos(a) * 80 * s, y + Math.sin(a) * 80 * s]], 18 * s, c || ink); }
    else for (let i = 0; i < 4; i++) circle(g, x - dir * 30 * s, y - 28 * s + i * 18 * s, 15 * s, c || ink);
    seg(g, [[x - dir * 10 * s, y + 18 * s], [x - dir * 62 * s, y - 30 * s]], 18 * s, c || ink);
    g.restore();
  }
}
// "NAME" label that slides in under/next to a hero
export function nameTag(g, t, x, y, str, at = 0.25, o = {}) {
  const k = ease.out(prog(t, at, at + 0.35)); if (k <= 0) return; const ui = S().ui, size = o.size || V(38, 42);
  const w = measure(g, str, size, FONTS.ui, 900);
  g.save(); g.globalAlpha *= k; g.translate((1 - k) * -30, 0);
  g.fillStyle = 'rgba(8,8,14,.6)'; rr(g, x - 18, y - size * 0.9, w + 36, size * 1.8, 8); g.fill(); g.fillStyle = o.color || ui.gold; g.fillRect(x - 18, y - size * 0.9, 6, size * 1.8);
  text(g, str, x, y + 2, { size, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 }); g.restore();
}
