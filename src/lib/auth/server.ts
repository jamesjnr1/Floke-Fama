import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, roleLogin, SESSION_COOKIE, verifySession, type Role } from '@/lib/auth/session';

/** The signed-in user on the site (hospitals and engineers). Admin sessions are separate: see getAdminSession. */
export async function getSession() {
  const s = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return s?.role === 'admin' ? null : s;
}

/** The signed-in admin, from the admin console's own cookie. */
export async function getAdminSession() {
  const s = await verifySession((await cookies()).get(ADMIN_COOKIE)?.value);
  return s?.role === 'admin' ? s : null;
}

/** Defence in depth: pages re-check the session even though middleware already guards the route. */
export async function requireSession(role: Role, path: string) {
  const session = role === 'admin' ? await getAdminSession() : await getSession();
  if (!session || session.role !== role) redirect(`${roleLogin[role]}?next=${encodeURIComponent(path)}`);
  return session;
}
