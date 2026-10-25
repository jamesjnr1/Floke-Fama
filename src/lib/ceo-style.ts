/**
 * "Meet our CEO" on About. 'message' (default): a "Leadership" photo banner, then "Message from our CEO", his profile
 * in paragraphs and his creed as a quote with his name, beside a tall portrait. 'feature': a green band with the heading, his
 * name and title, the portrait reaching below it, then Profile, Education, Honours and Philanthropy & Purpose behind
 * four buttons. 'tabs': the earlier section, with the portrait beside the profile in tabs.
 * Switch with NEXT_PUBLIC_CEO_STYLE=feature (or tabs) in Vercel (then redeploy).
 */
const styles = ['message', 'feature', 'tabs'] as const;
const env = process.env.NEXT_PUBLIC_CEO_STYLE as (typeof styles)[number] | undefined;
export const ceoStyle: (typeof styles)[number] = env && styles.includes(env) ? env : 'message';
