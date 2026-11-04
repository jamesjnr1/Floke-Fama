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
 * Microsoft Clarity (heatmaps and session recordings), first in the <head> of every page with the Google tag, on the
 * live site only. The portals and the admin console mask their content (data-clarity-mask), so recordings there show
 * where people click and scroll but not hospital names, phone numbers or orders. NEXT_PUBLIC_CLARITY_ID replaces the
 * project ID; "off" switches it off.
 */
const clarityId = (process.env.NEXT_PUBLIC_CLARITY_ID?.trim() || 'z8ikuzltr3').replace(/[^a-z0-9]/gi, '');
const clarityOn = process.env.VERCEL_ENV === 'production' && clarityId !== 'off' && /^[a-z0-9]{6,}$/i.test(clarityId);

export function ClarityTag() {
  if (!clarityOn) return null;
  return (
    <script
      type="text/javascript"
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${clarityId}");`,
      }}
    />
  );
}
