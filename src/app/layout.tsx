import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from 'sonner';
import { AccessibilityProvider } from '@/components/layout/accessibility';
import { ServiceWorkerRegister } from '@/components/layout/sw-register';
import { a11yBootScript } from '@/lib/a11y';
import { contact } from '@/data/seed';
import { allowIndexing, siteUrl } from '@/lib/utils';
import '@/styles/uicons/uicons.css';
import './globals.css';

/** Plus Jakarta Sans: headings, body and navigation. JetBrains Mono: technical labels, specs, badges and numbers. */
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-jetbrains', display: 'swap' });

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
    <html lang="en-GH" className={`${jakarta.variable} ${jetbrains.variable}`} suppressHydrationWarning>
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
        {/* Vercel Web Analytics: only on Vercel, where its script is served */}
        {process.env.VERCEL && <Analytics />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      </body>
    </html>
  );
}
