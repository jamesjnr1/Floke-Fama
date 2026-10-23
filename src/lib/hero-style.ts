/**
 * Home hero style. 'modern': the wordmark and claim centred on a deep green gradient with a soft glow
 * and a pulsing ECG line, then featured products as glass cards moving across. 'moving': a large row of the eight equipment photos moving slowly across under the menu
 * bar, with the headline on the left and the short text and actions on the right underneath. 'simple' (default): everything centred on the green gradient, with the eight equipment types in one
 * row of photos underneath; a hovered photo widens in the row. 'spotlight': the text on the green gradient, one equipment photo filling the right side and
 * melting into the green, with a numbered index of the eight types between them. 'feature': the text on a calm green gradient beside one equipment photo shown large, with
 * all eight types as thumbnails under it. 'collage': the same with the
 * eight as a photo collage. 'pages': the text on the left and a stack of catalogue pages on the right, the top page
 * turning through the equipment the CEO's review asks to feature. 'catalogue': an open Flokefama product catalogue instead, its page
 * turning through that equipment. 'strips': the headline with the equipment as photo
 * strips underneath. 'card': the earlier hero with a cross-fading equipment card. 'carousel': the earlier hero with a
 * row of product tiles. Switch with NEXT_PUBLIC_HERO_LAYOUT=pages (or catalogue, strips, card, carousel) in Vercel (then redeploy).
 * A new name again: NEXT_PUBLIC_HOME_HERO=card (and the older NEXT_PUBLIC_HERO_STYLE=card), still set in Vercel
 * from before, would otherwise keep the earlier hero.
 */
const styles = ['modern', 'collage', 'feature', 'spotlight', 'simple', 'moving', 'pages', 'catalogue', 'strips', 'card', 'carousel'] as const;
const style = process.env.NEXT_PUBLIC_HERO_LAYOUT as (typeof styles)[number] | undefined;
export const heroStyle: (typeof styles)[number] = style && styles.includes(style) ? style : 'simple';

/**
 * Home hero background. 'teal' (default): the dark Mirage → Deep Sea gradient. 'navy', 'graphite', 'dots' and
 * 'aurora': other dark backgrounds. 'light': a light, clinical background with dark text.
 * Switch with NEXT_PUBLIC_HERO_BG in Vercel (then redeploy).
 */
export const heroBackgrounds = ['teal', 'navy', 'graphite', 'light', 'dots', 'aurora'] as const;
export type HeroBackground = (typeof heroBackgrounds)[number];
const bg = process.env.NEXT_PUBLIC_HERO_BG as HeroBackground | undefined;
export const heroBackground: HeroBackground = bg && heroBackgrounds.includes(bg) ? bg : 'teal';
