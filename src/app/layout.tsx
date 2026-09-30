import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { ServiceWorkerRegister } from '@/components/layout/sw-register';
import { contact } from '@/data/seed';
import { allowIndexing, siteUrl } from '@/lib/utils';
import '@/styles/uicons/uicons.css';
import './globals.css';

const poppins = localFont({
  variable: '--font-poppins',
  display: 'swap',
  src: [
    { path: '../fonts/poppins-300.woff2', weight: '300' },
    { path: '../fonts/poppins-400.woff2', weight: '400' },
    { path: '../fonts/poppins-500.woff2', weight: '500' },
    { path: '../fonts/poppins-600.woff2', weight: '600' },
    { path: '../fonts/poppins-700.woff2', weight: '700' },
  ],
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

export const viewport: Viewport = { themeColor: '#070c14', width: 'device-width', initialScale: 1 };

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
    <html lang="en-GH" className={poppins.variable}>
      <body className="font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-surgical-600 focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <Toaster
          position="top-right"
          toastOptions={{
            classNames: {
              toast: '!rounded-2xl !border !border-line !bg-paper/95 !backdrop-blur-xl !shadow-[0_20px_50px_-20px_rgb(11_18_32/0.35)] !font-sans',
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
