import { revalidatePath, revalidateTag } from 'next/cache';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Sanity webhook: when an editor publishes in the Studio, the site refreshes at once
 * instead of waiting for the 10-minute cache. Signed with SANITY_REVALIDATE_SECRET.
 *
 * Sanity → API → Webhooks → Create: URL <site>/api/revalidate, trigger on create/update/delete,
 * HTTP method POST, and the same secret as SANITY_REVALIDATE_SECRET in Vercel.
 */
export async function POST(req: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim();
  if (!secret) return Response.json({ error: 'Webhook not configured' }, { status: 501 });

  const body = await req.text();
  // Header format: t=<timestamp>,v1=<base64url HMAC-SHA256 of "<timestamp>.<body>">
  const header = req.headers.get('sanity-webhook-signature') ?? '';
  const t = /t=(\d+)/.exec(header)?.[1];
  const v1 = /v1=([\w-]+)/.exec(header)?.[1];
  if (!t || !v1) return Response.json({ error: 'Missing signature' }, { status: 401 });
  const expected = createHmac('sha256', secret).update(`${t}.${body}`).digest('base64url');
  const a = Buffer.from(v1);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return Response.json({ error: 'Invalid signature' }, { status: 401 });
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return Response.json({ error: 'Stale request' }, { status: 401 });

  revalidateTag('cms');
  revalidatePath('/', 'layout');
  let type: string | undefined;
  try {
    type = (JSON.parse(body) as { _type?: string })._type;
  } catch {
    // The body is optional; refreshing everything is enough
  }
  return Response.json({ revalidated: true, type, at: new Date().toISOString() });
}
