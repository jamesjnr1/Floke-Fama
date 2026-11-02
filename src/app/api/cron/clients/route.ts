import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { clientDaily, clientTextsAuto } from '@/lib/client-sms';
import { appwrite } from '@/lib/appwrite';
import { clearSaveLocks, loadDesk, scheduleMaintenance } from '@/lib/service/server';

/**
 * The daily check: opens preventive maintenance jobs for machines due within two weeks (the engineering department's
 * schedule), then the texts to hospitals (see lib/client-sms.ts): check-ins after repairs, service reminders and
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
  // Preventive maintenance jobs open whether or not texts are switched on
  const scheduled = appwrite ? await scheduleMaintenance().catch((e) => (console.error('[cron] maintenance schedule:', e), 0)) : 0;
  if (appwrite) await clearSaveLocks().catch((e) => console.error('[cron] save marks:', e));
  if (!clientTextsAuto) return NextResponse.json({ enabled: false, scheduled });
  const on = req.nextUrl.searchParams.get('on');
  const now = on && /^\d{4}-\d{2}-\d{2}$/.test(on) ? Date.parse(`${on}T09:00:00Z`) : Date.now();
  return NextResponse.json({ enabled: true, scheduled, sent: await clientDaily(await loadDesk(), now) });
}
