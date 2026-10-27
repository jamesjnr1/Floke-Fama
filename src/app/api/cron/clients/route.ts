import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { clientDaily, clientTextsAuto } from '@/lib/client-sms';
import { loadDesk } from '@/lib/service/server';

/**
 * The daily check for texts to hospitals (see lib/client-sms.ts): check-ins after repairs, calibration reminders and
 * holiday greetings. Run by Vercel Cron at 9:00 Ghana time (vercel.json), which sends `Authorization: Bearer
 * <CRON_SECRET>`; anything else is refused. `?on=YYYY-MM-DD` runs it as on that day (to try it).
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
  if (!clientTextsAuto) return NextResponse.json({ enabled: false });
  const on = req.nextUrl.searchParams.get('on');
  const now = on && /^\d{4}-\d{2}-\d{2}$/.test(on) ? Date.parse(`${on}T09:00:00Z`) : Date.now();
  return NextResponse.json({ enabled: true, sent: await clientDaily(await loadDesk(), now) });
}
