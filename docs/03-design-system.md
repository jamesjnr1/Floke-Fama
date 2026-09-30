# Flokefama Design System (v4, "Premium Clinical")

> **v4 (current):** the tokens below replace earlier versions. They live in `src/app/globals.css` (`@theme`) and mirror the Figma local variables one-to-one. Earlier sections further down are kept for history; where they conflict, **v4 wins**.

## v4 tokens (Figma variables → Tailwind)
| Figma variable | Value | Tailwind | Use |
|---|---|---|---|
| `brand/midnight` | `#0F172A` | `bg-midnight` | Dark canvas (hero, portal, footer) |
| `brand/neon-blue` | `#3B82F6` | `neon-500` (fills use `neon-600` `#2563EB` for AA contrast with white text) | Primary actions, data highlights, glows |
| `brand/surgical-green` | `#10B981` | `bg-surgical`, `.status-dot`, `emerald-*` | Pulsating active-machine / status dots, "pass" states |
| `canvas/clean-white` | `#F8F9FA` | `bg-canvas` | Light solutions catalogue sections |

| Figma text style | Spec | Implementation |
|---|---|---|
| `Display/Hero Large` | Geist Sans, 80px, Bold, −3% tracking | `.display` + `text-[clamp(…,5rem)]`, hero slogan uppercase |
| `Heading/Muted Label` | Geist Mono, 12px, Medium, +15% tracking, uppercase | `.label` |

Fonts load via the `geist` package (`next/font`), self-hosted with no layout shift. Buttons and the header CTA use a 12px radius (`rounded-xl`).

**Component ↔ Figma frame map:** `Navbar.tsx` (Global Header) · `hero.tsx` (Hero Section) · `partners.tsx` (Partners & Clientele) · `BentoGrid.tsx` (Insights Deck) · `portal/PortalShell.tsx` (Portal Shell + Sidebar Rail) · `portal/AssetStatusList.tsx` (System Status Rail) · `portal/TimelineTracker.tsx` (Interactive Timeline Block) · `portal/QuickActions.tsx` (Terminal Button + Radial Efficiency Chart).

**Social flyers** still use the original green brand palette and Poppins. Align them to v4 if Flokefama wants the social channels to match the site.


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
