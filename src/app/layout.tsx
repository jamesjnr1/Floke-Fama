import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { AccessibilityProvider } from '@/components/layout/accessibility';
import { ServiceWorkerRegister } from '@/components/layout/sw-register';
import { a11yBootScript, revealNowScript } from '@/lib/a11y';
import { SiteProvider } from '@/components/site-provider';
import { getSite } from '@/lib/site';
import type { Contact } from '@/lib/site-content';
import { allowIndexing, siteUrl } from '@/lib/utils';
import '@/styles/uicons/uicons.css';
import './globals.css';

/** Plus Jakarta Sans: the main typeface (headings, body, navigation, the hero). Space Grotesk: small labels and figures. */
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-grotesk', display: 'swap' });
// Italic serif for the accent words in page headers
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', variable: '--font-instrument', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Flokefama | Medical Equipment & Diagnostics in Ghana', template: '%s | Flokefama' },
  description:
    'Flokefama supplies, installs and maintains world-class medical equipment and laboratory diagnostics for hospitals across Ghana and West Africa. Official distributor of Mindray, Biozek Holland and MR Global.',
  openGraph: { type: 'website', siteName: 'Flokefama', images: ['/images/og-image.jpg'] },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/images/favicon.png' },
  robots: allowIndexing ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#16232a', width: 'device-width', initialScale: 1 };

const organizationLd = (contact: Contact) => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: 'Flokefama Company Limited',
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  foundingDate: '2008',
  telephone: contact.phone,
  email: contact.info,
  address: { '@type': 'PostalAddress', addressLocality: 'Santa Maria, Accra', addressCountry: 'GH' },
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();
  return (
    <html lang="en-GH" className={`${jakarta.variable} ${grotesk.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply saved accessibility preferences before first paint */}
        <script dangerouslySetInnerHTML={{ __html: a11yBootScript }} />
      </head>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <SiteProvider value={site}>
          <AccessibilityProvider>{children}</AccessibilityProvider>
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd(site.contact)) }} />
        <script dangerouslySetInnerHTML={{ __html: revealNowScript }} />
      </body>
    </html>
  );
}
