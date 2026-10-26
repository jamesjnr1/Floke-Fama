import { NextResponse, type NextRequest } from 'next/server';
import { ID, type Models } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { PHOTO_MARK } from '@/lib/account-photos';
import { appwrite, BUCKETS, DATABASE_ID, fileUrl, isNotFound, TABLES } from '@/lib/appwrite';
import { getSession } from '@/lib/auth/server';

/**
 * The signed-in engineer's photo (required: hospitals and the admin team see who is coming). Kept like a hospital's
 * logo (see lib/account-photos.ts). GET returns its address (null until one is added); PUT replaces it with a small
 * square image prepared in the browser. Without Appwrite the answer is `{ enabled: false }` and no photo is asked for.
 */
export const dynamic = 'force-dynamic';

const MAX_BYTES = 600 * 1024;
const TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' };
const noStore = { 'Cache-Control': 'private, no-store' };

type Row = Models.Row & { fileId: string; facility: string };

async function engineer() {
  const s = await getSession();
  return s?.role === 'engineer' ? s : null;
}

async function current(accountId: string) {
  try {
    return await appwrite!.tables.getRow<Row>({ databaseId: DATABASE_ID, tableId: TABLES.hospitalLogos, rowId: accountId });
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

export async function GET() {
  if (!appwrite) return NextResponse.json({ enabled: false });
  const s = await engineer();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const row = await current(s.sub).catch(() => null);
  return NextResponse.json({ enabled: true, url: row ? fileUrl(BUCKETS.hospitalLogos, row.fileId, row.$updatedAt) : null }, { headers: noStore });
}

export async function PUT(req: NextRequest) {
  if (!appwrite) return NextResponse.json({ error: 'Photo storage is not set up.' }, { status: 503 });
  const s = await engineer();
  if (!s) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });
  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const ext = TYPES[(req.headers.get('content-type') ?? '').split(';')[0].trim()];
  if (!ext) return NextResponse.json({ error: 'Please upload a JPG, PNG or WebP photo.' }, { status: 415 });
  const body = Buffer.from(await req.arrayBuffer());
  if (!body.length || body.length > MAX_BYTES) return NextResponse.json({ error: 'That photo is too large.' }, { status: 413 });
  try {
    const old = await current(s.sub);
    const file = await appwrite.storage.createFile({ bucketId: BUCKETS.hospitalLogos, fileId: ID.unique(), file: InputFile.fromBuffer(body, `${s.sub}.${ext}`) });
    const row = await appwrite.tables.upsertRow<Row>({ databaseId: DATABASE_ID, tableId: TABLES.hospitalLogos, rowId: s.sub, data: { fileId: file.$id, facility: PHOTO_MARK } });
    if (old && old.fileId !== file.$id) await appwrite.storage.deleteFile({ bucketId: BUCKETS.hospitalLogos, fileId: old.fileId }).catch(() => {});
    return NextResponse.json({ enabled: true, url: fileUrl(BUCKETS.hospitalLogos, file.$id, row.$updatedAt) }, { headers: noStore });
  } catch (e) {
    console.error('photo: not saved', e);
    return NextResponse.json({ error: 'Your photo could not be saved. Please try again.' }, { status: 502 });
  }
}
