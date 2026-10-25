// Kinetic captions for Pixel Room reels: each spoken word pops in on its own beat, laid out as a stacked type composition.
// Styles: black (Montserrat 900), bold (800), light (500), cond (Anton, punch words), script (Caveat, feeling words).
// BLOCKS = { l01: { x, y, rows: [[[wordIndex, style, size, colour, label?], ...], ...], align?: 'left' | 'center', until? }, ... }
export const WHITE = '#f4f1ff', LIME = '#8bff47', AMBER = '#ffc061', PINK = '#ff7ab6';
const F = { black: s => `900 ${s}px Montserrat`, bold: s => `800 ${s}px Montserrat`, light: s => `500 ${s}px Montserrat`, cond: s => `400 ${s}px Anton`, script: s => `700 ${s}px Caveat` };
export async function captionFonts() {
  await Promise.all(['900 40px Montserrat', '800 40px Montserrat', '500 40px Montserrat', '400 40px Anton', '700 40px Caveat'].map(f => document.fonts.load(f)));
}
const backOut = k => { const c = 1.9; k -= 1; return 1 + (c + 1) * k * k * k + c * k * k; };
const cl = x => Math.max(0, Math.min(1, x));
// A line may be split into parts (an array of blocks); each part shows from its first word until the next part (or line) begins.
// Words a block doesn't list are spoken but not shown.
export function makeCaptions(TL, BLOCKS) {
  const cache = {}, parts = [];
  TL.lines.forEach((L, li) => {
    const B = BLOCKS[L.id]; if (!B) return;
    const list = Array.isArray(B) ? B : [B], next = TL.lines[li + 1];
    list.forEach((b, pi) => {
      const first = Math.min(...b.rows.flat().map(r => r[0])), nb = list[pi + 1];
      const t0 = li === 0 && pi === 0 ? -1 : L.words[first].t0 - .1;
      const t1 = b.until ?? (nb ? L.words[Math.min(...nb.rows.flat().map(r => r[0]))].t0 - .12 : next ? next.t0 - .12 : TL.dur + 1);
      parts.push({ L, b, key: `${L.id}:${pi}`, t0, t1 });
    });
  });
  function layout(ctx, P) {
    if (cache[P.key]) return cache[P.key];
    const { L, b: B } = P, out = []; let y = B.y;
    for (const row of B.rows) {
      const h = Math.max(...row.map(r => r[2])); y += h * (row.some(r => r[1] === 'cond') ? .86 : .92);
      const items = row.map(([i, f, s, col, lab]) => { ctx.font = F[f](s); const txt = lab ?? L.words[i].w; return { i, txt, font: F[f](s), wd: ctx.measureText(txt).width, size: s, col: col ?? WHITE, t0: L.words[i].t0 - .04 }; });
      const total = items.reduce((a, w) => a + w.wd, 0) + items.slice(1).reduce((a, w) => a + w.size * .26, 0);
      let x = B.align === 'center' ? 540 - total / 2 : (B.x ?? 84);
      for (const w of items) { out.push({ ...w, x, y, accent: w.col !== WHITE }); x += w.wd + w.size * .26; }
      y += 6;
    }
    return (cache[P.key] = out);
  }
  return {
    draw(ctx, t, o = {}) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      for (const P of parts) {
        if (t < P.t0 || t > P.t1) continue;
        const exitK = cl((t - (P.t1 - .16)) / .16);
        for (const w of layout(ctx, P)) {
          const k = w.t0 < .4 ? 1 : cl((t - w.t0) / .16); if (k <= 0) continue;   // a word spoken in the first 0.4 s is there from frame 0 (the hook frame)
          const s = .55 + .45 * backOut(k), a = cl(k * 3) * (1 - exitK) * (o.alpha ?? 1);
          ctx.save(); ctx.translate(w.x + w.wd / 2, w.y - w.size * .32 - exitK * 40); ctx.scale(s, s); ctx.translate(-w.wd / 2, w.size * .32);
          ctx.font = w.font; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = a;
          ctx.shadowColor = 'rgba(6,2,16,.75)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 8;
          ctx.fillStyle = w.col; ctx.fillText(w.txt, 0, 0);
          if (w.accent) { ctx.shadowColor = w.col; ctx.shadowBlur = 22; ctx.shadowOffsetY = 0; ctx.globalAlpha = a * .45; ctx.fillText(w.txt, 0, 0); }
          ctx.restore();
        }
      }
    },
  };
}
