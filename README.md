# Flokefama: Website Platform

The new [flokefama.com](https://flokefama.com): a composable, headless healthcare platform for Flokefama Company Limited, a Ghana Club 100 supplier of medical equipment and diagnostics (founded 2008).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Geist Sans/Mono · Radix / shadcn-style UI · Motion (Framer Motion) · Three.js · Sanity · Algolia · HubSpot · Vercel

→ Full architecture: [docs/05-architecture.md](docs/05-architecture.md)

## Quick start

Requires Node 20.9+.

```bash
npm install
npm run dev          # http://localhost:3000, runs on seed data, no keys needed
```

Optional integrations are switched on by environment variables. Copy `.env.example` to `.env.local` and fill in what's ready (Sanity, Algolia, HubSpot).

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run check` | Lint + type-check + production build (what CI runs) |
| `npm run build && npm start` | Production build and server |
| `npm run qa` | With the server running: screenshots every page at 390 and 1440 px into `qa/`, fails on overflow, console errors or broken images |
| `npm run icons` | Rebuilds the Flaticon UIcons subset after adding or removing `fi-*` classes (needs `pip install fonttools brotli`) |
| `npm run algolia:sync` | Pushes the catalogue to Algolia |
| `npm run flyers` | Renders social flyer templates to `flyers/export/` |
| `npm run images -- photo.jpg 1600` | Converts a photo to optimised WebP |

## What's in the repo

```
src/
  app/(site)/          Public pages (Navbar + footer): home, products (+ intercepted spec modal), quote, offline
  app/portal/          Biomedical Engineer Service Portal (own app-shell layout)
  components/          home/, products/, quote/, portal/, layout/, ui/ (Button, Tabs, Badge, Icon), motion/
  data/seed.ts         Content from the current site; fallback when Sanity isn't configured
  data/portal-demo.ts  Fictional demo data for the client-portal experience
  lib/                 data access (Sanity), search (Algolia/local), quote schema (zod), Three.js scene
studio/                Sanity Studio: schemas + seed importer (installed separately)
public/                Images, service worker
flyers/                Social media templates, exports, captions
docs/                  Audit, roadmap, design system, social playbook, architecture
prototype/             Earlier static HTML prototype (reference only)
```

## ⚠️ The live site is off-limits

**This project never touches the live flokefama.com.** The current WordPress site stays exactly as it is until Flokefama explicitly approves a launch.

- **No changes** to the live site's WordPress admin, hosting, plugins, content or DNS.
- The live site is only ever **read** (audit, copying public content and images).
- The new site runs on its **own Vercel address**. It never defaults to the live domain, and it is hidden from search engines (robots.txt, `noindex` meta and `X-Robots-Tag`) so it can't compete with the live site in Google.
- **Do not** set `NEXT_PUBLIC_SITE_URL` to flokefama.com, set `NEXT_PUBLIC_ALLOW_INDEXING=true`, or add the flokefama.com domain in Vercel, until the launch is approved in writing.

## Content rules (non-negotiable)
- **No invented facts.** Metrics and milestones come only from Flokefama's published material. Product specs are flagged `specsVerified: false` and show an "indicative" note until checked against manufacturer datasheets.
- The **Ministry of Health partnership** in the brief is **not shown** until Flokefama confirms it.
- The **client portal uses clearly labelled demo data** (fictional facility and engineers) until it's connected to a real service backend.
- Real event photography only.

## Git workflow
- `main` = approved work, deployed by Vercel to its own `*.vercel.app` address (never the live site). Work on branches, merge by pull request, and let CI pass first.
- Branch names: `feature/*`, `fix/*`, `content/*`, `flyers/yyyy-mm`.
