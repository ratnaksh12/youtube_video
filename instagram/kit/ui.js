// @ratnaksh.ai reel kit: the shared HUD layer for every Reel (1080×1920, 24 fps, violet lines + lime accent on locked values).
// A Reel's film.js does the choreography and calls these; engine/holo.js + engine/hud.js (Lemo-Opuscar, MIT) do the drawing.
import * as U from './engine/hud.js';
export { U };

export const W = 1080, H = 1920, FPS = 24;
export const HUE = 252, ACC = 82;
export const T = U.theme(HUE, ACC);
export const FONT = U.FONT;
export const TOP = { x: 90, y: 300, w: 900 };          // the card zone under Instagram's top bar
export const SUB_Y = 1452;                              // subtitle plate bottom, above the caption zone

export const clamp = U.clamp;
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const eo = t => 1 - Math.pow(1 - clamp(t), 3);
export const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const sine = t => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t));
export const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
export const win = (t, a, b, fi = 0.25, fo = 0.25) => clamp(Math.min((t - a) / fi, (b - t) / fo));
export const snap = t => Math.round(t / 0.125) * 0.125;   // 1/16 note at 120 BPM

// ---------------------------------------------------------------- timing from timeline.json
export function lineKeys(TL) {
  const L = Object.fromEntries(TL.lines.map(l => [l.id, l]));
  const w = (id, word, n = 0) => {
    const k = L[id].words.filter(x => x.w.toLowerCase().replace(/[^a-z0-9%]/g, '') === word);
    if (!k.length) throw new Error(`word "${word}" not in ${id}`);
    return snap(k[Math.min(n, k.length - 1)].t0);
  };
  return { L, w, DUR: TL.dur };
}

// ---------------------------------------------------------------- text
export function label(ctx, s, x, y, a, o = {}) {
  if (a <= 0) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.font = o.mono ? `${o.size || 22}px ${FONT.mono}` : `${o.w || 600} ${o.size || 26}px ${FONT.ui}`;
  ctx.letterSpacing = o.mono ? '0px' : `${o.track ?? 3}px`; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = o.color ? o.color(a) : T.line(0.9 * a); ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
  ctx.restore();
}
// a big value that rolls from garbage glyphs and locks in the accent (with a one-frame white flash)
export function bigValue(ctx, s, x, y, size, a, o = {}) {
  if (a <= 0) return [x, y, x, y];
  const { roll = 1, frame = 0, seed = 5, locked = roll >= 1, flash = false, align = 'center', weight = 300, track = 0, pctSmall = true } = o;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.font = `${weight} ${size}px ${FONT.ui}`; ctx.letterSpacing = `${track}px`; ctx.textBaseline = 'alphabetic';
  const txt = o.scramble ? s : U.rollText(s, roll, frame, seed);
  const adv = ctx.measureText('0').width * 1.02;
  const wOf = ch => ch === '%' && pctSmall ? ctx.measureText('%').width * 0.62 + 8 : /\d/.test(ch) ? adv : ctx.measureText(ch).width + track;
  const wd = [...txt].reduce((acc, ch) => acc + wOf(ch), 0);
  const x0 = align === 'center' ? x - wd / 2 : align === 'right' ? x - wd : x;
  ctx.fillStyle = locked ? (flash ? T.hi(a) : T.acc(a)) : T.line(0.95 * a);
  ctx.shadowColor = locked ? T.acc(0.75 * a) : T.line(0.85 * a); ctx.shadowBlur = size * 0.12;
  let cx = x0;
  for (const ch of txt) {
    if (ch === '%' && pctSmall) { ctx.font = `${weight} ${Math.round(size * 0.62)}px ${FONT.ui}`; ctx.fillText(ch, cx + 6, y); ctx.font = `${weight} ${size}px ${FONT.ui}`; }
    else if (/\d/.test(ch)) ctx.fillText(ch, cx + (adv - ctx.measureText(ch).width) / 2, y);
    else ctx.fillText(ch, cx, y);
    cx += wOf(ch);
  }
  ctx.restore();
  return [x0, y - size * 0.72, x0 + wd, y];
}
// the card zone: plate + unfolding top line + index + rolling title
export function card(ctx, idx, title, frame, a, k, h = 300) {
  if (a <= 0) return;
  const { x, y, w } = TOP;
  U.plate(ctx, T, x - 22, y - 20, (w + 44) * eo(k * 1.4), h, a);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = T.line(0.9 * a); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * eo(k), y); ctx.stroke();
  ctx.fillStyle = T.line(0.9 * a); ctx.fillRect(x, y - 3, 34 * eo(k), 6);
  ctx.restore();
  label(ctx, idx, x, y + 36, a, { mono: true, color: T.dim });
  label(ctx, U.rollText(title, clamp(k * 1.6 - 0.2), frame, 3), x + 74, y + 38, a, { color: T.hi, size: 30 });
}

