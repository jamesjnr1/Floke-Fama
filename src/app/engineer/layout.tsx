import type { Metadata } from 'next';
import { PostHogIdentity } from '@/components/site-provider';
import { getEngineerSession } from '@/lib/auth/server';

/** Its own tab and home-screen icon (the round mark on dark with a wrench), told apart from the site and the admin console. */
export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/images/engineer-icon.svg', type: 'image/svg+xml' }, { url: '/images/engineer-icon.png', sizes: '64x64', type: 'image/png' }],
    apple: '/images/engineer-apple-touch-icon.png',
  },
};

/**
 * The Biomedical Engineer Service Portal is an application shell: no marketing header or footer.
 * The script applies a saved dark mode before the first paint, so the page doesn't flash light first.
 */
export default async function EngineerLayout({ children }: { children: React.ReactNode }) {
  const session = await getEngineerSession(true);
  return (
    <>
      <PostHogIdentity user={session ? { id: session.sub, email: session.email, name: session.name, role: session.role, facility: session.facility } : null} />
      <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('ff-eng-theme')==='dark')document.documentElement.dataset.engTheme='dark'}catch(e){}" }} />
      {children}
    </>
  );
}
