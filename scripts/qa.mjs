// Visual + health QA against a running server (default http://localhost:3000).
// Usage: npm run build && ENGINEER_EMAILS=qa-engineer@example.com npm start   (in another terminal, without the
// APPWRITE_* variables)   then: npm run qa [baseUrl]
// Writes screenshots to qa/ and exits non-zero on horizontal overflow, header contents spilling out of the bar,
// console errors or broken images.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3000';
const pages = ['/', '/about', '/awards', '/services', '/events', '/esg', '/contact', '/products', '/products/auto-heamatology-analyzer-bc5150', '/news/quality-is-tested', '/quote', '/login', '/offline'];
// Protected pages are checked signed in. There are no demo accounts, so QA registers its own on a server started
// without Appwrite (accounts then live in the browser cookie, nothing is stored) and with
// ENGINEER_EMAILS=qa-engineer@example.com, so the second account opens the engineer portal.
const protectedPages = { '/portal': 'qa-client@example.com', '/engineer': 'qa-engineer@example.com' };
const sizes = [[390, 844], [1440, 900], [1600, 900]];
await mkdir('qa', { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
// Register once per account through the real form and reuse the session cookie.
const sessions = {};
for (const [path, email] of Object.entries(protectedPages)) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${base}/login?mode=register`);
  const fill = (name, value) => page.locator(`form input[name="${name}"]`).fill(value);
  await fill('name', 'QA Check');
  await fill('organisation', 'QA Teaching Hospital');
  await fill('phone', '+233 20 000 0000');
  await fill('email', email);
  await fill('password', 'qa-password-123');
  await fill('confirm', 'qa-password-123');
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(`**${path}`, { waitUntil: 'commit', timeout: 15000 }).catch(() => {
    throw new Error(`${email} did not open ${path}. Start the server without Appwrite and with ENGINEER_EMAILS=qa-engineer@example.com.`);
  });
  sessions[path] = await ctx.storageState();
  await ctx.close();
}

let failed = false;
for (const path of [...pages, ...Object.keys(protectedPages)]) {
  for (const [w, h] of sizes) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, storageState: sessions[path] });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(base + path, { waitUntil: 'load' });
    // Chrome reports below-the-fold lazy images as started but holds them until they near the viewport, so a page
    // can stay "busy" forever; wait for the network to settle, but not longer than a few seconds.
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    // Scroll through so lazy images and in-view animations settle
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      // Header contents must fit inside the bar (the CTA once spilled out at 1536px+)
      headerSpill: (() => {
        const bar = document.querySelector('header > div');
        if (!bar) return 0;
        const cs = getComputedStyle(bar);
        const inner = bar.getBoundingClientRect().right - parseFloat(cs.paddingRight) - parseFloat(cs.borderRightWidth);
        const right = Math.max(...[...bar.children].filter((e) => getComputedStyle(e).display !== 'none').map((e) => e.getBoundingClientRect().right));
        return Math.max(0, Math.round(right - inner));
      })(),
    }));
    const ok = r.overflow <= 0 && !r.broken.length && !errors.length && r.headerSpill === 0;
    failed ||= !ok;
    console.log(`${ok ? '✔' : '✘'} ${path.padEnd(28)} ${w}px  overflow=${r.overflow}  header=${r.headerSpill}  broken=${r.broken.length}  errors=${errors.length}${errors.length ? '\n    ' + errors.slice(0, 3).join('\n    ') : ''}`);
    await page.screenshot({ path: `qa/${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}-${w}.png` });
    await ctx.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
