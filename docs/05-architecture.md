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
| 3D | Three.js dotted capsule in the hero (points and lines only), lazy chunk, pauses off-screen, still frame with reduced motion | `src/lib/three/capsule-scene.ts` |
| CMS | **Sanity** (headless), falls back to seed data when not configured | `src/lib/sanity.ts`, `src/lib/data.ts`, `studio/` |
| Search | **Algolia** (lite client), falls back to a local scorer | `src/lib/search.ts`, `scripts/algolia-sync.ts` |
| Leads | Validated route handlers (quote, contact, portal registration) → **HubSpot** Forms API, with email/WhatsApp hand-off when not configured | `src/app/api/*/route.ts`, `src/lib/crm.ts` |
| Toasts | **Sonner**, clinical styling | `src/app/layout.tsx` |
| Sales tools | Quote list (several products, one request; kept in the browser), WhatsApp dock pre-filled with the product being viewed, related products, why-buy strip, sticky phone quote bar, Buying FAQ (FAQPage JSON-LD) | `src/lib/quote-list.ts`, `src/components/sales/*`, `src/components/products/product-extras.tsx`, `buying-faq.tsx` |
| Analytics | **Vercel Web Analytics** (cookie-free) with conversion events: quotes, demos, quote-list adds, WhatsApp, calls, brochure, datasheets. See `07-customers-ceo-sales.md` | `src/lib/analytics.ts` |
| Offline | Hand-written service worker + `/offline` emergency page | `public/sw.js`, `src/app/offline` |
| Hosting | **Vercel** (global CDN, preview deploy per PR) | CI: `.github/workflows/ci.yml` |
| Fonts / icons / logo | Poppins (self-hosted) + Geist Sans (`geist` package, `next/font`); Flaticon UIcons subset (~6 KB); official vector logo from the company brochure | `src/app/layout.tsx`, `src/styles/uicons`, `src/components/layout/logo.tsx` |

## Design principle: works with zero config
Every integration is optional at runtime. With no environment variables the site runs entirely on `src/data/seed.ts`: search runs locally and quote requests are validated and logged. Add keys one at a time as Flokefama's accounts are created (`.env.example`).

## Route groups
`src/app/(site)/` holds the public pages and shares the Navbar and footer via `(site)/layout.tsx`. `src/app/engineer/` and `src/app/portal/` are application shells with their own layouts, with no marketing chrome. `src/app/login/` is a standalone split screen (head office photo left, Sign in / Register panel right) with no Navbar or footer.

