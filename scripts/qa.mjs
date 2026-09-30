// Visual + health QA against a running server (default http://localhost:3000).
// Usage: npm run build && npm start   (in another terminal)   then: npm run qa [baseUrl]
// Writes screenshots to qa/ and exits non-zero on horizontal overflow, console errors or broken images.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3000';
const pages = ['/', '/products', '/products/mindray-bs-240', '/quote', '/portal', '/offline'];
const sizes = [[390, 844], [1440, 900]];
await mkdir('qa', { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
let failed = false;
for (const path of pages) {
  for (const [w, h] of sizes) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(base + path, { waitUntil: 'networkidle' });
    // Scroll through so lazy images and in-view animations settle
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
    }));
    const ok = r.overflow <= 0 && !r.broken.length && !errors.length;
    failed ||= !ok;
    console.log(`${ok ? '✔' : '✘'} ${path.padEnd(28)} ${w}px  overflow=${r.overflow}  broken=${r.broken.length}  errors=${errors.length}${errors.length ? '\n    ' + errors.slice(0, 3).join('\n    ') : ''}`);
    await page.screenshot({ path: `qa/${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}-${w}.png` });
    await page.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