// ---------------------------------------------------------------- frame chrome: corners, ruler, series title, live status
export function chrome(ctx, a, title, status) {
  const m = 40;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = T.line(0.5 * a); ctx.lineWidth = 1.5; U.corners(ctx, m, m + 150, W - m, H - m - 120, 44);
  ctx.strokeStyle = T.dim(0.4 * a); ctx.lineWidth = 1; ctx.beginPath();
  for (let y = 300; y < 1700; y += 24) { const big = ((y - 300) / 24) % 5 === 0; ctx.moveTo(m + 6, y); ctx.lineTo(m + 6 + (big ? 12 : 6), y); }
  ctx.stroke();
  ctx.font = `20px ${FONT.mono}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.fillStyle = T.line(0.85 * a); ctx.fillText(title, m + 22, 232);
  ctx.textAlign = 'right'; ctx.fillStyle = T.line(0.75 * a); ctx.fillText(status, W - m - 22, 232);
  ctx.restore();
}

// ---------------------------------------------------------------- rail chips (left column): label + value + unit
export const RAIL = { x: 52, y: 760, step: 96, w: 262 };
export function railChip(ctx, i, lab, val, unit, a, o = {}) {
  if (a <= 0) return;
  const x = RAIL.x - 40 * (1 - a), y = RAIL.y + i * RAIL.step;
  U.plate(ctx, T, x, y, RAIL.w, 82, a);
  label(ctx, lab, x + 16, y + 28, a, { mono: true, size: 18, color: o.hot ? T.hi : T.dim });
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `400 ${o.size || 46}px ${FONT.ui}`; ctx.textAlign = 'left';
  ctx.fillStyle = o.plain ? T.hi(a) : T.acc(a);
  ctx.fillText(val, x + 16, y + 72); const vw = ctx.measureText(val).width;
  ctx.font = `500 22px ${FONT.ui}`; ctx.fillStyle = T.acc(0.9 * a); ctx.fillText(unit, x + 24 + vw, y + 70); ctx.restore();
}

// ---------------------------------------------------------------- subtitles
// chunks of ≤ 2 rows × 22 characters (dynamic programming over break points), the spoken word lit
export function makeSubs(TLJ) {
  const S = [];
  for (const L of TLJ.lines) {
    // a written number ("15%") stands for one spoken word, plus "percent" when it follows ("fifteen percent");
    // "word^N" marks a written token that stands for N spoken words ("CleanYourTV,^3" = "Clean Your TV,", "#1^2" = "number one")
    const words = []; let j = 0;
    for (let tok of L.sub.split(' ')) {
      const m = /\^(\d+)$/.exec(tok); let n = 1;
      if (m) { n = +m[1]; tok = tok.slice(0, m.index); }
      const a = L.words[j]; let b = L.words[j + n - 1] || a; j += n;
      if (!m && /^\d+%/.test(tok) && L.words[j] && /^percent/.test(L.words[j].w)) { b = L.words[j]; j++; }
      words.push({ w: tok, t0: a.t0, t1: b.t1 });
    }
    if (j !== L.words.length) throw new Error(`subtitle words don't match the spoken words in ${L.id}`);
    const rowsOf = ws => { const rows = [[]]; for (const w of ws) { const r = rows[rows.length - 1], l = r.map(x => x.w).join(' ').length; if (r.length && l + 1 + w.w.length > 22) rows.push([w]); else r.push(w); } return rows; };
    const n = words.length, best = Array(n + 1).fill(Infinity), from = Array(n + 1).fill(-1);
    best[0] = 0;
    for (let jj = 1; jj <= n; jj++) for (let i = jj - 1; i >= 0; i--) {
      const ws = words.slice(i, jj); if (rowsOf(ws).length > 2) break;
      const last = ws[ws.length - 1].w, chars = ws.map(x => x.w).join(' ').length;
      let c = jj === n || /[.?!]$/.test(last) ? 0 : /[,:;]$/.test(last) ? 1 : 3;
      if (chars < 10) c += 4;
      if (ws.slice(0, -1).some(x => /[.?!]$/.test(x.w))) c += 5;
      if (best[i] + c < best[jj]) { best[jj] = best[i] + c; from[jj] = i; }
    }
    const chunks = []; for (let k = n; k > 0; k = from[k]) chunks.unshift(words.slice(from[k], k));
    chunks.map(rowsOf).forEach(rows => S.push({ rows, words: rows.flat(), t0: rows[0][0].t0 - 0.1, line: L.id, lineEnd: L.t1 }));
  }
  for (let i = 0; i < S.length; i++) {
    const nx = S[i + 1];
    S[i].t1 = S[i].line === nx?.line ? nx.t0 : Math.min(S[i].lineEnd + 0.6, nx ? nx.t0 - 0.05 : TLJ.dur - 0.3);
    S[i].text = S[i].rows.map(r => r.map(w => w.w).join(' ')).join(' ');
  }
  return S;
}
export function drawSub(ctx, t, S) {
  const cur = S.find(c => t >= c.t0 && t < c.t1);
  if (!cur) return;
  const a = Math.min(1, (t - cur.t0) / 0.1, (cur.t1 - t) / 0.12);
  ctx.save();
  ctx.font = `600 50px ${FONT.ui}`;
  const lines = cur.rows, lh = 60, tw = Math.max(...lines.map(r => ctx.measureText(r.map(w => w.w).join(' ')).width));
  const yb = SUB_Y, x = W / 2 - tw / 2, h = lines.length * lh;
  ctx.fillStyle = `rgba(4,2,14,${0.7 * a})`; ctx.fillRect(x - 64, yb - h - 26, tw + 100, h + 40);
  ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.line(0.6 * a); ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(x - 64, yb - h - 26 + 14); ctx.lineTo(x - 64, yb - h - 26); ctx.lineTo(x - 50, yb - h - 26);
  ctx.moveTo(x + tw + 36 - 14, yb + 14); ctx.lineTo(x + tw + 36, yb + 14); ctx.lineTo(x + tw + 36, yb); ctx.stroke();
  const speaking = cur.words.some(w => t >= w.t0 && t < w.t1 + 0.05);
  ctx.fillStyle = T.line(0.9 * a);
  for (let i = 0; i < 4; i++) { const hh = speaking ? 6 + 18 * Math.abs(Math.sin(t * 9 + i * 1.7)) : 4; ctx.fillRect(x - 46 + i * 7, yb - h / 2 - 8 - hh / 2, 3, hh); }
  ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  lines.forEach((row, li) => {
    let cx = x;
    for (const w of row) {
      ctx.fillStyle = t >= w.t0 - 0.03 ? T.hi(0.98 * a) : T.line(0.42 * a);
      ctx.fillText(w.w, cx, yb - h + (li + 1) * lh - 14);
      cx += ctx.measureText(w.w + ' ').width;
    }
  });
  ctx.restore();
}

