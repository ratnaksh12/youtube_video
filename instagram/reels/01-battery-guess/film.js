// "Your battery percentage is a guess": choreography for the Hologram HUD engine, 1080×1920 at 24 fps.
// Every time comes from timeline.json (voice lines + estimated word times on a 120 BPM grid); nothing here is hand-timed to the second
// except the beats between lines. The engine (engine/holo.js, engine/hud.js) only draws.
import { Holo, drawPad, drawScanPlane, makeCamera } from './engine/holo.js';
import * as U from './engine/hud.js';

export const W = 1080, H = 1920, FPS = 24;
const { clamp } = U;
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const sine = t => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t));
const hash = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const win = (t, a, b, fi = 0.25, fo = 0.25) => clamp(Math.min((t - a) / fi, (b - t) / fo));   // 0→1→0 over [a, b]
const snap = t => Math.round(t / 0.125) * 0.125;   // 1/16 note at 120 BPM: visual hits sit on the music grid, within 62 ms of the word
const HUE = 252, ACC = 82;                          // violet lines, lime for locked values only
const FONT = U.FONT;

// ---------------------------------------------------------------- timing
export function keys(TL) {
  const L = Object.fromEntries(TL.lines.map(l => [l.id, l]));
  const w = (id, word, n = 0) => {
    const ws = L[id].words, k = ws.map((x, i) => [x, i]).filter(([x]) => x.w.toLowerCase().replace(/[^a-z0-9%]/g, '') === word);
    if (!k.length) throw new Error(`word "${word}" not in ${id}`);
    return snap(k[Math.min(n, k.length - 1)][0].t0);
  };
  const K = {
    DUR: TL.dur, L,
    guess1: w('l01', 'guess'), l02: L.l02.t0, l03: L.l03.t0, battery: w('l03', 'battery'), chip: w('l03', 'chip'), fuel: w('l03', 'fuel'), watches: w('l03', 'watches'),
    l04: L.l04.t0, counts: w('l04', 'counts'), inout: w('l04', 'in'),
    l05: L.l05.t0, errors: w('l05', 'errors'), pile: w('l05', 'pile'),
    l06: L.l06.t0, volt: w('l06', 'voltage'),
    l07: L.l07.t0, middle: w('l07', 'middle'), barely: w('l07', 'barely'),
    l08: L.l08.t0, blends: w('l08', 'blends'), model: w('l08', 'model'), temp: w('l08', 'temperature'), age: w('l08', 'age'), pushing: w('l08', 'pushing'), l08e: L.l08.t1,
    l09: L.l09.t0, disagrees: w('l09', 'disagrees'), corrects: w('l09', 'corrects'),
    l10: L.l10.t0, three: w('l10', 'three'), cold: w('l10', 'cold'), die: w('l10', 'die'), l10e: L.l10.t1,
    l11: L.l11.t0, zero: w('l11', 'zero'), stops: w('l11', 'stops'), protect: w('l11', 'protect'),
    l12: L.l12.t0, number: w('l12', 'number'), guess2: w('l12', 'guess'),
    l13: L.l13.t0, one: w('l13', 'one'),
  };
  K.silence = [snap(K.l10e + 0.05), K.l11];              // true digital silence before the turn
  K.ignite = K.l12;                                      // the drop
  return K;
}

// ---------------------------------------------------------------- cameras (cx, cy in px; fov is vertical)
const FOV = 0.9;
function cams(M) {
  const g = M.center('gauge'), tb = M.center('tabs'), bt = M.center('battery'), mid = [0, M.ymax * 0.5, 0];
  return {
    high: { target: [0, M.ymax * 0.42, 0], yaw: 0.85, pitch: 0.44, dist: 7.6, cx: 540, cy: 1010 },
    front: { target: mid, yaw: 0.52, pitch: 0.17, dist: 6.9, cx: 540, cy: 950 },
    back: { target: mid, yaw: Math.PI - 0.55, pitch: 0.15, dist: 6.2, cx: 545, cy: 960 },
    chip: { target: g, yaw: Math.PI - 0.42, pitch: 0.2, dist: 1.1, cx: 520, cy: 1000 },
    flex: { target: [g[0] + 0.12, g[1] + 0.03, g[2]], yaw: Math.PI - 0.12, pitch: 0.16, dist: 0.95, cx: 520, cy: 1010 },
    drift: { target: [g[0] + 0.1, g[1] + 0.02, g[2]], yaw: Math.PI - 0.05, pitch: 0.12, dist: 1.1, cx: 520, cy: 1010 },
    tabs: { target: tb, yaw: Math.PI + 0.32, pitch: 0.22, dist: 1.25, cx: 600, cy: 1030 },
    graph: { target: [0, M.ymax * 0.52, 0], yaw: Math.PI + 0.25, pitch: 0.12, dist: 8.2, cx: 660, cy: 1110 },
    model: { target: mid, yaw: Math.PI - 0.62, pitch: 0.2, dist: 6.6, cx: 650, cy: 980 },
    cell: { target: bt, yaw: Math.PI - 0.2, pitch: 0.1, dist: 5.7, cx: 650, cy: 1100 },
    eye: { target: bt, yaw: Math.PI + 0.06, pitch: 0.0, dist: 4.2, cx: 470, cy: 930 },
  };
}
const mix = (A, B, w) => ({
  target: A.target.map((x, i) => lerp(x, B.target[i], w)), yaw: lerp(A.yaw, B.yaw, w), pitch: lerp(A.pitch, B.pitch, w),
  dist: Math.exp(lerp(Math.log(A.dist), Math.log(B.dist), w)), cx: lerp(A.cx, B.cx, w), cy: lerp(A.cy, B.cy, w), roll: 0, fov: FOV,
});
function camAt(C, K, t) {
  const at = (a, b, ta, tb, f = eio) => mix(a, b, f(seg(t, ta, tb)));
  if (t < K.l03) return at(C.high, C.front, K.l02, K.l03 + 0.3, eo);                                      // crane down while the scan grows
  if (t < K.chip - 0.5) return at(C.front, C.back, K.l03, K.battery - 0.1, sine);                         // orbit round to the back
  if (t < K.l04 - 0.4) return at(C.back, C.chip, K.chip - 0.5, K.chip + 0.35);                            // push in on the chip
  if (t < K.l05) return at(C.chip, C.flex, K.l04 - 0.4, K.l05, sine);                                     // lateral dolly along the flex
  if (t < K.l06 - 0.45) return at(C.flex, C.drift, K.l05, K.l06 - 0.45, sine);
  if (t < K.l07 + 0.2) return at(C.drift, C.tabs, K.l06 - 0.45, K.l06 + 0.05);                            // whip to the tabs (blurred)
  if (t < K.l08 - 0.2) return at(C.tabs, C.graph, K.l07 + 0.2, K.l07 + 1.3);                              // pull back under the graph
  if (t < K.l09 - 0.3) return { ...C.model, fov: FOV };                                                  // (drawn by camModelDrift)
  if (t < K.silence[0]) {                                                                                 // slow half-time orbit ends; push toward the cell
    const o = { ...C.model, yaw: C.model.yaw + 0.55 };
    return at(o, C.cell, K.l09 - 0.3, K.l10 + 0.5);
  }
  if (t < K.l11) return { ...C.cell, fov: FOV };
  if (t < K.l12 - 0.6) return at(C.cell, C.eye, K.l11, K.l11 + 1.8, eo);                                   // push to eye level on the cell
  return at(C.eye, C.front, K.l12 - 0.7, K.l12 + 1.3);                                                     // crane back round to the opening angle
}
// the model's orbit during l08 is drawn as a slow yaw drift (half-time)
function camModelDrift(C, K, t) {
  if (t < K.l08 - 0.2 || t >= K.l09 - 0.3) return null;
  const base = mix(C.graph, C.model, eio(seg(t, K.l08 - 0.2, K.l08 + 1.2)));
  return { ...base, yaw: base.yaw + 0.55 * sine(seg(t, K.l08 + 0.4, K.l09 - 0.3)) };
}

