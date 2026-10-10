import { NextResponse, type NextRequest } from 'next/server';
import type { PushSubscription } from 'web-push';
import { getSession } from '@/lib/auth/server';
import { pushEnabled, removeSubscription, saveSubscription } from '@/lib/push';

/**
 * Turns alerts on (POST, with the browser's push subscription) or off (DELETE, { endpoint }) for this device.
 * GET says whether alerts are available at all.
 */
export const dynamic = 'force-dynamic';

const sameOrigin = (req: NextRequest) => {
  const origin = req.headers.get('origin');
  return !origin || origin === req.nextUrl.origin;
};
const validSub = (s: unknown): s is PushSubscription => {
  const x = s as PushSubscription;
  return typeof x?.endpoint === 'string' && x.endpoint.startsWith('https://') && x.endpoint.length < 1000 && typeof x.keys?.p256dh === 'string' && typeof x.keys?.auth === 'string';
};

export async function GET() {
  return NextResponse.json({ enabled: pushEnabled });
}

export async function POST(req: NextRequest) {
  if (!pushEnabled) return NextResponse.json({ error: 'Alerts are not set up yet.' }, { status: 503 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const sub = (await req.json().catch(() => null)) as unknown;
  if (!validSub(sub)) return NextResponse.json({ error: 'Invalid subscription.' }, { status: 400 });
  await saveSubscription(s, { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!pushEnabled) return NextResponse.json({ ok: true });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const { endpoint } = ((await req.json().catch(() => ({}))) as { endpoint?: string });
  if (typeof endpoint === 'string') await removeSubscription(endpoint);
  return NextResponse.json({ ok: true });
}
