// Renders every flyer template in flyers/templates/ to a crisp PNG in flyers/export/.
// Usage: npm run flyers                 → export all
//        npm run flyers -- expert-tip   → export templates whose name contains "expert-tip"
// og-image.html is also copied to site/assets/img/og-image.jpg (the link-preview image).
import { readdir, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from './browser.mjs';

const dir = 'flyers/templates';
const filter = process.argv[2] || '';
const files = (await readdir(dir)).filter((f) => f.endsWith('.html') && f.includes(filter));
await mkdir('flyers/export', { recursive: true });

const browser = await launch();
for (const file of files) {
  const name = file.replace('.html', '');
  const isOg = name === 'og-image';
  // 2x for social (survives Instagram/WhatsApp compression); 1x is enough for the OG image
  const page = await browser.newPage({ viewport: { width: 1400, height: 2000 }, deviceScaleFactor: isOg ? 1 : 2 });
  await page.goto(pathToFileURL(resolve(dir, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const canvas = page.locator('.canvas');
  await canvas.screenshot({ path: `flyers/export/${name}.png` });
  if (isOg) await canvas.screenshot({ path: 'site/assets/img/og-image.jpg', type: 'jpeg', quality: 88 });
  const box = await canvas.boundingBox();
  console.log(`✔ ${name}.png  (${box.width}×${box.height}${isOg ? '' : ' @2x'})`);
  await page.close();
}
await browser.close();
