import type { NextConfig } from 'next';

/**
 * Content Security Policy: the browser may only run scripts, load images and fonts, and connect to the places this site
 * uses. If someone managed to slip a script into a page, it could not load code from elsewhere or send data out.
 *   - Scripts: the site itself; the live chat (Tidio, or Tawk.to); the engineer portal's photo check (MediaPipe from
 *     jsDelivr, run as WebAssembly). Inline scripts are needed by Next.js itself.
 *   - Images, fonts, video: the site, Sanity's image CDN, Appwrite's storage (engineers' photos, hospital logos), and
 *     the live chat's own files.
 *   - Connections: the site, the live chat (including its live socket), jsDelivr (the photo check), Algolia only
 *     when product search uses it.
 * Switch (env, at build): CSP=report only reports what would be blocked (in the browser console) instead of
 * blocking it; CSP=off sends only the baseline rules (no framing, no plugins). Default: enforced.
 */
const algolia = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? ' https://*.algolia.net https://*.algolianet.com' : '';
// Photos and logos kept in Appwrite's storage (engineers' photos, hospital logos) are shown straight from it
const appwriteOrigin = (() => {
  try {
    return process.env.APPWRITE_ENDPOINT ? ` ${new URL(process.env.APPWRITE_ENDPOINT).origin}` : '';
  } catch {
    return '';
  }
})();
const storage = ` https://*.appwrite.io${appwriteOrigin}`;
// Vercel's preview toolbar (preview deployments only, never production)
const preview = process.env.VERCEL_ENV === 'preview' ? ' https://vercel.live' : '';
const chat = {
  script: 'https://code.tidio.co https://embed.tawk.to https://*.tawk.to',
  connect: 'https://*.tidio.co wss://*.tidio.co https://*.tidiochat.com https://uploads.tidio.com https://*.tawk.to wss://*.tawk.to',
  img: 'https://*.tidio.co https://*.tidiochat.com https://tidio-images-messenger.s3.us-east-1.amazonaws.com https://cdnjs.cloudflare.com https://unpkg.com https://*.tawk.to https://tawk.link',
  font: 'https://code.tidio.co https://*.tawk.to',
  media: 'https://code.tidio.co https://*.tawk.to',
  frame: 'https://*.tidio.co https://*.tawk.to',
};
/** Google Analytics (components/google-analytics.tsx): Google's documented addresses for the tag and its reports. */
const ga = {
  script: 'https://*.googletagmanager.com',
  img: 'https://*.google-analytics.com https://*.googletagmanager.com https://www.google.com',
  // www.google.com: Google signals (demographics), which GA4 sends alongside each page view
  connect: 'https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com',
};
const baseline = `frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'${process.env.VERCEL ? '; upgrade-insecure-requests' : ''}`;
const policy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' ${chat.script} ${ga.script} https://cdn.jsdelivr.net${preview}${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline' https://*.tawk.to${preview}`,
  `img-src 'self' data: blob: https://cdn.sanity.io${storage} ${chat.img} ${ga.img}${preview}`,
  `font-src 'self' data: ${chat.font}${preview}`,
  `connect-src 'self' https://cdn.sanity.io https://cdn.jsdelivr.net ${chat.connect} ${ga.connect}${algolia}${preview}${preview ? ' wss://ws-us3.pusher.com' : ''}`,
  `media-src 'self' blob: https://cdn.sanity.io ${chat.media}`,
  `frame-src 'self' ${chat.frame}${preview}`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  baseline,
].join('; ');
const cspMode = (process.env.CSP ?? '').trim().toLowerCase();
const csp =
  cspMode === 'off'
    ? [{ key: 'Content-Security-Policy', value: baseline }]
    : cspMode === 'report'
      ? [{ key: 'Content-Security-Policy', value: baseline }, { key: 'Content-Security-Policy-Report-Only', value: policy }]
      : [{ key: 'Content-Security-Policy', value: policy }];

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self), usb=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  ...csp,
  // A site opened from a link can't reach back into this one (WhatsApp and maps links still open normally)
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
];

// Pre-launch safety: every response carries noindex until the launch switch is set
// (see allowIndexing in src/lib/utils.ts). Covers images and PDFs, not just pages.
if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'true') {
  securityHeaders.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Next-gen formats for all equipment photography
    formats: ['image/avif', 'image/webp'],
    // Fewer widths per image (the defaults list 16), so pages with many photos, like the Shop, stay light
    deviceSizes: [640, 828, 1080, 1440, 1920],
    imageSizes: [96, 256, 384],
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      // The service worker must never be served stale
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }] },
    ];
  },
  async redirects() {
    // Preserve SEO equity from the old WordPress URLs
    return [
      { source: '/index.php/shop', destination: '/products', permanent: true },
      // Product pages keep the same slugs as the current shop
      { source: '/index.php/product/:slug', destination: '/products/:slug', permanent: true },
      // News, blog and press posts: /index.php/2026/08/03/<slug>/ → /news/<slug>
      { source: '/index.php/:y(\\d{4})/:m(\\d{2})/:d(\\d{2})/:slug', destination: '/news/:slug', permanent: true },
      { source: '/index.php/category/:cat', destination: '/events#news', permanent: true },
      { source: '/index.php/careers', destination: '/support', permanent: true },
      { source: '/event/:slug', destination: '/events', permanent: true },
      { source: '/index.php/product-category/:slug', destination: '/products', permanent: true },
      { source: '/index.php/contact', destination: '/support', permanent: true },
      { source: '/index.php/contact-us', destination: '/support', permanent: true },
      // The Contact page was folded into Support
      { source: '/contact', destination: '/support', permanent: true },
      { source: '/index.php/services', destination: '/services', permanent: true },
      { source: '/index.php/about-us', destination: '/about', permanent: true },
      { source: '/index.php/awards', destination: '/awards', permanent: true },
      { source: '/index.php/esg', destination: '/esg', permanent: true },
      { source: '/index.php/media-centre', destination: '/events#news', permanent: true },
      { source: '/index.php/my-account/:path*', destination: '/portal', permanent: true },
      { source: '/shop', destination: '/products', permanent: true },
      { source: '/products/mindray-bs-240', destination: '/products?category=in-vitro-diagnostics', permanent: true },
      // WordPress author pages ("Adminfloke") and the old home page
      { source: '/index.php/author/:path*', destination: '/events#news', permanent: true },
      { source: '/author/:path*', destination: '/events#news', permanent: true },
      { source: '/index.php', destination: '/', permanent: true },
      // The news has no page of its own: it lives on Events & News (each article stays at /news/<slug>)
      { source: '/news', destination: '/events#news', permanent: true },
      // Earlier preview URLs
      { source: '/solutions', destination: '/services', permanent: true },
      { source: '/partners', destination: '/#partners', permanent: true },
      { source: '/impact', destination: '/about', permanent: true },
      { source: '/media', destination: '/events', permanent: true },
      // Any other old WordPress address: the same address without index.php (QA audit, Nov 2026). It skips every
      // address that has its own redirect above: Vercel let a plain catch-all win over them, whatever the order
      // (about-us, products, categories and careers ended on Page not found)
      {
        source: '/index.php/:path((?!(?:shop|product|product-category|category|careers|contact|contact-us|services|about-us|awards|esg|media-centre|my-account|author)(?:/|$)|\\d{4}/).+)',
        destination: '/:path',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