// ---------------------------------------------------------------- the comment-to-DM call to action
export function ctaCard(ctx, t, t0, keyword, frame, a) {
  if (a <= 0 || t < t0) return;
  const k = seg(t, t0, t0 + 0.4), rk = seg(t, t0 + 0.1, t0 + 0.5);
  const y = 1000;
  U.plate(ctx, T, 110, y - 330, 860 * eo(k * 1.3), 470, a);
  label(ctx, U.rollText('COMMENT', clamp(k * 1.5), frame, 71), W / 2, y - 250, a, { align: 'center', size: 44, track: 14, color: T.hi });
  bigValue(ctx, keyword, W / 2, y - 20, 230, a, { roll: rk, frame, seed: 73, flash: t > t0 + 0.5 && t < t0 + 0.6, track: 10, weight: 500 });
  const dk = seg(t, t0 + 0.45, t0 + 0.9);
  if (dk > 0) label(ctx, U.rollText('→  THE LINK GOES TO YOUR DMs', dk, frame, 75), W / 2, y + 80, a, { align: 'center', mono: true, size: 30 });
}

// the comment-a-vote call to action (news reels): a two-line question, two answers that light as they are spoken, a follow line
export function pollCard(ctx, t, t0, q, opts, at, frame, a, foot = 'FOLLOW FOR DAILY AI NEWS') {
  if (a <= 0 || t < t0) return;
  const k = seg(t, t0, t0 + 0.4), y = 700;
  U.plate(ctx, T, 110, y - 40, 860 * eo(k * 1.3), 560, a);
  q.forEach((s, i) => label(ctx, U.rollText(s, clamp(k * 1.5 - i * 0.2), frame, 81 + i), W / 2, y + 40 + i * 58, a, { align: 'center', size: 48, track: 4, color: T.hi }));
  opts.forEach((s, i) => {
    const x = W / 2 + (i ? 210 : -210), on = t >= at[i] - 0.05, rk = seg(t, at[i] - 0.05, at[i] + 0.3);
    U.plate(ctx, T, x - 170, y + 150, 340, 190, a * (on ? 1 : 0.5));
    if (rk > 0) bigValue(ctx, s, x, y + 290, 140, a, { roll: rk, frame, seed: 91 + i, flash: t > at[i] + 0.3 && t < at[i] + 0.4, track: 6, weight: 500 });
  });
  const dk = seg(t, t0 + 1.2, t0 + 1.6);                   // early enough to be read before the reel loops
  if (dk > 0) label(ctx, U.rollText('↓  COMMENT YOUR ANSWER', dk, frame, 95), W / 2, y + 410, a, { align: 'center', mono: true, size: 30 });
  if (dk > 0 && foot) label(ctx, U.rollText(foot, seg(t, t0 + 1.6, t0 + 2.0), frame, 97), W / 2, y + 470, a, { align: 'center', size: 30, track: 8, color: T.dim });
}

