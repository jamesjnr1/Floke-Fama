import { NextResponse, type NextRequest } from 'next/server';
import { cookieFor, isConsoleRole, roleAreas, roleHome, roleLogin, sessionCookie, signedInAreas, signSession, verifySession, type Role } from '@/lib/auth/session';

const within = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Paths that only scanners and attackers ask for (WordPress logins, secret files): refused at once. */
const probes = /^\/(wp-admin|wp-login\.php|wp-content\/plugins|xmlrpc\.php|phpmyadmin|\.env|\.git|\.aws|\.DS_Store|server-status|cgi-bin)(\/|$)/i;

/**
 * Photos and videos are served only to Flokefama's own pages (the CEO: protect our images): another website that
 * embeds them gets nothing. Opening a file directly, search engines and link previews (no referrer) still work.
 */
function hotlinked(request: NextRequest) {
  const referer = request.headers.get('referer');
  if (!referer) return false;
  let host: string;
  try {
    host = new URL(referer).hostname;
  } catch {
    return true;
  }
  const own = request.nextUrl.hostname;
  return !(host === own || host.endsWith('.flokefama.com') || host === 'flokefama.com' || host.endsWith('.vercel.app') || host === 'localhost' || host.endsWith('.sanity.studio'));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (probes.test(pathname)) return new NextResponse(null, { status: 404 });
  if (pathname.startsWith('/images/') || pathname.startsWith('/videos/') || pathname === '/_next/image') {
    return hotlinked(request) ? new NextResponse(null, { status: 403 }) : NextResponse.next();
  }
  // Each area reads only its own session: the admin console its cookie, the engineer portal its own, and the rest of
  // the site the hospitals' (an engineer or admin is never signed in on the site)
  const areaRole: Role = within(pathname, '/admin') ? 'admin' : within(pathname, '/engineer') ? 'engineer' : 'client';
  const cookie = cookieFor(areaRole);
  const found = await verifySession(request.cookies.get(cookie)?.value);
  // The admin console lets in admins and the sales team (who see only the sales tabs)
  const session = found && (areaRole === 'admin' ? isConsoleRole(found.role) : found.role === areaRole) ? found : null;

  // Signed-in users skip the login page.
  if (pathname === '/login') {
    return session ? NextResponse.redirect(new URL(roleHome[session.role], request.url)) : NextResponse.next();
  }

  // The admin console and the engineer portal have their own sign-in pages; someone already signed in to that area goes straight in.
  if (pathname === '/admin/login') {
    return session ? NextResponse.redirect(new URL(roleHome[session.role], request.url)) : NextResponse.next();
  }
  if (pathname === '/engineer/login') {
    return session?.role === 'engineer' ? NextResponse.redirect(new URL('/engineer', request.url)) : NextResponse.next();
  }

  const area = roleAreas.find((a) => within(pathname, a.prefix));
  const needsSignIn = area || signedInAreas.some((p) => within(pathname, p));
  if (!needsSignIn) return NextResponse.next();

  if (!session) {
    const login = new URL(area ? roleLogin[area.role] : '/login', request.url);
    login.searchParams.set('next', pathname + search);
    const res = NextResponse.redirect(login);
    res.cookies.delete(cookie); // clear expired or tampered cookies
    return res;
  }
  // Each role's own area (client portal, engineer portal) is closed to other roles.
  if (area && session.role !== area.role && !(area.role === 'admin' && isConsoleRole(session.role))) return NextResponse.redirect(new URL(roleHome[session.role], request.url));

  // Activity renews the session (sliding expiry), so it only ends after an hour without use (30 days with "Keep me signed in").
  const res = NextResponse.next();
  const { exp: _exp, ...user } = session;
  void _exp;
  res.cookies.set(cookie, await signSession(user), sessionCookie(user));
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export const config = {
  matcher: [
    '/login', '/admin/:path*', '/portal/:path*', '/engineer/:path*', '/checkout/:path*',
    // Photos and videos (hotlinking), and the paths scanners probe
    '/images/:path*', '/videos/:path*', '/_next/image',
    '/wp-admin/:path*', '/wp-login.php', '/wp-content/plugins/:path*', '/xmlrpc.php', '/phpmyadmin/:path*', '/.env', '/.git/:path*', '/.aws/:path*', '/.DS_Store', '/server-status', '/cgi-bin/:path*',
  ],
};
