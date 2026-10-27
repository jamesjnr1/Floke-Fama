import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_COOKIE, ENGINEER_COOKIE, roleLogin, SESSION_COOKIE, verifySession, type Role } from '@/lib/auth/session';

/**
 * Three separate sessions, one cookie each: hospitals on the site (ff_session), engineers in the engineer portal
 * (ff_engineer) and admins in the admin console (ff_admin). Signing in to one never signs you in to another.
 */
async function sessionFrom(cookie: string, role: Role) {
  const s = await verifySession((await cookies()).get(cookie)?.value);
  return s?.role === role ? s : null;
}

/** The signed-in hospital on the site. */
export const getClientSession = () => sessionFrom(SESSION_COOKIE, 'client');
/** The signed-in engineer, from the engineer portal's own cookie. */
export const getEngineerSession = () => sessionFrom(ENGINEER_COOKIE, 'engineer');
/** The signed-in admin, from the admin console's own cookie. */
export const getAdminSession = () => sessionFrom(ADMIN_COOKIE, 'admin');

/**
 * For what the hospital and engineer portals share (the service desk, alerts, photos): the engineer when the call
 * comes from the engineer portal, the hospital otherwise (then the other, if only that one is signed in).
 */
export async function getSession() {
  let from = '';
  try {
    from = new URL((await headers()).get('referer') ?? '').pathname;
  } catch {
    /* no referer */
  }
  const engineerFirst = from === '/engineer' || from.startsWith('/engineer/');
  const [client, engineer] = await Promise.all([getClientSession(), getEngineerSession()]);
  return engineerFirst ? (engineer ?? client) : (client ?? engineer);
}

/** Defence in depth: pages re-check the session even though middleware already guards the route. */
export async function requireSession(role: Role, path: string) {
  const session = role === 'admin' ? await getAdminSession() : role === 'engineer' ? await getEngineerSession() : await getClientSession();
  if (!session) redirect(`${roleLogin[role]}?next=${encodeURIComponent(path)}`);
  return session;
}
