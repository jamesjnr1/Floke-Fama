# Flokefama Design System

The rules that make everything (website, flyers, brochures) look like one company. Every token below is already a CSS custom property in `site/assets/css/styles.css`.

## Principles
1. **Clinical calm.** Lots of white space, few colours, nothing flashing. Healthcare buyers are cautious, and calm reads as competent.
2. **Green leads, red signals.** Green is the brand. Red (the dot in the logo) is used sparingly: one highlight per screen, never for whole buttons next to green buttons.
3. **Proof over claims.** Awards, partner logos, real numbers and real photos do the persuading. Adjectives don't.
4. **One primary action per view.** Usually "Request a quote".

## Colour

| Token | Hex | Use |
|---|---|---|
| `--green-700` | `#1B5E37` | Hover state for primary buttons, dark text on mint |
| **`--green-600`** | **`#257847`** | **Brand primary.** Buttons, links, icons |
| `--green-900` | `#0C2E1C` | Dark sections, footer, flyer backgrounds |
| `--mint-50` | `#EEF6F1` | Tinted section backgrounds, icon chips |
| **`--red-500`** | **`#E4283C`** | **Accent only.** Small highlights, badges, the dot |
| `--ink-900` | `#0F1A14` | Headings |
| `--ink-600` | `#4A5A51` | Body text (7.5:1 contrast on white) |
| `--line` | `#E3E9E5` | Borders and dividers |
| `--surface` | `#F7F9F8` | Alternate section background |

Contrast: white on `--green-600` = 5.6:1 ✅ (passes WCAG AA for all text sizes). **Avoid red text on green**, since it fails for colour-blind users.

## Typography
- **Headings:** *Manrope* 700/800, tight tracking (-0.02em). Modern and geometric, and it pairs well with the rounded logo type.
- **Body / UI:** *Inter* 400/500/600 (the site already uses it).
- Fluid scale (uses `clamp()`, so it adapts on its own between mobile and desktop):

| Token | Mobile → Desktop | Use |
|---|---|---|
| `--fs-display` | 40 → 72 px | Hero headline only |
| `--fs-h2` | 30 → 48 px | Section titles |
| `--fs-h3` | 20 → 24 px | Card titles |
| `--fs-body` | 16 → 18 px | Paragraphs |
| `--fs-small` | 14 px | Labels, meta |
| Eyebrow | 13 px, uppercase, 0.12em tracking, green | Small label above section titles |

Max line length: **65 characters** (`max-width: 60ch`) for paragraphs.

## Spacing & layout
- 4 px base unit: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128
- Container: **1200 px** max, 20 px side padding on mobile, 32 px on desktop
- Section vertical padding: 64 px mobile → 112 px desktop
- Radius: 10 px (buttons, inputs), 18 px (cards), 28 px (large media)
- Shadows: one soft shadow only, `0 10px 30px -12px rgba(12,46,28,.18)`

## Components
- **Buttons:** primary (green fill), secondary (white with a green border), ghost (text + arrow). Height 48 px, so they are easy to tap.
- **Cards:** white, 1 px `--line` border, 18 px radius, lift 4 px on hover.
- **Eyebrow + heading + lead:** the standard opening for every section.
- **Stat:** large Manrope number plus a small label. **Numbers are rendered in the HTML, not animated from 0**, which fixes the "0 +" bug.
- **Logo wall:** greyscale logos at 60% opacity that turn full colour on hover, in a fixed grid (3 columns on mobile, 7 on desktop).

## Imagery
- Real Flokefama photos first: the head office, engineers installing equipment, the team, award moments.
- Product shots: **square, pure white background, product centred at ~80% of the frame, WebP, ≤ 120 KB**.
- No stock photos of Western hospitals, and no images copied from Amazon or Bing.
- Over photos, use a dark green gradient on **one side only**, so faces stay visible.

## Logo usage
- Needs a vector (SVG) from the client. The current PNG has a white pill baked in, which is why it looks like a sticker on the green hero.
- Minimum clear space = the height of the "O" symbol. Minimum width 120 px on screen.
- On dark backgrounds, use an all-white version (to be produced from the vector).

## Voice
- Confident, precise, warm. "We install, calibrate and maintain." not "We are passionate about delivering innovative solutions."
- Ghanaian English conventions (organisation, centre, programme).
- Use numbers only when they are verified.
