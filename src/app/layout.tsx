import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'sonner';
import { MotionProvider } from '@/components/layout/motion-provider';
import { MaintenanceBanner } from '@/components/layout/maintenance-banner';
import { ServiceWorkerRegister } from '@/components/layout/sw-register';
import { bootScript, revealNowScript } from '@/lib/a11y';
import { introOn, introPlayer } from '@/lib/intro';
import { SiteProvider } from '@/components/site-provider';
import { GoogleTags } from '@/components/google-analytics';
import { getSite } from '@/lib/site';
import { socials } from '@/data/socials';
import type { Contact } from '@/lib/site-content';
import { allowIndexing, siteUrl, jsonLdHtml } from '@/lib/utils';
import '@/styles/uicons/uicons.css';
import './globals.css';

/*
 * One typeface across the site (the IT team's review, Nov 2026): Plus Jakarta Sans, kept in the site (src/app/fonts,
 * Latin, from Google Fonts, SIL Open Font License), so a build never depends on Google Fonts answering and visitors'
 * browsers never contact Google for it.
 */
const jakarta = localFont({ src: './fonts/jakarta.woff2', weight: '400 800', variable: '--font-jakarta', display: 'swap' });
// Two exceptions kept by request: Inter Black for the big FLOKE FAMA lettering (hero and footer), and the italic serif
// for the accent words in page headers
const inter = localFont({ src: './fonts/inter.woff2', weight: '900', variable: '--font-inter', display: 'swap' });
const serif = localFont({ src: './fonts/serif.woff2', weight: '400', style: 'italic', variable: '--font-instrument', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Flokefama | Ghana’s No.1 Healthcare Company', template: '%s | Flokefama' },
  description:
    'Flokefama supplies, installs and maintains world-class medical equipment and laboratory diagnostics for hospitals across Ghana and West Africa. Official distributor of Mindray.',
  // The share picture: the hero's first slide (?v= changes when it does, so apps fetch the new one)
  openGraph: { type: 'website', siteName: 'Flokefama', images: [{ url: '/images/og-image.jpg?v=4', width: 1200, height: 630, alt: 'Flokefama, Ghana’s No.1 Healthcare Company' }] },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/images/favicon.png' },
  robots: allowIndexing ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#16232a', width: 'device-width', initialScale: 1 };

/**
 * Who Flokefama is, for search engines (schema.org): the head office with its map position, every branch with its
 * phone, the 24/7 support line, where it works, and its social profiles. Kept in step with the Studio (Site content).
 */
const organizationLd = (contact: Contact, branches: { name: string; detail: string; phone?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  '@id': `${siteUrl}/#organization`,
  name: 'Flokefama Company Limited',
  alternateName: 'Flokefama',
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  image: `${siteUrl}/images/og-image.jpg?v=4`,
  description: 'Medical equipment and laboratory diagnostics supplied, installed, maintained and calibrated for hospitals and laboratories across Ghana and West Africa. Official distributor of Mindray.',
  foundingDate: '2008',
  telephone: contact.phone,
  email: contact.info,
  address: { '@type': 'PostalAddress', streetAddress: contact.address || undefined, addressLocality: 'Accra', addressRegion: 'Greater Accra', addressCountry: 'GH' },
  ...(contact.lat && contact.lng ? { geo: { '@type': 'GeoCoordinates', latitude: contact.lat, longitude: contact.lng } } : {}),
  areaServed: [{ '@type': 'Country', name: 'Ghana' }, { '@type': 'Place', name: 'West Africa' }],
  contactPoint: [
    { '@type': 'ContactPoint', contactType: 'customer support', telephone: contact.phone, email: contact.support || contact.info, availableLanguage: ['English'], hoursAvailable: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' } },
    ...(contact.sales ? [{ '@type': 'ContactPoint', contactType: 'sales', email: contact.sales, telephone: contact.phone }] : []),
  ],
  department: branches.map((b) => ({ '@type': 'MedicalBusiness', name: `Flokefama ${b.name}`, address: { '@type': 'PostalAddress', streetAddress: b.detail || undefined, addressLocality: b.name, addressCountry: 'GH' }, telephone: b.phone || undefined })),
  sameAs: socials.map((x) => x.href),
});

/** The site itself, with its catalogue search, so search engines can offer a search box for it. */
const websiteLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}/#website`,
  name: 'Flokefama',
  url: siteUrl,
  publisher: { '@id': `${siteUrl}/#organization` },
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/products?q={search_term_string}` }, 'query-input': 'required name=search_term_string' },
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <html lang="en-GH" data-banner={site.maintenance.show ? undefined : 'off'} data-patterns={process.env.NEXT_PUBLIC_PATTERNS === 'off' ? 'off' : undefined} className={`${jakarta.variable} ${inter.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        <GoogleTags />
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* The opening's player (lib/intro.ts): plain JavaScript, so it plays on time and React can't cut it short */}
        {introOn && <script dangerouslySetInnerHTML={{ __html: introPlayer }} />}
      </head>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        {site.maintenance.show && <MaintenanceBanner notice={site.maintenance} />}
        <SiteProvider value={site}>
          <MotionProvider>{children}</MotionProvider>
        </SiteProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: '!rounded-2xl !border !border-line !bg-paper/95 !backdrop-blur-xl !shadow-[0_20px_50px_-20px_rgb(11_21_16/0.35)] !font-sans',
              title: '!text-ink !font-medium',
              description: '!text-ink-3',
            },
          }}
        />
        <ServiceWorkerRegister />
        {/* Vercel Web Analytics: only on Vercel, where its script is served */}
        {process.env.VERCEL && <Analytics />}
        {/* Vercel Speed Insights: track Core Web Vitals */}
        {process.env.VERCEL && <SpeedInsights />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml([organizationLd(site.contact, site.branches), websiteLd()]) }} />
        <script dangerouslySetInnerHTML={{ __html: revealNowScript }} />
      </body>
    </html>
  );
}
