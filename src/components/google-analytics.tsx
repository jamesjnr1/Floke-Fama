/* eslint-disable @next/next/no-before-interactive-script-outside-document -- that rule is for the old pages/ router; in the app/ router beforeInteractive belongs in the root layout, as here */
import Script from 'next/script';

/**
 * Google Analytics (GA4) and Google Tag Manager, at the top of the <head> of every page, once, on the live site only
 * (Vercel production), so tests and previews aren't counted. The site's security rules allow Google's addresses
 * (next.config.ts, `ga`).
 *
 * Loaded with next/script `beforeInteractive`: Next.js puts them first in the <head> itself, outside the part of the
 * page React checks when it takes over. Rendered as plain <script> tags they broke the page (Nov 2026): Google's tags
 * add scripts of their own to the <head> while the page loads, React found a <head> different from the one the server
 * sent (React error #418), threw the page away and drew it again, which cut the opening animation short.
 *
 * NEXT_PUBLIC_GA_ID and NEXT_PUBLIC_GTM_ID replace the IDs; "off" switches either off. Tags added inside Tag Manager
 * that load scripts from other companies need their addresses allowed in next.config.ts.
 */
const live = process.env.VERCEL_ENV === 'production';
const gaId = (process.env.NEXT_PUBLIC_GA_ID?.trim() || 'G-NDWC0XZN4H').replace(/[^A-Z0-9-]/gi, '');
const gtmId = (process.env.NEXT_PUBLIC_GTM_ID?.trim() || 'GTM-WZRQP9GV').replace(/[^A-Z0-9-]/gi, '');
const gaOn = live && /^G-[A-Z0-9]+$/i.test(gaId);
const gtmOn = live && /^GTM-[A-Z0-9]+$/i.test(gtmId);

export function GoogleTags() {
  if (!gaOn && !gtmOn) return null;
  return (
    <>
      {/* Google tag (gtag.js) and Google Tag Manager, as Google gives them */}
      <Script id="google-tags" strategy="beforeInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
${gaOn ? `gtag('config', '${gaId}');` : ''}`}
      </Script>
      {gaOn && <Script id="google-tag" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="beforeInteractive" />}
      {gtmOn && <Script id="google-tag-manager" src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`} strategy="beforeInteractive" />}
    </>
  );
}
