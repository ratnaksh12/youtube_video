// Reel 04 · "How ChatGPT writes a sentence" · How It Actually Works, Pixel Room look, 1080×1920 at 24 fps.
// The room and BIT come from kit/pixelroom; this file adds the story's props (a tokenizer on the monitor, a cloud of tokens, word blocks,
// probability bars, a thermometer), the camera, the kinetic captions, the overlays and the sound events.
import * as THREE from 'three';
import { buildRoom, LIME, AMBER, VIOLET } from './kit/pixelroom/room.js';
import { wordBlock, growBar, cubeCloud, thermometer } from './kit/pixelroom/props.js';
import { makeCaptions, captionFonts, WHITE, PINK } from './kit/pixelroom/captions.js';
import { lineKeys } from './kit/ui.js';

const TL = await (await fetch('timeline.json')).json();
const Q = new URLSearchParams(location.search);
await captionFonts();
const R = buildRoom({ ssaa: +(Q.get('ss') ?? 1), bitPos: [-.55, 0, .65] });
const { scene, camera } = R;
const ov = document.getElementById('ov').getContext('2d');

// ---------------------------------------------------------------- times
const { L, w, DUR } = lineKeys(TL);
const K = {
  know: w('l01', 'know'), say: w('l01', 'say'), l02: L.l02.t0, one2: w('l02', 'one'),
  l03: L.l03.t0, words3: w('l03', 'words'), tokens3: w('l03', 'tokens'),
  l04: L.l04.t0, chopped: w('l04', 'chopped'), three: w('l04', 'three'), each: w('l04', 'each'),
  l05: L.l05.t0, scores: w('l05', 'scores'), every5: w('l05', 'every'), next: w('l05', 'next'),
  l06: L.l06.t0, mat: w('l06', 'mat'), p60: w('l06', '60'), floor: w('l06', 'floor'), p10: w('l06', '10'), moon: w('l06', 'moon'), zero: w('l06', 'zero'),
  l07: L.l07.t0, picks: w('l07', 'picks'), adds: w('l07', 'adds'), sentence: w('l07', 'sentence'), again: w('l07', 'again'),
  l08: L.l08.t0, hundreds: w('l08', 'hundreds'), answer: w('l08', 'answer'),
  l09: L.l09.t0, nobody: w('l09', 'nobody'), it9: w('l09', 'it'), always: w('l09', 'always'), pick: w('l09', 'pick'), top: w('l09', 'top'),
  l10: L.l10.t0, temperature: w('l10', 'temperature'), randomness: w('l10', 'randomness'), robot: w('l10', 'robot'),
  l11: L.l11.t0, same: w('l11', 'same'), different: w('l11', 'different'), time11: w('l11', 'time'),
  l12: L.l12.t0, token12: w('l12', 'token'), free: w('l12', 'free'), words12: w('l12', 'words'),
};
K.land1 = K.sentence + .05;                 // "mat" lands in the sentence
K.montage = [];                              // the fast loop: a token lands every 0.36 s through l08
for (let t = K.l08 + .1; t < K.hundreds + .9; t += .36) K.montage.push(+t.toFixed(3));
K.land2 = K.top + .7;                        // "floor" lands (not the top pick)
K.regen = []; for (let t = K.same; t < K.time11 + .3; t += .55) K.regen.push(+t.toFixed(3));
K.cta = K.l12 - .15;
const cl = x => Math.max(0, Math.min(1, x)), seg = (t, a, b) => cl((t - a) / (b - a)), lerp = (a, b, k) => a + (b - a) * k;
const eio = k => { k = cl(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }, eo = k => 1 - Math.pow(1 - cl(k), 3);
const sine = k => .5 - .5 * Math.cos(Math.PI * cl(k)), win = (t, a, b, fi = .25, fo = .25) => cl(Math.min((t - a) / fi, (b - t) / fo));
const backOut = k => { const c = 1.9; k = cl(k) - 1; return 1 + (c + 1) * k * k * k + c * k * k; };

// ---------------------------------------------------------------- the stage: a sentence in the air, three candidate bars on the rug
const SENT_Y = 1.48, SENT_Z = -.45, SLOT_X = .8, GAP = .035, BH = .15;
const BARS_X = [.15, .55, .95], BARS_Z = .3, BAR_SCALE = 1.25;
const blocks = {};   // one block mesh per word string (reused)
// one block per (word, colour, instance): the same word can sit in the sentence and on a bar at once
const blk = (txt, o = {}, inst = 0) => { const k = `${txt}|${o.ink || ''}|${inst}`; if (!blocks[k]) { const b = wordBlock(txt, { hM: BH, h: 32, size: 24, ...o }); b.visible = false; scene.add(b); blocks[k] = b; } return blocks[k]; };
const slot = wordBlock('?', { hM: BH, h: 32, size: 24, ink: LIME, edge: LIME, bg: '#0e1a08', glow: 1.4 }); slot.visible = false; scene.add(slot);
const SENT1 = ['The', 'cat', 'sat', 'on', 'the'];
const sentTimes = SENT1.map((_, i) => TL.lines.find(l => l.id === 'l06').words[i].t0 - .02);
const MONTAGE = ['and', 'purred', 'softly', 'as', 'the', 'rain', 'fell', 'outside', '.', 'Then', 'it', 'slept'];
const bars = BARS_X.map(() => { const b = growBar(LIME); scene.add(b.group); return b; });
bars.forEach((b, i) => b.group.position.set(BARS_X[i], 0, BARS_Z));
const cloud = cubeCloud(260); scene.add(cloud.mesh);
const thermo = thermometer(.85); thermo.group.position.set(-.12, 0, .15); thermo.group.visible = false; scene.add(thermo.group);

// What the sentence holds at time t: landed words (in order), the word in flight (if any), and the line's scroll position
function sentenceAt(t) {
  if (t < K.next - .05 || t >= K.cta) return null;
  if (t >= K.l09 - .2 && t < K.it9 - .1) return { ...sentenceAt(K.l09 - .21), fade: 1 - seg(t, K.l09 - .2, K.l09 + .1) };
  // phase 1: The cat sat on the | mat, then the loop
  if (t < K.it9 - .1) {
    const words = SENT1.map((s, i) => ({ s, at: sentTimes[i], drop: true }));
    const lands = [{ s: 'mat', at: K.land1, from: 0 }];
    K.montage.forEach((at, i) => lands.push({ s: MONTAGE[i % MONTAGE.length], at, from: i % 3, quick: true }));
    return { words, lands, fade: 1 };
  }
  // phase 2: the same start again; this time "floor" (10%) is picked
  if (t < K.l11 - .1) return { words: SENT1.map((s, i) => ({ s, at: K.it9 - .1 + i * .04, drop: true })), lands: [{ s: 'floor', at: K.land2, from: 1 }], fade: 1 };
  // phase 3: regenerate: the last word keeps changing
  const ends = ['mat', 'floor', 'rug', 'sofa', 'mat'], n = K.regen.filter(x => t >= x).length;
  return { words: SENT1.map(s => ({ s, at: -1 })), regen: ends[Math.min(ends.length - 1, n)], regenAt: K.regen[Math.max(0, n - 1)], fade: 1 };
}
const widthOf = s => blk(s).userData.w, SLOT_W = slot.userData.w;
function layoutSentence(t) {
  for (const k in blocks) blocks[k].visible = false; slot.visible = false;
  const S = sentenceAt(t); if (!S) return null;
  const landed = S.lands ? S.lands.filter(l => t >= l.at) : [], flying = S.lands ? S.lands.find(l => t < l.at && t >= l.at - (l.quick ? .3 : .75)) : null;
  const seq = [...S.words.map(x => x.s), ...landed.map(l => l.s)];
  // scroll: the slot sits at SLOT_X; after each landing the line slides left over 0.25 s
  const xs = []; let acc = 0; for (const s of seq) { const wd = widthOf(s); xs.push(acc + wd / 2); acc += wd + GAP; }
  const slotLine = n => { let a = 0; for (let i = 0; i < n; i++) a += widthOf(seq[i]) + GAP; return a + SLOT_W / 2; };
  let off = SLOT_X - slotLine(seq.length);
  const last = landed[landed.length - 1];
  if (last && t < last.at + .25) { const before = SLOT_X - slotLine(seq.length - 1); off = lerp(before, off, eio(seg(t, last.at, last.at + .25))); }
  const shown = [];
  seq.forEach((s, i) => {
    const b = blk(s, {}, 's' + i), src = i < S.words.length ? S.words[i] : null;
    let y = SENT_Y, sc = 1;
    if (src && src.at > -1) { if (t < src.at) return; const k = seg(t, src.at, src.at + .2); y += (1 - eo(k)) * .45; sc = .6 + .4 * backOut(k); }
    const x = xs[i] + off; if (x < -2.2) return;
    b.visible = true; b.position.set(x, y, SENT_Z); b.scale.setScalar(sc * S.fade); shown.push({ s, x, y });
  });
  if (S.regen) {   // the regenerated last word flips in
    const b = blk(S.regen, { ink: AMBER }, 'r'), k = seg(t, S.regenAt, S.regenAt + .18);
    b.visible = true; b.position.set(SLOT_X, SENT_Y, SENT_Z); b.scale.setScalar(.5 + .5 * backOut(k)); b.rotation.x = (1 - eo(k)) * Math.PI;
  } else {
    const pulse = 1 + .06 * Math.sin(t * 9);
    slot.visible = t >= K.next - .05 && !(flying && t > flying.at - .08); slot.position.set(SLOT_X, SENT_Y, SENT_Z); slot.scale.setScalar(pulse * eo(seg(t, K.next - .05, K.next + .2)) * S.fade);
  }
  return { S, flying, landed };
}

// candidates per moment: [word, share] for each bar; null = bars down
function candidatesAt(t) {
  const A = [['mat', .60], ['floor', .10], ['moon', .001]];
  if (t >= K.mat - .1 && t < K.again + .1) return { list: A, at: [K.mat, K.floor, K.moon], picked: t >= K.adds - .1 ? 0 : -1 };
  if (t >= K.l08 && t < K.l09 - .2) {   // the loop: candidates reshuffle for every token
    const i = Math.max(0, K.montage.filter(x => t >= x - .3).length - 1), m = K.montage[i];
    const next = MONTAGE[i % MONTAGE.length], alts = ['and', 'then', 'while', 'again', 'quietly', 'the', 'rain', 'loudly', 'sky', 'but'];
    const list = [[next, .35 + (i % 3) * .1], [alts[(i * 3 + 1) % alts.length], .12 + (i % 2) * .06], [alts[(i * 7 + 4) % alts.length], .04]];
    const ord = [0, 1, 2]; const from = i % 3; [ord[0], ord[from]] = [ord[from], ord[0]];
    return { list: ord.map(j => list[j]), at: [m - .3, m - .3, m - .3], picked: from, quick: true, pickAt: m - .3 };
  }
  if (t >= K.it9 - .1 && t < K.land2 + .3) return { list: A, at: [K.it9, K.it9 + .05, K.it9 + .1], picked: t >= K.top ? 1 : -1, reject: t >= K.top - .1 ? 0 : -1 };
  if (t >= K.land2 + .3 && t < K.l11 - .1) {   // after "floor": what comes next, and temperature flattens it
    const k = eio(seg(t, K.temperature, K.randomness + .4));
    return { list: [['.', lerp(.55, .34, k)], ['and', lerp(.25, .3, k)], ['purring', lerp(.03, .16, k)]], at: [K.land2 + .4, K.land2 + .45, K.land2 + .5], picked: -1, wobble: k };
  }
  return null;
}
const pct = s => s < .01 ? '≈0%' : `${Math.round(s * 100)}%`;
function layoutBars(t, flying) {
  const C = candidatesAt(t), labels = [];
  bars.forEach((b, i) => {
    if (!C) { b.set(0); return; }
    const [s, share] = C.list[i], k = eo(seg(t, C.at[i], C.at[i] + (C.quick ? .15 : .35))), down = t >= K.again && t < K.again + .1 ? 0 : 1;
    const wob = C.wobble ? 1 + .12 * Math.sin(t * 11 + i * 2) * C.wobble : 1;
    const hgt = Math.max(.02, share * BAR_SCALE * k * down * wob); b.set(hgt);
    const pickedHere = C.picked === i, inFlight = flying && pickedHere && t >= flying.at - (flying.quick ? .3 : .75);
    const blkOn = blk(s, C.reject === i ? { ink: '#ff5a6a' } : {}, 'c' + i);
    if (!inFlight && !(pickedHere && C.quick && t >= C.pickAt + .3) && k > 0) {
      blkOn.visible = true; blkOn.position.set(BARS_X[i], hgt + BH / 2 + .02, BARS_Z); blkOn.scale.setScalar(.4 + .6 * backOut(k));
      blkOn.rotation.z = C.reject === i ? Math.sin(t * 30) * .08 * (1 - seg(t, K.top, K.top + .6)) : 0;
    }
    if (k > .3) labels.push({ p: new THREE.Vector3(BARS_X[i], hgt + BH + .1, BARS_Z), txt: pct(share * wob), hot: pickedHere && !C.quick, a: k, rej: C.reject === i });
  });
  // the word in flight: from the top of its bar to the slot, on an arc
  if (flying) {
    const span = flying.quick ? .3 : .75, fi = flying.from, C2 = candidatesAt(flying.at - span + .01) || C, share = C2 ? C2.list[fi]?.[1] ?? .3 : .3;
    const k = eio(seg(t, flying.at - span, flying.at));
    const a = new THREE.Vector3(BARS_X[fi], Math.max(.02, share * BAR_SCALE) + BH / 2 + .02, BARS_Z), b = new THREE.Vector3(SLOT_X, SENT_Y, SENT_Z);
    const c = a.clone().lerp(b, .5); c.y += .5;
    const p = a.clone().multiplyScalar((1 - k) * (1 - k)).add(c.multiplyScalar(2 * (1 - k) * k)).add(b.clone().multiplyScalar(k * k));
    const fb = blk(flying.s, {}, 'f'); fb.visible = true; fb.position.copy(p); fb.scale.setScalar(1 + .25 * Math.sin(Math.PI * k)); fb.rotation.z = 0;
  }
  return labels;
}

// ---------------------------------------------------------------- camera
const CAM = {
  hook0: [-.05, .55, -.45, .36, 3.6, 6.9], hook1: [-.05, .55, -.45, .24, 3.25, 5.9], swing: [-.05, .55, -.45, .1, 3.2, 5.7],
  mon: [1.0, 1.24, -1.85, 0, 1.45, 3.5], mon2: [1.0, 1.24, -1.85, 0, 1.43, 3.25],
  stage: [.1, 1.0, -.1, .16, 2.55, 5.6], stage2: [.12, 1.0, -.1, .02, 2.45, 5.2], high: [.15, .25, .1, .3, 5.4, 6.2],
  bit: [-.55, .62, .65, .3, 1.15, 2.4], stage3: [.1, 1.0, -.1, -.14, 2.6, 5.5], cta: [-.1, .7, -.3, .1, 3.0, 6.8],
};
const mixC = (A, B, k) => A.map((x, i) => lerp(x, B[i], k));
function camAt(t) {
  const at = (a, b, ta, tb, f = eio) => mixC(CAM[a], CAM[b], f(seg(t, ta, tb)));
  if (t < K.l02 - .3) return at('hook0', 'hook1', 0, K.l02, sine);
  if (t < K.l03 - .35) return at('hook1', 'swing', K.l02 - .3, K.l02 + .4);
  if (t < K.l05) return t < K.l03 + .7 ? at('swing', 'mon', K.l03 - .35, K.l03 + .7) : at('mon', 'mon2', K.l03 + .7, K.l05, sine);
  if (t < K.l08) return t < K.l05 + 1.8 ? at('mon2', 'stage', K.l05, K.l05 + 1.8, eo) : at('stage', 'stage2', K.l05 + 1.8, K.l08, sine);
  if (t < K.l09) return at('stage2', 'high', K.l08, K.l08 + 1.6);
  if (t < K.it9 - .3) return at('high', 'bit', K.l09, K.l09 + .9);
  if (t < K.l11) return at('bit', 'stage3', K.it9 - .3, K.it9 + .5);
  if (t < K.cta - .2) return at('stage3', 'stage2', K.l11, K.cta, sine);
  return at('stage2', 'cta', K.cta - .2, K.cta + .8);
}

// ---------------------------------------------------------------- BIT's acting
function bitAt(t) {
  if (t >= K.cta) return ['happy', 'wave'];
  if (t >= K.robot - .05 && t < K.l11) return ['flat', 'down'];
  if (t >= K.pick - .1 && t < K.land2 + .4) return ['eyes', 'up'];
  if (t >= K.nobody - .1 && t < K.it9) return ['wide', 'down'];
  if (t >= K.l08 && t < K.l09) return ['dots', 'down'];
  if (t >= K.picks - .05 && t < K.land1 + .4) return ['eyes', 'up'];
  if (t >= K.next - .1 && t < K.l07) return ['q', 'down'];
  if (t >= K.one2 - .05 && t < K.l03) return ['eyes', 'up'];
  if (t >= K.know - .05 && t < K.l02) return ['q', 'down'];
  return ['eyes', 'down'];
}

// ---------------------------------------------------------------- the monitor: a tokenizer, then a chat that grows
const TOK = [['Token', '#b08cff'], ['ization', '#7ee08a'], [' is', '#ffb36b'], [' unbeliev', '#6cc8ff'], ['ably', '#ff8fb8'], [' weird', '#e6e07a']];
function screen(t, g, W, H) {
  if (t < K.l03 - .6 || t > K.l05 + 2.5) {   // a chat window: the sentence the stage is writing
    g.fillStyle = '#0a0818'; g.fillRect(0, 0, W, H); g.fillStyle = '#1d1834'; g.fillRect(0, 0, W, 26);
    g.font = '600 14px Montserrat'; g.fillStyle = '#a99cff'; g.fillText('chat', 12, 18);
    const S = t > K.l05 ? layoutText(t) : 'Write me a sentence about a cat.';
    g.fillStyle = '#2a2250'; g.fillRect(20, 50, W - 40, 120); g.font = '700 22px Montserrat'; g.fillStyle = '#f4f1ff';
    wrapText(g, S + (Math.floor(t * 3) % 2 ? '▌' : ''), 34, 84, W - 68, 28);
    return;
  }
  g.fillStyle = '#0c0a1e'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#1d1834'; g.fillRect(0, 0, W, 30); g.font = '600 15px Montserrat'; g.fillStyle = '#a99cff'; g.fillText('TOKENIZER', 14, 21);
  g.font = '600 12px Montserrat'; g.fillStyle = '#6e6888'; g.textAlign = 'right'; g.fillText('ILLUSTRATION', W - 12, 20); g.textAlign = 'left';
  const typed = 'Tokenization is unbelievably weird', nType = Math.round(typed.length * seg(t, K.l03 - .3, K.words3 + .2));
  g.font = '800 26px Montserrat';
  if (t < K.tokens3) { g.fillStyle = '#f4f1ff'; g.fillText(typed.slice(0, nType) + (Math.floor(t * 3) % 2 ? '▌' : ''), 20, 84); }
  else {   // the chips: each token gets its own colour
    let x = 20, y = 84;
    TOK.forEach(([s, c], i) => {
      const k = seg(t, K.tokens3 + i * .07, K.tokens3 + i * .07 + .12), wd = g.measureText(s).width;
      if (x + wd > W - 20) { x = 20; y += 44; }
      g.globalAlpha = .35 + .65 * k; g.fillStyle = c; g.fillRect(x - 2, y - 26 - 4 * (1 - k), wd + 4, 34); g.globalAlpha = 1;
      g.fillStyle = '#0c0a1e'; g.fillText(s, x, y - 4 * (1 - k)); x += wd + 6;
    });
    const ck = seg(t, K.chopped, K.chopped + .3);
    if (ck > 0) { g.globalAlpha = ck; g.font = '700 17px Montserrat'; g.fillStyle = '#a99cff'; g.fillText('4 words  →  6 tokens', 20, 160); g.globalAlpha = 1; }
    const tk = seg(t, K.three, K.three + .25);
    if (tk > 0) { g.globalAlpha = tk; g.font = '900 30px Montserrat'; g.fillStyle = LIME; g.fillText('1 token ≈ ¾ of a word', 20, 205); g.globalAlpha = 1; }
    const ek = seg(t, K.each, K.each + .25);
    if (ek > 0) { g.globalAlpha = ek; g.font = '600 15px Montserrat'; g.fillStyle = '#c8c0ff'; g.fillText('100 tokens ≈ 75 words (English, on average)', 20, 234); g.globalAlpha = 1; }
  }
}
function layoutText(t) { const S = sentenceAt(t); if (!S) return 'The cat sat on the'; const parts = [...S.words.filter(x => x.at < 0 || t >= x.at).map(x => x.s), ...(S.lands || []).filter(l => t >= l.at).map(l => l.s)]; if (S.regen) parts.push(S.regen); return parts.join(' ').replace(' .', '.'); }
function wrapText(g, s, x, y, maxW, lh) { const ws = s.split(' '); let line = ''; for (const wd of ws) { const test = line ? line + ' ' + wd : wd; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); y += lh; line = wd; } else line = test; } g.fillText(line, x, y); }

