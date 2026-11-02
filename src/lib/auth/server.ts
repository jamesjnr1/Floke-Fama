import 'server-only';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { demoOn } from '@/lib/demo';
import { facilityActive } from '@/lib/facility-registry';
import { ADMIN_COOKIE, cookieFor, ENGINEER_COOKIE, isConsoleRole, roleLogin, SESSION_COOKIE, sessionCookie, signSession, verifySession, type Role, type SessionUser } from '@/lib/auth/session';

/**
 * Three separate sessions, one cookie each: hospitals on the site (ff_session), engineers in the engineer portal
 * (ff_engineer) and admins in the admin console (ff_admin). Signing in to one never signs you in to another.
 */
/**
 * A demo session (lib/demo.ts) counts as signed out everywhere (every API and every action), so a demo can never
 * read or change the real database. Only the pages that show the sample data ask for it with `demo`.
 */
const allow = (s: SessionUser | null, demo: boolean) => (s && (!s.demo || (demo && demoOn())) ? s : null);

async function sessionFrom(cookie: string, role: Role, demo = false) {
  const s = await verifySession((await cookies()).get(cookie)?.value);
  return s?.role === role ? allow(s, demo) : null;
}

/** The signed-in hospital on the site (none when the hospital has been made inactive in the registry). */
export const getClientSession = async (demo = false) => {
  const s = await sessionFrom(SESSION_COOKIE, 'client', demo);
  return s && (s.demo || (await facilityActive(s.facility))) ? s : null;
};
/** The signed-in engineer, from the engineer portal's own cookie. */
export const getEngineerSession = (demo = false) => sessionFrom(ENGINEER_COOKIE, 'engineer', demo);
/** The signed-in admin, from the admin console's own cookie. */
export const getAdminSession = (demo = false) => sessionFrom(ADMIN_COOKIE, 'admin', demo);
/** Whoever is signed in to the admin console: an admin, or the sales team (limited to the sales tabs). */
export async function getConsoleSession(demo = false) {
  const s = await verifySession((await cookies()).get(ADMIN_COOKIE)?.value);
  return s && isConsoleRole(s.role) ? allow(s, demo) : null;
}
/** The admin console's pages: an admin or the sales team, else to the console's sign-in. */
export async function requireConsole(path: string, { demo = false } = {}) {
  const session = await getConsoleSession(demo);
  if (!session) redirect(`${roleLogin.admin}?next=${encodeURIComponent(path)}`);
  return session;
}

/**
 * For what the hospital and engineer portals share (the service desk, alerts, photos): the engineer's session when
 * the call comes from the engineer portal, the hospital's when it comes from the rest of the site, and never the
 * other one. (Falling back to the other made an engineer portal whose session had run out show the hospital's view
 * when both were signed in on one computer.) Only a call with no page to go by takes whichever is signed in.
 */
export async function getSession() {
  let from: string | null = null;
  try {
    from = new URL((await headers()).get('referer') ?? '').pathname;
  } catch {
    /* no referer */
  }
  if (from !== null) return from === '/engineer' || from.startsWith('/engineer/') ? getEngineerSession() : getClientSession();
  const [client, engineer] = await Promise.all([getClientSession(), getEngineerSession()]);
  return client ?? engineer;
}

/**
 * Keeps a portal's session alive while it is open: its regular updates count as activity, like moving between
 * pages does, so an engineer working on one screen isn't signed out after an hour.
 */
export async function renewSession(s: SessionUser) {
  const { exp: _exp, ...user } = s;
  void _exp;
  try {
    (await cookies()).set(cookieFor(s.role), await signSession(user), sessionCookie(user));
  } catch {
    /* not in a route that can set cookies */
  }
}

/** Defence in depth: pages re-check the session even though middleware already guards the route. */
export async function requireSession(role: Role, path: string, { demo = false } = {}) {
  const session = role === 'admin' ? await getAdminSession(demo) : role === 'engineer' ? await getEngineerSession(demo) : await getClientSession(demo);
  // Signed in, but the hospital was made inactive: say so (the sign-in page would only send them back here)
  if (!session && role === 'client' && (await sessionFrom(SESSION_COOKIE, 'client', demo))) redirect('/account-inactive');
  if (!session) redirect(`${roleLogin[role]}?next=${encodeURIComponent(path)}`);
  return session;
}
