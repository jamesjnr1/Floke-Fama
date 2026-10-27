import { NextResponse, type NextRequest } from 'next/server';
import { getClientSession } from '@/lib/auth/server';
import { setTextsOn, textsOn } from '@/lib/client-sms';
import { smsEnabled } from '@/lib/sms';

/**
 * A hospital's choice about Flokefama's texts (check-ins, calibration reminders, greetings, news): GET says whether
 * they are on; POST { on } changes it. Hospitals only.
 */
export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  const s = await getClientSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  if (!smsEnabled) return NextResponse.json({ enabled: false });
  return NextResponse.json({ enabled: true, on: await textsOn(s.sub), phone: s.phone ?? '' }, { headers: noStore });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const s = await getClientSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  if (!smsEnabled) return NextResponse.json({ enabled: false });
  const body = (await req.json().catch(() => ({}))) as { on?: unknown };
  if (typeof body.on !== 'boolean') return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  try {
    await setTextsOn(s.sub, body.on, s.email);
    return NextResponse.json({ enabled: true, on: body.on }, { headers: noStore });
  } catch (e) {
    console.error('[texts] choice not saved', e);
    return NextResponse.json({ error: 'That could not be saved. Please try again.' }, { status: 502 });
  }
}
