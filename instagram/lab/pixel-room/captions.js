// Kinetic captions: each spoken word pops in on its own beat, laid out as a stacked type composition (bold / light / condensed / script)
const WHITE = '#f4f1ff', LIME = '#8bff47', WARM = '#ffc061';
const F = {
  black: s => `900 ${s}px Montserrat`, light: s => `500 ${s}px Montserrat`, bold: s => `800 ${s}px Montserrat`,
  cond: s => `400 ${s}px Anton`, script: s => `700 ${s}px Caveat`,
};
// one block per voice line; rows of [word index in the line, font, size, colour]
const BLOCKS = {
  l01: { x: 84, y: 360, rows: [
    [[0, 'black', 124, WHITE]],
    [[1, 'light', 76, WHITE]],
    [[2, 'cond', 236, LIME]],
    [[3, 'light', 64, WHITE], [4, 'light', 64, WHITE], [5, 'light', 64, WHITE]],
    [[6, 'light', 64, WHITE], [7, 'script', 150, WARM]],
  ] },
  l02: { x: 84, y: 380, rows: [
    [[0, 'light', 76, WHITE], [1, 'black', 124, WHITE]],
    [[2, 'cond', 280, LIME]],
    [[3, 'bold', 82, WHITE], [4, 'bold', 82, WHITE], [5, 'bold', 82, WHITE], [6, 'bold', 82, WHITE]],
  ] },
};
const LABEL = { 2: 'KNOW', 'l02:2': 'ONE' };
export async function captionsReady() {
  await Promise.all(['900 40px Montserrat', '500 40px Montserrat', '800 40px Montserrat', '400 40px Anton', '700 40px Caveat'].map(f => document.fonts.load(f)));
}
const backOut = k => { const c = 1.9; k -= 1; return 1 + (c + 1) * k * k * k + c * k * k; };
const cl = x => Math.max(0, Math.min(1, x));
function layout(ctx, L, B) {
  const out = []; let y = B.y;
  for (const row of B.rows) {
    const h = Math.max(...row.map(r => r[2])); y += h * (row[0][1] === 'cond' ? .86 : .92);
    let x = B.x;
    for (const [i, f, s, col] of row) {
      const word = L.words[i], txt = LABEL[L.id === 'l01' ? i : `${L.id}:${i}`] || word.w;
      ctx.font = F[f](s); const wd = ctx.measureText(txt).width;
      out.push({ txt, x, y, wd, font: F[f](s), col, t0: word.t0 - .04, size: s, accent: col !== WHITE });
      x += wd + s * .26;
    }
    y += 6;
  }
  return out;
}
export function drawCaptions(ctx, TL, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  TL.lines.forEach((L, li) => {
    const next = TL.lines[li + 1], t0 = li ? L.t0 - .1 : -1, t1 = next ? next.t0 - .12 : TL.dur + 1;
    if (t < t0 || t > t1) return;
    const exitK = cl((t - (t1 - .16)) / .16), B = BLOCKS[L.id];
    for (const w of layout(ctx, L, B)) {
      const k = w.t0 < .4 ? 1 : cl((t - w.t0) / .16); if (k <= 0) continue;   // the first word is on screen from frame 0 (the hook frame)
      const s = .55 + .45 * backOut(k), a = cl(k * 3) * (1 - exitK);
      ctx.save(); ctx.translate(w.x + w.wd / 2, w.y - w.size * .32 - exitK * 40); ctx.scale(s, s); ctx.translate(-w.wd / 2, w.size * .32);
      ctx.font = w.font; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = a;
      ctx.shadowColor = 'rgba(6,2,16,.7)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
      ctx.fillStyle = w.col; ctx.fillText(w.txt, 0, 0);
      if (w.accent) { ctx.shadowColor = w.col; ctx.shadowBlur = 22; ctx.shadowOffsetY = 0; ctx.globalAlpha = a * .45; ctx.fillText(w.txt, 0, 0); }
      ctx.restore();
    }
  });
}
export function captionTexts(TL, t) {
  const out = [];
  TL.lines.forEach((L, li) => {
    const next = TL.lines[li + 1], t1 = next ? next.t0 - .28 : TL.dur;
    const last = L.words[L.words.length - 1].t0 + .2;
    if (t > last && t < t1) out.push({ id: L.id, text: L.sub, x0: 84, y0: 360, x1: 1000, y1: 1100 });
  });
  return out;
}
