import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, ENGINEER_COOKIE, SESSION_COOKIE, verifySession } from '@/lib/auth/session';
import { ingest, isBot, parseBatch } from '@/lib/pulse/server';
import type { Who } from '@/lib/pulse/types';
import { clientIp, limited } from '@/lib/rate-limit';

/**
 * Where the site's own script (components/pulse.tsx) reports what a visitor is doing, for the site monitor
 * (/monitor): pages opened, time spent, actions and page speed. The address the report comes from is used only to
 * limit how many one connection can send; it is not stored. Search engines and testing tools are left out.
 */
export const dynamic = 'force-dynamic';

const header = (req: NextRequest, name: string) => {
  const v = req.headers.get(name);
  if (!v) return undefined;
  try {
    return decodeURIComponent(v).slice(0, 80);
  } catch {
    return v.slice(0, 80);
  }
};

/** Who is signed in, if anyone: staff first (so their visits are kept out of the public figures), then a hospital. */
async function whoIs(req: NextRequest): Promise<Who | undefined> {
  for (const cookie of [ADMIN_COOKIE, ENGINEER_COOKIE, SESSION_COOKIE]) {
    const s = await verifySession(req.cookies.get(cookie)?.value);
    if (s) return s.demo ? { role: s.role, name: 'Demo account' } : { role: s.role, name: s.name.slice(0, 80), ...(s.facility ? { facility: s.facility.slice(0, 120) } : {}) };
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') ?? '';
  if (isBot(ua) && process.env.PULSE_TEST !== 'on') return new NextResponse(null, { status: 204 });
  if (limited(`pulse:${clientIp(req)}`, 120, 60_000)) return new NextResponse(null, { status: 429 });
  const text = await req.text().catch(() => '');
  if (!text || text.length > 24_000) return new NextResponse(null, { status: 400 });
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const batch = parseBatch(raw);
  if (!batch || !batch.items.length) return new NextResponse(null, { status: 400 });
  await ingest(batch, { ua, country: header(req, 'x-vercel-ip-country'), region: header(req, 'x-vercel-ip-country-region'), city: header(req, 'x-vercel-ip-city'), who: await whoIs(req) });
  return new NextResponse(null, { status: 204 });
}