## Routes
| Route | Rendering | Notes |
|---|---|---|
| `/` | Static + ISR | Hero (“Ghana’s No.1 Healthcare Company.”, 3D dotted capsule), Partners & Clientele, in-vitro diagnostics scrollytelling, product universe, testimonials |
| `/about` | Static + ISR | Company → About Us: who we are, impact (figures + sourced stories), mission / vision / aim, core values |
| `/awards` | Static | Company → Awards: photographed awards, closing statement |
| `/services` | Static | Products & Services: the service lifecycle, why choose Flokefama (products live in the Shop) |
| `/events` | Static, daily ISR | Events & Activities: upcoming / past events (an optional `image` per event in `seed.ts`, e.g. the Floke Praise 2025 flyer from the current site, shown uncropped at 16:9 beside the details), Media Centre news |
| `/news/[slug]` | SSG | The full text of every News, Blog & Press post from the current site (8 articles, `src/data/articles.ts`), with images, dates and categories; `NewsArticle` JSON-LD |
| `/esg` | Static | ESG: patient safety, community, education, governance, local industry (from Flokefama’s own published material) |
| `/contact` | Static | Contact details, simple message form, head office photo, live map, directions, branches |
| `/products` | Dynamic | Shop: the **full catalogue of the current flokefama.com shop (92 products)** with their original names, brands, descriptions and photos (`src/data/catalogue.ts`). **New arrivals** strip (as on the current homepage), five category tabs, keystroke search, and **Explore Product Categories**: the original shop categories with counts, each filtering exactly (`?type=`). State mirrored to the URL |
| `/products/[slug]` | SSG + ISR | Product page with the same slug as the current shop, the original description and categories, **key features from the Flokefama brochure** where it lists the product (BC-5150, BC-20s, BC-30s, BA-88A semi-auto chemistry, DCR-2000), and the brochure for download; `Product` JSON-LD |
| `/products/(.)[slug]` | Intercepted (parallel `@modal` slot) | The same spec sheet as an overlay when opened from the catalogue |
| `/quote` | Dynamic | Multi-step procurement flow (quote or demo), react-hook-form + zod, validated again on the server |
| `/api/quote`, `/api/contact`, `/api/register` | Dynamic | Validate, then deliver to HubSpot when configured (see “Form delivery”) |
| `/login` | Dynamic, no site chrome | Portal access: head office photo (`public/images/head-office-entrance.webp`) on the left; on the right **Sign in** and **Register** tabs, as on the original site's account page (`?mode=register` opens Register). Sign in sends each account to its own portal and has a *Forgot password?* email link to support. Register sends a client portal access request (name, facility, role, email, phone, installed systems) to `/api/register`: the CRM when configured, otherwise a pre-filled email or WhatsApp to support. Accounts are verified by Flokefama before they go live. The engineer sign-in (`?next=/engineer`) has no Register tab. A short photo banner on phones |
| `/portal` | Dynamic, own layout, **sign-in required (client)** | Flokefama Care client dashboard (**demo data**): Overview (live KPIs, live service tracker with engineer + ETA, calibrations due, updates, quick actions), Service requests (submit a request with urgency, contact and preferred visit; follow progress; message the engineer; rate the visit), Equipment (health, warranty, calibration, service history, report a fault, order consumables), Certificates (download) |
| `/engineer` | Dynamic, own layout, **sign-in required (engineer)** | Biomedical Engineer Service Portal (**demo data**, separate from the client portal). Working app: Overview (live KPIs, work queue, fleet health, calibrations due, activity), Service Tickets (filters; assign → en route with ETA → on site → resolve with report; work log notes; parts), System Pulse (status derived from open tickets, facility filter), Calibration schedule (overdue / due soon, record result → certificate + next due date), Documentation (system sheets, service history, downloadable certificates, manual requests), ⌘K command palette, notifications. State persists in the browser (`src/lib/engineer/store.ts`) with a reset button; in production the same actions call the service backend |
| `/offline` | Static | Precached; emergency biomedical support contacts |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | Generated | |

The navigation mirrors the menu on flokefama.com: Home · Company (About Us, Awards) · Products & Services · Events & Activities · Shop (`/products`) · ESG · Contact, with **Client Portal** in place of “My Account”.

Old WordPress URLs (`/index.php/shop`, `/index.php/product/<slug>` → `/products/<slug>`, `/index.php/<yyyy>/<mm>/<dd>/<slug>` → `/news/<slug>`, `/index.php/category/*`, `/index.php/careers`, `/event/*`, `/index.php/about-us`, `/index.php/awards`, `/index.php/services`, `/index.php/esg`, `/index.php/contact`, `/index.php/media-centre`, `/index.php/my-account`) and the earlier preview pages (`/solutions`, `/partners`, `/impact`, `/media`) are 308-redirected in `next.config.ts`.

**No duplication:** every section lives on exactly one page (testimonials and partners on Home, the service lifecycle on Services, map / directions / branches on Contact); other pages link to them.

## Content from the current site
All copy, figures, products and articles come from flokefama.com (and its brochure, `public/brochure/flokefama-brochure.pdf`, re-saved at web size). The catalogue and articles are generated from the site's public data feeds by `scripts/content-import/` (read only; see its README). Page text is the original wording, with obvious typos corrected.

