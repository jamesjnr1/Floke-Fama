import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import { AccessibilityProvider } from '@/components/layout/accessibility';
import { ServiceWorkerRegister } from '@/components/layout/sw-register';
import { a11yBootScript } from '@/lib/a11y';
import { contact } from '@/data/seed';
import { allowIndexing, siteUrl } from '@/lib/utils';
import '@/styles/uicons/uicons.css';
import './globals.css';

/** Poppins (self-hosted): the main typeface for headings and body text. */
const poppins = localFont({
  src: [
    { path: '../fonts/poppins-300.woff2', weight: '300', style: 'normal' },
    { path: '../fonts/poppins-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/poppins-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/poppins-600.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/poppins-700.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-poppins',
  display: 'swap',
});

/** Instrument Serif italic (self-hosted, OFL): the accent word in the home headline. */
const serif = localFont({
  src: [{ path: '../fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' }],
  variable: '--font-instrument',
  display: 'swap',
});

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

export const viewport: Viewport = { themeColor: '#0b1510', width: 'device-width', initialScale: 1 };

const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: 'Flokefama Company Limited',
  url: siteUrl,
  logo: `${siteUrl}/images/logo.png`,
  foundingDate: '2008',
  telephone: contact.phone,
  email: contact.info,
  address: { '@type': 'PostalAddress', addressLocality: 'Santa Maria, Accra', addressCountry: 'GH' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GH" className={`${poppins.variable} ${GeistSans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply saved accessibility preferences before first paint */}
        <script dangerouslySetInnerHTML={{ __html: a11yBootScript }} />
      </head>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <AccessibilityProvider>{children}</AccessibilityProvider>
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      </body>
    </html>
  );
}
