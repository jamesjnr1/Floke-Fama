# Flokefama Design System (v5, company colours)

> **Rule: company colours only.** Every accent comes from the Flokefama logo: **green** (disc) and **red** (dot), on neutral backgrounds. No other hues. Where older sections below conflict, **v5 wins**. The only exceptions are photography and partner logos, which are shown exactly as the manufacturers and hospitals publish them.

## Colour tokens (`src/app/globals.css` → `@theme`)
| Token | Value | Use |
|---|---|---|
| `brand-600` | **`#257847`** (logo green) | Primary buttons, links, active states. 5.6:1 with white text (AA) |
| `brand-50 … brand-800` | `#EEF7F1` → `#134228` | Tints and shades of the logo green: surfaces, glows, gradients, hovers |
| `signal` | **`#E4283C`** (logo red) | Sparingly: critical priority, "needs attention", error states |
| `signal-700` | `#B41D2E` | Logo red darkened for AA text on light backgrounds |
| `surgical` | `#3AA867` | Live status dots (brand green lifted for visibility on dark) |
| `midnight` | `#0B1510` | Dark canvas: a rich black with a hint of the logo green |
| `canvas` / `paper` | `#F8F9FA` / `#FFFFFF` | Light sections |
| `ink`, `ink-2`, `ink-3`, `line`, `mist` | neutral greys | Text and borders |

**Mobile:** sections use tighter vertical padding on phones, and stacks of cards (awards, impact stories, news, ESG, mission, why-choose, categories) become a horizontal swipe row (`.swipe-row` in `globals.css`); the catalogue is two columns; the footer is compact.

**Section rhythm:** pages alternate dark (`midnight`), light (`canvas`/`paper`) and **brand green** (a deep `brand-700 → brand-800` gradient, used for Core values and ESG “Made in Ghana”), so no page is a run of dark sections.

Hover states always go **darker** (`brand-700`), never lighter, so white text stays AA-compliant.

**Hero 3D:** a dotted globe with the head office as a pulsing logo-red node and green arcs carrying light pulses out to facilities; glass read-outs show the published figures. Pauses off-screen; a still frame with reduced motion.

**Logos:** partner and client logos are trimmed of built-in margins and sized to equal visual area (`logoBox` in `home/partners.tsx`), so wordmarks and crests look the same size.

**Product renders on dark:** use cut-outs with feathered edges (see `scripts/stage-image.mjs`), never a rectangular photo that is rotated or masked on one side only. Coloured light in renders is recoloured to the logo green.

**Verification:** every page is audited in a real browser. A script reads each element's computed colours (text, backgrounds, gradients, borders, shadows, SVG) and fails on any blue or purple hue. Current result: all pages pass.

## Typography
| Style | Spec | Implementation |
|---|---|---|
| Text (headings + body) | **Poppins** (self-hosted, `src/fonts/`, 300–700) | `font-sans` (default) |
| Display/Hero Large | Poppins Semibold, −3% tracking, uppercase for page slogans | `.display` |
| Labels, numerals, accents | **Geist Sans**, 12px, Medium, +15% tracking, uppercase | `.label` / `font-mono` utility |

Only these two typefaces are used. (The `font-mono` utility is mapped to Geist Sans.)

## Navigation
- Mirrors the flokefama.com menu, each tab its own page: **Home** · **Company** ▾ (About Us `/about`, Awards `/awards`) · **Products & Services** `/services` · **Events & Activities** `/events` · **Shop** `/products` · **ESG** `/esg` · **Contact** `/contact`. Below 1280 px it collapses into the menu button.
- Company opens a dropdown (text only, no icons) on hover, click or keyboard (Escape closes).
- The header is always the dark glass bar (solid on pages that open light, such as Shop), so it never changes colour between tabs. **Get a Quote** (the procurement portal) and **Client Portal** sit at the right.
- Hover: a soft glass pill **glides** between items (Motion shared `layoutId`), and also follows keyboard focus. No underline.
- Active page: a quiet persistent pill plus a small brand-green dot, with `aria-current="page"`.

**Component map:** `Navbar.tsx` (Global Header) · `home/testimonials.tsx` · `contact/visit-us.tsx` (head office photo, greyscale live map, directions, branches) · `contact/get-in-touch.tsx` + `contact-form.tsx` (in the footer) · `awards/awards-gallery.tsx` · `home/hero-globe.tsx` + `lib/three/globe-scene.ts` (hero 3D) · `about/impact.tsx` · `about/core-values.tsx` · `home/services.tsx` (service lifecycle rail) · `engineer/*` (service portal app) · `page-hero.tsx` (shared dark page header) · `media/news-grid.tsx` (Newsroom) · `hero.tsx` (Hero Section) · `partners.tsx` (Partners & Clientele) · `BentoGrid.tsx` (Insights Deck) · `client-portal/tickets.tsx` + `inventory.tsx` (Client portal) · `auth/login-form.tsx` (Sign-in card) · `engineer/PortalShell.tsx` (Engineer Portal Shell + Sidebar Rail) · `engineer/AssetStatusList.tsx` (System Status Rail) · `engineer/TimelineTracker.tsx` (Interactive Timeline Block) · `engineer/QuickActions.tsx` (Terminal Button + Radial Efficiency Chart).

