import { NextResponse, type NextRequest } from 'next/server';
import { appwrite } from '@/lib/appwrite';
import { getSession } from '@/lib/auth/server';
import type { Action } from '@/lib/service/desk';
import { applyAction, DeskError, loadDesk, visibleTo } from '@/lib/service/server';

/**
 * The shared service desk (Appwrite). GET returns what the signed-in account may see; POST applies one action
 * ({ action }) for that account and returns the updated view. Without Appwrite configured the answer is
 * `{ enabled: false }` and the portals keep the desk in the browser instead.
 */
export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'private, no-store' };
const MAX_BODY = 16 * 1024;
const TYPES = new Set<Action['type']>(['assign', 'travel', 'arrive', 'note', 'part', 'resolve', 'create', 'request', 'rate', 'calibrate', 'read', 'readAll']);

/** Changes must come from this site (the session cookie is SameSite=Lax; this closes the rest). */
const sameOrigin = (req: NextRequest) => {
  const origin = req.headers.get('origin');
  return !origin || origin === req.nextUrl.origin;
};

export async function GET() {
  if (!appwrite) return NextResponse.json({ enabled: false });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  try {
    return NextResponse.json({ enabled: true, state: visibleTo(s, await loadDesk()) }, { headers: noStore });
  } catch (e) {
    console.error('service desk: load failed', e);
    return NextResponse.json({ error: 'The service desk could not be loaded.' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  if (!appwrite) return NextResponse.json({ error: 'The service desk is not set up.' }, { status: 503 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Your session has ended. Please sign in again.' }, { status: 401 });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return NextResponse.json({ error: 'That is too long.' }, { status: 413 });
  let action: Action;
  try {
    action = (JSON.parse(raw) as { action: Action }).action;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (!action || !TYPES.has(action.type)) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  try {
    return NextResponse.json({ state: await applyAction(s, action) }, { headers: noStore });
  } catch (e) {
    if (e instanceof DeskError) return NextResponse.json({ error: e.message }, { status: e.status });
    console.error('service desk: action failed', action.type, e);
    return NextResponse.json({ error: 'That change could not be saved. Please try again.' }, { status: 502 });
  }
}
