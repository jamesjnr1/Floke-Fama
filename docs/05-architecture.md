# Architecture: Composable (Headless) Stack

```
            ┌──────────────────────────────────────────┐
            │   Next.js 15 (App Router) on Vercel Edge  │
            │   SSG + ISR (10 min) · Route Handlers     │
            └───────┬───────────────┬───────────────┬───┘
                    │               │               │
         ┌──────────▼───┐   ┌───────▼──────┐  ┌─────▼──────────┐
         │  Sanity CMS  │   │   Algolia    │  │ Sales board    │
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
| CMS | **Sanity** (headless) for products, categories, events, news articles, figures and milestones; falls back to the built-in content when not configured. A signed webhook (`/api/revalidate`) refreshes pages the moment an editor publishes. Setup and demo script: `studio/README.md` | `src/lib/sanity.ts`, `src/lib/data.ts`, `src/app/api/revalidate`, `studio/` |
| Search | **Algolia** (lite client), falls back to a local scorer | `src/lib/search.ts`, `scripts/algolia-sync.ts` |
| Leads | Checkout orders → the admin console's **sales board** (Appwrite) + an email to sales (Brevo); Support page requests → engineers, the support inbox and (demonstrations) sales; email/WhatsApp hand-off when nothing is configured | `src/app/api/orders/route.ts`, `src/app/api/support/route.ts`, `src/lib/support-email.ts` |
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
| `/quote` | Dynamic | Old address, kept for links and bookmarks: forwards to checkout with the product in the cart, or to the Support page for a demonstration, documents or “can't find it” |
| `/api/orders`, `/api/support` | Dynamic | Validate, save, then email sales / support when configured (see “Form delivery”) |
| `/login` | Dynamic, no site chrome | Portal access: head office photo (`public/images/head-office-entrance.webp`) on the left; on the right **Sign in** and **Register** tabs, as on the original site's account page (`?mode=register` opens Register). Sign in sends each account to its own portal and has a *Forgot password?* email link to support. Register sends a client portal access request (name, facility, role, email, phone, installed systems) to `/api/register`: the CRM when configured, otherwise a pre-filled email or WhatsApp to support. Accounts are verified by Flokefama before they go live. The engineer sign-in (`?next=/engineer`) has no Register tab. A short photo banner on phones |
| `/portal` | Dynamic, own layout, **sign-in required (client)** | Flokefama Care client dashboard (**demo data**): Overview (live KPIs, live service tracker with engineer + ETA, calibrations due, updates, quick actions), Service requests (submit a request with urgency, contact and preferred visit; follow progress; message the engineer; rate the visit), Equipment (health, warranty, calibration, service history, report a fault, order consumables), Certificates (download) |
| `/engineer` | Dynamic, own layout, **sign-in required (engineer)** | Biomedical Engineer Service Portal, laid out like the hospital dashboard, light or dark mode. Overview (key figures, work queue, activity, equipment health, calibration schedule), Service requests (filters; assign → en route with ETA → on site → resolve with report; work log notes; parts), Equipment (status derived from open requests, facility filter), Calibration (overdue / due soon, record result → certificate + next due date), Documents (system sheets, service history, downloadable certificates, manual requests), Ctrl K search, notifications. Shares the service desk with `/portal` (see below) |
| `/offline` | Static | Precached; emergency biomedical support contacts |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` | Generated | |

The navigation mirrors the menu on flokefama.com: Home · Company (About Us, Awards) · Products & Services · Events & Activities · Shop (`/products`) · ESG · Contact, with **Client Portal** in place of “My Account”.

Old WordPress URLs (`/index.php/shop`, `/index.php/product/<slug>` → `/products/<slug>`, `/index.php/<yyyy>/<mm>/<dd>/<slug>` → `/news/<slug>`, `/index.php/category/*`, `/index.php/careers`, `/event/*`, `/index.php/about-us`, `/index.php/awards`, `/index.php/services`, `/index.php/esg`, `/index.php/contact`, `/index.php/media-centre`, `/index.php/my-account`) and the earlier preview pages (`/solutions`, `/partners`, `/impact`, `/media`) are 308-redirected in `next.config.ts`.

**No duplication:** every section lives on exactly one page (testimonials and partners on Home, the service lifecycle on Services, map / directions / branches on Contact); other pages link to them.

## Content from the current site
All copy, figures, products and articles come from flokefama.com (and its brochure, `public/brochure/flokefama-brochure.pdf`, re-saved at web size). The catalogue and articles are generated from the site's public data feeds by `scripts/content-import/` (read only; see its README). Page text is the original wording, with obvious typos corrected.

