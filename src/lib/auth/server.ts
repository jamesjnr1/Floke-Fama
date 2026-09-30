import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession, type Role } from '@/lib/auth/session';

export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Defence in depth: pages re-check the session even though middleware already guards the route. */
export async function requireSession(role: Role, path: string) {
  const session = await getSession();
  if (!session || session.role !== role) redirect(`/login?next=${encodeURIComponent(path)}`);
  return session;
}