// ---------------------------------------------------------------- screen-space helpers
// project a point on a flat rectangle in the model (origin o, axes u and v in world units) and draw text on it with an affine fit
export function planeMapper(proj, o, u, v) {
  const at = (a, b) => proj([o[0] + u[0] * a + v[0] * b, o[1] + u[1] * a + v[1] * b, o[2] + u[2] * a + v[2] * b]);
  const quad = (a0, b0, a1, b1) => [at(a0, b0), at(a1, b0), at(a1, b1), at(a0, b1)];
  const path = (ctx, q) => { ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); };
  // text: (a, b) is the anchor in plane coords; size is a fraction of the v axis (glyphs keep their aspect even when |u| ≠ |v|)
  const r = Math.hypot(...v) / Math.hypot(...u);
  const text = (ctx, s, a, b, size, style, o = {}) => {
    const p0 = at(a, b), pu = at(a + 0.01, b), pv = at(a, b + 0.01);
    const ux = (pu[0] - p0[0]) / 0.01 * r, uy = (pu[1] - p0[1]) / 0.01 * r, vx = (pv[0] - p0[0]) / 0.01, vy = (pv[1] - p0[1]) / 0.01;
    ctx.save(); ctx.setTransform(ux / 100, uy / 100, -vx / 100, -vy / 100, p0[0], p0[1]);
    ctx.font = `${o.weight || 600} ${Math.max(1, size * 100)}px ${o.mono ? FONT.mono : FONT.ui}`; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = style; ctx.globalCompositeOperation = o.comp || 'lighter'; ctx.fillText(s, 0, 0); ctx.restore();
  };
  return { at, quad, path, text };
}

// whip-pan motion blur: N sub-frames over a 180° shutter, only while blurK(t) > 0.05
export function withWhip(frameAt, blurK) {
  const acc = mk(W, H), sub = mk(W, H);
  return (ctx, t, o = {}) => {
    if (o.noblur || blurK(t) < 0.05) return frameAt(ctx, t, o);
    const N = 5, a = acc.getContext('2d'), s = sub.getContext('2d');
    for (let k = 0; k < N; k++) {
      s.setTransform(1, 0, 0, 1, 0, 0); frameAt(s, t + (k / (N - 1) - 0.5) / 48, { ...o, frameT: t });
      a.globalAlpha = 1 / (k + 1); a.drawImage(sub, 0, 0);
    }
    a.globalAlpha = 1; ctx.drawImage(acc, 0, 0);
  };
}
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
