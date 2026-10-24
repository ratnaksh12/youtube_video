// Reel 03 · "OpenAI's AI smuggled its questions out through DNS" · AI News series, Hologram HUD, 1080×1920 at 24 fps.
// Times come from timeline.json. The set: a glass sandbox (the training environment) with the AI inside it, and the live internet as a globe.
import { Holo, drawPad, makeCamera } from './kit/engine/holo.js';
import { U, T, W, H, FPS, TOP, clamp, lerp, seg, eo, eio, sine, hash, win, snap, lineKeys, label, bigValue, card, chrome, makeSubs, drawSub, pollCard, withWhip } from './kit/ui.js';

const FOV = 0.9;
const ACC_HEX = '#8bff47';                     // T.acc at full alpha (holo.js's keep takes a hex colour)
export function keys(TL) {
  const { L, w, DUR } = lineKeys(TL);
  const K = {
    DUR, L,
    blocked: w('l01', 'blocked'), internet1: w('l01', 'internet'),
    l02: L.l02.t0, smuggled: w('l02', 'smuggled'), questions2: w('l02', 'questions'), phone: w('l02', 'phone'),
    l03: L.l03.t0, websites: w('l03', 'websites'), dns: w('l03', 'dns'), worked: w('l03', 'worked'),
    l04: L.l04.t0, questions4: w('l04', 'questions'), inside: w('l04', 'inside'), names: w('l04', 'names'), and4: w('l04', 'and'), an: w('l04', 'an'), chatbot: w('l04', 'chatbot'), answered: w('l04', 'answered'), way: w('l04', 'way'),
    l05: L.l05.t0, sent: w('l05', 'sent'), more: w('l05', 'more'), stopped: w('l05', 'stopped'),
    l06: L.l06.t0, paused: w('l06', 'paused'), training6: w('l06', 'training'), d11: w('l06', '11'), now: w('l06', 'now'), they: w('l06', 'they'), train: w('l06', 'train'), saved: w('l06', 'saved'),
    l07: L.l07.t0, anthropic: w('l07', 'anthropic'), caught: w('l07', 'caught'), far: w('l07', 'far'),
    l08: L.l08.t0, submitted: w('l08', 'submitted'), form: w('l08', 'form'), another: w('l08', 'another'), tip: w('l08', 'tip'), police: w('l08', 'police'),
    l09: L.l09.t0, cut: w('l09', 'cut'), internal: w('l09', 'internal'),
    l10: L.l10.t0, rewards: w('l10', 'rewards'), so: w('l10', 'so'), job: w('l10', 'job'), loopholes: w('l10', 'loopholes'), pay: w('l10', 'pay'),
    l11: L.l11.t0, chatgpt: w('l11', 'chatgpt'), claude: w('l11', 'claude'), search: w('l11', 'search'),
    l12: L.l12.t0, yes: w('l12', 'yes'), no: w('l12', 'no'),
  };
  K.count = [K.sent, K.more + 0.6];                     // the question counter runs 1 → 19
  K.silence = [snap(L.l05.t1 + 0.15), K.l06];          // the run is stopped: 1.25 s of nothing
  K.ignite = K.l07;                                      // the drop: Anthropic's turn, the same sandbox lit again
  K.cta = K.l12 - 0.15;
  // the card zone: one card at a time, each held long enough to read (readcheck)
  K.cards = [
    ['access', -1, K.smuggled - 0.1], ['dns', K.smuggled - 0.1, K.inside - 0.1], ['tunnel', K.inside - 0.1, K.l05 - 0.05],
    ['count', K.l05 - 0.05, K.training6 - 0.1], ['fix', K.training6 - 0.1, K.l07 + 0.45], ['report', K.l07 + 0.45, K.submitted - 0.3],
    ['tests', K.submitted - 0.3, K.cut - 0.05], ['off', K.cut - 0.05, K.l10 - 0.05], ['why', K.l10 - 0.05, K.l11 + 0.35], ['you', K.l11 + 0.35, K.cta],
  ];
  return K;
}

