/**
 * Menu bar style. 'floating' (default): the original rounded glass bar that floats over the page. 'bar': a full-width dark bar.
 * Switch with NEXT_PUBLIC_NAV_STYLE in Vercel (then redeploy).
 */
export const navStyle: 'bar' | 'floating' = process.env.NEXT_PUBLIC_NAV_STYLE === 'bar' ? 'bar' : 'floating';