// ---------------------------------------------------------------- the film
export function makeFilm(model, TLJ, X) {
  const K = keys(TLJ), T = U.theme(HUE, ACC);
  const M = {
    ymax: model.ymax,
    center: id => { const P = model.byId[id]; return (P.center || P.anchor).slice(); },
  };
  const C = cams(M);
  const holo = new Holo(W, H);
  const pulsePath = X.pulse, cellB = X.cell;     // already in normalised world units
  const subs = makeSubs(TLJ);

  // ---- readout values over time (the number is the film's main actor)
  const CAND = ['61%', '64%', '59%', '63%', '60%', '65%', '58%', '62%'];
  function readout(t, frame) {
    // returns { text, locked, flash, roll, tag }
    if (t < K.guess1) return { text: CAND[Math.floor(frame / 3) % CAND.length], locked: false, scramble: true };
    if (t < K.l09) return { text: '62%', locked: true, flash: t - K.guess1 < 0.125 };
    if (t < K.three) return { text: '15%', locked: t > K.l09 + 0.4, roll: seg(t, K.l09, K.l09 + 0.4), flash: Math.abs(t - K.l09 - 0.42) < 0.06 };
    if (t < K.cold) return { text: '3%', locked: t > K.three + 0.42, roll: seg(t, K.three + 0.12, K.three + 0.42), flash: Math.abs(t - K.three - 0.45) < 0.07 };
    if (t < K.silence[0] + 0.2) return { text: '30%', locked: t > K.cold + 0.3, roll: seg(t, K.cold, K.cold + 0.3), flash: false };
    if (t < K.number) return { text: '0%', locked: true, flash: false };
    if (t < K.one) return { text: '62%', locked: t > K.number + 0.5, roll: seg(t, K.number, K.number + 0.5), flash: Math.abs(t - K.number - 0.52) < 0.06 };
    return { text: '1%', locked: t > K.one + 0.35, roll: seg(t, K.one, K.one + 0.35), flash: Math.abs(t - K.one - 0.37) < 0.07 };
  }
  // the charge drawn inside the cell, 0–1
  function level(t) {
    if (t < K.three) return 0.62 + (t < K.l09 ? 0 : lerp(0, -0.47, eo(seg(t, K.l09, K.l09 + 0.4))));
    if (t < K.cold) return lerp(0.15, 0.03, eo(seg(t, K.three + 0.1, K.three + 0.5)));
    if (t < K.silence[0]) return lerp(0.03, 0.30, eo(seg(t, K.cold, K.cold + 0.3)));
    if (t < K.l12) return 0;
    return lerp(0, 0.62, eo(seg(t, K.l12, K.l12 + 1.4)));
  }

  // ---- events for the score and the mixer
  function events() {
    const E = [];
    const ev = (t, type, o = {}) => E.push({ t: +t.toFixed(3), type, ...o });
    ev(0, 'scramble', { t1: K.guess1 }); ev(K.guess1, 'lock'); ev(K.guess1, 'confirm');
    ev(K.l02 + 0.05, 'shrink'); ev(K.l02 + 0.15, 'scan', { t1: K.l03 - 0.1 });
    ev(K.battery - 0.75, 'slide');
    ev(K.battery, 'probe'); ev(K.battery + 0.35, 'deny');
    ev(K.chip, 'lock'); ev(K.fuel - 0.1, 'card'); ev(K.fuel - 0.05, 'roll', { t1: K.fuel + 0.25 }); ev(K.fuel + 0.25, 'confirm');
    for (let i = 0; i < 10; i++) ev(K.counts + i * 0.25, 'pulse', { dir: i % 2 ? -1 : 1 });
    ev(K.l04 + 0.1, 'card'); ev(K.counts, 'roll', { t1: K.l05 + 2.4, count: true });
    ev(K.errors, 'error', { t1: K.pile + 0.9 });
    ev(K.l06 - 0.3, 'dock'); ev(K.l06 - 0.45, 'whip'); ev(K.l06 + 0.05, 'lock'); ev(K.l06 + 0.1, 'card');
    ev(K.l06 + 0.2, 'roll', { t1: K.l06 + 0.6 }); ev(K.l06 + 0.6, 'confirm');
    ev(K.l07 + 0.35, 'dock'); ev(K.l07 + 0.4, 'card'); ev(K.l07 + 0.45, 'draw', { t1: K.middle - 0.1 }); ev(K.middle, 'lock'); ev(K.barely, 'sweep', { t1: K.barely + 1.0 });
    ev(K.l08 - 0.1, 'card'); ev(K.blends, 'merge');
    ev(K.temp, 'roll', { t1: K.temp + 0.4 }); ev(K.temp + 0.4, 'confirm');
    ev(K.age, 'roll', { t1: K.age + 0.4 }); ev(K.age + 0.4, 'confirm');
    ev(K.pushing, 'roll', { t1: K.pushing + 0.4 }); ev(K.pushing + 0.4, 'confirm');
    [0, 0.15, 0.3].forEach(d => ev(K.l08e + 0.05 + d, 'dock'));
    ev(K.l09, 'roll', { t1: K.l09 + 0.4 }); ev(K.l09 + 0.42, 'confirm');
    ev(K.disagrees, 'flag', { t1: K.three - 0.1 });
    ev(K.three, 'glitch'); ev(K.three + 0.12, 'roll', { t1: K.three + 0.42 }); ev(K.three + 0.45, 'confirm', { hard: true });
    ev(K.cold, 'frost'); ev(K.cold, 'roll', { t1: K.cold + 0.3 });
    ev(K.die, 'powerloss');
    E.push({ t: K.silence[0], type: 'silence', t1: K.silence[1] });
    ev(K.zero, 'lock', { first: true }); ev(K.zero + 0.3, 'card'); ev(K.zero + 0.35, 'roll', { t1: K.zero + 0.85 });
    ev(K.stops, 'marker');
    ev(K.l12 - 0.55, 'close');
    ev(K.ignite, 'ignite');
    ev(K.number, 'roll', { t1: K.number + 0.5 }); ev(K.number + 0.52, 'confirm');
    ev(K.guess2, 'lock');
    ev(K.one, 'roll', { t1: K.one + 0.35 }); ev(K.one + 0.37, 'confirm', { final: true });
    ev(K.one + 0.8, 'roll', { t1: K.one + 1.4 });
    ev(K.DUR - 1.4, 'erase', { t1: K.DUR - 0.5 });
    return E.sort((a, b) => a.t - b.t);
  }

  // ---- whip blur: 5 sub-frames over a 180° shutter, only inside the whip
  const acc = mk(W, H), sub = mk(W, H);
  const whipK = t => (t > K.l06 - 0.45 && t < K.l06 + 0.05) ? Math.sin(Math.PI * seg(t, K.l06 - 0.45, K.l06 + 0.05)) : 0;
  function render(ctx, t, o = {}) {
    if (o.noblur || whipK(t) < 0.05) return frameAt(ctx, t, o);
    const N = 5, a = acc.getContext('2d'), s = sub.getContext('2d');
    for (let k = 0; k < N; k++) {
      const tk = t + (k / (N - 1) - 0.5) / 48;
      s.setTransform(1, 0, 0, 1, 0, 0); frameAt(s, tk, { ...o, frameT: t });
      a.globalAlpha = 1 / (k + 1); a.drawImage(sub, 0, 0);
    }
    a.globalAlpha = 1; ctx.drawImage(acc, 0, 0);
  }

  // ---- one frame
  function frameAt(ctx, t, o = {}) {
    const tf = o.frameT ?? t, frame = Math.round(tf * FPS);
    const cam = camModelDrift(C, K, t) || camAt(C, K, t);
    cam.fov = FOV;
    const P = makeCamera(cam, W, H).project, p3 = new Float32Array(3);
    const proj = (v) => { P(v[0], v[1], v[2], p3); return [p3[0], p3[1], p3[2]]; };

    // power state: hook (no phone) → scan → on … die flicker → silence power-down → dark → re-ignite
    const scanY = t < K.l03 + 0.2 ? lerp(-0.05, M.ymax * 1.03, sine(seg(t, K.l02 + 0.15, K.l03 - 0.1))) : null;
    const erase = t > K.DUR - 1.4 ? lerp(M.ymax * 1.03, -0.05, sine(seg(t, K.DUR - 1.4, K.DUR - 0.5))) : null;
    const dieFl = t >= K.die && t < K.die + 0.3 ? (Math.floor((t - K.die) * FPS) % 2 ? 0.1 : 0.7) : 1;
    let power = 1;
    if (t >= K.die + 0.3) power = lerp(0.55, 0.35, seg(t, K.die + 0.3, K.silence[0]));
    if (t >= K.silence[0]) power = lerp(0.35, 0.05, eo(seg(t, K.silence[0] + 0.1, K.silence[0] + 0.9)));
    if (t >= K.ignite - 0.6) power = lerp(0.05, 1, eo(seg(t, K.ignite - 0.6, K.ignite + 0.4)));
    power *= dieFl;
    const hudA = t < K.silence[0] + 0.2 ? 1 : t < K.l11 + 0.1 ? 1 - seg(t, K.silence[0] + 0.2, K.l11 - 0.1) * 0.85 : t < K.ignite ? lerp(0.15, 1, eo(seg(t, K.l11 + 0.1, K.l11 + 0.8))) : 1;

    // ---- background, pad
    U.background(ctx, W, H, T, { cx: cam.cx, cy: cam.cy + 40, px: -cam.yaw * 120, py: cam.pitch * 140, alpha: 0.75 + 0.25 * power });
    const padA = t < K.l02 ? 0.35 : t < K.silence[0] ? 1 : t < K.ignite ? lerp(1, 0.75, seg(t, K.silence[0], K.l11)) : 1;
    drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12, alpha: padA * (erase !== null ? 1 - seg(t, K.DUR - 0.8, K.DUR) * 0.6 : 1) });
    if (t >= K.ignite && t < K.DUR - 0.6) U.beam(ctx, T, P, eo(seg(t, K.ignite, K.ignite + 0.5)) * (1 - seg(t, K.DUR - 1.3, K.DUR - 0.6)), t, { y1: M.ymax * 1.05 });

    // ---- subject
    let info = null;
    if (t >= K.l02 + 0.1) {
      const openK = eo(seg(t, K.battery - 0.75, K.battery - 0.05)) * (1 - eio(seg(t, K.l12 - 0.55, K.l12 - 0.05)));
      const explode = { back: openK, board: openK, battery: openK, tabs: openK, gauge: openK };
      let focus = null, dim = 0.3, flash = {};
      if (t > K.chip && t < K.l06 - 0.3) { focus = 'gauge'; dim = 0.42; }
      if (t > K.l06 - 0.1 && t < K.l07 + 0.3) { focus = 'tabs'; dim = 0.4; }
      if (t > K.silence[0] && t < K.l12 - 0.3) { focus = 'battery'; dim = t < K.zero ? 1 : 0.18; }
      if (Math.abs(t - K.chip) < 0.125) flash.gauge = 1;
      if (Math.abs(t - K.l06 - 0.05) < 0.125) flash.tabs = 1;
      let gain = power * (t > K.l07 + 0.35 && t < K.l08 ? lerp(1, 0.42, eo(seg(t, K.l07 + 0.35, K.l07 + 0.95))) : 1);
      if (t >= K.l08 && t < K.l08 + 0.8) gain = power * lerp(0.42, 1, eo(seg(t, K.l08, K.l08 + 0.8)));
      if (t > K.zero - 0.05 && t < K.l12 - 0.3) { gain = lerp(gain, 0.85, eo(seg(t, K.zero - 0.05, K.zero + 0.25))); dim = 0.1; }   // only the cell comes back
      const solid = t >= K.ignite ? eo(seg(t, K.ignite, K.ignite + 0.7)) * (erase !== null ? 1 - seg(t, K.DUR - 1.4, K.DUR - 0.9) : 1) : 0;
      const wave = t >= K.ignite && t < K.ignite + 1.3 ? { y: lerp(-0.1, M.ymax + 0.1, seg(t, K.ignite, K.ignite + 1.2)), w: 0.12 } : null;
      info = holo.draw(ctx, model, cam, {
        hue: T.hue, explode, focus, dim, flash, gain, solid, wave, scanOffset: frame,
        scan: scanY !== null ? { y: scanY, band: 0.09 } : null, scanDown: erase !== null ? { y: erase } : null,
        lineWidth: solid > 0 ? lerp(1.35, 1.9, solid) - 0.3 * seg(t, K.ignite + 0.7, K.ignite + 2) : 1.45,
      });
      if (scanY !== null && t < K.l03) drawScanPlane(ctx, cam, W, H, scanY, { hue: T.hue, r: 0.78, rot: t * 0.6 });
      if (erase !== null) drawScanPlane(ctx, cam, W, H, erase, { hue: T.hue, r: 0.78, rot: -t * 0.6, alpha: 1 - seg(t, K.DUR - 0.6, K.DUR - 0.45) });
      drawCellCharge(ctx, t, proj, openK, power);
      drawPulses(ctx, t, proj);
    }

    // ---- HUD: chrome, status, title
    chrome(ctx, t, hudA);
    // ---- top zone: the readout and the cards
    drawTop(ctx, t, frame, info, proj, hudA);
    // ---- rail
    drawRail(ctx, t, frame, hudA);
    // ---- target boxes, leaders and markers on the subject
    drawLocks(ctx, t, frame, info, proj);
    U.vignette(ctx, W, H, 0.55);
    // ---- subtitles
    if (!o.nosub) drawSub(ctx, t, subs);
    // ---- the one glitch, on the biggest change
    if (t >= K.three && t < K.three + 3 / FPS) U.glitch(ctx, W, H, 1, Math.floor(t * FPS));
  }

  // the charge inside the cell: a filled band on the cell's back face, its top edge hot; at 0% only the reserve stays lit
  function drawCellCharge(ctx, t, proj, openK, power) {
    const vis = clamp(openK * 3);
    if (vis <= 0.01) return;
    const lv = level(t), { x0, x1, y0, y1, z } = cellB, yy = y => y0 + (y1 - y0) * y;
    const quad = (a, b, al, fill) => {
      const q = [[x0, yy(a), z], [x1, yy(a), z], [x1, yy(b), z], [x0, yy(b), z]].map(proj);
      ctx.beginPath(); q.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
      ctx.fillStyle = fill(al); ctx.fill();
      return q;
    };
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const RES = 0.07;                                                     // the reserve band under "0%"
    const darkK = t > K.silence[0] && t < K.l12;
    if (!darkK && lv > 0.005) {
      const q = quad(0, lv, 0.16 * vis * power, a => T.line(a));
      // interlace stripes give it the projected look
      ctx.strokeStyle = T.line(0.14 * vis * power); ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 1; i < 14; i++) { const f = i / 14 * lv, a = proj([x0, yy(f), z]), b = proj([x1, yy(f), z]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke();
      ctx.strokeStyle = T.hi(0.85 * vis * power); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(q[3][0], q[3][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.stroke();
    }
    if (t >= K.zero - 0.05 && t < K.l12 + 0.4) {                          // the turn: the reserve lights inside the dark phone
      const k = eo(seg(t, K.zero - 0.05, K.zero + 0.25)) * (1 - seg(t, K.l12, K.l12 + 0.4));
      const pulse = 0.75 + 0.25 * Math.sin((t - K.zero) * 5);
      const q = quad(0, RES, 0.42 * k * pulse, a => T.line(a));
      ctx.strokeStyle = T.hi(0.95 * k); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(q[3][0], q[3][1]); ctx.lineTo(q[2][0], q[2][1]); ctx.stroke();
      if (t > K.stops) {                                                  // the cut-off line across the cell
        const a = eo(seg(t, K.stops, K.stops + 0.35));
        const l = proj([x0 - 0.12, yy(RES), z]), r = proj([lerp(x0 - 0.12, x1 + 0.12, a), yy(RES), z]);
        ctx.setLineDash([10, 7]); ctx.strokeStyle = T.hi(0.9 * k); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(r[0], r[1]); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    ctx.restore();
  }

  // charge pulses travelling through the gauge chip, both ways
  function drawPulses(ctx, t, proj) {
    const a = win(t, K.counts - 0.1, K.l05 + 0.4, 0.2, 0.4);
    if (a <= 0) return;
    const pts = pulsePath.map(proj);
    const lens = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); lens.push(d); tot += d; }
    const at = u => { let d = u * tot; for (let i = 0; i < lens.length; i++) { if (d <= lens[i]) { const f = d / lens[i]; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; } d -= lens[i]; } return pts[pts.length - 1]; };
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    // the path itself, faint
    ctx.strokeStyle = T.line(0.25 * a); ctx.lineWidth = 1.5; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    for (let i = 0; i < 10; i++) {
      const t0 = K.counts + i * 0.25, u = (t - t0) / 0.7;
      if (u < 0 || u > 1) continue;
      const dir = i % 2 ? -1 : 1, uu = dir > 0 ? u : 1 - u;
      for (let k = 0; k < 6; k++) {                                       // a short comet
        const p = at(clamp(uu - dir * k * 0.025)); const al = a * (1 - k / 6) * Math.sin(Math.PI * u);
        ctx.fillStyle = k ? T.line(0.7 * al) : T.hi(al); ctx.beginPath(); ctx.arc(p[0], p[1], k ? 3.2 - k * 0.4 : 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- chrome
  function chrome(ctx, t, a) {
    const m = 40;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = T.line(0.5 * a); ctx.lineWidth = 1.5; U.corners(ctx, m, m + 150, W - m, H - m - 120, 44);
    ctx.strokeStyle = T.dim(0.4 * a); ctx.lineWidth = 1; ctx.beginPath();
    for (let y = 300; y < 1700; y += 24) { const big = ((y - 300) / 24) % 5 === 0; ctx.moveTo(m + 6, y); ctx.lineTo(m + 6 + (big ? 12 : 6), y); }
    ctx.stroke();
    ctx.font = `20px ${FONT.mono}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = T.line(0.85 * a); ctx.fillText('HOW IT ACTUALLY WORKS // 01', m + 22, 232);
    ctx.textAlign = 'right'; ctx.fillStyle = T.line(0.75 * a); ctx.fillText(status(t), W - m - 22, 232);
    ctx.restore();
  }
  function status(t) {
    if (t < K.guess1) return 'SOC ?? · SAMPLING';
    if (t < K.l02) return 'SOC 62% · UNVERIFIED';
    if (t < K.l03) return `SCANNING ${String(Math.min(100, Math.floor(seg(t, K.l02 + 0.15, K.l03 - 0.1) * 100))).padStart(3, '0')}%`;
    if (t < K.chip) return 'HANDSET-01 · BACK OPEN';
    if (t < K.l06) return 'TGT 01 · FUEL GAUGE';
    if (t < K.l08) return 'TGT 02 · CELL TABS';
    if (t < K.l09) return 'MODEL · 3 INPUTS';
    if (t < K.silence[0]) return 'ESTIMATE · CORRECTING';
    if (t < K.zero) return '';
    if (t < K.ignite) return 'CELL · RESERVE';
    return 'SOC ≈62% · ESTIMATE';
  }

  // ---------------------------------------------------------------- top zone: the readout and the cards
  const TOP = { x: 90, y: 300, w: 900 };
  function bigNumber(ctx, t, frame, x, y, size, a, r) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.font = `300 ${size}px ${FONT.ui}`; ctx.textBaseline = 'alphabetic';
    const s = r.scramble ? r.text : U.rollText(r.text, r.roll ?? 1, frame, 5);
    const adv = ctx.measureText('0').width * 1.02;
    const wd = [...s].reduce((acc, ch) => acc + (ch === '%' ? ctx.measureText('%').width : adv), 0);
    const x0 = x - wd / 2;
    ctx.fillStyle = r.locked ? (r.flash ? T.hi(a) : T.acc(a)) : T.line(0.95 * a);
    ctx.shadowColor = r.locked ? T.acc(0.75 * a) : T.line(0.85 * a); ctx.shadowBlur = size * 0.12;
    let cx = x0;
    for (const ch of s) { const w = ch === '%' ? ctx.measureText('%').width : adv; if (ch === '%') { ctx.font = `300 ${Math.round(size * 0.62)}px ${FONT.ui}`; ctx.fillText(ch, cx + 6, y); ctx.font = `300 ${size}px ${FONT.ui}`; } else ctx.fillText(ch, cx + (adv - ctx.measureText(ch).width) / 2, y); cx += w; }
    ctx.restore();
    return [x0, y - size * 0.72, x0 + wd, y];
  }
  function label(ctx, s, x, y, a, o = {}) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.font = o.mono ? `${o.size || 22}px ${FONT.mono}` : `${o.w || 600} ${o.size || 26}px ${FONT.ui}`;
    ctx.letterSpacing = o.mono ? '0px' : `${o.track ?? 3}px`; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = o.color ? o.color(a) : T.line(0.9 * a); ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
    ctx.restore();
  }
  function cardHead(ctx, idx, title, frame, a, k) {
    const { x, y, w } = TOP;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = T.line(0.9 * a); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * eo(k), y); ctx.stroke();
    ctx.fillStyle = T.line(0.9 * a); ctx.fillRect(x, y - 3, 34 * eo(k), 6);
    ctx.restore();
    label(ctx, idx, x, y + 36, a, { mono: true, color: T.dim });
    label(ctx, U.rollText(title, clamp(k * 1.6 - 0.2), frame, 3), x + 60, y + 38, a, { color: T.hi, size: 30 });
  }
  const cardA = (t, a, b) => win(t, a, b, 0.3, 0.3);

  function drawTop(ctx, t, frame, info, proj, hudA) {
    // 1. the readout, hook → shrinks into the top zone
    const r = readout(t, frame);
    if (t < K.fuel - 0.1) {
      const k = eio(seg(t, K.l02 + 0.02, K.l02 + 0.6));
      const size = lerp(330, 190, k), y = lerp(1010, TOP.y + 230, k);
      const a = 1 - seg(t, K.fuel - 0.4, K.fuel - 0.1);
      if (k > 0.98) U.plate(ctx, T, TOP.x - 22, TOP.y - 20, TOP.w + 44, 300, a);
      if (k > 0.98) cardHead(ctx, 'SOC', 'BATTERY · STATE OF CHARGE', frame, a, 1);
      const bb = bigNumber(ctx, t, frame, W / 2, y, size, a, r);
      if (t < K.l02 + 0.1) {
        const lk = seg(t, K.guess1 - 0.2, K.guess1);
        U.targetBox(ctx, T, bb, t > K.guess1 - 0.2 ? 1 : 0, { lockK: eo(lk), flash: t >= K.guess1 && t < K.guess1 + 0.125, pad: 34, tag: 'READOUT · LOCK' });
        if (t > K.guess1 + 0.05) label(ctx, U.rollText('≈ ESTIMATE, NOT A MEASUREMENT', seg(t, K.guess1 + 0.05, K.guess1 + 0.45), frame, 9), W / 2, y + 74, 1, { align: 'center', color: T.hi, size: 34, track: 4 });
        if (t < K.guess1) label(ctx, 'BATTERY', W / 2, y - size * 0.82, 1, { align: 'center', size: 30, track: 8 });
        if (t < K.guess1) {                                                // live inputs flicker while the number is being worked out
          const f = Math.floor(frame / 2), v = (3.80 + hash(f) * 0.08).toFixed(2), i = Math.round(380 + hash(f + 7) * 90), c = (30.6 + hash(f + 3) * 0.8).toFixed(1);
          label(ctx, `V ${v}  ·  I −${i} mA  ·  T ${c} °C`, W / 2, y + 74, 0.9, { align: 'center', mono: true, size: 28 });
        }
      } else label(ctx, '≈ ESTIMATE', TOP.x + TOP.w, TOP.y + 36, a * eo(seg(t, K.l02 + 0.5, K.l02 + 0.8)), { mono: true, align: 'right', color: T.acc });
      return;
    }
    // 2. FUEL GAUGE IC
    if (t < K.l04 + 0.15) {
      const a = win(t, K.fuel - 0.1, K.l04 + 0.15, 0.3, 0.2), k = seg(t, K.fuel - 0.1, K.fuel + 0.4);
      U.plate(ctx, T, TOP.x - 22, TOP.y - 20, (TOP.w + 44) * eo(k * 1.4), 300, a);
      cardHead(ctx, 'TGT 01', 'FOUND · THE ESTIMATOR', frame, a, k);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `300 118px ${FONT.ui}`; ctx.letterSpacing = '10px';
      ctx.fillStyle = t > K.fuel + 0.25 ? (t < K.fuel + 0.35 ? T.hi(a) : T.acc(a)) : T.line(0.9 * a);
      ctx.fillText(U.rollText('FUEL GAUGE', seg(t, K.fuel - 0.05, K.fuel + 0.25), frame, 7), TOP.x - 6, TOP.y + 170); ctx.restore();
      const det = seg(t, K.watches - 0.2, K.watches + 0.4);
      if (det > 0) label(ctx, U.rollText('IC · WATCHES THE CELL · ESTIMATES THE %', det, frame, 13), TOP.x, TOP.y + 236, a, { mono: true, size: 24 });
      return;
    }
    // 3. COUNT
    if (t < K.l06 - 0.3) {
      const a = cardA(t, K.l04 + 0.15, K.l06 - 0.3), k = seg(t, K.l04 + 0.15, K.l04 + 0.6);
      U.plate(ctx, T, TOP.x - 22, TOP.y - 20, (TOP.w + 44) * eo(k * 1.4), 330, a);
      cardHead(ctx, 'M1', 'METHOD 1 · COUNT THE CHARGE', frame, a, k);
      const mah = Math.round(2486 - Math.max(0, t - K.counts) * 41.3), s = mah.toLocaleString('en-US');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `300 120px ${FONT.ui}`;
      ctx.fillStyle = T.line(0.95 * a); U.monoText(ctx, t < K.counts ? U.rollText(s, seg(t, K.l04, K.counts), frame, 4) : s, TOP.x - 4, TOP.y + 170, ctx.measureText('0').width * 1.02);
      ctx.font = `500 40px ${FONT.ui}`; ctx.fillText('mAh', TOP.x + 340, TOP.y + 170); ctx.restore();
      // in / out arrows blink with the pulses
      const ph = Math.floor((t - K.counts) / 0.25), on = t > K.counts && t < K.l05 + 0.4;
      label(ctx, 'IN ▲', TOP.x + 450, TOP.y + 112, a * (on && ph % 2 === 1 ? 1 : 0.3), { mono: true, size: 28 });
      label(ctx, 'OUT ▼', TOP.x + 450, TOP.y + 156, a * (on && ph % 2 === 0 ? 1 : 0.3), { mono: true, size: 28 });
      // drift: counted vs true, the gap grows
      const e = seg(t, K.errors - 0.1, K.pile + 0.9);
      if (e > 0) {
        const gx = TOP.x + 570, gy = TOP.y + 74, gw = 320, gh = 150;
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = T.dim(0.5 * a); ctx.lineWidth = 1; ctx.strokeRect(gx, gy, gw, gh);
        const n = 40, sh = [], tr = [];
        for (let i = 0; i <= n; i++) { const u = i / n; if (u > e) break; const x = gx + u * gw; tr.push([x, gy + gh * (0.25 + 0.5 * u)]); sh.push([x, gy + gh * (0.25 + 0.5 * u) - gh * 0.42 * u * u * Math.min(1, e * 1.3)]); }
        ctx.setLineDash([5, 5]); ctx.strokeStyle = T.line(0.7 * a); ctx.beginPath(); tr.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = T.hi(0.9 * a); ctx.lineWidth = 2; ctx.beginPath(); sh.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
        if (sh.length > 1) { ctx.fillStyle = T.line(0.12 * a); ctx.beginPath(); sh.forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); for (let i = tr.length - 1; i >= 0; i--) ctx.lineTo(...tr[i]); ctx.fill(); }
        ctx.restore();
        label(ctx, 'TRUE', gx + gw + 8, gy + gh * 0.78, a, { mono: true, size: 18, color: T.dim });
        label(ctx, 'COUNTED', gx, gy - 10, a, { mono: true, size: 18 });
        const err = lerp(0.4, 6.0, eo(e)).toFixed(1);
        label(ctx, `DRIFT ±${err}%`, TOP.x, TOP.y + 258, a, { mono: true, size: 30, color: e >= 1 ? T.acc : T.hi });
      }
      return;
    }
    // 4. VOLTAGE
    if (t < K.l07 + 0.35) {
      const a = cardA(t, K.l06 + 0.05, K.l07 + 0.35), k = seg(t, K.l06 + 0.05, K.l06 + 0.5);
      U.plate(ctx, T, TOP.x - 22, TOP.y - 20, (TOP.w + 44) * eo(k * 1.4), 300, a);
      cardHead(ctx, 'M2', 'METHOD 2 · READ THE VOLTAGE', frame, a, k);
      const rk = seg(t, K.l06 + 0.2, K.l06 + 0.6), locked = rk >= 1;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `300 150px ${FONT.ui}`;
      ctx.fillStyle = locked ? (t < K.l06 + 0.7 ? T.hi(a) : T.acc(a)) : T.line(0.9 * a);
      const vw = U.monoText(ctx, rk > 0 ? U.rollText('3.85', rk, frame, 6) : '-.--', TOP.x - 4, TOP.y + 195, ctx.measureText('0').width * 1.02);
      ctx.font = `500 52px ${FONT.ui}`; ctx.fillText('V', TOP.x + vw + 10, TOP.y + 195); ctx.restore();
      label(ctx, 'CELL TERMINALS · OPEN-CIRCUIT', TOP.x + 470, TOP.y + 150, a, { mono: true, size: 22, color: T.dim });
      return;
    }
    // 5. GRAPH: voltage vs charge, flat in the middle
    if (t < K.l08 - 0.1) {
      const a = cardA(t, K.l07 + 0.35, K.l08 - 0.1), k = seg(t, K.l07 + 0.35, K.l07 + 0.85);
      drawGraph(ctx, t, frame, a, k);
      return;
    }
    // 6. MODEL
    if (t < K.l09 - 0.05) {
      const a = cardA(t, K.l08 - 0.1, K.l09 - 0.05), k = seg(t, K.l08 - 0.1, K.l08 + 0.4);
      U.plate(ctx, T, TOP.x - 22, TOP.y - 20, (TOP.w + 44) * eo(k * 1.4), 360, a);
      cardHead(ctx, 'M3', 'BLEND · COUNT + VOLTAGE + MODEL', frame, a, k);
      const rows = [['TEMPERATURE', '31', '°C', K.temp], ['AGE', '412', 'CYCLES', K.age], ['LOAD', '2.4', 'W', K.pushing]];
      rows.forEach(([lab, val, unit, tw], i) => {
        const y = TOP.y + 112 + i * 80, rk = seg(t, tw, tw + 0.4), ra = seg(t, tw - 0.25, tw);
        if (ra <= 0) { label(ctx, lab, TOP.x, y, a * 0.35, { size: 30 }); return; }
        label(ctx, lab, TOP.x, y, a, { size: 30, color: T.hi });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `300 76px ${FONT.ui}`; ctx.textAlign = 'right';
        ctx.fillStyle = rk >= 1 ? (t < tw + 0.5 ? T.hi(a) : T.acc(a)) : T.line(0.9 * a);
        ctx.fillText(U.rollText(val, rk, frame, 20 + i), TOP.x + 640, y + 8);
        ctx.font = `500 30px ${FONT.ui}`; ctx.textAlign = 'left'; ctx.fillText(unit, TOP.x + 656, y + 6); ctx.restore();
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.dim(0.35 * a); ctx.beginPath(); ctx.moveTo(TOP.x, y + 22); ctx.lineTo(TOP.x + TOP.w, y + 22); ctx.stroke(); ctx.restore();
      });
      return;
    }
    // 7. READOUT again: 15 → 3 → 30 → 0
    if (t < K.zero + 0.2) {
      const fade = t < K.silence[0] + 0.2 ? 1 : lerp(1, 0.45, seg(t, K.silence[0] + 0.2, K.silence[0] + 0.6));
      const a = win(t, K.l09 - 0.05, K.zero + 0.2, 0.3, 0.2) * fade;
      U.plate(ctx, T, TOP.x - 22, TOP.y - 20, TOP.w + 44, 300, a);
      cardHead(ctx, 'SOC', 'BATTERY · STATE OF CHARGE', frame, a, 1);
      bigNumber(ctx, t, frame, W / 2 - 120, TOP.y + 230, 190, a, r);
      const flag = t > K.disagrees && t < K.three ? (Math.floor((t - K.disagrees) * 4) % 2 ? 0.45 : 1) : 0;
      if (flag) label(ctx, 'MODEL ≠ VOLTAGE', TOP.x + TOP.w, TOP.y + 110, a * flag, { align: 'right', size: 30, color: T.hi });
      if (t > K.three + 0.45 && t < K.cold) label(ctx, 'CORRECTED IN 58 S', TOP.x + TOP.w, TOP.y + 110, a, { align: 'right', mono: true, size: 26, color: T.hi });
      if (t > K.cold && t < K.die) label(ctx, 'COLD · −8 °C', TOP.x + TOP.w, TOP.y + 110, a, { align: 'right', mono: true, size: 26, color: T.hi });
      if (t > K.die && t < K.silence[0] + 0.2) label(ctx, 'POWER OFF AT 30%', TOP.x + TOP.w, TOP.y + 110, a * (Math.floor((t - K.die) * 6) % 2 ? 0.5 : 1), { align: 'right', mono: true, size: 26, color: T.hi });
      if (t > K.silence[0] + 0.2) label(ctx, 'SHUT DOWN', TOP.x + TOP.w, TOP.y + 110, a, { align: 'right', mono: true, size: 26 });
      return;
    }
    // 8. RESERVE: 0% isn't empty
    if (t < K.l12 - 0.2) {
      const a = win(t, K.zero + 0.2, K.l12 - 0.2, 0.3, 0.3), k = seg(t, K.zero + 0.2, K.zero + 0.7);
      U.plate(ctx, T, TOP.x - 22, TOP.y - 20, (TOP.w + 44) * eo(k * 1.4), 300, a);
      cardHead(ctx, 'AT 0%', 'INSIDE THE CELL', frame, a, k);
      const rk = seg(t, K.zero + 0.35, K.zero + 0.85);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `300 132px ${FONT.ui}`; ctx.letterSpacing = '6px';
      ctx.fillStyle = rk >= 1 ? (t < K.zero + 0.95 ? T.hi(a) : T.acc(a)) : T.line(0.9 * a);
      ctx.fillText(U.rollText('NOT EMPTY', rk, frame, 17), TOP.x - 6, TOP.y + 180); ctx.restore();
      const d = seg(t, K.stops - 0.1, K.stops + 0.4);
      if (d > 0) label(ctx, U.rollText('THE PHONE STOPS HERE · PROTECTS THE CELL', d, frame, 31), TOP.x, TOP.y + 240, a, { mono: true, size: 24 });
      return;
    }
    // 9. ENDING: ≈62% · ESTIMATE, then 1%, then it settles back to the hook's place for the loop
    {
      const a = win(t, K.number - 0.3, K.DUR + 1, 0.3, 0.3);
      const mv = eio(seg(t, K.DUR - 1.4, K.DUR - 0.3));
      const size = lerp(210, 330, mv), y = lerp(TOP.y + 240, 1010, mv);
      const pa = a * (1 - mv);
      U.plate(ctx, T, TOP.x - 22, TOP.y - 20, TOP.w + 44, 320, pa);
      cardHead(ctx, 'SOC', 'BATTERY · STATE OF CHARGE', frame, pa, seg(t, K.number - 0.3, K.number + 0.2));
      if (t > K.number - 0.05) {
        const bb = bigNumber(ctx, t, frame, W / 2, y, size, a, r);
        if (t > K.guess2 - 0.2 && t < K.one) U.targetBox(ctx, T, bb, 1, { lockK: eo(seg(t, K.guess2 - 0.2, K.guess2)), flash: t >= K.guess2 && t < K.guess2 + 0.125, pad: 24 });
      }
      if (t > K.guess2) label(ctx, U.rollText('≈ A VERY GOOD GUESS', seg(t, K.guess2, K.guess2 + 0.45), frame, 41), TOP.x + TOP.w, TOP.y + 36, pa, { mono: true, align: 'right', color: T.acc });
      const st = seg(t, K.one + 0.8, K.one + 1.4);
      if (st > 0) label(ctx, U.rollText('HOW IT ACTUALLY WORKS · 01', st, frame, 51), W / 2, y + 104, a, { align: 'center', size: 30, track: 6, color: T.hi });
    }
  }

  function drawGraph(ctx, t, frame, a, k) {
    const x = TOP.x, y = TOP.y, w = TOP.w, h = 400;
    U.plate(ctx, T, x - 22, y - 20, (w + 44) * eo(k * 1.4), h + 40, a);
    cardHead(ctx, 'TYPICAL CELL', 'VOLTAGE VS CHARGE', frame, a, k);
    const gx = x + 60, gy = y + 84, gw = w - 90, gh = 190;
    const V = s => { s = clamp(s); return 0.08 + 0.42 * (1 - Math.exp(-s * 16)) + 0.28 * s + 0.24 * Math.pow(Math.max(0, s - 0.82) / 0.18, 2.2); };   // a typical graphite Li-ion open-circuit curve, shape only
    const px_ = s => gx + s * gw, py_ = v => gy + gh - v * gh;
    const dk = eo(seg(t, K.l07 + 0.45, K.middle - 0.1));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = T.dim(0.6 * a); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(gx, gy - 10); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw + 10, gy + gh); ctx.stroke();
    ctx.beginPath(); for (let i = 0; i <= 10; i++) { const xx = px_(i / 10); ctx.moveTo(xx, gy + gh); ctx.lineTo(xx, gy + gh + (i % 5 ? 6 : 12)); } ctx.stroke();
    // flat zone
    const fz = seg(t, K.middle - 0.1, K.middle + 0.3);
    if (fz > 0) {
      ctx.fillStyle = T.line(0.1 * a * fz); ctx.fillRect(px_(0.2), gy - 10, (px_(0.8) - px_(0.2)) * eo(fz), gh + 10);
      ctx.strokeStyle = T.hi(0.8 * a * fz); ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(px_(0.2), gy - 10); ctx.lineTo(px_(0.2), gy + gh); ctx.moveTo(px_(0.8), gy - 10); ctx.lineTo(px_(0.8), gy + gh); ctx.stroke(); ctx.setLineDash([]);
    }
    // the curve, drawn left to right
    ctx.strokeStyle = T.line(0.95 * a); ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 200 * dk; i++) { const s = i / 200, xx = px_(s), yy = py_(V(s)); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
    ctx.stroke();
    if (fz > 0) { ctx.strokeStyle = T.hi(0.95 * a * fz); ctx.lineWidth = 4; ctx.beginPath(); for (let i = 40; i <= 160; i++) { const s = i / 200; i > 40 ? ctx.lineTo(px_(s), py_(V(s))) : ctx.moveTo(px_(s), py_(V(s))); } ctx.stroke(); }
    // cursor sweep 30 → 70 %
    const sw = seg(t, K.barely, K.barely + 1.0), s0 = 0.3, s = lerp(s0, 0.7, sine(sw));
    if (sw > 0) {
      const cx = px_(s), cy = py_(V(s));
      ctx.strokeStyle = T.hi(0.6 * a); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, gy + gh); ctx.lineTo(cx, cy); ctx.lineTo(gx, cy); ctx.stroke();
      ctx.fillStyle = T.hi(a); ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
      const c0 = px_(s0), v0 = py_(V(s0));
      ctx.strokeStyle = T.line(0.5 * a); ctx.setLineDash([3, 5]); ctx.beginPath(); ctx.moveTo(c0, gy + gh); ctx.lineTo(c0, v0); ctx.lineTo(gx, v0); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.restore();
    label(ctx, 'VOLTAGE', gx - 8, gy - 22, a, { mono: true, size: 20, color: T.dim });
    label(ctx, 'CHARGE  0 → 100%', gx + gw, gy + gh + 30, a, { mono: true, size: 20, align: 'right', color: T.dim });
    if (fz > 0) label(ctx, 'FLAT ZONE', (px_(0.2) + px_(0.8)) / 2, gy + 30, a * fz, { align: 'center', size: 30, color: T.hi, track: 6 });
    // two bars: the charge moves a lot, the voltage barely
    if (sw > 0) {
      const by = gy + gh + 74;
      const dC = (s - s0), dV = V(s) - V(s0);
      label(ctx, 'CHARGE', x, by, a, { mono: true, size: 22 }); label(ctx, `+${Math.round(dC * 100)}%`, x + w, by, a, { mono: true, size: 22, align: 'right', color: T.acc });
      label(ctx, 'VOLTAGE', x, by + 46, a, { mono: true, size: 22 }); label(ctx, 'BARELY MOVES', x + w, by + 46, a, { mono: true, size: 22, align: 'right', color: T.hi });
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = T.dim(0.3 * a); ctx.fillRect(x + 150, by - 14, 520, 8); ctx.fillRect(x + 150, by + 32, 520, 8);
      ctx.fillStyle = T.acc(0.9 * a); ctx.fillRect(x + 150, by - 14, 520 * dC / 0.4, 8);
      ctx.fillStyle = T.hi(0.9 * a); ctx.fillRect(x + 150, by + 32, 520 * dV / 0.4, 8);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- the rail: what the chip knows
  const RAIL = [
    { id: 'count', label: 'CHARGE COUNT', val: t => '±6', unit: '%', dock: () => K.l06 - 0.3 },
    { id: 'volt', label: 'CELL VOLTAGE', val: t => '3.85', unit: 'V', dock: () => K.l07 + 0.35 },
    { id: 'temp', label: 'TEMPERATURE', val: t => t < K.cold ? '31' : '−8', unit: '°C', dock: () => K.l08e + 0.05, roll: () => [K.cold, K.cold + 0.3] },
    { id: 'age', label: 'AGE', val: t => '412', unit: 'CYC', dock: () => K.l08e + 0.2 },
    { id: 'load', label: 'LOAD', val: t => '2.4', unit: 'W', dock: () => K.l08e + 0.35 },
  ];
  const railX = 52, railY = i => 760 + i * 96, railW = 262;
  function drawRail(ctx, t, frame, hudA) {
    RAIL.forEach((c, i) => {
      const d = c.dock(); if (t < d) return;
      let a = eo(seg(t, d, d + 0.3));
      if (t > K.silence[0] + 0.15) a *= 1 - seg(t, K.silence[0] + 0.15 + i * 0.16, K.silence[0] + 0.3 + i * 0.16);   // power-down, one panel at a time
      if (t > K.l12 - 0.3) a = 0;
      if (a <= 0) return;
      const x = railX - 40 * (1 - a), y = railY(i);
      const mergeK = t > K.blends - 0.1 && t < K.blends + 0.6 && i < 2 ? 1 - seg(t, K.blends, K.blends + 0.6) : 0;
      U.plate(ctx, T, x, y, railW, 82, a);
      label(ctx, c.label, x + 16, y + 28, a, { mono: true, size: 18, color: mergeK ? T.hi : T.dim });
      const rr = c.roll ? seg(t, ...c.roll()) : 1;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `400 46px ${FONT.ui}`; ctx.textAlign = 'left';
      ctx.fillStyle = (c.roll && t > c.roll()[0] && rr < 1) ? T.line(0.9 * a) : (c.roll && t > c.roll()[0] && t < c.roll()[1] + 0.1 ? T.hi(a) : T.acc(a));
      const s = c.roll && t > c.roll()[0] ? U.rollText(c.val(t), rr, frame, 60 + i) : c.val(t);
      ctx.fillText(s, x + 16, y + 72); const vw = ctx.measureText(s).width;
      ctx.font = `500 22px ${FONT.ui}`; ctx.fillStyle = T.acc(0.9 * a); ctx.fillText(c.unit, x + 24 + vw, y + 70); ctx.restore();
    });
  }

  // ---------------------------------------------------------------- locks on the subject
  function drawLocks(ctx, t, frame, info, proj) {
    if (!info) return;
    // the battery: "no way to see inside" — a probe sweeps it and finds nothing to read
    if (t > K.battery - 0.05 && t < K.chip - 0.1) {
      const c = proj(M.center('battery')), a = win(t, K.battery - 0.05, K.chip - 0.1, 0.15, 0.2);
      const bx = cellBoxScreen(proj);
      U.targetBox(ctx, T, bx, 1, { lockK: eo(seg(t, K.battery - 0.05, K.battery + 0.17)), alpha: a, pad: 14, tag: "CELL · CAN'T SEE INSIDE" });
      const sy = lerp(bx[1], bx[3], sine(seg(t, K.battery + 0.1, K.battery + 0.9)));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = T.hi(0.6 * a); ctx.fillRect(bx[0] - 10, sy - 1, bx[2] - bx[0] + 20, 2); ctx.restore();
    }
    // the gauge chip
    if (t > K.chip - 0.2 && t < K.l04 + 0.3) {
      const bb = info.bbox.gauge || chipBox(proj), a = win(t, K.chip - 0.2, K.l04 + 0.3, 0.1, 0.3);
      U.targetBox(ctx, T, bb, 1, { lockK: eo(seg(t, K.chip - 0.2, K.chip)), flash: t >= K.chip && t < K.chip + 0.125, alpha: a, pad: 22, tag: 'TGT 01 · LOCK' });
      if (t > K.fuel - 0.1) {
        const an = info.anchor.gauge, pr = seg(t, K.fuel - 0.1, K.fuel + 0.4);
        U.leader(ctx, T, [an[0], an[1]], [an[0] + (TOP.x + 200 - an[0]) * 0.35, TOP.y + 420], [TOP.x + 200, TOP.y + 300], pr, { alpha: a, pulse: (t * 1.5) % 1 });
      }
    }
    // the cell tabs
    if (t > K.l06 - 0.15 && t < K.l07 + 0.5) {
      const a = win(t, K.l06 - 0.15, K.l07 + 0.5, 0.1, 0.3);
      const bb = info.bbox.tabs || tabsBox(proj);
      U.targetBox(ctx, T, bb, 1, { lockK: eo(seg(t, K.l06 - 0.15, K.l06 + 0.05)), flash: Math.abs(t - K.l06 - 0.05) < 0.07, alpha: a, pad: 20, tag: 'TGT 02 · TERMINALS' });
      if (t > K.l06 + 0.3) { const an = info.anchor.tabs; U.leader(ctx, T, [an[0], an[1]], [an[0] - 60, TOP.y + 420], [TOP.x + 360, TOP.y + 300], seg(t, K.l06 + 0.3, K.l06 + 0.7), { alpha: a }); }
    }
    // "blends both": light lines from the two method chips into the gauge
    if (t > K.blends - 0.1 && t < K.blends + 0.9) {
      const g = proj(M.center('gauge')), a = win(t, K.blends - 0.1, K.blends + 0.9, 0.1, 0.3), p = eo(seg(t, K.blends - 0.1, K.blends + 0.5));
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 2; i++) {
        const sx = railX + railW, sy = railY(i) + 42, ex = lerp(sx, g[0], p), ey = lerp(sy, g[1], p);
        ctx.strokeStyle = T.hi(0.8 * a); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = T.hi(a); ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill();
      }
      if (p > 0.95) { ctx.strokeStyle = T.hi(a * (1 - seg(t, K.blends + 0.4, K.blends + 0.9))); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(g[0], g[1], 12 + 40 * seg(t, K.blends + 0.4, K.blends + 0.9), 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
    }
    // the reserve
    if (t > K.zero - 0.2 && t < K.l12 - 0.3) {
      const a = win(t, K.zero - 0.2, K.l12 - 0.3, 0.1, 0.3);
      const { x0, x1, y0, y1, z } = cellB, yr = y0 + (y1 - y0) * 0.07;
      const q = [[x0, y0, z], [x1, y0, z], [x1, yr, z], [x0, yr, z]].map(proj);
      const bb = [Math.min(...q.map(p => p[0])), Math.min(...q.map(p => p[1])), Math.max(...q.map(p => p[0])), Math.max(...q.map(p => p[1]))];
      U.targetBox(ctx, T, bb, 1, { lockK: eo(seg(t, K.zero - 0.2, K.zero)), flash: t >= K.zero && t < K.zero + 0.125, alpha: a, pad: 18, tag: 'RESERVE · STILL CHARGED' });
      if (t > K.stops) { const e0 = proj([x0 - 0.12, yr, z]), e1 = proj([x1 + 0.12, yr, z]), m = e0[0] > e1[0] ? e0 : e1; U.marker(ctx, T, [m[0], m[1]], 'SAFETY CUT-OFF', a * eo(seg(t, K.stops, K.stops + 0.3)), 0, 1); }
    }
  }
  function cellBoxScreen(proj) { const { x0, x1, y0, y1, z } = cellB; const q = [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]].map(proj); return [Math.min(...q.map(p => p[0])), Math.min(...q.map(p => p[1])), Math.max(...q.map(p => p[0])), Math.max(...q.map(p => p[1]))]; }
  function chipBox(proj) { const c = proj(M.center('gauge')); return [c[0] - 20, c[1] - 14, c[0] + 20, c[1] + 14]; }
  function tabsBox(proj) { const c = proj(M.center('tabs')); return [c[0] - 30, c[1] - 12, c[0] + 30, c[1] + 12]; }

  // ---------------------------------------------------------------- subtitles: HUD plate, 2-line chunks, the spoken word lit
  function drawSub(ctx, t, S) {
    const cur = S.find(c => t >= c.t0 && t < c.t1);
    if (!cur) return;
    const a = Math.min(1, (t - cur.t0) / 0.1, (cur.t1 - t) / 0.12);
    ctx.save();
    ctx.font = `600 50px ${FONT.ui}`;
    const lines = cur.rows, lh = 60, tw = Math.max(...lines.map(r => ctx.measureText(r.map(w => w.w).join(' ')).width));
    const yb = 1452, x = W / 2 - tw / 2, h = lines.length * lh;
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
        const lit = t >= w.t0 - 0.03;
        ctx.fillStyle = lit ? T.hi(0.98 * a) : T.line(0.42 * a);
        ctx.fillText(w.w, cx, yb - h + (li + 1) * lh - 14);
        cx += ctx.measureText(w.w + ' ').width;
      }
    });
    ctx.restore();
  }

  // on-screen texts for readcheck (subtitles are checked by the .srt)
  function texts(t) {
    const out = [{ id: 'title', text: 'HOW IT ACTUALLY WORKS // 01', x0: 60, y0: 220, x1: 420, y1: 245 }];
    const card = (id, text) => out.push({ id, text, x0: TOP.x, y0: TOP.y, x1: TOP.x + TOP.w, y1: TOP.y + 300 });
    if (t > K.fuel + 0.25 && t < K.l04 - 0.05) card('fuel', 'FUEL GAUGE');
    if (t > K.l06 + 0.6 && t < K.l07 + 0.05) card('volt', '3.85 V');
    if (t > K.middle + 0.3 && t < K.l08 - 0.4) card('flat', 'FLAT ZONE');
    if (t > K.zero + 0.85 && t < K.l12 - 0.5) card('reserve', 'NOT EMPTY');
    if (t > K.guess2 + 0.45 && t < K.DUR - 1.4) card('guess', '≈ A VERY GOOD GUESS');
    return out;
  }

  return { K, render, events, texts, subs };
}

// subtitle chunks: ≤ 2 rows of ≤ 22 characters, broken at punctuation where possible; each chunk holds until the next one or the line end + 0.6 s
export function makeSubs(TLJ) {
  const S = [];
  for (const L of TLJ.lines) {
    // a written number ("15%") stands for one spoken word, plus "percent" when it follows ("fifteen percent")
    const words = []; let j = 0;
    for (const tok of L.sub.split(' ')) {
      const a = L.words[j]; let b = a; j++;
      if (/^\d+%/.test(tok) && L.words[j] && /^percent/.test(L.words[j].w)) { b = L.words[j]; j++; }
      words.push({ w: tok, t0: a.t0, t1: b.t1 });
    }
    if (j !== L.words.length) throw new Error(`subtitle words don't match the spoken words in ${L.id}`);
    // best chunking (dynamic programming): each chunk fits 2 rows × 22 characters; prefer ending at punctuation,
    // avoid tiny chunks and chunks that run across a sentence end
    const rowsOf = ws => { const rows = [[]]; for (const w of ws) { const r = rows[rows.length - 1], l = r.map(x => x.w).join(' ').length; if (r.length && l + 1 + w.w.length > 22) rows.push([w]); else r.push(w); } return rows; };
    const n = words.length, best = Array(n + 1).fill(Infinity), from = Array(n + 1).fill(-1);
    best[0] = 0;
    for (let j = 1; j <= n; j++) for (let i = j - 1; i >= 0; i--) {
      const ws = words.slice(i, j); if (rowsOf(ws).length > 2) break;
      const last = ws[ws.length - 1].w, chars = ws.map(x => x.w).join(' ').length;
      let c = j === n || /[.?!]$/.test(last) ? 0 : /[,:;]$/.test(last) ? 1 : 3;
      if (chars < 10) c += 4;
      if (ws.slice(0, -1).some(x => /[.?!]$/.test(x.w))) c += 5;
      if (best[i] + c < best[j]) { best[j] = best[i] + c; from[j] = i; }
    }
    let chunks = []; for (let j = n; j > 0; j = from[j]) chunks.unshift(words.slice(from[j], j));
    chunks = chunks.map(rowsOf);
    chunks.forEach(rows => S.push({ rows, words: rows.flat(), t0: rows[0][0].t0 - 0.1, line: L.id, lineEnd: L.t1 }));
  }
  for (let i = 0; i < S.length; i++) {
    const nx = S[i + 1];
    S[i].t1 = S[i].line === nx?.line ? nx.t0 : Math.min(S[i].lineEnd + 0.6, nx ? nx.t0 - 0.05 : TLJ.dur - 0.3);
    S[i].text = S[i].rows.map(r => r.map(w => w.w).join(' ')).join(' ');
  }
  return S;
}
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
