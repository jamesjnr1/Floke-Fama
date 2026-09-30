// Screenshots the prototype at common breakpoints and fails on horizontal overflow or broken images.
// Usage: npm run qa   → writes PNGs to qa/
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { launch } from './browser.mjs';

const url = pathToFileURL(resolve('site/index.html')).href;
const sizes = [[360, 780], [390, 844], [768, 1024], [1024, 768], [1440, 900]];
await mkdir('qa', { recursive: true });
const browser = await launch();
let failed = false;
for (const [w, h] of sizes) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(url, { waitUntil: 'networkidle' });
  // Reveal everything so full-page screenshots show all content
  await page.evaluate(() => { document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible')); document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }); });
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - innerWidth,
    broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src')),
    wide: [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed').slice(0, 3).map((el) => el.className || el.tagName),
  }));
  const ok = r.overflow <= 0 && r.broken.length === 0;
  if (!ok) failed = true;
  console.log(`${ok ? '✔' : '✘'} ${w}×${h}  overflow=${r.overflow}px  broken=${r.broken.length}${r.overflow > 0 ? '  wide: ' + r.wide.join(', ') : ''}`);
  await page.screenshot({ path: `qa/home-${w}.png`, fullPage: true });
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
