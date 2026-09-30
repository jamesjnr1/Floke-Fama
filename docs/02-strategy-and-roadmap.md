# Strategy & Roadmap

## The goal in one sentence
Make Flokefama look like the market leader it says it is: a calm, confident, clinical-grade website that helps hospitals and labs **find equipment, trust the company, and request a quote in under a minute.**

## Who the site is for (design every page for these people)
| Visitor | What they need | Primary action |
|---|---|---|
| Hospital procurement officer | Product range, official-distributor proof, a fast quote | **Request a quote** |
| Lab scientist / biomedical engineer | Specs, brochures, service and calibration support | Download a spec sheet · book service |
| Hospital director / government buyer | Scale, credibility, awards, references | Contact sales |
| Job seeker / press | Story, news, careers | Read · apply |

---

## Technical decision (updated)

**Chosen: composable (headless) architecture.** Next.js 15 on Vercel, Sanity CMS, Algolia search and HubSpot for leads. See [05-architecture.md](05-architecture.md).

Why this over staying on WordPress + Elementor:
- **Speed across West African networks:** static generation plus a global edge CDN, with a service worker for patchy connectivity.
- **Catalogue scale:** structured product data (specs, compatibility, datasheets) in Sanity, searchable keystroke-by-keystroke with Algolia.
- **Lead generation:** a purpose-built procurement flow that feeds the CRM directly.
- **Editing stays easy:** the team edits in Sanity Studio, which is simpler than Elementor and can't break layouts.

**Migration notes:** the 92 WooCommerce products are exported and imported into Sanity (`studio/import-seed.ts` shows the shape). Old `/index.php/...` URLs redirect. WordPress can stay online at a subdomain during the transition.

## Proposed sitemap (simpler than today)

```
Home
Solutions ▾
  ├─ In-Vitro Diagnostics
  ├─ In-Vivo Medical Devices
  └─ Consumables
Products            (WooCommerce catalogue, "Request a quote" on every product)
Services            (install · maintenance · calibration · repairs · training)
About ▾
  ├─ Our Story      (mission, vision, timeline 2008 → 2030)
  ├─ Awards
  ├─ ESG            (hidden until it has content)
  └─ Careers        (hidden until it has content)
Newsroom            (news, press, events in one place)
Contact             (branches, map, form, WhatsApp)
[Request a Quote]   ← the one primary button in the header
```
"My Account" and the cart move to small icons, or disappear entirely if the shop becomes quote-based.

---

## Phased roadmap

### Phase 0 — Foundations (week 1)
- [x] Audit the live site (`docs/01-site-audit.md`)
- [x] Set up the repo, branching and folder structure
- [x] Draft the design system (`docs/03-design-system.md`)
- [ ] **Send the client questions** (audit §5) and collect the logo vector, stats, testimonials and social logins
- [ ] Get read-only (or staging) access to WordPress admin and the hosting account

### Phase 1 — Design approval (weeks 1–2)
- [x] Homepage prototype (`/site/index.html`)
- [ ] Present it: show the live site next to the prototype on desktop and on a phone
- [ ] Revise from feedback; prototype Products, Product detail, About and Contact
- [ ] Get **written sign-off** on the homepage and the design system before building

### Phase 2 — Build (weeks 3–5)
- [x] Next.js platform: home, product universe, deep spec sheets, procurement portal, client-portal demo, offline mode
- [ ] Connect Vercel (preview URL for the client), then Sanity, Algolia and HubSpot accounts
- [ ] Import all 92 products with real photography and verified specs
- [ ] Clean the content: consistent product photos (white background, square, WebP) and real alt text
- [ ] SEO: meta descriptions, Open Graph images, `Organization` and `LocalBusiness` schema per branch, XML sitemap
- [ ] Legal pages: Privacy Policy and Terms

### Phase 3 — QA & launch (week 6, only with Flokefama's written approval; until then the live site is not touched)
- [ ] Test at 360 / 390 / 768 / 1024 / 1440 px in Chrome, Safari and Firefox, plus a real Android phone (most visitors in Ghana)
- [ ] Lighthouse targets: **Performance ≥ 90 mobile, Accessibility ≥ 95, SEO 100**
- [ ] Check that no page scrolls horizontally, there are no `#` links, and there are no placeholder numbers
- [ ] Full backup, then launch, then 301 redirects from old `/index.php/...` URLs
- [ ] Set up Google Search Console and Analytics (GA4 or Plausible)

### Phase 4 — Grow (ongoing)
- Social content calendar (`docs/04-social-media-playbook.md`)
- Monthly news posts, and turn each into a flyer and a LinkedIn post
- A monthly one-page report to management: traffic, quote requests, top products, social reach

---

## Working agreement (how you stay "top-tier" professionally)
- **One source of truth:** this repo. Designs, docs, flyers and code all live here.
- **Branches:** `main` = approved; feature branches (`feature/homepage`, `flyers/oct-2026` and so on) are merged through pull requests, even when you work alone. The history shows the company how you work.
- **Weekly update** to your contact: what shipped, what's next, what you need from them. Keep it short, with screenshots.
- **Never go live on a Friday.** Always back up before you touch production.
- **Don't invent content.** Every number, quote and claim on the site must come from the client.
