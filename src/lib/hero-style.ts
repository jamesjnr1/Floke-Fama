/**
 * Home hero style. 'catalogue' (default): the text on the left and an open Flokefama product catalogue on the right,
 * its page turning through the equipment the CEO's review lists. 'strips': the headline with the equipment as photo
 * strips underneath. 'card': the earlier hero with a cross-fading equipment card. 'carousel': the earlier hero with a
 * row of product tiles. Switch with NEXT_PUBLIC_HOME_HERO=strips (or card, carousel) in Vercel (then redeploy).
 * A new name: the older NEXT_PUBLIC_HERO_STYLE=card, still set in Vercel from before, would otherwise keep the
 * earlier hero.
 */
const styles = ['catalogue', 'strips', 'card', 'carousel'] as const;
const style = process.env.NEXT_PUBLIC_HOME_HERO as (typeof styles)[number] | undefined;
export const heroStyle: (typeof styles)[number] = style && styles.includes(style) ? style : 'catalogue';

/**
 * Home hero background. 'teal' (default): the dark Mirage → Deep Sea gradient. 'navy', 'graphite', 'dots' and
 * 'aurora': other dark backgrounds. 'light': a light, clinical background with dark text.
 * Switch with NEXT_PUBLIC_HERO_BG in Vercel (then redeploy).
 */
export const heroBackgrounds = ['teal', 'navy', 'graphite', 'light', 'dots', 'aurora'] as const;
export type HeroBackground = (typeof heroBackgrounds)[number];
const bg = process.env.NEXT_PUBLIC_HERO_BG as HeroBackground | undefined;
export const heroBackground: HeroBackground = bg && heroBackgrounds.includes(bg) ? bg : 'teal';
