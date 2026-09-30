# Flokefama — Website Redesign & Brand Content

Redesign of [flokefama.com](https://flokefama.com) plus the social media content system for Flokefama Company Limited, a Ghanaian supplier of medical equipment and diagnostics (founded 2008).

> **Status:** Phase 1 (design prototype, awaiting client review). See the [roadmap](docs/02-strategy-and-roadmap.md).

## What's in this repo

```
docs/
  01-site-audit.md            What's wrong with the current site, and questions for the client
  02-strategy-and-roadmap.md  Tech decision, new sitemap, phased plan, working agreement
  03-design-system.md         Colours, type, spacing, components, imagery, voice
  04-social-media-playbook.md Channels, content pillars, flyer rules, posting workflow
site/                         Homepage prototype (plain HTML/CSS/JS, no build step)
  index.html
  assets/{css,js,img,fonts}
flyers/
  templates/                  Editable HTML flyer templates + shared flyer.css
  export/                     Rendered PNGs, ready to post
  captions.md                 Caption drafts per flyer
scripts/                      Image optimiser, flyer exporter, responsive QA
.github/workflows/pages.yml   Publishes /site to GitHub Pages for review links
```

## Quick start

Requires Node 18+.

```bash
npm install                  # installs Playwright (headless Chromium for the scripts)
npx playwright install chromium   # first time only, if you don't have the browser yet

npm run dev                  # preview the prototype at http://localhost:5173
npm run qa                   # screenshots at 360→1440 px in qa/, fails on overflow/broken images
npm run flyers               # renders every flyer template to flyers/export/*.png (2x)
npm run flyers -- expert-tip # render just one
npm run images -- path/to/photo.jpg 1600   # convert a photo to optimised WebP
```

## Making a new flyer

1. Duplicate a template in `flyers/templates/` (e.g. `product-spotlight.html` → `product-bc5150.html`).
2. Edit the text and image inside the `<!-- EDIT -->` blocks. Keep it under 25 words.
3. Run `npm run flyers -- product-bc5150`.
4. Add the caption to `flyers/captions.md`, get approval, then post.

| Template | Size | Use |
|---|---|---|
| `product-spotlight` | 1080×1350 | One product, three benefits, quote CTA |
| `milestone-award` | 1080×1350 | Awards, press, partnerships (real event photo) |
| `expert-tip` | 1080×1350 | Educational tips; builds authority |
| `branches-story` | 1080×1920 | Instagram Story / WhatsApp Status |
| `og-image` | 1200×630 | Website link-preview image (also written to `site/assets/img/og-image.jpg`) |

## Git workflow

- `main` holds only work the client has approved. Everything else goes on a branch and is merged by pull request.
- Branch names: `feature/<page>`, `fix/<issue>`, `flyers/<yyyy-mm>`, `docs/<topic>`.
- Commit messages are imperative and specific: `Add product detail page prototype`, `Fix hero overflow at 360px`.

## Content rules (non-negotiable)

- **No invented facts.** Stats, testimonials and claims must be confirmed by Flokefama. Numbers awaiting confirmation are marked with a `NOTE` comment in `site/index.html`.
- **Real photos only** for events and people. Product images should be manufacturer or own photography, never copied from Amazon or Bing.
- All images and logos in `site/assets/img` come from the current flokefama.com and belong to Flokefama and the respective partners.
