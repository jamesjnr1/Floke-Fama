import { PostHogIdentity } from '@/components/site-provider';
import { getClientSession } from '@/lib/auth/server';

/** The client portal is an application shell: no marketing header or footer. */
export default async function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getClientSession(true);
  return (
    <>
      <PostHogIdentity user={session ? { id: session.sub, email: session.email, name: session.name, role: session.role, facility: session.facility } : null} />
      {children}
    </>
  );
}
