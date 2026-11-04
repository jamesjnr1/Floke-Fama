import Link from 'next/link';
import { LogoMark } from '@/components/layout/logo';
import { siteUrl } from '@/lib/utils';
import type { Metadata } from 'next';

/** Its own tab icon (the round mark on green with a chart), told apart from the site and the engineer portal. */
export const metadata: Metadata = {
  title: 'Flokefama Admin Console',
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: '/images/admin-icon.svg', type: 'image/svg+xml' }, { url: '/images/admin-icon.png', sizes: '64x64', type: 'image/png' }],
    apple: '/images/admin-apple-touch-icon.png',
  },
};

/**
 * The admin console is an application shell: no marketing header or footer. It is for computers only: on phones and
 * small tablets (below 1024 px) every page, the sign-in included, says to open it on a computer instead.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="grid min-h-svh place-items-center bg-[#eef2f0] px-6 text-center lg:hidden">
        <div className="max-w-sm">
          <LogoMark className="mx-auto size-12" />
          <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-ink">Open the admin console on a computer</h1>
          <p className="mt-3 text-ink-3">The admin console is made for a laptop or desktop screen. Sign in there at {siteUrl.replace(/^https?:\/\//, '')}/admin.</p>
          <Link href="/" className="mt-6 inline-flex h-11 items-center bg-brand-700 px-5 font-semibold text-white hover:bg-brand-800">Go to the website</Link>
        </div>
      </main>
      <div className="max-lg:hidden">{children}</div>
    </>
  );
}
