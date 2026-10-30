/**
 * Menu bar style. 'bar' (default): a dark bar across the full width, fixed at the top. 'floating': the earlier
 * rounded glass bar that floats over the page. Switch with NEXT_PUBLIC_NAV_STYLE in Vercel (then redeploy).
 */
export const navStyle: 'bar' | 'floating' = process.env.NEXT_PUBLIC_NAV_STYLE === 'floating' ? 'floating' : 'bar';
