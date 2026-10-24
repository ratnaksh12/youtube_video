// Reel 02 · "This free GitHub repo switches off your smart TV's ads" (CleanYourTV) · GitHub series, Hologram HUD, 1080×1920 at 24 fps.
// Times come from timeline.json (voice + word times on the 120 BPM grid). The TV's home screen is drawn on the screen plane.
import { Holo, drawPad, drawScanPlane, makeCamera } from './kit/engine/holo.js';
import { U, T, W, H, FPS, FONT, TOP, RAIL, clamp, lerp, seg, eo, eio, sine, hash, win, snap, lineKeys, label, bigValue, card, chrome, railChip, makeSubs, drawSub, ctaCard, planeMapper, withWhip } from './kit/ui.js';

const FOV = 0.9;
export function keys(TL) {
  const { L, w, DUR } = lineKeys(TL);
  const K = {
    DUR, L,
    ads: w('l01', 'ads'), l02: L.l02.t0, repo: w('l02', 'repo'), off2: w('l02', 'off'),
    l03: L.l03.t0, clean3: w('l03', 'clean'), number: w('l03', 'number'), trending: w('l03', 'trending'),
    l04: L.l04.t0, dev: w('l04', 'developer'), assistant: w('l04', 'assistant'), claude: w('l04', 'claude'), wifi: w('l04', 'wifi'),
    l05: L.l05.t0, backs: w('l05', 'backs'), installed: w('l05', 'installed'),
    l06: L.l06.t0, adsvc: w('l06', 'ad'), tracking: w('l06', 'tracking'), sponsored: w('l06', 'sponsored'), rows: w('l06', 'rows'), l06e: L.l06.t1,
    l07: L.l07.t0, apps: w('l07', 'apps'),
    l08: L.l08.t0, deleted: w('l08', 'deleted'), root: w('l08', 'root'), command: w('l08', 'command'), back: w('l08', 'back'),
    l09: L.l09.t0, android: w('l09', 'android'), google: w('l09', 'google'), samsung: w('l09', 'samsung'), lg: w('l09', 'lg'),
    l10: L.l10.t0, laptop: w('l10', 'laptop'), community: w('l10', 'community'), phones: w('l10', 'phones'),
    l11: L.l11.t0, tv: w('l11', 'tv'),
  };
  K.silence = [snap(K.l06e + 0.1), K.l07];
  K.ignite = K.l07;
  K.cta = K.l11 - 0.15;
  return K;
}

// ---------------------------------------------------------------- the stock home screen: 8 ads, each with the moment it is switched off
function adItems(K) {
  const it = [{ id: 'banner', kind: 'banner', off: K.adsvc }, { id: 'tracker', kind: 'tracker', off: K.tracking }];
  for (let i = 0; i < 5; i++) it.push({ id: 'sp' + i, kind: 'sponsored', i, off: K.sponsored + i * 0.125 });
  it.push({ id: 'ap1', kind: 'appad', i: 1, off: K.rows + 0.125 }, { id: 'ap3', kind: 'appad', i: 3, off: K.rows + 0.25 });
  it.forEach((x, n) => { x.pop = 0.05 + n * 0.17; });                 // the hook: badges pop in one by one
  return it;
}
const ADS_TOTAL = 8;   // banner + 5 sponsored tiles + 2 promoted apps (the tracker is a service, not a tile)

function cams(M) {
  const c = [0, M.screenCy, 0];
  return {
    hook: { target: c, yaw: 0.16, pitch: 0.05, dist: 3.3, cx: 545, cy: 945 },
    front: { target: c, yaw: 0.26, pitch: 0.08, dist: 3.95, cx: 540, cy: 975 },
    orbit: { target: c, yaw: -0.42, pitch: 0.14, dist: 4.15, cx: 555, cy: 985 },
    setup: { target: c, yaw: 0.5, pitch: 0.1, dist: 4.4, cx: 650, cy: 990 },
    screen: { target: c, yaw: 0.05, pitch: 0.03, dist: 3.3, cx: 540, cy: 960 },
    clean: { target: c, yaw: 0.34, pitch: 0.13, dist: 4.1, cx: 540, cy: 985 },
    safe: { target: c, yaw: -0.3, pitch: 0.1, dist: 4.25, cx: 540, cy: 990 },
    cta: { target: c, yaw: 0.1, pitch: 0.18, dist: 4.9, cx: 540, cy: 1150 },
  };
}
const mix = (A, B, w) => ({
  target: A.target.map((x, i) => lerp(x, B.target[i], w)), yaw: lerp(A.yaw, B.yaw, w), pitch: lerp(A.pitch, B.pitch, w),
  dist: Math.exp(lerp(Math.log(A.dist), Math.log(B.dist), w)), cx: lerp(A.cx, B.cx, w), cy: lerp(A.cy, B.cy, w), roll: 0, fov: FOV,
});
function camAt(C, K, t) {
  const at = (a, b, ta, tb, f = eio) => mix(a, b, f(seg(t, ta, tb)));
  if (t < K.l02) return at(C.hook, C.front, 0, K.l02 + 0.6, sine);                                 // slow pull back off the ad wall
  if (t < K.l04 - 0.3) return at(C.front, C.orbit, K.l02 + 0.2, K.l04 - 0.3, sine);                  // orbit while the repo is named
  if (t < K.l05) return at(C.orbit, C.setup, K.l04 - 0.3, K.l04 + 0.9);                            // swing right: rail on the left
  if (t < K.l06 - 0.4) return at(C.setup, C.front, K.l05, K.l06 - 0.4, sine);
  if (t < K.silence[1]) return at(C.front, C.screen, K.l06 - 0.4, K.adsvc);                        // push in on the screen
  if (t < K.l08) return at(C.screen, C.clean, K.ignite, K.ignite + 1.4, eo);                        // the drop: pull back, crane up
  if (t < K.l11 - 0.4) return at(C.clean, C.safe, K.l08, K.l10 + 1, sine);                          // slow orbit through the facts
  return at(C.safe, C.cta, K.l11 - 0.4, K.l11 + 0.4);
}

