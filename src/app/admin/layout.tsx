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

/** The admin console is an application shell: no marketing header or footer. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
