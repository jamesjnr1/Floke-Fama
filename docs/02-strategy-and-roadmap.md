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

## Technical recommendation

**Recommended: stay on WordPress, but replace Elementor with a lightweight custom block theme.**

Why:
- The team already publishes news, products and events in WordPress. Taking that away creates friction and puts your role at risk.
- WooCommerce (92 products) and The Events Calendar keep working with no data migration.
- Most of the slowness and the layout bugs (overflow, "0+" counters, blank sections) come from Elementor, UiCore and the widget packs. A hand-built theme removes all of that.

**How we get there, in two stages:**
1. **Design prototype (this repo, `/site`)** — plain HTML/CSS/JS with no build step. You can show it on a laptop or phone, host it on GitHub Pages for review, and iterate quickly on client feedback.
2. **Production theme (`/wp-theme`, later)** — convert the approved prototype into a WordPress block theme (`theme.json` plus block patterns), so staff edit content with the normal WordPress editor. The prototype's CSS carries straight over.

> Alternative if the client wants a clean break: Astro (static front end) plus headless WordPress or a simple CMS. It's faster and more modern, but it adds hosting and CMS decisions. Only raise it if they ask.

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
- [ ] Set up a staging site (subdomain such as `staging.flokefama.com`, or a local WordPress install)
- [ ] Build the block theme: header, footer, patterns, templates for pages, posts, products and archives
- [ ] WooCommerce: product template, category pages, "Request a quote" flow
- [ ] Clean the content: consistent product photos (white background, square, WebP) and real alt text
- [ ] SEO: meta descriptions, Open Graph images, `Organization` and `LocalBusiness` schema per branch, XML sitemap
- [ ] Legal pages: Privacy Policy and Terms

### Phase 3 — QA & launch (week 6)
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