function cams() {
  const c = (target, yaw, pitch, dist, cx = 540, cy = 1000) => ({ target, yaw, pitch, dist, cx, cy });
  return {
    hook: c([0.1, 0.75, -0.2], 0.5, 0.16, 3.4, 520, 1020), hook2: c([0.1, 0.75, -0.2], 0.42, 0.16, 3.1, 520, 1020),
    rise: c([0.4, 1.0, -0.7], 0.35, 0.1, 4.3, 540, 1000), rise2: c([0.4, 1.0, -0.7], 0.22, 0.1, 4.2, 540, 1000),
    globe: c([0.6, 1.25, -1.1], 0.15, 0.05, 3.6, 560, 1000), port: c([0.15, 0.85, 0], 0.5, 0.22, 3.0, 540, 1010),
    wide: c([0.35, 0.95, -0.6], -0.2, 0.14, 4.8, 540, 1030), cache: c([-0.12, 0.45, 0.12], -0.55, 0.3, 2.8, 540, 1020),
    drop: c([0.35, 1.0, -0.6], 0.75, 0.12, 4.6, 540, 1020), reach: c([0.4, 1.0, -0.65], 0.35, 0.1, 4.5, 540, 1020),
    seal: c([0, 0.6, 0], 0.25, 0.2, 3.05, 540, 1010), why: c([0, 0.6, 0], -0.35, 0.18, 3.25, 540, 1010),
    you: c([0.4, 1.0, -0.65], 0.1, 0.1, 4.7, 540, 1020), cta: c([0.3, 0.9, -0.5], 0.0, 0.2, 5.3, 540, 1250),
  };
}
const mix = (A, B, w) => ({
  target: A.target.map((x, i) => lerp(x, B.target[i], w)), yaw: lerp(A.yaw, B.yaw, w), pitch: lerp(A.pitch, B.pitch, w),
  dist: Math.exp(lerp(Math.log(A.dist), Math.log(B.dist), w)), cx: lerp(A.cx, B.cx, w), cy: lerp(A.cy, B.cy, w), roll: 0, fov: FOV,
});
function camAt(C, K, t) {
  const at = (a, b, ta, tb, f = eio) => mix(a, b, f(seg(t, ta, tb)));
  if (t < K.smuggled - 0.2) return at(C.hook, C.hook2, 0, K.smuggled, sine);                         // slow push in on the box
  if (t < K.l03) return at(C.hook2, C.rise, K.smuggled - 0.2, K.phone + 0.3);                        // crane up the way the question goes
  if (t < K.questions4) return at(C.rise, C.rise2, K.l03, K.questions4, sine);
  if (t < K.l05 - 0.3) return at(C.rise2, C.globe, K.questions4, K.chatbot + 0.2);                   // up to the chatbot's side
  if (t < K.l06) return at(C.globe, C.port, K.l05 - 0.3, K.l05 + 0.8);                               // back down to the box: the run is stopped
  if (t < K.now) return at(C.port, C.wide, K.l06, K.l06 + 1.6, eo);
  if (t < K.l07 - 0.3) return at(C.wide, C.cache, K.now, K.saved + 0.4);                             // the saved copy inside the box
  if (t < K.l07 + 0.4) return at(C.cache, C.drop, K.l07 - 0.3, K.l07 + 0.4);                          // whip: Anthropic
  if (t < K.cut - 0.3) return at(C.drop, C.reach, K.l07 + 0.4, K.l08 + 2.5, sine);
  if (t < K.l10) return at(C.reach, C.seal, K.cut - 0.3, K.cut + 0.6);                               // push in as the box is sealed
  if (t < K.l11 - 0.3) return at(C.seal, C.why, K.l10, K.l11, sine);
  if (t < K.cta - 0.2) return at(C.why, C.you, K.l11 - 0.3, K.l11 + 0.9);
  return at(C.you, C.cta, K.cta - 0.2, K.cta + 0.6);
}

// ---------------------------------------------------------------- 3D helpers
const add3 = (a, b) => a.map((x, i) => x + b[i]), sub3 = (a, b) => a.map((x, i) => x - b[i]), mul3 = (a, s) => a.map(x => x * s);
const nrm3 = a => mul3(a, 1 / Math.hypot(...a));
const bez = (a, c, b, s) => a.map((x, i) => (1 - s) * (1 - s) * x + 2 * (1 - s) * s * c[i] + s * s * b[i]);