// ---------------------------------------------------------------- the cloud: "every token it knows"
const MONC = new THREE.Vector3(1.0, 1.24, -1.83), CC = new THREE.Vector3(.25, 1.25, -.15);
function cloudAt(t) {
  if (t < K.scores - .1 || t > K.mat + .6) { cloud.update(() => null); return; }
  const slotP = new THREE.Vector3(SLOT_X, SENT_Y, SENT_Z), gather = eio(seg(t, K.next - .2, K.next + .5)), gone = seg(t, K.mat, K.mat + .5);
  cloud.update(i => {
    const u = eo(seg(t, K.scores + i * .006, K.scores + i * .006 + 1.1)); if (u <= 0) return null;
    const th = i * 2.399 + t * (.8 + (i % 5) * .08), r = .55 + (i % 7) * .09, yy = ((i % 13) / 13 - .5) * 1.3;
    const sw = [CC.x + Math.cos(th) * r, CC.y + yy + Math.sin(t * 2 + i) * .04, CC.z + Math.sin(th) * r * .6];
    const p = [lerp(MONC.x, sw[0], u), lerp(MONC.y, sw[1], u), lerp(MONC.z, sw[2], u)];
    const q = [lerp(p[0], slotP.x, gather * .85), lerp(p[1], slotP.y, gather * .85), lerp(p[2], slotP.z, gather * .85)];
    const s = (1 - gone) * (1 - gather * .6) * (.8 + .4 * ((i * 7) % 3) / 2);
    return s > .02 ? [...q, s] : null;
  });
}

