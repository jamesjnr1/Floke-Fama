// Visual + health QA against a running server (default http://localhost:3000).
// Usage: npm run build && npm start   (in another terminal)   then: npm run qa [baseUrl]
// Writes screenshots to qa/ and exits non-zero on horizontal overflow, header contents spilling out of the bar,
// console errors or broken images.
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:3000';
const pages = ['/', '/about', '/awards', '/services', '/events', '/esg', '/contact', '/products', '/products/mindray-bc-5150', '/quote', '/login', '/offline'];
// Protected pages are checked signed in with the preview demo accounts (ENABLE_DEMO_ACCOUNTS must not be "false").
const protectedPages = { '/portal': ['client@demo.flokefama.com', 'FlokeCare-2026'], '/engineer': ['engineer@demo.flokefama.com', 'FlokeEng-2026'] };
const sizes = [[390, 844], [1440, 900], [1600, 900]];
await mkdir('qa', { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
// Sign in once per account through the real login form and reuse the session cookie.
const sessions = {};
for (const [path, [email, password]] of Object.entries(protectedPages)) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${base}/login?next=${encodeURIComponent(path)}`);
  await page.getByLabel('Email', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`**${path}`, { waitUntil: 'commit' });
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
