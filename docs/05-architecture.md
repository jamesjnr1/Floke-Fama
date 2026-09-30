# Architecture: Composable (Headless) Stack

```
            ┌──────────────────────────────────────────┐
            │   Next.js 15 (App Router) on Vercel Edge  │
            │   SSG + ISR (10 min) · Route Handlers     │
            └───────┬───────────────┬───────────────┬───┘
                    │               │               │
         ┌──────────▼───┐   ┌───────▼──────┐  ┌─────▼──────────┐
         │  Sanity CMS  │   │   Algolia    │  │ HubSpot (CRM)  │
         │  products,   │   │  instant SKU │  │ quote & demo   │
         │  specs, PDFs │   │   search     │  │   requests     │
         └──────────────┘   └──────────────┘  └────────────────┘
```

| Layer | Technology | Where in the repo |
|---|---|---|
| Frontend | **Next.js 15.5** App Router, React 19, TypeScript (strict) | `src/app` |
| Styling | **Tailwind CSS v4** (CSS-first tokens) + shadcn-style components on **Radix** primitives | `src/app/globals.css`, `src/components/ui` |
| Motion | **Motion** (Framer Motion's current package, `motion/react`) | throughout, e.g. `layoutId` morphs |
| 3D | Three.js wireframe-polyhedra network behind the hero, lazy chunk, pauses off-screen | `src/lib/three/network-scene.ts` |
| CMS | **Sanity** (headless), falls back to seed data when not configured | `src/lib/sanity.ts`, `src/lib/data.ts`, `studio/` |
| Search | **Algolia** (lite client), falls back to a local scorer | `src/lib/search.ts`, `scripts/algolia-sync.ts` |
| Leads | Validated route handler → **HubSpot** Forms API | `src/app/api/quote/route.ts` |
| Toasts | **Sonner**, clinical styling | `src/app/layout.tsx` |
| Offline | Hand-written service worker + `/offline` emergency page | `public/sw.js`, `src/app/offline` |
| Hosting | **Vercel** (global CDN, preview deploy per PR) | CI: `.github/workflows/ci.yml` |
| Fonts / icons | Geist Sans + Geist Mono (`geist` package, `next/font`); Flaticon UIcons subset (~6 KB) | `src/app/layout.tsx`, `src/styles/uicons` |

## Design principle: works with zero config
Every integration is optional at runtime. With no environment variables the site runs entirely on `src/data/seed.ts`: search runs locally and quote requests are validated and logged. Add keys one at a time as Flokefama's accounts are created (`.env.example`).

## Route groups
`src/app/(site)/` holds the public pages and shares the Navbar and footer via `(site)/layout.tsx`. `src/app/portal/` is an application shell with its own layout, with no marketing chrome.

## Routes
| Route | Rendering | Notes |
|---|---|---|
| `/` | Static + ISR | Dark-canvas hero, Partners & Clientele, Insights Deck bento, pinned BS-240 scrollytelling, product universe, services, Media Hub, portal teaser |
| `/products` | Dynamic | Category morphing and keystroke search without reloads; state mirrored to the URL |
| `/products/[slug]` | SSG + ISR | Full Deep Spec Sheet page for SEO, with `Product` JSON-LD |
| `/products/(.)[slug]` | Intercepted (parallel `@modal` slot) | The same spec sheet as an overlay when opened from the catalogue |
| `/quote` | Dynamic | Multi-step procurement flow (quote or demo), react-hook-form + zod, validated again on the server |
| `/portal` | Static, own layout | Biomedical Engineer Service Portal (**demo data**): sidebar rail, System Status rail with sparklines, ticket timeline tracker, log-fault terminal, radial uptime, System Pulse and Documentation views with deep spec sheets |
| `/offline` | Static | Precached; emergency biomedical support contacts |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | Generated | |

Old WordPress URLs (`/index.php/shop`, `/index.php/product/*` and so on) are 308-redirected in `next.config.ts`.

## Deploying to Vercel (preview only, the live site is untouched)
1. Import the GitHub repo at vercel.com → New Project (framework auto-detected).
2. Add only the integration keys that are ready. **Leave `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_ALLOW_INDEXING` unset.**
3. Every PR gets a preview URL, and `main` deploys to the project's own `*.vercel.app` address.
4. The site is automatically hidden from search engines (see "Pre-launch protection").

**Never, without Flokefama's written approval:** add the flokefama.com domain in Vercel, change DNS, or make any change to the live WordPress site.

## Pre-launch protection
| Layer | Behaviour until `NEXT_PUBLIC_ALLOW_INDEXING=true` |
|---|---|
| `robots.txt` | `Disallow: /` for all crawlers |
| `<meta name="robots">` | `noindex, nofollow` on every page |
| `X-Robots-Tag` header | `noindex, nofollow` on every response, including images |
| Canonical / sitemap / JSON-LD | Use this deployment's own URL (never the live domain) |

Launch day (only when approved) is a separate, planned task: back up the live site, set the two variables, add the domain, then switch DNS.

## Production checklist
| Item | Status |
|---|---|
| Lint + strict type-check + production build in CI | ✅ |
| Next-gen images (`next/image`, AVIF/WebP) | ✅ configured; real product photography still needed |
| Responsive, no horizontal overflow (390 / 1440 px, all routes) | ✅ `npm run qa` |
| Keyboard and screen-reader support via Radix (dialogs, tabs), skip link, focus rings, reduced motion | ✅ baseline; a full WCAG 2.1 AA audit with axe and a manual screen-reader pass is still to do |
| Offline page + service worker | ✅ |
| Security headers (HSTS, nosniff, frame, referrer, permissions) | ✅ |
| Pre-launch noindex protection; no references to the live domain | ✅ |
| Structured data (MedicalBusiness, Product) + sitemap | ✅ |
| Lighthouse ≥ 95 performance | ⏳ measure on the Vercel preview (can't be measured reliably locally) |
| Sanity project, Algolia index, HubSpot form | ⏳ need Flokefama accounts |
| Client portal authentication + real service backend | ⏳ phase 2 (currently demo data) |
| Verified specs, metrics, logo SVG, privacy policy | ⏳ client content (see audit §5) |
