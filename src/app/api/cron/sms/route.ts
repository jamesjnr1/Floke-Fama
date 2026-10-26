import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { loadDesk } from '@/lib/service/server';
import { escalateStale, smsEnabled } from '@/lib/sms';

/**
 * The scheduled check for urgent requests nobody has taken (see escalateStale in lib/sms.ts), so escalations go
 * out even when no portal is open. Call it every 5 to 10 minutes with `Authorization: Bearer <CRON_SECRET>`:
 * from Vercel Cron (Pro plan) or a free scheduler such as cron-job.org.
 */
export const dynamic = 'force-dynamic';

const authorised = (req: NextRequest) => {
  const secret = process.env.CRON_SECRET ?? '';
  const given = req.headers.get('authorization') ?? '';
  const want = `Bearer ${secret}`;
  return secret.length >= 16 && given.length === want.length && timingSafeEqual(Buffer.from(given), Buffer.from(want));
};

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 401 });
  if (!smsEnabled) return NextResponse.json({ enabled: false });
  const escalated = await escalateStale(await loadDesk(), true);
  return NextResponse.json({ enabled: true, escalated });
}
