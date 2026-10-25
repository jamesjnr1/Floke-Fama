import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Inter, Mona_Sans, Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { MotionProvider } from '@/components/layout/motion-provider';
import { ServiceWorkerRegister } from '@/components/layout/sw-register';
import { bootScript, revealNowScript } from '@/lib/a11y';
import { SiteProvider } from '@/components/site-provider';
import { getSite } from '@/lib/site';
import type { Contact } from '@/lib/site-content';
import { allowIndexing, siteUrl, jsonLdHtml } from '@/lib/utils';
import '@/styles/uicons/uicons.css';
import './globals.css';

/** Plus Jakarta Sans: the main typeface (headings, body, navigation, the hero). Space Grotesk: small labels and figures. */
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-grotesk', display: 'swap' });
// Italic serif for the accent words in page headers
// Mona Sans: the menu bar only
const mona = Mona_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-mona', display: 'swap' });
// Inter Black: the FLOKE FAMA lettering on the hero, as in the hero designs
const inter = Inter({ subsets: ['latin'], weight: '900', variable: '--font-inter', display: 'swap' });
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', variable: '--font-instrument', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Flokefama | Ghana’s No.1 Healthcare Company', template: '%s | Flokefama' },
  description:
    'Flokefama supplies, installs and maintains world-class medical equipment and laboratory diagnostics for hospitals across Ghana and West Africa. Official distributor of Mindray.',
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
    <html lang="en-GH" data-patterns={process.env.NEXT_PUBLIC_PATTERNS === 'off' ? 'off' : undefined} className={`${jakarta.variable} ${grotesk.variable} ${serif.variable} ${mona.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(organizationLd(site.contact)) }} />
        <script dangerouslySetInnerHTML={{ __html: revealNowScript }} />
      </body>
    </html>
  );
}
