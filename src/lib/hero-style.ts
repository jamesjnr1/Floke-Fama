/**
 * Home hero style. 'strips' (default): the headline on the left, the text and buttons on its right, and the equipment
 * as a row of photo strips underneath. 'card': the earlier hero, with the text on the left and a cross-fading
 * equipment card on the right. 'carousel': the earlier hero with a row of product tiles instead of the card.
 * Switch with NEXT_PUBLIC_HOME_HERO=card (or carousel) in Vercel (then redeploy). A new name: the older
 * NEXT_PUBLIC_HERO_STYLE=card, still set in Vercel from before, would otherwise keep the earlier hero.
 */
const style = process.env.NEXT_PUBLIC_HOME_HERO;
export const heroStyle: 'strips' | 'card' | 'carousel' = style === 'card' || style === 'carousel' ? style : 'strips';

/**
 * Home hero background. 'teal' (default): the dark Mirage → Deep Sea gradient. 'navy', 'graphite', 'dots' and
 * 'aurora': other dark backgrounds. 'light': a light, clinical background with dark text.
 * Switch with NEXT_PUBLIC_HERO_BG in Vercel (then redeploy).
 */
export const heroBackgrounds = ['teal', 'navy', 'graphite', 'light', 'dots', 'aurora'] as const;
export type HeroBackground = (typeof heroBackgrounds)[number];
const bg = process.env.NEXT_PUBLIC_HERO_BG as HeroBackground | undefined;
export const heroBackground: HeroBackground = bg && heroBackgrounds.includes(bg) ? bg : 'teal';