export function makeFilm(model, TLJ, X) {
  const K = keys(TLJ), M = { screenCy: X.screen.o[1] + X.screen.v[1] / 2, ymax: model.ymax };
  const C = cams(M), holo = new Holo(W, H), ADS = adItems(K), subs = makeSubs(TLJ);

  const offK = (x, t) => seg(t, x.off, x.off + 0.25);                       // 0 → 1 while a tile collapses
  const adsLeft = t => ADS.filter(x => x.kind !== 'tracker' && t < x.off + 0.1).length;

  // ---------------------------------------------------------------- events for the score and the mixer
  function events() {
    const E = [], ev = (t, type, o = {}) => E.push({ t: +t.toFixed(3), type, ...o });
    ev(0, 'scramble', { t1: K.ads }); ADS.forEach(x => x.kind !== 'tracker' && ev(x.pop, 'pulse', { dir: 1 }));
    ev(K.ads, 'lock'); ev(K.ads, 'confirm');
    ev(K.l02 - 0.05, 'card'); ev(K.repo, 'roll', { t1: K.repo + 0.45 }); ev(K.repo + 0.45, 'confirm');
    ev(K.clean3, 'lock'); ev(K.number, 'roll', { t1: K.number + 0.3 }); ev(K.number + 0.3, 'lock'); ev(K.number + 0.32, 'confirm');
    ev(K.dev - 0.1, 'card'); ev(K.l04 - 0.3, 'whip');
    [K.dev, K.assistant, K.wifi].forEach((t, i) => { ev(t, 'roll', { t1: t + 0.3 }); ev(t + 0.3, 'dock'); });
    for (let i = 0; i < 6; i++) ev(K.wifi + 0.1 + i * 0.25, 'wifi', { dir: i % 2 ? -1 : 1 });
    ev(K.backs, 'scan', { t1: K.backs + 1.4 }); ev(K.installed + 0.3, 'dock');
    ADS.forEach(x => ev(x.off, 'off'));
        ev(K.adsvc - 0.6, 'close');
    E.push({ t: K.silence[0], type: 'silence', t1: K.silence[1] });
    ev(K.ignite, 'ignite');
    for (let i = 1; i < 4; i++) ev(K.ignite + 1.2 + i * 0.5, 'hover');   // the glass highlight springs from tile to tile
    [K.deleted, K.root, K.command].forEach(t => { ev(t, 'roll', { t1: t + 0.35 }); ev(t + 0.35, 'confirm'); });
    ev(K.back, 'probe'); ev(K.back + 0.45, 'deny');
    ev(K.l09 - 0.1, 'card'); ev(K.android + 0.1, 'confirm'); ev(K.google + 0.1, 'confirm'); ev(K.samsung + 0.1, 'deny'); ev(K.lg + 0.1, 'deny');
    ev(K.community - 0.3, 'card'); ev(K.community - 0.25, 'roll', { t1: K.community + 0.1 }); ev(K.community + 0.1, 'confirm');
    ev(K.cta, 'card'); ev(K.tv, 'cta'); ev(K.tv + 0.4, 'confirm', { final: true });
    return E.sort((a, b) => a.t - b.t);
  }

  // ---------------------------------------------------------------- one frame
  const whipK = t => (t > K.l04 - 0.3 && t < K.l04 + 0.4) ? Math.sin(Math.PI * seg(t, K.l04 - 0.3, K.l04 + 0.4)) * 0.6 : 0;
  const render = withWhip(frameAt, whipK);
  function frameAt(ctx, t, o = {}) {
    const frame = Math.round((o.frameT ?? t) * FPS);
    const cam = camAt(C, K, t); cam.fov = FOV;
    const P = makeCamera(cam, W, H).project, p3 = new Float32Array(3);
    const proj = v => { P(v[0], v[1], v[2], p3); return [p3[0], p3[1], p3[2]]; };
    const S = planeMapper(proj, X.screen.o, X.screen.u, X.screen.v);

    const sil = t >= K.silence[0] && t < K.silence[1];
    const ctaDim = t > K.cta ? lerp(1, 0.35, eo(seg(t, K.cta, K.cta + 0.6))) : 1;
    const power = (sil ? lerp(1, 0.45, eo(seg(t, K.silence[0], K.silence[0] + 0.4))) : 1) * ctaDim;
    const solid = t >= K.ignite ? eo(seg(t, K.ignite, K.ignite + 0.7)) * lerp(1, 0.55, seg(t, K.ignite + 2.5, K.ignite + 4)) * ctaDim : 0;
    const wave = t >= K.ignite && t < K.ignite + 1.3 ? { y: lerp(-0.1, M.ymax + 0.1, seg(t, K.ignite, K.ignite + 1.2)), w: 0.1 }
      : (t > K.backs && t < K.backs + 1.4 ? { y: lerp(M.ymax + 0.1, -0.1, seg(t, K.backs, K.backs + 1.4)), w: 0.07 } : null);

    U.background(ctx, W, H, T, { cx: cam.cx, cy: cam.cy, px: -cam.yaw * 140, py: cam.pitch * 140, alpha: 0.75 + 0.25 * power });
    drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12, alpha: 0.9 * power });
    if (t >= K.ignite) U.beam(ctx, T, P, eo(seg(t, K.ignite, K.ignite + 0.5)) * lerp(1, 0.4, seg(t, K.ignite + 3, K.ignite + 5)) * ctaDim, t, { y1: M.ymax * 1.05, r0: 1.0, r1: 0.95 });
    const info = holo.draw(ctx, model, cam, { hue: T.hue, gain: power, solid, wave, scanOffset: frame, lineWidth: solid > 0 ? lerp(1.4, 1.9, solid) : 1.4 });
    if (t > K.backs && t < K.backs + 1.4) {   // the backup scan sweeps down the set
      const y = lerp(M.ymax * 1.02, 0, sine(seg(t, K.backs, K.backs + 1.4)));
      drawScanPlane(ctx, cam, W, H, y, { hue: T.hue, r: 0.95, rot: t * 0.5, alpha: win(t, K.backs, K.backs + 1.4, 0.15, 0.15) });
    }
    drawScreen(ctx, t, frame, S, power);
    drawWifi(ctx, t, S);

    const hudA = sil ? 0.55 : 1;
    chrome(ctx, hudA * ctaDim, 'GITHUB REPO OF THE DAY // 01', status(t));
    drawTop(ctx, t, frame);
    drawRail(ctx, t, frame);
    drawLocks(ctx, t, frame, S, info);
    ctaCard(ctx, t, K.cta, 'TV', frame, win(t, K.cta, K.DUR + 1, 0.25, 0.25));
    U.vignette(ctx, W, H, 0.5);
    if (!o.nosub) drawSub(ctx, t, subs);
  }
  function status(t) {
    if (t < K.ads) return 'HOME SCREEN · SCANNING';
    if (t < K.l02) return `ADS FOUND · ${ADS_TOTAL}`;
    if (t < K.l04) return 'REPO · GATHIN23/CLEANYOURTV';
    if (t < K.l05) return 'SETUP · ABOUT 15 MIN';
    if (t < K.l06) return 'BACKUP · IN PROGRESS';
    if (t < K.silence[0]) return `DISABLING · ${ADS_TOTAL - adsLeft(t)}/${ADS_TOTAL}`;
    if (t < K.ignite) return '';
    if (t < K.l08) return 'NEW HOME SCREEN · READY';
    if (t < K.l11) return 'RESTORE · ONE COMMAND';
    return 'LINK · VIA DM';
  }

  // ---------------------------------------------------------------- the TV's home screen
  function drawScreen(ctx, t, frame, S, power) {
    const sil = t >= K.silence[0] && t < K.silence[1];
    ctx.save();
    // the panel is opaque: it hides the back of the set (the wireframe behind it), as a real screen would
    S.path(ctx, S.quad(0, 0, 1, 1)); ctx.fillStyle = `rgba(5,3,16,${0.8 * Math.min(1, power + 0.2)})`; ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    // the panel glow (screen on); black during the silence
    const glowA = t < K.silence[0] ? 0.09 : t < K.ignite ? lerp(0.09, 0, seg(t, K.silence[0], K.silence[0] + 0.3)) : 0.03;
    if (glowA > 0) { S.path(ctx, S.quad(0, 0, 1, 1)); ctx.fillStyle = T.line(glowA * power); ctx.fill(); }
    const stockA = t < K.silence[0] ? 1 : 1 - seg(t, K.silence[0], K.silence[0] + 0.25);
    const ghost = t > K.back && t < K.back + 0.9 ? Math.sin(Math.PI * seg(t, K.back, K.back + 0.9)) : 0;   // "puts it all back": a restore flash
    if (stockA > 0 || ghost > 0) drawStock(ctx, t, frame, S, Math.max(stockA, ghost * 0.55) * power, ghost > 0 && stockA <= 0);
    if (t >= K.ignite) drawLauncher(ctx, t, frame, S, power);
    ctx.restore();
  }
  function tile(ctx, S, a0, b0, a1, b1, alpha, fill = 0.06, hot = false) {
    const q = S.quad(a0, b0, a1, b1); S.path(ctx, q);
    ctx.fillStyle = T.line(fill * alpha); ctx.fill();
    ctx.strokeStyle = hot ? T.hi(0.9 * alpha) : T.line(0.75 * alpha); ctx.lineWidth = hot ? 2 : 1.3; ctx.stroke();
  }
  function badge(ctx, S, a, b, s, alpha) {   // the white "AD" badge at a tile's top-right corner
    const q = S.quad(a - 0.062, b - 0.088, a, b); S.path(ctx, q); ctx.fillStyle = T.hi(0.92 * alpha); ctx.fill();
    S.text(ctx, s, a - 0.031, b - 0.07, 0.064, `rgba(10,6,24,${alpha})`, { align: 'center', weight: 700, comp: 'source-over' });
  }
  function collapse(k, a0, b0, a1, b1) {   // CRT-style switch-off: squeeze to a line, then to a dot
    const bm = (b0 + b1) / 2, am = (a0 + a1) / 2, ky = clamp(k * 1.6), kx = clamp(k * 1.6 - 0.6);
    return [lerp(a0, am, kx), lerp(b0, bm, ky), lerp(a1, am, kx), lerp(b1, bm, ky)];
  }
  function drawStock(ctx, t, frame, S, A, isGhost) {
    const blink = (n) => 0.65 + 0.35 * (Math.floor(frame / 6 + n) % 2);
    // top bar
    S.text(ctx, 'HOME', 0.03, 0.915, 0.05, T.hi(0.85 * A));
    S.text(ctx, 'FOR YOU  ·  LIVE  ·  APPS', 0.16, 0.918, 0.035, T.line(0.65 * A), { mono: true });
    for (const x of ADS) {
      const popA = 1;                                                 // every ad is on screen from frame 0
      const ping = !isGhost && t >= x.pop && t < x.pop + 0.15;          // the hook pings each one in turn
      const k = isGhost ? 0 : offK(x, t);
      const a = A * popA * (1 - clamp((k - 0.85) / 0.15));
      if (a <= 0.01) continue;
      const hot = ping || (!isGhost && t >= x.off - 0.05 && t < x.off + 0.15);
      if (x.kind === 'tracker') {   // the analytics service: a pulsing dot top-right
        const r = collapse(k, 0.86, 0.885, 0.975, 0.95);
        S.path(ctx, S.quad(...r)); ctx.strokeStyle = (hot ? T.hi : T.line)(0.8 * a); ctx.lineWidth = 1.2; ctx.stroke();
        if (k < 0.3) S.text(ctx, '● TRACKING', 0.868, 0.9, 0.034, T.hi((0.6 + 0.4 * blink(2)) * a), { mono: true });
      } else if (x.kind === 'banner') {
        const r = collapse(k, 0.03, 0.56, 0.97, 0.86);
        tile(ctx, S, ...r, a, 0.09, hot);
        if (k < 0.3) {
          ctx.strokeStyle = T.line(0.35 * a); ctx.lineWidth = 1; ctx.beginPath();   // promo artwork: diagonal light streaks
          for (let i = 0; i < 7; i++) { const p = S.at(0.45 + i * 0.07, 0.57), q = S.at(0.6 + i * 0.07, 0.85); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }
          ctx.stroke();
          S.text(ctx, 'SPONSORED', 0.06, 0.78, 0.045, T.hi(0.8 * a), { mono: true });
          S.text(ctx, 'WATCH THE NEW SERIES', 0.06, 0.68, 0.08, T.line(0.95 * a), { weight: 600 });
          badge(ctx, S, 0.96, 0.85, 'AD', a * blink(0));
        }
      } else {
        const b0 = x.kind === 'sponsored' ? 0.31 : 0.07, b1 = b0 + 0.19, a0 = 0.03 + x.i * 0.19, a1 = a0 + 0.175;
        const r = collapse(k, a0, b0, a1, b1);
        tile(ctx, S, ...r, a, 0.07, hot);
        if (k < 0.3) badge(ctx, S, a1 - 0.008, b1 - 0.008, 'AD', a * blink(x.i + 1));
      }
    }
    // rows' labels and the user's own (non-ad) apps
    S.text(ctx, 'SPONSORED FOR YOU', 0.03, 0.515, 0.035, T.line(0.7 * A), { mono: true });
    S.text(ctx, 'YOUR APPS', 0.03, 0.275, 0.035, T.line(0.7 * A), { mono: true });
    for (const i of [0, 2, 4]) tile(ctx, S, 0.03 + i * 0.19, 0.07, 0.205 + i * 0.19, 0.26, A, 0.05);
    if (isGhost) S.text(ctx, 'RESTORED', 0.5, 0.45, 0.12, T.hi(0.9 * A), { align: 'center', weight: 700 });
  }
  function drawLauncher(ctx, t, frame, S, power) {
    const k = seg(t, K.ignite, K.ignite + 0.6), A = power * (t > K.back && t < K.back + 0.9 ? 1 - 0.7 * Math.sin(Math.PI * seg(t, K.back, K.back + 0.9)) : 1);
    const reveal = b => clamp((k * 1.3 - b) * 4);                      // wipes in from the bottom
    S.text(ctx, 'GOOD EVENING', 0.06, 0.8, 0.055, T.hi(0.8 * A * reveal(0.75)), { weight: 600 });
    S.text(ctx, '8:30', 0.06, 0.6, 0.16, T.hi(0.95 * A * reveal(0.6)), { weight: 300 });
    const dock = S.quad(0.17, 0.1, 0.83, 0.36); S.path(ctx, dock);
    ctx.fillStyle = T.line(0.08 * A * reveal(0.1)); ctx.fill(); ctx.strokeStyle = T.line(0.6 * A * reveal(0.1)); ctx.lineWidth = 1.3; ctx.stroke();
    const focus = Math.floor(seg(t, K.ignite + 1.2, K.ignite + 1.2 + 4 * 0.5) * 4) % 4;   // the glass highlight springs from tile to tile
    for (let i = 0; i < 4; i++) {
      const a0 = 0.205 + i * 0.155, lift = i === focus && t > K.ignite + 1.0 ? 0.015 : 0;
      tile(ctx, S, a0, 0.14 + lift, a0 + 0.125, 0.32 + lift, A * reveal(0.15), i === focus ? 0.14 : 0.06, i === focus && t > K.ignite + 1.0);
      icon(ctx, S, i, a0 + 0.0625, 0.23 + lift, A * reveal(0.2));
    }
  }
  function icon(ctx, S, i, a, b, A) {   // simple line glyphs: play, note, photo, globe
    ctx.strokeStyle = T.hi(0.8 * A); ctx.lineWidth = 1.6; ctx.beginPath();
    const p = (x, y) => S.at(a + x * 0.04, b + y * 0.07);
    if (i === 0) { const P = [p(-0.4, -0.5), p(0.5, 0), p(-0.4, 0.5)]; ctx.moveTo(...P[0]); ctx.lineTo(...P[1]); ctx.lineTo(...P[2]); ctx.closePath(); }
    if (i === 1) { ctx.moveTo(...p(-0.2, -0.4)); ctx.lineTo(...p(-0.2, 0.5)); ctx.lineTo(...p(0.4, 0.6)); ctx.lineTo(...p(0.4, -0.3)); const c = p(-0.4, -0.45); ctx.moveTo(c[0] + 6, c[1]); ctx.arc(c[0], c[1], 6, 0, 7); }
    if (i === 2) { const q = [p(-0.6, -0.5), p(0.6, -0.5), p(0.6, 0.5), p(-0.6, 0.5)]; ctx.moveTo(...q[0]); q.slice(1).forEach(v => ctx.lineTo(...v)); ctx.closePath(); ctx.moveTo(...p(-0.6, -0.5)); ctx.lineTo(...p(-0.1, 0.1)); ctx.lineTo(...p(0.2, -0.2)); ctx.lineTo(...p(0.6, 0.2)); }
    if (i === 3) { const c = p(0, 0), r = Math.abs(p(0.5, 0)[0] - c[0]); ctx.moveTo(c[0] + r, c[1]); ctx.arc(c[0], c[1], r, 0, 7); ctx.moveTo(c[0] - r, c[1]); ctx.lineTo(c[0] + r, c[1]); ctx.moveTo(c[0], c[1] - r); ctx.ellipse(c[0], c[1], r * 0.45, r, 0, -Math.PI / 2, Math.PI * 1.5); }
    ctx.stroke();
  }
  // Wi-Fi: pulses from the rail's connection chip to the TV
  function drawWifi(ctx, t, S) {
    const a = win(t, K.wifi, K.wifi + 1.9, 0.1, 0.4); if (a <= 0) return;
    const sx = RAIL.x + RAIL.w, sy = RAIL.y + 2 * RAIL.step + 41, e = S.at(0.02, 0.5);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.setLineDash([4, 8]); ctx.strokeStyle = T.line(0.5 * a); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(e[0], e[1]); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < 6; i++) {
      const u = (t - K.wifi - 0.1 - i * 0.25) / 0.6; if (u < 0 || u > 1) continue;
      const v = i % 2 ? 1 - u : u, x = lerp(sx, e[0], v), y = lerp(sy, e[1], v);
      ctx.fillStyle = T.hi(a * Math.sin(Math.PI * u)); ctx.beginPath(); ctx.arc(x, y, 6, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- the card zone
  function drawTop(ctx, t, frame) {
    if (t >= K.cta) return;
    const { x, y, w } = TOP;
    // 1. ADS ON YOUR HOME SCREEN (hook) and the countdown (l05–l07)
    const countA = Math.max(win(t, -1, K.l02 - 0.05, 0.2, 0.25), win(t, K.l05 - 0.05, K.l08 - 0.05, 0.3, 0.3));
    if (countA > 0) {
      const sil = t >= K.silence[0] && t < K.silence[1];
      card(ctx, 'ADS', 'ON YOUR HOME SCREEN', frame, countA * (sil ? 0.6 : 1), t < K.l02 ? 1 : seg(t, K.l05 - 0.05, K.l05 + 0.4));
      let n, locked, flash = false;
      if (t < K.ads) { n = t < K.ads - 0.3 ? String(1 + Math.floor(hash(Math.floor(frame / 2)) * 9)) : '8'; locked = false; }   // counting…
      else if (t < K.l05) { n = String(ADS_TOTAL); locked = true; flash = t < K.ads + 0.125; }
      else { n = String(adsLeft(t)); const last = Math.max(...ADS.filter(z => t >= z.off + 0.1).map(z => z.off + 0.1), -1); locked = n === '0'; flash = t - last < 0.1; }
      bigValue(ctx, n, x + 150, y + 236, 200, countA, { roll: 1, locked, flash, frame });
      if (t > K.l05 - 0.05 && t < K.l06) {   // backup progress
        const p = seg(t, K.backs, K.backs + 1.4);
        label(ctx, `BACKUP · PACKAGES + SETTINGS  ${String(Math.round(p * 100)).padStart(3, ' ')}%`, x + 320, y + 140, countA, { mono: true, size: 24 });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = T.dim(0.3 * countA); ctx.fillRect(x + 320, y + 170, 560, 6);
        ctx.fillStyle = (p >= 1 ? T.acc : T.hi)(0.9 * countA); ctx.fillRect(x + 320, y + 170, 560 * p, 6); ctx.restore();
      }
      if (t >= K.l06) label(ctx, t < K.ignite ? 'SWITCHED OFF, NOT DELETED' : 'CLEAN HOME SCREEN', x + 320, y + 170, countA, { mono: true, size: 26, color: t < K.ignite ? T.hi : T.acc });
      if (t < K.l02 && t > K.ads) label(ctx, 'AD TILES + SPONSORED ROWS', x + 320, y + 170, countA * seg(t, K.ads, K.ads + 0.3), { mono: true, size: 26, color: T.hi });
    }
    // 2. the repo
    const repoA = win(t, K.l02 - 0.05, K.dev - 0.1, 0.3, 0.3);
    if (repoA > 0) {
      card(ctx, 'REPO', 'GITHUB · OPEN SOURCE · MIT', frame, repoA, seg(t, K.l02 - 0.05, K.l02 + 0.4), 320);
      const rk = seg(t, K.repo, K.repo + 0.45);
      if (rk > 0) bigValue(ctx, 'CleanYourTV', x - 4, y + 160, 118, repoA, { roll: rk, frame, align: 'left', seed: 9, flash: t > K.repo + 0.45 && t < K.repo + 0.55, pctSmall: false, track: 2 });
      const nk = seg(t, K.number, K.number + 0.3);
      if (nk > 0) {
        bigValue(ctx, '#1', x - 4, y + 262, 84, repoA, { roll: nk, frame, align: 'left', seed: 13, flash: t > K.number + 0.3 && t < K.number + 0.4 });
        label(ctx, 'TRENDING THIS WEEK', x + 120, y + 236, repoA * seg(t, K.number + 0.05, K.number + 0.3), { size: 34, color: T.hi });
        label(ctx, 'via trendshift.io', x + 120, y + 270, repoA * seg(t, K.trending, K.trending + 0.3), { mono: true, size: 20, color: T.dim });
      }
    }
    // 3. setup: three steps
    const setA = win(t, K.dev - 0.1, K.l05 - 0.05, 0.3, 0.3);
    if (setA > 0) {
      card(ctx, 'SETUP', 'ABOUT 15 MINUTES', frame, setA, seg(t, K.dev - 0.1, K.dev + 0.4));
      const steps = [[K.dev, 'DEVELOPER MODE ON'], [K.assistant, 'AN AI CODING ASSISTANT'], [K.wifi, 'SAME WI-FI · NO CABLE']];
      const n = steps.filter(s => t >= s[0]).length;
      if (n > 0) {
        const s = steps[n - 1], rk = seg(t, s[0], s[0] + 0.3);
        bigValue(ctx, `${n}/3`, x - 4, y + 220, 170, setA, { roll: rk, frame, align: 'left', seed: 17 + n, flash: t > s[0] + 0.3 && t < s[0] + 0.4 });
        label(ctx, U.rollText(s[1], rk, frame, 19 + n), x + 330, y + 170, setA, { size: 34, color: T.hi });
        for (let i = 0; i < 3; i++) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = (i < n ? T.acc : T.dim)((i < n ? 0.9 : 0.3) * setA); ctx.fillRect(x + 330 + i * 190, y + 200, 170, 6); ctx.restore(); }
      }
    }
    // 4. safe by design
    const safeA = win(t, K.l08 - 0.05, K.l09 - 0.1, 0.3, 0.3);
    if (safeA > 0) {
      card(ctx, 'SAFE', 'REVERSIBLE BY DESIGN', frame, safeA, seg(t, K.l08 - 0.05, K.l08 + 0.4), 360);
      [['UNINSTALLED', '0', '', K.deleted], ['ROOT NEEDED', 'NO', '', K.root], ['RESTORE', '1', 'COMMAND', K.command]].forEach(([lab, val, unit, tw], i) => {
        const yy = y + 112 + i * 80, rk = seg(t, tw, tw + 0.35), on = t >= tw - 0.2;
        label(ctx, lab, x, yy, safeA * (on ? 1 : 0.35), { size: 30, color: on ? T.hi : T.line });
        if (rk > 0) bigValue(ctx, val, x + 600, yy + 8, 76, safeA, { roll: rk, frame, align: 'right', seed: 30 + i, flash: t > tw + 0.35 && t < tw + 0.45 });
        if (rk > 0 && unit) label(ctx, unit, x + 616, yy + 6, safeA, { size: 30, color: T.acc });
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.dim(0.35 * safeA); ctx.beginPath(); ctx.moveTo(x, yy + 22); ctx.lineTo(x + w, yy + 22); ctx.stroke(); ctx.restore();
      });
    }
    // 5. which TVs
    const comA = win(t, K.l09 - 0.1, K.community - 0.3, 0.3, 0.3);
    if (comA > 0) {
      card(ctx, 'WORKS ON', 'ANY ANDROID TV OR GOOGLE TV', frame, comA, seg(t, K.l09 - 0.1, K.l09 + 0.4), 300);
      [['ANDROID TV', true, K.android, 0, 0], ['GOOGLE TV', true, K.google, 1, 0], ['SAMSUNG', false, K.samsung, 0, 1], ['LG', false, K.lg, 1, 1]].forEach(([lab, ok, tw, col, row]) => {
        const xx = x + col * 450, yy = y + 140 + row * 96, a = comA * (t >= tw - 0.1 ? 1 : 0.3), k = seg(t, tw + 0.05, tw + 0.25);
        label(ctx, lab, xx + 70, yy, a, { size: 40, color: ok ? T.hi : T.line, w: 600 });
        if (k > 0) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 6; ctx.lineCap = 'round';
          if (ok) { ctx.strokeStyle = T.acc(a * k); ctx.beginPath(); ctx.moveTo(xx + 8, yy - 16); ctx.lineTo(xx + 24, yy); ctx.lineTo(xx + 52, yy - 34); ctx.stroke(); }
          else { ctx.strokeStyle = T.hi(0.85 * a * k); ctx.beginPath(); ctx.moveTo(xx + 10, yy - 32); ctx.lineTo(xx + 46, yy + 2); ctx.moveTo(xx + 46, yy - 32); ctx.lineTo(xx + 10, yy + 2); ctx.stroke();
            ctx.lineWidth = 2; ctx.strokeStyle = T.line(0.6 * a * k); ctx.beginPath(); const lw = lab.length * 23; ctx.moveTo(xx + 66, yy - 14); ctx.lineTo(xx + 66 + lw * k, yy - 14); ctx.stroke(); }
          ctx.restore();
        }
      });
    }
    // 6. no laptop?
    const phA = win(t, K.community - 0.3, K.cta, 0.3, 0.25);
    if (phA > 0) {
      card(ctx, 'NO LAPTOP?', 'USE YOUR ANDROID PHONE', frame, phA, seg(t, K.community - 0.3, K.community + 0.2));
      const rk = seg(t, K.community - 0.25, K.community + 0.1);
      if (rk > 0) bigValue(ctx, 'PHONE APP', x - 4, y + 190, 120, phA, { roll: rk, frame, align: 'left', seed: 41, track: 4, flash: t > K.community + 0.1 && t < K.community + 0.2 });
      if (t > K.phones - 0.1) label(ctx, U.rollText('COMMUNITY-BUILT · ABOUT 5 MINUTES', seg(t, K.phones - 0.1, K.phones + 0.4), frame, 43), x, y + 250, phA, { mono: true, size: 24 });
    }
  }

  // ---------------------------------------------------------------- the rail: how it runs
  const RAILS = [
    { lab: 'DEVELOPER MODE', val: 'ON', unit: '', at: () => K.dev + 0.3 },
    { lab: 'AI ASSISTANT', val: 'CLAUDE CODE', unit: '', at: () => K.assistant + 0.3, size: 30 },
    { lab: 'CONNECTION', val: 'WI-FI', unit: 'NO CABLE', at: () => K.wifi + 0.3, size: 38 },
    { lab: 'BACKUP', val: 'SAVED', unit: '', at: () => K.installed + 0.3, size: 38 },
  ];
  function drawRail(ctx, t, frame) {
    if (t >= K.l06) return;                                            // off before the push-in, so the screen stays clear
    RAILS.forEach((c, i) => {
      const d = c.at(); if (t < d) return;
      const a = eo(seg(t, d, d + 0.3)) * (1 - seg(t, K.l06 - 0.35, K.l06 - 0.05));
      railChip(ctx, i, c.lab, c.val, c.unit, a, { size: c.size });
    });
  }

  // ---------------------------------------------------------------- locks on the set
  function drawLocks(ctx, t, frame, S, info) {
    const box = (a0, b0, a1, b1) => { const q = S.quad(a0, b0, a1, b1); return [Math.min(...q.map(p => p[0])), Math.min(...q.map(p => p[1])), Math.max(...q.map(p => p[0])), Math.max(...q.map(p => p[1]))]; };
    if (t > K.ads - 0.2 && t < K.l02 + 0.3) {   // hook: lock on the whole ad wall
      U.targetBox(ctx, T, box(0.02, 0.05, 0.98, 0.88), 1, { lockK: eo(seg(t, K.ads - 0.2, K.ads)), flash: t >= K.ads && t < K.ads + 0.125, alpha: win(t, K.ads - 0.2, K.l02 + 0.3, 0.05, 0.3), pad: 18, tag: 'ADS · 8 FOUND' });
    }
    if (t > K.clean3 - 0.2 && t < K.l04 - 0.4 && info.bbox.tv) {   // as the name is spoken, the repo locks onto the whole set
      U.targetBox(ctx, T, info.bbox.tv, 1, { lockK: eo(seg(t, K.clean3 - 0.2, K.clean3)), flash: t >= K.clean3 && t < K.clean3 + 0.125, alpha: win(t, K.clean3 - 0.2, K.l04 - 0.4, 0.05, 0.3) * 0.8, pad: 28, tag: 'TARGET · ANDROID TV / GOOGLE TV' });
    }
    // l06: each ad gets a short lock as it switches off
    for (const x of ADS) {
      if (t < x.off - 0.18 || t > x.off + 0.3) continue;
      const r = x.kind === 'banner' ? [0.03, 0.56, 0.97, 0.86] : x.kind === 'tracker' ? [0.86, 0.885, 0.975, 0.95] : x.kind === 'sponsored' ? [0.03 + x.i * 0.19, 0.31, 0.205 + x.i * 0.19, 0.5] : [0.03 + x.i * 0.19, 0.07, 0.205 + x.i * 0.19, 0.26];
      U.targetBox(ctx, T, box(...r), 1, { lockK: eo(seg(t, x.off - 0.18, x.off)), flash: t >= x.off && t < x.off + 0.1, alpha: win(t, x.off - 0.18, x.off + 0.3, 0.04, 0.15), pad: 8,
        tag: x.kind === 'banner' ? 'AD SERVICE · OFF' : x.kind === 'tracker' ? 'TRACKING · OFF' : x.i === 0 || x.kind === 'appad' ? 'OFF' : '' });
    }
  }

  function texts(t) {
    const out = [{ id: 'title', text: 'GITHUB REPO OF THE DAY // 01', x0: 60, y0: 220, x1: 420, y1: 245 }];
    const c = (id, text) => out.push({ id, text, x0: TOP.x, y0: TOP.y, x1: TOP.x + TOP.w, y1: TOP.y + 300 });
    if (t > K.repo + 0.45 && t < K.l04 - 0.4) c('repo', 'CleanYourTV');
    if (t > K.number + 0.3 && t < K.dev - 0.4) c('trend', '#1 TRENDING THIS WEEK');
    if (t > K.deleted + 0.35 && t < K.l09 - 0.4) c('uninst', 'UNINSTALLED 0');
    if (t > K.samsung + 0.25 && t < K.community - 0.6) c('samsung', 'SAMSUNG ✗');
    if (t > K.lg + 0.25 && t < K.community - 0.6) c('lg', 'LG ✗');
    if (t > K.community + 0.1 && t < K.cta - 0.25) c('phone', 'PHONE APP');
    if (t > K.tv + 0.5) c('cta', 'COMMENT TV');
    return out;
  }
  return { K, render, events, texts, subs };
}
