import { NextResponse, type NextRequest } from 'next/server';
import { assetIdPattern } from '@/lib/service/desk';
import { appwrite } from '@/lib/appwrite';
import { clientIp, limited } from '@/lib/rate-limit';
import { loadDesk } from '@/lib/service/server';

/**
 * For the QR code on an equipment tag: the machine's name, serial and hospital, so the Support form opens filled in.
 * Only what is printed on the tag itself; nothing else about the hospital or its requests.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (limited(`tag:${clientIp(req)}`, 30, 60_000)) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  const id = req.nextUrl.searchParams.get('asset') ?? '';
  if (!appwrite || !assetIdPattern.test(id)) return NextResponse.json({ asset: null });
  try {
    const a = (await loadDesk()).assets.find((x) => x.id === id);
    if (!a) return NextResponse.json({ asset: null });
    return NextResponse.json(
      { asset: { id: a.id, name: `${a.brand ? `${a.brand} ` : ''}${a.name}`.trim(), serial: a.serial, facility: a.facility, location: a.location } },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (e) {
    console.error('tag lookup failed', e);
    return NextResponse.json({ asset: null });
  }
}