// ---------------------------------------------------------------- captions (kinetic) and overlays
const C = (rows, o = {}) => ({ x: 84, y: 300, rows, ...o });
const BLOCKS = {
  l01: C([[[0, 'black', 124]], [[1, 'light', 76]], [[2, 'cond', 236, LIME, 'KNOW']], [[3, 'light', 64], [4, 'light', 64], [5, 'light', 64]], [[6, 'light', 64], [7, 'script', 150, AMBER]]]),
  l02: C([[[0, 'light', 76], [1, 'black', 124]], [[2, 'cond', 280, LIME, 'ONE']], [[3, 'bold', 82], [4, 'bold', 82], [5, 'bold', 82], [6, 'bold', 82]]]),
  l03: C([[[0, 'light', 64], [1, 'light', 64], [2, 'light', 64], [3, 'black', 100]], [[4, 'cond', 200, LIME, 'TOKENS.']]]),
  l04: [C([[[0, 'light', 60], [1, 'light', 60], [2, 'light', 60]], [[3, 'cond', 170, LIME, 'CHOPPED']], [[4, 'bold', 66], [5, 'bold', 66]]]),
    C([[[6, 'light', 64]], [[7, 'cond', 190, LIME, '3/4']], [[9, 'light', 64], [10, 'light', 64], [11, 'script', 110, AMBER], [12, 'light', 64]]])],
  l05: [C([[[0, 'light', 60], [1, 'light', 60], [2, 'black', 110]], [[3, 'cond', 170, LIME, 'EVERY']], [[4, 'bold', 70], [5, 'light', 70], [6, 'bold', 70]]]),
    C([[[7, 'light', 60], [8, 'light', 60], [9, 'light', 60], [10, 'light', 60]], [[11, 'black', 110], [12, 'black', 110]], [[13, 'cond', 190, LIME, 'NEXT?']]])],
  l07: C([[[0, 'light', 64], [1, 'black', 110], [2, 'light', 64]], [[3, 'light', 60], [4, 'light', 60], [5, 'light', 60], [6, 'light', 60], [7, 'bold', 72]], [[8, 'light', 64], [9, 'light', 64], [10, 'light', 64]], [[11, 'cond', 150, LIME, 'ALL'], [12, 'cond', 150, LIME, 'AGAIN.']]]),
  l08: [C([[[0, 'light', 64], [1, 'light', 64], [2, 'bold', 80], [3, 'bold', 80]]]), C([[[4, 'cond', 210, LIME, 'HUNDREDS']], [[5, 'light', 64], [6, 'light', 64], [7, 'light', 64], [8, 'script', 120, AMBER]]])],
  l09: [C([[[0, 'light', 64], [1, 'light', 64], [2, 'light', 64]], [[3, 'cond', 230, PINK, 'NOBODY']], [[4, 'bold', 80], [5, 'bold', 80]]]),
    C([[[6, 'light', 64], [7, 'black', 110]], [[8, 'cond', 200, LIME, 'ALWAYS']], [[9, 'light', 64], [10, 'light', 64], [11, 'script', 120, AMBER], [12, 'light', 64]]])],
  l10: [C([[[0, 'light', 60], [1, 'light', 60], [2, 'light', 60]], [[3, 'cond', 170, AMBER, 'TEMPERATURE']], [[4, 'light', 60], [5, 'light', 60], [6, 'light', 60], [7, 'script', 100, LIME]]]),
    C([[[8, 'light', 64], [9, 'light', 64], [10, 'black', 100]], [[11, 'light', 64], [12, 'light', 64], [13, 'light', 64]], [[14, 'cond', 200, LIME, 'ROBOT.']]])],
  l11: [C([[[0, 'light', 64], [1, 'light', 64]], [[2, 'light', 64], [3, 'cond', 190, LIME, 'SAME'], [4, 'bold', 76]]]),
    C([[[5, 'light', 64], [6, 'light', 64], [7, 'light', 64]], [[8, 'script', 140, AMBER]], [[9, 'bold', 76], [10, 'light', 64], [11, 'bold', 76]]])],
};
const caps = makeCaptions(TL, BLOCKS);
const _v = new THREE.Vector3();
const toScreen = p => { _v.copy(p).project(camera); return [(_v.x * .5 + .5) * 1080, (-_v.y * .5 + .5) * 1920]; };
function label(g, txt, x, y, o = {}) {
  g.save(); g.font = o.font || '900 52px Montserrat'; g.textAlign = o.align || 'center'; g.textBaseline = 'alphabetic'; g.globalAlpha = o.a ?? 1;
  g.shadowColor = 'rgba(6,2,16,.8)'; g.shadowBlur = 18; g.shadowOffsetY = 6; g.fillStyle = o.col || WHITE; g.fillText(txt, x, y); g.restore();
}
function overlays(g, t, labels) {
  for (const L of labels) { const [x, y] = toScreen(L.p); label(g, L.txt, x, y, { a: L.a, col: L.rej ? '#ff5a6a' : L.hot ? LIME : WHITE, font: L.hot ? '900 60px Montserrat' : '800 46px Montserrat' }); }
  // the loop counter
  const ca = win(t, K.l08, K.l09 - .1, .2, .3);
  if (ca > 0) {
    const n = 7 + K.montage.filter(x => t >= x).length, big = seg(t, K.hundreds, K.hundreds + .7);
    const shown = big > 0 ? Math.round(lerp(n, 400, eo(big))) : n;
    label(g, 'TOKEN', 540, 1330, { a: ca, font: '800 40px Montserrat', col: '#c8c0ff' });
    label(g, `#${shown}`, 540, 1470, { a: ca, font: '400 150px Anton', col: big >= 1 ? LIME : WHITE });
  }
  // regenerate: ↻ flashes on every new ending
  if (t >= K.same && t < K.cta) { const n = K.regen.filter(x => t >= x).length, last = K.regen[Math.max(0, n - 1)], f = 1 - seg(t, last, last + .4); if (n) label(g, `↻ answer ${n}`, 540, 1290, { a: .5 + .5 * f, font: '800 48px Montserrat', col: AMBER }); }
  // the call to action: a comment being typed
  const k = seg(t, K.cta, K.cta + .4); if (k <= 0) return;
  const a = win(t, K.cta, DUR + 1, .25, .25);
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(10,6,22,.82)'; roundRect(g, 90, 520, 900 * eo(k * 1.3), 640, 28); g.fill();
  g.strokeStyle = 'rgba(143,108,240,.7)'; g.lineWidth = 3; g.stroke(); g.restore();
  label(g, 'Comment', 540, 660, { a: a * seg(t, K.cta + .1, K.cta + .35), font: '800 70px Montserrat' });
  label(g, 'TOKEN', 540, 860, { a: a * seg(t, K.token12 - .05, K.token12 + .2), font: '400 230px Anton', col: LIME });
  // the input box, typing
  const typed = 'TOKEN'.slice(0, Math.round(5 * seg(t, K.token12 + .3, K.token12 + 1.0)));
  g.save(); g.globalAlpha = a; g.fillStyle = '#1a1430'; roundRect(g, 150, 920, 780, 96, 48); g.fill(); g.strokeStyle = 'rgba(244,241,255,.25)'; g.lineWidth = 2; g.stroke();
  g.font = '700 44px Montserrat'; g.fillStyle = WHITE; g.textAlign = 'left'; g.fillText(typed + (Math.floor(t * 3) % 2 ? '|' : ''), 200, 985);
  g.fillStyle = LIME; g.beginPath(); g.arc(870, 968, 34, 0, 7); g.fill(); g.strokeStyle = '#0a0618'; g.lineWidth = 6; g.beginPath(); g.moveTo(852, 968); g.lineTo(886, 968); g.moveTo(872, 952); g.lineTo(888, 968); g.lineTo(872, 984); g.stroke(); g.restore();
  label(g, '→ a free tokenizer tool, in your DMs', 540, 1090, { a: a * seg(t, K.free, K.free + .3), font: '600 40px Montserrat', col: '#c8c0ff' });
  label(g, 'FOLLOW FOR DAILY AI, EXPLAINED', 540, 1130 + 30, { a: a * seg(t, K.words12, K.words12 + .4), font: '800 30px Montserrat', col: AMBER });
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// ---------------------------------------------------------------- sound events (score + effects library)
window.EV = (() => {
  const E = [], ev = (t, type, o = {}) => E.push({ t: +(+t).toFixed(3), type, ...o });
  ev(0, 'scramble', { t1: .3 }); ev(K.know, 'lock', { first: true }); ev(K.say, 'confirm'); ev(K.one2, 'dock');
  ev(K.l03 - .35, 'whip'); ev(K.l03 - .2, 'roll', { t1: K.words3 + .2 });
  TOK.forEach((_, i) => ev(K.tokens3 + i * .07, 'pulse', { dir: i % 2 ? -1 : 1 })); ev(K.three, 'confirm');
  ev(K.chopped, 'pulse', { dir: 1 }); ev(K.each, 'dock');
  ev(K.scores, 'scan', { t1: K.scores + 1.4 }); for (let i = 0; i < 5; i++) ev(K.scores + 1.5 + i * .5, 'hover'); ev(K.next, 'marker');
  sentTimes.forEach(x => ev(x, 'dock'));
  [K.mat, K.floor].forEach(x => ev(x, 'roll', { t1: x + .3 })); ev(K.p60, 'lock'); ev(K.p10, 'confirm'); ev(K.moon + .1, 'deny');
  ev(K.picks, 'probe'); ev(K.land1 - .4, 'whip'); ev(K.land1, 'confirm', { hard: true }); ev(K.again, 'shrink');
  ev(K.l08, 'roll', { t1: K.hundreds, count: true }); K.montage.forEach((x, i) => i % 2 || ev(x, 'dock')); ev(K.hundreds + .7, 'lock');
  ev(K.l09 - .2, 'shrink'); ev(K.nobody, 'card');
  ev(K.always, 'ignite'); ev(K.top, 'error'); ev(K.land2 - .4, 'whip'); ev(K.land2, 'confirm');
  ev(K.temperature, 'scan', { t1: K.randomness + .4 }); for (let i = 0; i < 4; i++) ev(K.randomness + i * .22, 'wifi', { dir: i % 2 ? -1 : 1 }); ev(K.robot, 'off');
  K.regen.forEach(x => ev(x, 'shrink'));
  ev(K.cta, 'card'); ev(K.token12, 'cta'); ev(K.token12 + .3, 'roll', { t1: K.token12 + 1.0 }); ev(K.free + .1, 'confirm', { final: true }); ev(K.words12 + .2, 'dock'); ev(K.words12 + 1.6, 'hover');
  return E.sort((a, b) => a.t - b.t);
})();

// ---------------------------------------------------------------- one frame
window.DUR = DUR;
window.TEXTS = t => {
  const out = [], box = (id, text, y0, y1) => out.push({ id, text, x0: 90, y0, x1: 990, y1 });
  if (t > K.tokens3 + .5 && t < K.l05 + .4) box('chips', 'Token ization is unbeliev ably weird', 700, 1200);
  if (t > K.three + .25 && t < K.l05 + .4) box('rule', '1 token ≈ ¾ of a word', 700, 1200);
  if (t > K.p60 && t < K.again) box('p60', '60%', 1000, 1300);
  if (t > K.cta + 1) box('cta', 'Comment TOKEN', 600, 900);
  return out;
};
window.render = t => {
  const c = camAt(t); R.look(c[0], c[1], c[2], c[3], c[4], c[5]);
  const [face, arm] = bitAt(t); R.bit.set(t, face, arm, camera);
  const S = layoutSentence(t), labels = layoutBars(t, S?.flying);
  cloudAt(t);
  const th = t >= K.temperature - .2 && t < K.l11 - .1; thermo.group.visible = th; if (th) { thermo.set(lerp(.15, .85, eio(seg(t, K.temperature, K.randomness + .3)))); thermo.group.scale.setScalar(eo(seg(t, K.temperature - .2, K.temperature + .1))); }
  const onMon = t > K.l03 && t < K.l05 + .6, focusP = onMon ? MONC : (S && t > K.next ? new THREE.Vector3(.4, 1.1, -.1) : null);
  const monK = Math.max(0, Math.min(1, seg(t, K.l03 - .35, K.l03 + .5) - seg(t, K.l05, K.l05 + 1)));
  R.frame(t, { screen: (tt, g, W, H) => screen(tt, g, W, H), focus: focusP ? camera.position.distanceTo(focusP) : undefined, aper: onMon ? 90 : 150,
    screenGlow: lerp(1.6, .5, monK), bloom: lerp(.6, .22, monK), bloomThreshold: lerp(.8, 1.1, monK), lampGlow: lerp(1, .35, monK) });
  caps.draw(ov, t, { alpha: t >= K.cta ? 0 : 1 });
  overlays(ov, t, labels);
};
window.READY = true;