## Form delivery (no lost enquiries)
**One way to order: the cart and checkout.** “Order now” anywhere on the site opens checkout with the product in the cart (`/checkout?add=slug`, `src/lib/links.ts`). Checkout asks for delivery, the department, how soon it is needed and notes for sales; prices are confirmed by sales. Each order is saved (Appwrite) for the hospital's dashboard and lands on the admin console's **sales board** (*Orders* tab, `src/lib/sales-stages.ts`): New → Called → Price sent → Paid → Being prepared → Delivered, or Lost. Sales moves a card with one button, opens it for the contact, the order, the agreed price (GHS) and notes, and every move and note is kept with who and when; the hospital sees Price sent, Paid, Being prepared and Delivered. Each new order is also emailed to sales through Brevo (`SALES_EMAIL_TO`, else `SUPPORT_EMAIL_TO`; “URGENT order …” when needed within two weeks; replies go to the hospital; a button opens the card). Demonstrations, training, documents and “can't find it” are requests on the Support page's *Other assistance* tab (prefilled by `helpHref`); a demonstration is emailed to sales as well. **If the order can't be saved, nothing is lost:** the confirmation offers *Email it to sales* / *WhatsApp* with the whole order pre-filled.

## Shared service desk
Both portals run on one service desk (`src/lib/service/store.ts`). A request a hospital submits in `/portal` lands in the engineers’ queue in `/engineer`; each step an engineer takes (assign, en route with ETA, on site, resolved with report, calibration certificate) appears live for the hospital, with a notification for the other side, and the hospital can message the engineer and rate the visit. With Appwrite configured the desk is kept on the server (`/api/service`, tables `service_assets`, `service_tickets`, `service_notifications`): the server applies each action with the signed-in account as the actor, using the same rules (`src/lib/service/desk.ts`), checks the account may take it, and returns only what that account may see (engineers every facility, a hospital its own). Orders are saved by `/api/orders` (table `orders`) and turned into the hospital's equipment there. The portals refresh every 15 seconds and when the tab comes back into view. Without Appwrite the desk and orders live in the browser (localStorage, synced across tabs).

## Portal sign-in
Two separate areas, two roles: **client** (hospital staff) → `/portal`, **engineer** (Flokefama biomedical engineers) → `/engineer`. Neither can open the other's area.

| Layer | What it does |
|---|---|
| `src/middleware.ts` (edge) | Runs on `/login`, `/portal/*` and `/engineer/*`. No valid session → redirect to `/login?next=…`; wrong role → own portal; signed in on `/login` → own portal. Sets `Cache-Control: private, no-store` |
| `src/lib/auth/server.ts` | `requireSession(role)` is checked again inside each page, so a page is never rendered without a session even if the middleware is bypassed |
| `src/lib/auth/session.ts` | Session = signed cookie `ff_session` (HMAC-SHA-256 with `SESSION_SECRET`, 8-hour expiry). `httpOnly`, `SameSite=Lax`, `Secure` in production. Tampered or expired cookies are rejected and cleared |
| `src/lib/auth/actions.ts` | Server actions `login` / `register` / `logout`. One generic error message (never says which of email or password was wrong); `?next=` is honoured only inside the account's own area, so it can't be used as an open redirect |
| `src/lib/auth/users.ts` | Server-only: which emails are engineers (`ENGINEER_EMAILS`) |
| `src/lib/auth/accounts.ts` | Registered accounts (Appwrite, or a signed cookie without it). Passwords are stored as salted hashes and compared in constant time |
| `public/sw.js` | Never caches `/portal`, `/engineer` or `/login` |

**Accounts.** There are no demo accounts. Hospitals register at `/login?mode=register`; accounts are stored in Appwrite (`accounts` table, passwords as salted PBKDF2 hashes), or in a signed browser cookie when Appwrite isn't configured. Engineers register the same way; an email listed in `ENGINEER_EMAILS` (comma-separated, in Vercel) signs in to `/engineer` instead of `/portal`. Set a long random `SESSION_SECRET` in Vercel.

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
| Sanity project, Algolia index | ⏳ need Flokefama accounts |
| Portal sign-in, role separation, protected routes | ✅ preview-grade (signed cookie + demo accounts) |
| Real identity provider, per-facility accounts, real service backend | ⏳ phase 2 (portals currently use demo data) |
| Verified specs, metrics, logo SVG, privacy policy | ⏳ client content (see audit §5) |
