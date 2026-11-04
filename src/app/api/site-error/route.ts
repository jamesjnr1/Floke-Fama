import { NextResponse, type NextRequest } from 'next/server';
import { recordError } from '@/lib/monitor';
import { sharedLimited } from '@/lib/shared-limit';

/**
 * An error on a visitor's screen (a page that broke in the browser), sent by the site's error page so it shows in
 * Site health. At most 20 reports per connection every 10 minutes; only the message and the page are kept.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { message?: unknown; path?: unknown } | null;
  const message = typeof body?.message === 'string' ? body.message.slice(0, 500) : '';
  const path = typeof body?.path === 'string' && body.path.startsWith('/') ? body.path.slice(0, 200) : '';
  if (!message || !path) return NextResponse.json({ ok: false }, { status: 400 });
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (await sharedLimited(`site-error:${ip}`, 20, 10 * 60_000).catch(() => false)) return NextResponse.json({ ok: false }, { status: 429 });
  await recordError({ message, path, source: 'browser' });
  return NextResponse.json({ ok: true });
}
