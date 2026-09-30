// Converts heavy JPG/PNG images to resized WebP using headless Chromium (no native deps needed).
// Usage: npm run images -- <file> [maxWidth] [quality]
//        npm run images            (converts the default list below)
import { readFile, writeFile, stat } from 'node:fs/promises';
import { extname } from 'node:path';
import { launch } from './browser.mjs';

const defaults = [
  ['public/images/head-office.jpg', 1100],
  ['public/images/solution-ivd.png', 900],
  ['public/images/solution-invivo.png', 900],
  ['public/images/solution-consumables.png', 900],
];
const args = process.argv.slice(2);
const jobs = args.length ? [[args[0], Number(args[1] || 1600), Number(args[2] || 0.82)]] : defaults.map(([f, w]) => [f, w, 0.82]);

const browser = await launch();
const page = await browser.newPage();
for (const [file, maxW, q] of jobs) {
  const mime = extname(file) === '.png' ? 'image/png' : 'image/jpeg';
  const src = `data:${mime};base64,${(await readFile(file)).toString('base64')}`;
  const b64 = await page.evaluate(async ({ src, maxW, q }) => {
    const img = new Image(); img.src = src; await img.decode();
    const scale = Math.min(1, maxW / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/webp', q).split(',')[1];
  }, { src, maxW, q });
  const out = file.replace(/\.(jpe?g|png)$/i, '.webp');
  await writeFile(out, Buffer.from(b64, 'base64'));
  const [a, b] = [(await stat(file)).size, (await stat(out)).size];
  console.log(`${file} → ${out}  ${(a / 1024).toFixed(0)} KB → ${(b / 1024).toFixed(0)} KB`);
}
await browser.close();
