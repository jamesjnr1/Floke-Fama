/**
 * The Google tag (Google Analytics, GA4), exactly as Google gives it, first in the <head> of every page, once. Only on
 * the live site (Vercel production), so tests and previews aren't counted. NEXT_PUBLIC_GA_ID replaces the ID; set it
 * to "off" to switch it off. The site's security rules allow Google's addresses (next.config.ts, `ga`).
 */
const id = (process.env.NEXT_PUBLIC_GA_ID?.trim() || 'G-NDWC0XZN4H').replace(/[^A-Z0-9-]/gi, '');
const on = process.env.VERCEL_ENV === 'production' && /^G-[A-Z0-9]+$/i.test(id);

export function GoogleTag() {
  if (!on) return null;
  return (
    <>
      {/* Google tag (gtag.js) */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${id}');`,
        }}
      />
    </>
  );
}

/**
 * Google Tag Manager (GTM-WZRQP9GV), exactly as given, in the <head> of every page next to the Google tag, on the
 * live site only. NEXT_PUBLIC_GTM_ID replaces the container ID; "off" switches it off. Tags added inside Tag Manager
 * that load scripts from other companies need their addresses allowed in next.config.ts (the Content Security Policy).
 */
const gtmId = (process.env.NEXT_PUBLIC_GTM_ID?.trim() || 'GTM-WZRQP9GV').replace(/[^A-Z0-9-]/gi, '');
const gtmOn = process.env.VERCEL_ENV === 'production' && /^GTM-[A-Z0-9]+$/i.test(gtmId);

export function TagManager() {
  if (!gtmOn) return null;
  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());`,
        }}
      />
    </>
  );
}
