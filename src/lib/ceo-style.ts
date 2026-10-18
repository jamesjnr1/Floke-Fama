/**
 * "Meet our CEO" on About. 'feature' (default): a green band with the heading, his name and title, the portrait
 * reaching below it, then Profile, Education, Honours and Philanthropy & Purpose behind four buttons. 'tabs': the earlier
 * section, with the portrait beside the profile in tabs. Switch with NEXT_PUBLIC_CEO_STYLE=tabs in Vercel (then redeploy).
 */
export const ceoStyle: 'feature' | 'tabs' = process.env.NEXT_PUBLIC_CEO_STYLE === 'tabs' ? 'tabs' : 'feature';
