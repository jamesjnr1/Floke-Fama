/**
 * Home page layout. 'classic' (default): the current home page. 'blueprint': the structure from the wireframe:
 * hero with a photo, partner logos, highlighted equipment, why us, reviews, FAQs and a closing call to action, on light
 * backgrounds with faint patterns. Switch with NEXT_PUBLIC_HOME_LAYOUT=blueprint in Vercel (then redeploy).
 */
export const homeLayout: 'classic' | 'blueprint' = process.env.NEXT_PUBLIC_HOME_LAYOUT === 'blueprint' ? 'blueprint' : 'classic';
