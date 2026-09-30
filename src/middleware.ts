import { NextResponse, type NextRequest } from 'next/server';
import { roleHome, SESSION_COOKIE, verifySession, type Role } from '@/lib/auth/session';

/** Protected areas and the role allowed into each. */
const areas: { prefix: string; role: Role }[] = [
  { prefix: '/portal', role: 'client' },
  { prefix: '/engineer', role: 'engineer' },
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  // Signed-in users skip the login page.
  if (pathname === '/login') {
    return session ? NextResponse.redirect(new URL(roleHome[session.role], request.url)) : NextResponse.next();
  }

  const area = areas.find((a) => pathname === a.prefix || pathname.startsWith(`${a.prefix}/`));
  if (!area) return NextResponse.next();

  if (!session) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname + search);
    const res = NextResponse.redirect(login);
    res.cookies.delete(SESSION_COOKIE); // clear expired or tampered cookies
    return res;
  }
  // Each role only sees its own area.
  if (session.role !== area.role) return NextResponse.redirect(new URL(roleHome[session.role], request.url));

  const res = NextResponse.next();
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export const config = { matcher: ['/login', '/portal/:path*', '/engineer/:path*'] };
