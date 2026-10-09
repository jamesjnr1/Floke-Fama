# Flokefama: Website Platform

The new [flokefama.com](https://flokefama.com): a composable, headless healthcare platform for Flokefama Company Limited, a Ghana Club 100 supplier of medical equipment and diagnostics (founded 2008).

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Poppins + Geist Sans · Radix / shadcn-style UI · Motion (Framer Motion) · Three.js · Sanity · Algolia · HubSpot · Vercel

→ Full architecture: [docs/05-architecture.md](docs/05-architecture.md) · Plain-language guide to how the site works and its integrations: [docs/Flokefama-Website-Guide.docx](docs/Flokefama-Website-Guide.docx)

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
| `npm run qa` | With the server running: screenshots every page at 390, 1440 and 1600 px into `qa/`, fails on overflow, header contents spilling out of the bar, console errors or broken images |
| `npm run icons` | Rebuilds the Flaticon UIcons subset after adding or removing `fi-*` classes (needs `pip install fonttools brotli`) |
| `npm run algolia:sync` | Pushes the catalogue to Algolia |
| `npm run flyers` | Renders social flyer templates to `flyers/export/` |
| `npm run images -- photo.jpg 1600` | Converts a photo to optimised WebP |
| `node scripts/stage-image.mjs` | Rebuilds the BS-240 cut-out for dark sections (feathered edges, logo-green light strip) |

## What's in the repo

```
src/
  app/(site)/          Public pages (Navbar + footer), matching the flokefama.com menu: home, about, awards, services,
                       events, products (shop, + intercepted spec modal), esg, contact, quote, offline
  app/login/           Split-screen portal sign-in (no site chrome)
  app/portal/          Client portal /portal (own shell)
  app/engineer/        Biomedical Engineer Service Portal /engineer (own app-shell layout, separate from the client portal)
  middleware.ts        Protects /portal and /engineer (sign-in + role check)
  components/          home/, about/, contact/, awards/, products/, quote/, client-portal/, engineer/, auth/, layout/, ui/, motion/
  data/seed.ts         Content from the current site; fallback when Sanity isn't configured
  lib/                 auth/ (sessions, sign-in), data access (Sanity), search (Algolia/local), quote schema (zod), Three.js scene
studio/                Sanity Studio: schemas + seed importer (installed separately)
public/                Images, service worker
flyers/                Social media templates, exports, captions
docs/                  Audit, roadmap, design system, social playbook, architecture
prototype/             Earlier static HTML prototype (reference only)
```

## Portals

| Portal | URL | Who | Account |
|---|---|---|---|
| Flokefama Care (client) | `/portal` | Hospital and lab staff | Register at `/login?mode=register` |
| Biomedical Engineer Service Portal | `/engineer` | Flokefama engineers | Register the same way with an email listed in `ENGINEER_EMAILS` |

There are no demo accounts: accounts are stored in Appwrite (see `.env.example`).

Both require signing in at `/login`, and each account can only open its own portal. Details and the go-live steps: [architecture → Portal sign-in](docs/05-architecture.md#portal-sign-in).

## ⚠️ The live site is off-limits

**This project never touches the live flokefama.com.** The current WordPress site stays exactly as it is until Flokefama explicitly approves a launch.

- **No changes** to the live site's WordPress admin, hosting, plugins, content or DNS.
- The live site is only ever **read** (audit, copying public content and images).
- The new site runs on its **own Vercel address**. It never defaults to the live domain, and it is hidden from search engines (robots.txt, `noindex` meta and `X-Robots-Tag`) so it can't compete with the live site in Google.
- **Do not** set `NEXT_PUBLIC_SITE_URL` to flokefama.com, set `NEXT_PUBLIC_ALLOW_INDEXING=true`, or add the flokefama.com domain in Vercel, until the launch is approved in writing.

## Content rules (non-negotiable)
- **No invented facts.** Metrics and milestones come only from Flokefama's published material. Product specs are flagged `specsVerified: false` and show an "indicative" note until checked against manufacturer datasheets.
- The **Ministry of Health partnership** in the brief is **not shown** until Flokefama confirms it.
- The **portals hold no demo data**: equipment, requests and certificates are only what real accounts add.
- Real event photography only. Awards are shown from photos of the actual awards; testimonials, figures (700+ facilities, 300+ integrations), services and events are taken from the current site.
- Only products in Flokefama’s actual catalogue are named. (The BS-240 render is used as an illustration for in-vitro diagnostics, as on the current homepage; the BS-240 itself is not sold by Flokefama and is not listed.)
- **All content comes from the current flokefama.com**: page text in its original wording, the full 92-product catalogue and the News, Blog & Press articles (generated by `scripts/content-import/`, read only), and the company brochure (hosted here at web size). The site never links to the live flokefama.com.

## Git workflow
- `main` = approved work, deployed by Vercel to its own `*.vercel.app` address (never the live site). Work on branches, merge by pull request, and let CI pass first.
- Branch names: `feature/*`, `fix/*`, `content/*`, `flyers/yyyy-mm`.