## Form delivery (no lost enquiries)
Quote requests and “Get in touch” messages are validated on the server and sent to HubSpot when `HUBSPOT_PORTAL_ID` and `HUBSPOT_FORM_GUID` are set. **Until then, nothing is silently dropped:** the API answers `delivered: false` and the page shows *Send by email* / *Send on WhatsApp* buttons with the full request pre-filled (quotes → sales@, contact messages → sales@, support@ or info@ by topic). Once the CRM is connected, visitors simply see “Request received”.

## Shared service desk
Both portals run on one service desk (`src/lib/service/store.ts`). A request a hospital submits in `/portal` lands in the engineers’ queue in `/engineer`; each step an engineer takes (assign, en route with ETA, on site, resolved with report, calibration certificate) appears live for the hospital, with a notification for the other side, and the hospital can message the engineer and rate the visit. In this preview the desk lives in the browser (localStorage, synced across tabs) so the round trip can be demonstrated with the two demo accounts; in production the same actions call the service-management backend.

## Portal sign-in
Two separate areas, two roles: **client** (hospital staff) → `/portal`, **engineer** (Flokefama biomedical engineers) → `/engineer`. Neither can open the other's area.

| Layer | What it does |
|---|---|
| `src/middleware.ts` (edge) | Runs on `/login`, `/portal/*` and `/engineer/*`. No valid session → redirect to `/login?next=…`; wrong role → own portal; signed in on `/login` → own portal. Sets `Cache-Control: private, no-store` |
| `src/lib/auth/server.ts` | `requireSession(role)` is checked again inside each page, so a page is never rendered without a session even if the middleware is bypassed |
| `src/lib/auth/session.ts` | Session = signed cookie `ff_session` (HMAC-SHA-256 with `SESSION_SECRET`, 8-hour expiry). `httpOnly`, `SameSite=Lax`, `Secure` in production. Tampered or expired cookies are rejected and cleared |
| `src/lib/auth/actions.ts` | Server actions `login` / `logout`. One generic error message (never says which of email or password was wrong); `?next=` is honoured only inside the account's own area, so it can't be used as an open redirect |
| `src/lib/auth/users.ts` | Server-only account lookup. Passwords are stored as hashes and compared in constant time |
| `public/sw.js` | Never caches `/portal`, `/engineer` or `/login` |

**Preview demo accounts** (fictional data; the login page shows one-click buttons for them):

| Portal | Email | Password |
|---|---|---|
| Client | `client@demo.flokefama.com` | `FlokeCare-2026` |
| Engineer | `engineer@demo.flokefama.com` | `FlokeEng-2026` |

Set `ENABLE_DEMO_ACCOUNTS=false` to switch them off. **Before real hospitals get access:** set a long random `SESSION_SECRET` in Vercel, and replace `users.ts` with a real identity provider (e.g. Auth.js or Clerk with per-facility accounts, password reset and MFA for engineers), connected to the service backend.

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
| Responsive, no horizontal overflow, header contents fit the bar (390 / 1440 / 1600 px, all routes) | ✅ `npm run qa` |
| Keyboard and screen-reader support via Radix (dialogs, tabs), skip link, focus rings, reduced motion | ✅ baseline; a full WCAG 2.1 AA audit with axe and a manual screen-reader pass is still to do |
| Offline page + service worker | ✅ |
| Security headers (HSTS, nosniff, frame, referrer, permissions) | ✅ |
| Pre-launch noindex protection; no references to the live domain | ✅ |
| Structured data (MedicalBusiness, Product) + sitemap | ✅ |
| Lighthouse ≥ 95 performance | ⏳ measure on the Vercel preview (can't be measured reliably locally) |
| Sanity project, Algolia index, HubSpot form | ⏳ need Flokefama accounts |
| Portal sign-in, role separation, protected routes | ✅ preview-grade (signed cookie + demo accounts) |
| Real identity provider, per-facility accounts, real service backend | ⏳ phase 2 (portals currently use demo data) |
| Verified specs, metrics, logo SVG, privacy policy | ⏳ client content (see audit §5) |
