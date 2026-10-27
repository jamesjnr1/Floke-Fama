import { NextResponse } from 'next/server';
import { appwrite } from '@/lib/appwrite';
import { getEngineerSession } from '@/lib/auth/server';
import { knownFacilities } from '@/lib/service/server';

/** For engineers registering existing equipment: the hospitals they can choose from. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getEngineerSession();
  if (!s) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  if (!appwrite) return NextResponse.json({ facilities: [] });
  try {
    return NextResponse.json({ facilities: await knownFacilities() }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    console.error('facilities: load failed', e);
    return NextResponse.json({ facilities: [] });
  }
}
