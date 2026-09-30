import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
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
      { source: '/index.php/product/:slug', destination: '/products', permanent: true },
      { source: '/index.php/product-category/:slug', destination: '/products', permanent: true },
      { source: '/index.php/contact', destination: '/quote', permanent: true },
      { source: '/index.php/services', destination: '/#services', permanent: true },
      { source: '/index.php/about-us', destination: '/#trust', permanent: true },
      { source: '/index.php/awards', destination: '/#trust', permanent: true },
    ];
  },
};

export default nextConfig;
