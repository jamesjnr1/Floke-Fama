import { NextResponse } from 'next/server';
import { engineerPhotos } from '@/lib/account-photos';
import { appwrite } from '@/lib/appwrite';
import { getSession } from '@/lib/auth/server';

/**
 * Engineers' photos by name, so a hospital sees who is coming (and engineers see each other). Signed-in accounts
 * only. Without Appwrite the answer is `{ photos: {} }`.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!appwrite) return NextResponse.json({ photos: {} });
  if (!(await getSession())) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  try {
    return NextResponse.json({ photos: await engineerPhotos() }, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (e) {
    console.error('team photos: not loaded', e);
    return NextResponse.json({ photos: {} });
  }
}