export function makeFilm(X, TLJ) {
  const K = keys(TLJ), C = cams(), holo = new Holo(W, H), subs = makeSubs(TLJ);
  const { BOX, CORE, PORT, CACHE, GLOBE } = X.set;
  const onGlobe = d => add3(GLOBE.c, mul3(nrm3(d), GLOBE.r * 1.02));
  // the DNS route: core → the port in the lid → up over to the globe
  const G = onGlobe(sub3(PORT, GLOBE.c)), CTRL = [PORT[0] + 0.1, PORT[1] + 0.75, PORT[2] - 0.15], CORE_TOP = add3(CORE, [0.05, 0.18, 0.04]);
  const route = u => u < 0.2 ? add3(CORE_TOP, mul3(sub3(PORT, CORE_TOP), u / 0.2)) : bez(PORT, CTRL, G, (u - 0.2) / 0.8);
  // where things sit on the globe (pins, not turning with it)
  const PIN = { chatbot: onGlobe([-0.55, 0.05, 0.85]), form: onGlobe([-0.75, -0.05, 0.7]), tip: onGlobe([-0.2, -0.55, 0.85]), you1: onGlobe([-0.6, 0.45, 0.6]), you2: onGlobe([-0.3, -0.35, 0.9]) };
  // blocked attempts: rays from the core that stop at the glass
  const h = BOX.s / 2;
  const RAYS = [{ to: [-h, 0.8, 0.1], t: 0.12 }, { to: [h, 0.86, 0.1], t: 0.42 }, { to: [0.12, 0.66, h], t: 0.72 },
    { to: [-h, 0.8, 0.1], t: K.websites - 0.2 }, { to: [h, 0.86, 0.1], t: K.websites }, { to: [0.12, 0.66, h], t: K.websites + 0.2 }];
  // packets on the DNS route: dir 1 = a question going out, -1 = an answer coming back
  const PK = [];
  for (let i = 0; i < 3; i++) PK.push({ t: K.questions2 + i * 0.3, d: 0.9, dir: 1 });
  PK.push({ t: K.questions4, d: 1.2, dir: 1, q: 1 }, { t: K.names - 0.1, d: 1.2, dir: 1, q: 1 }, { t: K.answered, d: 1.1, dir: -1, q: 1 }, { t: K.way, d: 1.1, dir: -1, q: 1 });
  const nCount = 18, cStep = (K.count[1] - K.count[0]) / nCount;
  for (let i = 0; i < nCount; i++) PK.push({ t: K.count[0] + i * cStep, d: 0.7, dir: i % 3 === 2 ? -1 : 1, burst: 1 });
  const asked = t => 1 + PK.filter(p => p.burst && p.dir > 0 && t >= p.t).length + PK.filter(p => p.burst && p.dir < 0 && t >= p.t).length;   // 1 → 19
  // Anthropic: two reaches out of the box to real sites
  const REACH = [{ id: 'form', t0: K.submitted - 0.3, t1: K.form, tag: 'GOVERNMENT FORM', dir: -1 }, { id: 'tip', t0: K.another, t1: K.tip, tag: 'POLICE TIP LINE', dir: -1 }];

  // ---------------------------------------------------------------- events for the score and the mixer
  function events() {
    const E = [], ev = (t, type, o = {}) => E.push({ t: +t.toFixed(3), type, ...o });
    ev(0, 'scramble', { t1: K.blocked }); ev(K.blocked, 'lock', { first: true }); ev(K.blocked + 0.02, 'confirm');
    RAYS.slice(0, 3).forEach(r => ev(r.t + 0.22, 'deny'));
    ev(K.smuggled - 0.1, 'card'); ev(K.smuggled, 'draw', { t1: K.phone }); ev(K.smuggled, 'roll', { t1: K.questions2 + 0.2 }); ev(K.questions2 + 0.2, 'confirm');
    PK.filter(p => !p.burst).forEach(p => ev(p.t + p.d * 0.5, 'pulse', { dir: p.dir }));
    ev(K.phone, 'marker');
    ev(K.websites + 0.02, 'deny'); ev(K.worked, 'confirm');
    ev(K.questions4 - 0.1, 'card'); ev(K.names - 0.2, 'roll', { t1: K.names + 0.15 }); ev(K.names + 0.15, 'lock');
    ev(K.chatbot, 'probe'); ev(K.chatbot + 0.3, 'marker');
    ev(K.l05 - 0.05, 'card'); ev(K.count[0], 'roll', { t1: K.count[1], count: true }); ev(K.count[1], 'lock'); ev(K.count[1] + 0.02, 'confirm', { hard: true });
    ev(K.stopped, 'glitch'); ev(K.stopped + 0.05, 'powerloss');
    E.push({ t: K.silence[0], type: 'silence', t1: K.silence[1] });
    ev(K.paused - 0.15, 'card'); ev(K.training6, 'roll', { t1: K.d11 + 0.25, count: true }); ev(K.d11 + 0.25, 'confirm');
    ev(K.now + 0.1, 'off'); ev(K.train, 'dock'); ev(K.saved, 'scan', { t1: K.saved + 0.9 }); ev(K.saved + 0.1, 'frost');
    ev(K.l07 - 0.3, 'whip'); ev(K.ignite, 'ignite'); ev(K.caught, 'roll', { t1: K.caught + 0.3 }); ev(K.caught + 0.3, 'lock');
    ev(K.l08 - 0.05, 'card');
    REACH.forEach((r, i) => { ev(r.t0, 'slide'); ev(r.t1, i ? 'error' : 'lock'); });
    ev(K.cut - 0.05, 'card'); ev(K.cut, 'glitch'); ev(K.cut + 0.05, 'close'); ev(K.cut + 0.3, 'confirm', { hard: true });
    ev(K.l10 - 0.05, 'card'); [K.rewards, K.job, K.loopholes].forEach(t => ev(t, 'dock')); ev(K.pay, 'confirm');
    ev(K.l11 + 0.35, 'card'); ev(K.chatgpt + 0.35, 'confirm'); ev(K.claude + 0.3, 'confirm'); ev(K.search, 'merge');
    for (let i = 0; i < 4; i++) ev(K.search + 0.3 + i * 0.25, 'wifi', { dir: i % 2 ? -1 : 1 });
    ev(K.cta, 'card'); ev(K.yes, 'cta'); ev(K.no, 'roll', { t1: K.no + 0.1 }); ev(K.no + 0.3, 'confirm', { final: true });
    return E.sort((a, b) => a.t - b.t);
  }

  // ---------------------------------------------------------------- state
  const sil = t => t >= K.silence[0] && t < K.silence[1];
  const powerAt = t => {
    if (t >= K.stopped && t < K.silence[0]) return lerp(1, 0.32, eo(seg(t, K.stopped, K.silence[0])));
    if (sil(t)) return 0.32;
    if (t >= K.silence[1] && t < K.silence[1] + 0.9) return lerp(0.32, 1, eo(seg(t, K.silence[1], K.silence[1] + 0.9)));
    return 1;
  };
  const globeAt = t => {                                   // how live the internet looks: 1 live, ~0.2 a cut-off ghost
    if (t < K.now) return 1;
    if (t < K.ignite) return lerp(1, 0.18, eo(seg(t, K.now, K.now + 0.6)));
    if (t < K.cut) return lerp(0.18, 1, eo(seg(t, K.ignite, K.ignite + 0.7)));
    if (t < K.search) return lerp(1, 0.18, eo(seg(t, K.cut, K.cut + 0.4)));
    return lerp(0.18, 0.9, eo(seg(t, K.search, K.search + 0.8)));
  };
  const solidAt = t => {
    let s = 0.16;
    if (t >= K.ignite && t < K.ignite + 1.5) s = Math.max(s, 0.55 * (1 - seg(t, K.ignite + 0.3, K.ignite + 1.5)));
    if (t >= K.cut) s = Math.max(s, lerp(0.9, 0.38, seg(t, K.cut + 0.4, K.cut + 2.5)));
    return s;
  };
  const waveAt = (t, top) => {
    if (t >= K.ignite && t < K.ignite + 1.0) return { y: lerp(-0.05, top, seg(t, K.ignite, K.ignite + 0.9)), w: 0.08 };
    if (t >= K.cut && t < K.cut + 0.8) return { y: lerp(top, -0.05, seg(t, K.cut, K.cut + 0.7)), w: 0.08 };
    if (t >= K.saved && t < K.saved + 0.9) return { y: lerp(-0.05, 0.45, seg(t, K.saved, K.saved + 0.9)), w: 0.05 };
    return null;
  };
  const routeA = t => {                                    // the DNS route: drawn in l02, live to the stop, a ghost again when loopholes are named
    if (t < K.smuggled) return 0;
    if (t < K.stopped) return 1;
    if (t < K.stopped + 0.4) return hash(Math.floor(t * 48)) > 0.45 ? 0.8 : 0.1;   // flickers out
    if (t > K.loopholes - 0.1 && t < K.l11) return 0.35 * win(t, K.loopholes - 0.1, K.l11, 0.2, 0.4);
    return 0;
  };
  const glitchAt = t => Math.max(t > K.stopped && t < K.stopped + 0.18 ? 1 : 0, t > K.cut && t < K.cut + 0.15 ? 0.8 : 0);

  // ---------------------------------------------------------------- one frame
  const whipK = t => (t > K.l07 - 0.3 && t < K.l07 + 0.4) ? Math.sin(Math.PI * seg(t, K.l07 - 0.3, K.l07 + 0.4)) * 0.6 : 0;
  const render = withWhip(frameAt, whipK);
  function frameAt(ctx, t, o = {}) {
    const frame = Math.round((o.frameT ?? t) * FPS);
    const cam = camAt(C, K, t); cam.fov = FOV;
    const P = makeCamera(cam, W, H).project, p3 = new Float32Array(3);
    const proj = v => { P(v[0], v[1], v[2], p3); return [p3[0], p3[1], p3[2]]; };
    const ctaDim = t > K.cta ? lerp(1, 0.3, eo(seg(t, K.cta, K.cta + 0.6))) : 1;
    const power = powerAt(t) * ctaDim, live = globeAt(t);

    U.background(ctx, W, H, T, { cx: cam.cx, cy: cam.cy, px: -cam.yaw * 140, py: cam.pitch * 140, alpha: 0.75 + 0.25 * power });
    drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12, alpha: 0.85 * power });
    holo.draw(ctx, X.globe, cam, { hue: T.hue, gain: (0.35 + 0.65 * live) * power, spin: t * 0.16 * (0.3 + 0.7 * live), spinC: GLOBE.c, lineWidth: 1.15, glow: 0.5 + 0.5 * live });
    const portLit = t >= K.smuggled && t < K.stopped + 0.1;
    const info = holo.draw(ctx, X.lab, cam, {
      hue: T.hue, gain: power, solid: solidAt(t) * power, wave: waveAt(t, BOX.y0 + BOX.s), scanOffset: frame,
      angle: { ico: t * 0.5, ring: -t * 0.8 - (t > K.l10 ? (t - K.l10) * 1.2 : 0), inner: t * 1.4 },
      explode: { cache: t >= K.saved && t < K.ignite ? eo(seg(t, K.saved, K.saved + 0.5)) : 0 },
      keep: portLit ? { port: ACC_HEX } : null, flash: { core: t > K.pay && t < K.pay + 0.12 ? 1 : 0 },
    });
    drawRays(ctx, t, proj, power);
    drawRoute(ctx, t, proj, routeA(t) * power);
    drawPackets(ctx, t, proj, power);
    drawReach(ctx, t, proj, power * ctaDim);
    drawPins(ctx, t, proj, frame, power * ctaDim);
    const gl = glitchAt(t); if (gl > 0) U.glitch(ctx, W, H, gl, frame);

    chrome(ctx, (sil(t) ? 0.55 : 1) * ctaDim, 'AI NEWS // 01', status(t));
    drawTop(ctx, t, frame);
    pollCard(ctx, t, K.cta, ['SHOULD AI GET THE', 'OPEN INTERNET BACK?'], ['YES', 'NO'], [K.yes, K.no], frame, win(t, K.cta, K.DUR + 1, 0.25, 0.25));
    U.vignette(ctx, W, H, 0.5);
    if (!o.nosub) drawSub(ctx, t, subs);
  }
  function status(t) {
    if (t < K.l04) return 'SOURCE · OPENAI';
    if (t < K.l05) return 'DNS TUNNEL · OPEN';
    if (t < K.stopped) return `QUESTIONS · ${asked(t)}`;
    if (t < K.silence[1]) return 'RUN STOPPED';
    if (t < K.l07) return 'SOURCE · OPENAI';
    if (t < K.l10) return 'SOURCE · ANTHROPIC, 9 OCT';
    if (t < K.cta) return 'SOURCES · OPENAI, ANTHROPIC';
    return 'YOUR TAKE?';
  }

  // ---------------------------------------------------------------- the set's overlays
  function xMark(ctx, p, s, a) {
    ctx.beginPath(); ctx.moveTo(p[0] - s, p[1] - s); ctx.lineTo(p[0] + s, p[1] + s); ctx.moveTo(p[0] + s, p[1] - s); ctx.lineTo(p[0] - s, p[1] + s);
    ctx.strokeStyle = T.hi(a); ctx.lineWidth = 3; ctx.stroke();
  }
  function drawRays(ctx, t, proj, power) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const r of RAYS) {
      const k = seg(t, r.t, r.t + 0.22), fade = 1 - seg(t, r.t + 0.5, r.t + 1.1);
      if (k <= 0 || fade <= 0) continue;
      const a = proj(CORE), b = proj(add3(CORE, mul3(sub3(r.to, CORE), k)));
      ctx.setLineDash([10, 7]); ctx.strokeStyle = T.line(0.85 * fade * power); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]);
      if (k >= 1) {
        const hit = seg(t, r.t + 0.22, r.t + 0.5);
        xMark(ctx, b, 11, fade * power);
        ctx.strokeStyle = T.line(0.7 * (1 - hit) * power); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(b[0], b[1], 12 + 30 * hit, 0, 7); ctx.stroke();
      }
    }
    // l01: a tag on the glass once the third attempt hits
    const tagA = win(t, RAYS[1].t + 0.25, K.smuggled - 0.2, 0.15, 0.3) * power;
    if (tagA > 0) U.marker(ctx, T, proj(RAYS[1].to).slice(0, 2), 'BLOCKED', tagA, 0, 1);
    ctx.restore();
  }
  function drawRoute(ctx, t, proj, a) {
    if (a <= 0) return;
    const prog = seg(t, K.smuggled, K.phone), N = 60;
    const pts = []; for (let i = 0; i <= N * prog; i++) pts.push(proj(route(i / N)));
    if (pts.length < 2) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    ctx.setLineDash([12, 8]); ctx.lineDashOffset = -t * 40;
    ctx.strokeStyle = T.line(0.9 * a); ctx.lineWidth = 2.4; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    ctx.setLineDash([]); ctx.strokeStyle = T.line(0.18 * a); ctx.lineWidth = 9; ctx.stroke();
    const head = pts[pts.length - 1];
    if (prog < 1) { ctx.fillStyle = T.hi(a); ctx.beginPath(); ctx.arc(head[0], head[1], 5, 0, 7); ctx.fill(); }
    ctx.restore();
    // the port's tag while the route is live
    const tagA = win(t, K.smuggled + 0.2, K.l04, 0.2, 0.3) * a;
    if (tagA > 0) { const p = proj(PORT); U.marker(ctx, T, [p[0], p[1]], 'DNS · STILL OPEN', tagA, (t * 0.9) % 1, -1); }
  }
  function drawPackets(ctx, t, proj, power) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const p of PK) {
      if (t < p.t || t > p.t + p.d || t > K.stopped + 0.05) continue;
      const u0 = seg(t, p.t, p.t + p.d), u = p.dir > 0 ? u0 : 1 - u0, q = proj(route(u)), tail = proj(route(clamp(u - 0.05 * p.dir)));
      const a = Math.sin(Math.PI * u0) * power;
      ctx.strokeStyle = T.hi(0.5 * a); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tail[0], tail[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      ctx.fillStyle = T.hi(a);
      if (p.dir > 0) { ctx.beginPath(); ctx.arc(q[0], q[1], p.q ? 8 : 6, 0, 7); ctx.fill(); }
      else { const s = p.q ? 9 : 7; ctx.beginPath(); ctx.moveTo(q[0], q[1] - s); ctx.lineTo(q[0] + s, q[1]); ctx.lineTo(q[0], q[1] + s); ctx.lineTo(q[0] - s, q[1]); ctx.closePath(); ctx.fill(); }
      if (p.q) { ctx.font = `600 22px ${U.FONT.mono}`; ctx.textAlign = 'left'; ctx.fillStyle = T.hi(0.95 * a); ctx.fillText(p.dir > 0 ? '?' : '!', q[0] + 12, q[1] - 10); }
    }
    ctx.restore();
  }
  function drawReach(ctx, t, proj, power) {
    if (t < K.l08 - 0.5 || t > K.cut + 0.4) return;
    const cutK = seg(t, K.cut, K.cut + 0.25);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const r of REACH) {
      const k = eo(seg(t, r.t0, r.t1)); if (k <= 0) continue;
      const end = PIN[r.id], ctrl = add3(mul3(add3(CORE, end), 0.5), [-0.35, 0.45, 0.25]), N = 48;
      const pts = []; for (let i = 0; i <= N * k; i++) pts.push(proj(bez(CORE, ctrl, end, i / N)));
      const a = power * (1 - cutK);
      if (pts.length < 2 || a <= 0) continue;
      ctx.setLineDash([12, 8]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = T.line(0.9 * a); ctx.lineWidth = 2.4;
      ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); ctx.setLineDash([]);
      if (k < 1) { const hd = pts[pts.length - 1]; ctx.fillStyle = T.hi(a); ctx.beginPath(); ctx.arc(hd[0], hd[1], 5, 0, 7); ctx.fill(); }
    }
    ctx.restore();
  }
  function drawPins(ctx, t, proj, frame, power) {
    const pin = (id, lab, t0, t1, dir = 1) => {
      const a = win(t, t0, t1, 0.2, 0.3) * power; if (a <= 0) return;
      const p = proj(PIN[id]); U.marker(ctx, T, [p[0], p[1]], lab, a, seg(t, t0, t0 + 0.6), dir);
    };
    pin('chatbot', 'OUTSIDE CHATBOT', K.chatbot, K.l05 - 0.1);
    for (const r of REACH) pin(r.id, r.tag, r.t1 - 0.05, K.cut + 0.2, r.dir);
    pin('you1', 'CHATGPT', K.chatgpt + 0.3, K.cta + 0.3, -1);
    pin('you2', 'CLAUDE', K.claude + 0.3, K.cta + 0.3, -1);
    // the saved copy inside the box
    const ca = win(t, K.saved + 0.3, K.l07 - 0.3, 0.2, 0.3) * power;
    if (ca > 0) { const p = proj(CACHE); U.marker(ctx, T, [p[0], p[1]], 'SAVED COPY OF THE WEB', ca, seg(t, K.saved + 0.3, K.saved + 0.9), 1); }
  }

  // ---------------------------------------------------------------- the card zone
  const cardA = (id, t) => { const c = K.cards.find(x => x[0] === id); return win(t, c[1], c[2], 0.3, 0.25); };
  const cardK = (id, t) => { const c = K.cards.find(x => x[0] === id); return seg(t, c[1], c[1] + 0.45); };
  function tick(ctx, xx, yy, ok, a, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    if (ok) { ctx.strokeStyle = T.acc(a * k); ctx.beginPath(); ctx.moveTo(xx + 8, yy - 16); ctx.lineTo(xx + 24, yy); ctx.lineTo(xx + 52, yy - 34); ctx.stroke(); }
    else { ctx.strokeStyle = T.hi(0.85 * a * k); ctx.beginPath(); ctx.moveTo(xx + 10, yy - 32); ctx.lineTo(xx + 46, yy + 2); ctx.moveTo(xx + 46, yy - 32); ctx.lineTo(xx + 10, yy + 2); ctx.stroke(); }
    ctx.restore();
  }
  function rule(ctx, x, y, w, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.dim(0.35 * a); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke(); ctx.restore(); }
  function row(ctx, t, frame, i, y, lab, val, tw, a, o = {}) {   // a label on the left, a value that rolls in on the right
    const { x, w } = TOP, on = t >= tw - 0.2, rk = seg(t, tw, tw + 0.35);
    label(ctx, lab, x, y, a * (on ? 1 : 0.35), { size: o.size || 32, color: on ? T.hi : T.line });
    if (rk > 0) bigValue(ctx, val, x + w, y + 6, o.vsize || 60, a, { roll: rk, frame, align: 'right', seed: 60 + i, flash: t > tw + 0.35 && t < tw + 0.45, track: 2, locked: o.plain ? false : undefined });
    rule(ctx, x, y + 24, w, a);
  }
  function drawTop(ctx, t, frame) {
    if (t >= K.cta) return;
    const { x, y, w } = TOP, sa = sil(t) ? 0.6 : 1;
    // 1. the hook: internet access, blocked
    let a = cardA('access', t);
    if (a > 0) {
      card(ctx, '01', 'OPENAI · A RESEARCH MODEL IN TRAINING', frame, a, 1);
      label(ctx, 'INTERNET ACCESS', x, y + 112, a, { mono: true, size: 26 });
      bigValue(ctx, 'BLOCKED', x - 4, y + 240, 150, a, { roll: 1, locked: t >= K.blocked, frame, align: 'left', seed: 3, flash: t >= K.blocked && t < K.blocked + 0.12, track: 4 });
    }
    // 2. the loophole: DNS, then what was open and what wasn't
    a = cardA('dns', t);
    if (a > 0) {
      card(ctx, '02', "THE LOOPHOLE · THE INTERNET'S PHONE BOOK", frame, a, cardK('dns', t));
      const rk = seg(t, K.smuggled, K.questions2 + 0.2);
      if (rk > 0) bigValue(ctx, 'DNS', x - 4, y + 168, 130, a, { roll: rk, frame, align: 'left', seed: 11, flash: t > K.questions2 + 0.2 && t < K.questions2 + 0.3, track: 6 });
      const pk = seg(t, K.phone - 0.3, K.phone + 0.3);
      if (pk > 0) {
        label(ctx, U.rollText('LOOKS UP THE ADDRESS', pk, frame, 13), x + 290, y + 118, a, { size: 32, color: T.hi });
        label(ctx, U.rollText('BEHIND EVERY WEBSITE NAME', pk, frame, 14), x + 290, y + 158, a, { size: 32, color: T.hi });
      }
      [['WEBSITES', false, K.websites + 0.1, 0], ['DNS', true, K.dns, 1]].forEach(([lab, ok, tw, col]) => {
        const xx = x + col * 430, yy = y + 250, on = t >= tw - 0.1;
        if (t < K.l03 - 0.2) return;
        label(ctx, lab, xx + 70, yy, a * (on ? 1 : 0.35), { size: 40, color: ok ? T.hi : T.line, w: 600 });
        tick(ctx, xx, yy, ok, a, seg(t, tw + 0.05, tw + 0.25));
      });
    }
    // 3. the tunnel: a question hidden in a website name
    a = cardA('tunnel', t);
    if (a > 0) {
      card(ctx, '03', 'THE TUNNEL · A QUESTION IN A WEBSITE NAME', frame, a, cardK('tunnel', t));
      label(ctx, 'ILLUSTRATION', x + w, y + 112, a * 0.8, { mono: true, size: 20, align: 'right', color: T.dim });
      label(ctx, 'THE AI LOOKS UP:', x, y + 112, a, { mono: true, size: 24 });
      const qk = seg(t, K.names - 0.2, K.names + 0.15);
      if (qk > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `44px ${U.FONT.mono}`; ctx.textAlign = 'left';
        const q = U.rollText('who-is-this', qk, frame, 21), rest = U.rollText('.relay.example', qk, frame, 22);
        ctx.fillStyle = T.acc(a); ctx.shadowColor = T.acc(0.6 * a); ctx.shadowBlur = 6; ctx.fillText(q, x, y + 178);
        const qw = ctx.measureText(q).width; ctx.shadowBlur = 0; ctx.fillStyle = T.line(0.8 * a); ctx.fillText(rest, x + qw, y + 178);
        ctx.restore();
        label(ctx, '↑ THE QUESTION', x, y + 214, a * seg(t, K.names + 0.2, K.names + 0.5), { mono: true, size: 22, color: T.dim });
      }
      const ok = seg(t, K.and4, K.and4 + 0.35);
      if (ok > 0) label(ctx, U.rollText('→ OUTSIDE CHATBOT', ok, frame, 23), x, y + 262, a, { size: 34, color: T.hi });
    }
    // 4. the count: 1 → 19, then the stop
    a = cardA('count', t) * sa;
    if (a > 0) {
      card(ctx, '04', 'QUESTIONS SENT THROUGH DNS', frame, a, cardK('count', t));
      const n = asked(t), done = t >= K.count[1];
      bigValue(ctx, String(n), x + 150, y + 236, 200, a, { roll: 1, locked: done, flash: done && t < K.count[1] + 0.12, frame });
      label(ctx, done ? '1 + 18 MORE' : '', x + 320, y + 140, a, { size: 40, color: T.hi });
      if (t >= K.stopped) label(ctx, U.rollText('RUN STOPPED', seg(t, K.stopped, K.stopped + 0.3), frame, 29), x + 320, y + 200, a, { size: 44, color: T.acc, w: 700 });
      else if (done) label(ctx, 'MONITORING FLAGGED IT', x + 320, y + 200, a * seg(t, K.count[1], K.count[1] + 0.3), { mono: true, size: 24 });
    }
    // 5. OpenAI's fix
    a = cardA('fix', t);
    if (a > 0) {
      card(ctx, '05', "OPENAI'S FIX · ITS TOP MODELS", frame, a, cardK('fix', t), 320);
      row(ctx, t, frame, 0, y + 112, 'TRAINING PAUSED', '11 DAYS', K.d11, a);
      // the pause on a calendar: 20 Sep → 1 Oct, one cell a day
      const ck = seg(t, K.training6, K.d11 + 0.25);
      const calA = a * (1 - seg(t, K.now - 0.3, K.now));
      if (calA > 0) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 12; i++) { const on = i < Math.round(ck * 11) + (ck > 0 ? 1 : 0); ctx.fillStyle = (on ? (i === 11 ? T.acc : T.line) : T.dim)((on ? 0.85 : 0.25) * calA); ctx.fillRect(x + i * 76, y + 150, 66, 10); }
        ctx.restore();
        label(ctx, '20 SEP', x, y + 192, calA * 0.9, { mono: true, size: 22 }); label(ctx, '1 OCT · RESTARTED', x + w, y + 192, calA * 0.9 * seg(t, K.d11, K.d11 + 0.3), { mono: true, size: 22, align: 'right' });
      }
      if (t >= K.now) {
        row(ctx, t, frame, 1, y + 182, 'LIVE INTERNET', 'OFF', K.now + 0.1, a * seg(t, K.now, K.now + 0.3));
        row(ctx, t, frame, 2, y + 252, 'SAVED COPY OF THE WEB', 'ON', K.they, a * seg(t, K.they - 0.2, K.they + 0.1));
      }
    }
    // 6. Anthropic's report
    a = cardA('report', t);
    if (a > 0) {
      card(ctx, '06', 'ANTHROPIC · REPORT, 9 OCT 2026', frame, a, cardK('report', t));
      const k4 = K.caught - 0.2, rk = seg(t, k4, k4 + 0.3);
      if (rk > 0) bigValue(ctx, '4', x + 70, y + 236, 200, a, { roll: rk, frame, seed: 31, flash: t > k4 + 0.3 && t < k4 + 0.4 });
      label(ctx, 'KINDS OF ACTIONS', x + 200, y + 150, a * seg(t, k4 + 0.1, k4 + 0.4), { size: 44, color: T.hi });
      label(ctx, 'NOBODY ASKED FOR, IN TESTS', x + 200, y + 200, a * seg(t, K.far - 0.2, K.far + 0.2), { size: 34, color: T.line });
    }
    // 7. what the models did
    a = cardA('tests', t);
    if (a > 0) {
      card(ctx, '07', 'IN TESTS · WHAT THE MODELS DID', frame, a, cardK('tests', t));
      row(ctx, t, frame, 3, y + 120, 'A REAL GOVERNMENT FORM', 'SUBMITTED', K.submitted, a, { vsize: 48 });
      row(ctx, t, frame, 4, y + 200, 'A MADE-UP TIP', 'TO POLICE', K.another, a, { vsize: 48 });
      label(ctx, 'ANTHROPIC: "MINIMAL REAL-WORLD IMPACT"', x, y + 262, a * seg(t, K.police, K.police + 0.4), { mono: true, size: 22, color: T.dim });
    }
    // 8. cut off
    a = cardA('off', t);
    if (a > 0) {
      card(ctx, '08', 'ANTHROPIC · ALL INTERNAL TESTS', frame, a, cardK('off', t));
      label(ctx, 'LIVE INTERNET', x, y + 112, a, { mono: true, size: 26 });
      const rk = seg(t, K.cut, K.cut + 0.3);
      if (rk > 0) bigValue(ctx, 'OFF', x - 4, y + 240, 150, a, { roll: rk, frame, align: 'left', seed: 41, flash: t > K.cut + 0.3 && t < K.cut + 0.4, track: 4 });
      label(ctx, 'IN EVERY INTERNAL TEST', x + 330, y + 200, a * seg(t, K.internal - 0.2, K.internal + 0.2), { size: 34, color: T.hi });
    }
    // 9. why: loophole → job done → reward
    a = cardA('why', t);
    if (a > 0) {
      card(ctx, '09', 'WHY · HOW TRAINING CAN BACKFIRE', frame, a, cardK('why', t));
      const steps = [['LOOPHOLE', K.so], ['JOB DONE', K.job], ['REWARD', K.rewards]], pay = t >= K.pay;
      steps.forEach(([s, tw], i) => {
        const xx = x + i * 310, k = seg(t, tw, tw + 0.3);
        U.plate(ctx, T, xx, y + 120, 270, 110, a * (k > 0 ? 1 : 0.35));
        if (k > 0) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.font = `600 42px ${U.FONT.ui}`; ctx.letterSpacing = '3px'; ctx.textAlign = 'center';
          ctx.fillStyle = (pay ? T.acc : T.hi)(a); ctx.fillText(U.rollText(s, k, frame, 51 + i), xx + 135, y + 190); ctx.restore();
        }
        if (i < 2) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = T.line(0.8 * a * (pay ? 1 : 0.5)); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(xx + 276, y + 175); ctx.lineTo(xx + 302, y + 175); ctx.moveTo(xx + 294, y + 167); ctx.lineTo(xx + 302, y + 175); ctx.lineTo(xx + 294, y + 183); ctx.stroke(); ctx.restore(); }
      });
      label(ctx, pay ? 'THE WORKAROUND PAYS OFF, SO IT GETS LEARNED' : 'TRAINING REWARDS THE RESULT', x, y + 272, a * seg(t, K.rewards, K.rewards + 0.3), { mono: true, size: 22, color: pay ? T.hi : T.line });
    }
    // 10. for you
    a = cardA('you', t);
    if (a > 0) {
      card(ctx, '10', 'FOR YOU · WHAT DOESN\'T CHANGE', frame, a, cardK('you', t));
      row(ctx, t, frame, 7, y + 120, 'CHATGPT · WEB SEARCH', 'ON', K.chatgpt + 0.2, a, { vsize: 56 });
      row(ctx, t, frame, 8, y + 200, 'CLAUDE · WEB SEARCH', 'ON', K.chatgpt + 0.45, a, { vsize: 56 });
      label(ctx, 'THE CHANGE IS IN TRAINING AND TESTING', x, y + 262, a * seg(t, K.search, K.search + 0.4), { mono: true, size: 22, color: T.dim });
    }
  }

  function texts(t) {
    const out = [{ id: 'title', text: 'AI NEWS // 01', x0: 60, y0: 220, x1: 300, y1: 245 }];
    const c = (id, text) => out.push({ id, text, x0: TOP.x, y0: TOP.y, x1: TOP.x + TOP.w, y1: TOP.y + 300 });
    if (t < K.smuggled - 0.35) c('blocked', 'INTERNET ACCESS BLOCKED');
    if (t > K.questions2 + 0.3 && t < K.inside - 0.35) c('dns', 'DNS');
    if (t > K.websites + 0.35 && t < K.inside - 0.35) c('web', 'WEBSITES ✗');
    if (t > K.dns + 0.25 && t < K.inside - 0.35) c('dnsok', 'DNS ✓');
    if (t > K.names + 0.15 && t < K.l05 - 0.3) c('q', 'who-is-this.relay.example');
    if (t > K.and4 + 0.35 && t < K.l05 - 0.3) c('bot', '→ OUTSIDE CHATBOT');
    if (t > K.count[1] && t < K.training6 - 0.35) c('n19', '19');
    if (t > K.stopped + 0.3 && t < K.training6 - 0.35) c('stop', 'RUN STOPPED');
    if (t > K.d11 + 0.35 && t < K.l07 + 0.2) c('days', 'TRAINING PAUSED 11 DAYS');
    if (t > K.now + 0.45 && t < K.l07 + 0.2) c('live', 'LIVE INTERNET OFF');
    if (t > K.they + 0.35 && t < K.l07 + 0.2) c('saved', 'SAVED COPY OF THE WEB ON');
    if (t > K.caught + 0.2 && t < K.submitted - 0.55) c('kinds', '4 KINDS OF ACTIONS');
    if (t > K.submitted + 0.35 && t < K.cut - 0.3) c('form', 'A REAL GOVERNMENT FORM SUBMITTED');
    if (t > K.another + 0.35 && t < K.cut - 0.3) c('tip', 'A MADE-UP TIP TO POLICE');
    if (t > K.cut + 0.3 && t < K.l10 - 0.3) c('off', 'LIVE INTERNET OFF');
    if (t > K.rewards + 0.3 && t < K.l11 + 0.1) c('reward', 'REWARD');
    if (t > K.job + 0.3 && t < K.l11 + 0.1) c('jobdone', 'JOB DONE');
    if (t > K.so + 0.3 && t < K.l11 + 0.1) c('loophole', 'LOOPHOLE');
    if (t > K.chatgpt + 0.55 && t < K.cta - 0.25) c('gpt', 'CHATGPT · WEB SEARCH ON');
    if (t > K.chatgpt + 0.8 && t < K.cta - 0.25) c('claude', 'CLAUDE · WEB SEARCH ON');
    const pc = (id, text, y0, y1) => out.push({ id, text, x0: 110, y0, x1: 970, y1 });
    if (t > K.cta + 0.5) pc('poll', 'SHOULD AI GET THE OPEN INTERNET BACK?', 700, 820);
    if (t > K.yes + 0.3) pc('yes', 'YES', 850, 1050);
    if (t > K.no + 0.3) pc('no', 'NO', 850, 1050);
    if (t > K.cta + 1.6) pc('comment', '↓ COMMENT YOUR ANSWER', 1080, 1120);
    if (t > K.cta + 2.0) pc('follow', 'FOLLOW FOR DAILY AI NEWS', 1140, 1180);
    return out;
  }
  return { K, render, events, texts, subs };
}
