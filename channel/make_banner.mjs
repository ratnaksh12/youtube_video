// channel/make_banner.mjs — composes the YouTube banner (2560x1440) from the generated art in banner_base.png:
// the art is framed so the figures + sunset sit in the safe strip (2560x423 desktop, 1546x423 phones),
// and the channel name + tagline are set as dark silhouettes with an amber rim, like the figures.
//   node channel/make_banner.mjs [--guides]
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDIO = path.join(HERE, '..', 'aitrends-2d-studio');
const { chromium } = createRequire(path.join(STUDIO, 'package.json'))('playwright');
const guides = process.argv.includes('--guides');
const F = (p) => 'file://' + path.join(STUDIO, 'node_modules', '@fontsource', p);

const CFG = { artW: 2600, artX: -20, artY: 0, titleY: 572, tagY: 630 };   // art framing + text centres (px)

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Fredoka; font-weight: 700; src: url(${F('fredoka/files/fredoka-latin-700-normal.woff2')}); }
@font-face { font-family: Nunito; font-weight: 900; src: url(${F('nunito/files/nunito-latin-900-normal.woff2')}); }
html, body { margin: 0; width: 2560px; height: 1440px; overflow: hidden; background: #0b0814; }
#art { position: absolute; inset: 0; background: url(banner_base.png) ${CFG.artX}px ${CFG.artY}px / ${CFG.artW}px auto no-repeat; }
.title, .tag { position: absolute; left: 0; width: 2560px; text-align: center; transform: translateY(-50%); white-space: nowrap; color: #0e0b12; }
.title { top: ${CFG.titleY}px; font: 700 112px Fredoka; letter-spacing: 16px;
  text-shadow: 0 0 2px #ffe9c8, 0 0 3px #ffe9c8, -3px -3px 0 #ffd59a, 3px -3px 0 #ffd59a, 0 0 28px rgba(255,170,80,.85), 0 0 70px rgba(255,140,60,.55); }
.tag { top: ${CFG.tagY}px; font: 900 30px Nunito; letter-spacing: 8px;
  text-shadow: 0 0 2px #ffe9c8, -2px -2px 0 #ffd59a, 2px -2px 0 #ffd59a, 0 0 18px rgba(255,170,80,.9), 0 0 40px rgba(255,140,60,.5); }
.g { position: absolute; border: 4px dashed; box-sizing: border-box; }
</style></head><body>
<div id="art"></div>
<div class="title">INKVERSE</div>
<div class="tag">BIG MOVIE UNIVERSES, EXPLAINED IN ANIMATION</div>
${guides ? `<div class="g" style="left:0;top:508px;width:2560px;height:423px;border-color:#5dff8a"></div>
<div class="g" style="left:507px;top:508px;width:1546px;height:423px;border-color:#ff4a6a"></div>` : ''}
</body></html>`;

const pageFile = path.join(HERE, '_banner.html');
fs.writeFileSync(pageFile, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 2560, height: 1440 } });
await page.goto('file://' + pageFile);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const out = path.join(HERE, guides ? 'banner_guides.png' : 'banner_2560x1440.png');
await page.screenshot({ path: out });
await browser.close();
fs.unlinkSync(pageFile);
console.log('wrote', out);
