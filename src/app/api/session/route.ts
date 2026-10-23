import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, sessionCookie, signSession, verifySession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/** Who is signed in (for the header on every page). Each call counts as activity and renews the session. */
export async function GET() {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  // Admins sign in on the admin console only; an older admin session on the site counts as signed out
  if (session?.role === 'admin') {
    jar.delete(SESSION_COOKIE);
    return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (!session) return NextResponse.json({ user: null }, { headers: { 'Cache-Control': 'no-store' } });
  const { exp: _exp, ...user } = session;
  void _exp;
  const token = await signSession(user);
  jar.set(SESSION_COOKIE, token, sessionCookie(user));
  const exp = Math.floor(Date.now() / 1000) + sessionCookie(user).maxAge;
  return NextResponse.json(
    { user: { name: user.name, email: user.email, role: user.role, facility: user.facility, phone: user.phone }, exp },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
