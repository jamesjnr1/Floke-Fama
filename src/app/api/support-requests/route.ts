import { NextResponse, type NextRequest } from 'next/server';
import { appwrite } from '@/lib/appwrite';
import { isTableMissing } from '@/lib/appwrite-tables';
import { getSession } from '@/lib/auth/server';
import { isReference, listSupportRequests, setSupportStatus, supportStatuses, type SupportStatus } from '@/lib/support-requests';

/**
 * Requests from the Support page, for the engineer portal (From the website). GET lists them; POST
 * ({ id, status, ticketId? }) marks one called back or closed, or records the service desk job it became.
 * Engineers only. Without Appwrite the answer is `{ enabled: false }`.
 */
export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'private, no-store' };

async function engineer() {
  const s = await getSession();
  return s?.role === 'engineer' ? s : null;
}

export async function GET() {
  if (!appwrite) return NextResponse.json({ enabled: false });
  if (!(await engineer())) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  try {
    const requests = await listSupportRequests().catch((e) => (isTableMissing(e) ? [] : Promise.reject(e)));
    return NextResponse.json({ enabled: true, requests }, { headers: noStore });
  } catch (e) {
    console.error('support requests: load failed', e);
    return NextResponse.json({ error: 'Requests from the website could not be loaded.' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!appwrite) return NextResponse.json({ error: 'The database is not set up.' }, { status: 503 });
  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const s = await engineer();
  if (!s) return NextResponse.json({ error: 'Your session has ended. Please sign in again.' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { id?: unknown; status?: unknown; ticketId?: unknown } | null;
  const status = body?.status as SupportStatus;
  const ticketId = typeof body?.ticketId === 'string' && /^TK-\d{4,7}$/.test(body.ticketId) ? body.ticketId : undefined;
  if (!isReference(body?.id) || !supportStatuses.includes(status)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  try {
    await setSupportStatus(body.id, status, s.name, ticketId);
    return NextResponse.json({ ok: true }, { headers: noStore });
  } catch (e) {
    console.error('support requests: update failed', e);
    return NextResponse.json({ error: 'That change could not be saved. Please try again.' }, { status: 502 });
  }
}