**Social flyers** already use the brand green and red and Poppins, so they match the site.


The rules that make the website, flyers and brochures look like one flagship healthcare brand. Every token below is a CSS custom property in `site/assets/css/styles.css`.

## Direction
**Cinematic, clinical, confident.** Deep emerald darkness, light-emitting glass and real-time 3D, balanced with calm white sections for reading. The reference points are flagship pharma and medtech brands (Roche, Siemens Healthineers, Novartis), not a typical local supplier template.

1. **Dark to open, light to read.** Hero, impact, contact and footer are dark "stage" sections. Solutions, services, products and news are light and airy.
2. **One hero moment.** A real-time 3D molecule with floating two-tone capsules (Three.js). Everywhere else, depth comes from glass, soft shadows and subtle 3D tilt, never clutter.
3. **Simple content.** Short headlines, one idea per section, one primary action: *Request a quote*.
4. **Green leads, red signals.** Red (the dot in the logo) appears as tiny accents only: the pulse dot and the oxygen atoms in the 3D molecule.

## Colour
| Token | Hex | Use |
|---|---|---|
| `--night` | `#03110A` | Dark stage sections |
| `--emerald-800` | `#0E3F26` | Deep gradients, icon chip base |
| **`--emerald-600`** | **`#257847`** | **Brand primary.** Buttons, links, highlights on light |
| `--emerald-400` | `#3FBF7F` | Glows, gradient midpoint |
| `--mint-300` | `#7FE0A8` | Accents on dark (eyebrows, icons, stats labels) |
| `--mint-50` | `#EFF8F3` | Tinted light surfaces |
| **`--red-500`** | **`#E4283C`** | Accent only |
| `--ink` / `--ink-2` | `#0B1A12` / `#405048` | Headings / body text on light |
| Glass | `rgba(255,255,255,.06)` + `.12` border + `backdrop-filter: blur()` | Cards, pills and nav on dark |

Signature gradient text (on dark): `linear-gradient(100deg, #7FE0A8, #3FBF7F, #B9F2D2)`.

## Typography: Poppins only
Self-hosted in `site/assets/fonts/` (weights 300, 400, 500, 600, 700; ~8 KB each).

| Role | Weight | Size (mobile → desktop) | Tracking |
|---|---|---|---|
| Hero display | 600 | 42 → 84 px | -0.04em |
| Section title (h2) | 600 | 32 → 54 px | -0.025em |
| Card title (h3) | 600 | 18 → 22 px | -0.015em |
| Lead / body | **300** / 400 | 17–20 / 16–17 px | 0 |
| Eyebrow | 500, uppercase | 13 px | 0.16em, with a 24 px gradient rule |

Light (300) body copy against heavy (600) headings is what gives Poppins its premium feel. Don't use 700 for headings; it looks generic.

## Icons: Flaticon UIcons
- Use the **Regular Rounded** set (`fi-rr-*`) for UI and **Brands** (`fi-brands-*`) for social. Browse at https://www.flaticon.com/uicons.
- Usage: `<i class="fi-rr-microscope"></i>`
- After adding or changing icons, run `npm run icons`. It scans the HTML and rebuilds a subset font containing only the icons in use (**~4 KB instead of ~400 KB**). It fails loudly if an icon name doesn't exist.
- **3D icon chip:** wrap feature icons in `<span class="icon-3d">…</span>` (or `icon-3d icon-3d--sm`). It gives a glossy emerald tile with a top highlight, inner shading and a coloured drop shadow, and it straightens up on hover.

## 3D & motion
| Element | Technique |
|---|---|
| Hero molecule + capsules | Three.js (`src/hero3d.js`, built to `site/assets/js/hero3d.js` with `npm run build:3d`). Physical materials with clearcoat, studio environment reflections, cursor parallax |
| Cards (solutions, products) | CSS `perspective` tilt driven by the cursor plus a moving glare highlight (`data-tilt`) |
| Product images | "Pedestal" stage: radial light plus a soft floor shadow, so cut-outs feel 3D |
| Glass cards | Float slowly (7 s loop) |
| Stats | Count up when visible. **The final number is in the HTML**, so it can never show "0" |
| Section reveal | Fade and rise with a stagger |

**Performance and accessibility rules:**
- The 3D scene pauses when it's off-screen or the tab is hidden, caps pixel ratio at 2, and fades in only once it's ready.
- If WebGL isn't available, a CSS glow orb stays in place, so the hero still looks finished.
- With `prefers-reduced-motion`, the 3D scene renders a single still frame and all animation is switched off.
- Tilt runs only for mouse/trackpad users, not on touch screens.

## Layout & shape
- Container 1240 px, gutter 20 → 40 px, section padding 80 → 144 px.
- Radius: 12 px (inputs), 20 px (cards), 32 px (large tiles), pills fully round.
- Buttons are fully rounded, 52 px tall, and the primary one has an emerald gradient with an inner highlight.

## Imagery
- Real Flokefama photography first: events, engineers on site, the head office.
- Products are shown on the pedestal stage. Supply square PNG/WebP with a white or transparent background.
- The logo still needs a vector version from the client. The current PNG has a white pill baked in; it works on dark, but an SVG and an all-white version are needed.

## Voice
Confident, precise, warm. Short sentences. Verified numbers only. Ghanaian/British English spelling.
