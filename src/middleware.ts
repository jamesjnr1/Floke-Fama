import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, roleAreas, roleHome, SESSION_COOKIE, sessionCookie, signedInAreas, signSession, verifySession } from '@/lib/auth/session';

const within = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // The admin console reads only its own cookie; the rest of the site only the site's (an admin is never signed in there)
  const adminArea = within(pathname, '/admin');
  const cookie = adminArea ? ADMIN_COOKIE : SESSION_COOKIE;
  const found = await verifySession(request.cookies.get(cookie)?.value);
  const session = adminArea ? (found?.role === 'admin' ? found : null) : found?.role === 'admin' ? null : found;

  // Signed-in users skip the login page.
  if (pathname === '/login') {
    return session ? NextResponse.redirect(new URL(roleHome[session.role], request.url)) : NextResponse.next();
  }

  // The admin console has its own sign-in page; a signed-in admin goes straight to the console.
  if (pathname === '/admin/login') {
    return session?.role === 'admin' ? NextResponse.redirect(new URL('/admin', request.url)) : NextResponse.next();
  }

  const area = roleAreas.find((a) => within(pathname, a.prefix));
  const needsSignIn = area || signedInAreas.some((p) => within(pathname, p));
  if (!needsSignIn) return NextResponse.next();

  if (!session) {
    const login = new URL(area?.role === 'admin' ? '/admin/login' : '/login', request.url);
    login.searchParams.set('next', pathname + search);
    const res = NextResponse.redirect(login);
    res.cookies.delete(cookie); // clear expired or tampered cookies
    return res;
  }
  // Each role's own area (client portal, engineer portal) is closed to other roles.
  if (area && session.role !== area.role) return NextResponse.redirect(new URL(roleHome[session.role], request.url));

  // Activity renews the session (sliding expiry), so it only ends after an hour without use (30 days with "Keep me signed in").
  const res = NextResponse.next();
  const { exp: _exp, ...user } = session;
  void _exp;
  res.cookies.set(cookie, await signSession(user), sessionCookie(user));
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export const config = { matcher: ['/login', '/admin/:path*', '/portal/:path*', '/engineer/:path*', '/checkout/:path*', '/quote/:path*'] };
