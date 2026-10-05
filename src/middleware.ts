import { NextResponse, type NextRequest } from 'next/server';
import { roleAreas, roleHome, SESSION_COOKIE, sessionCookie, signedInAreas, signSession, verifySession } from '@/lib/auth/session';

const within = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  // Signed-in users skip the login page.
  if (pathname === '/login') {
    return session ? NextResponse.redirect(new URL(roleHome[session.role], request.url)) : NextResponse.next();
  }

  const area = roleAreas.find((a) => within(pathname, a.prefix));
  const needsSignIn = area || signedInAreas.some((p) => within(pathname, p));
  if (!needsSignIn) return NextResponse.next();

  if (!session) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname + search);
    const res = NextResponse.redirect(login);
    res.cookies.delete(SESSION_COOKIE); // clear expired or tampered cookies
    return res;
  }
  // Each role's own area (client portal, engineer portal) is closed to other roles.
  if (area && session.role !== area.role) return NextResponse.redirect(new URL(roleHome[session.role], request.url));

  // Activity renews the session (sliding expiry), so it only ends after an hour without use.
  const res = NextResponse.next();
  const { exp: _exp, ...user } = session;
  void _exp;
  res.cookies.set(SESSION_COOKIE, await signSession(user), sessionCookie);
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export const config = { matcher: ['/login', '/portal/:path*', '/engineer/:path*', '/checkout/:path*', '/quote/:path*', '/account/:path*'] };
