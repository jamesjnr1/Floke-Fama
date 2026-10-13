/**
 * Home hero style. 'strips' (default): the headline on the left, the text and buttons on its right, and the equipment
 * as a row of photo strips underneath. 'card': the earlier hero, with the text on the left and a cross-fading
 * equipment card on the right. 'carousel': the earlier hero with a row of product tiles instead of the card.
 * Switch with NEXT_PUBLIC_HERO_STYLE=card (or carousel) in Vercel (then redeploy).
 */
const style = process.env.NEXT_PUBLIC_HERO_STYLE;
export const heroStyle: 'strips' | 'card' | 'carousel' = style === 'card' || style === 'carousel' ? style : 'strips';
