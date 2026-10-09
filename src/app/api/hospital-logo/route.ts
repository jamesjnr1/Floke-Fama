import { NextResponse, type NextRequest } from 'next/server';
import { ID, type Models } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { appwrite, BUCKETS, DATABASE_ID, fileUrl, isNotFound, TABLES } from '@/lib/appwrite';
import { getSession } from '@/lib/auth/server';

/**
 * The signed-in hospital's logo, kept in Appwrite (bucket `hospital-logos`, row in `hospital_logos` keyed by
 * the account). GET returns its address, PUT replaces it (a small image prepared in the browser), DELETE
 * removes it. Only a signed-in hospital can change its own logo; without Appwrite configured the answer is
 * `{ enabled: false }` and the dashboard keeps logos in the browser instead.
 */
export const dynamic = 'force-dynamic';

const MAX_BYTES = 600 * 1024;
const TYPES: Record<string, string> = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' };

type LogoRow = Models.Row & { fileId: string; facility: string };

async function hospital() {
  const s = await getSession();
  return s && s.role === 'client' ? s : null;
}

/** Changes must come from this site (the session cookie is SameSite=Lax; this closes the rest). */
const sameOrigin = (req: NextRequest) => {
  const origin = req.headers.get('origin');
  return !origin || origin === req.nextUrl.origin;
};

async function current(accountId: string) {
  if (!appwrite) return null;
  try {
    return await appwrite.tables.getRow<LogoRow>({ databaseId: DATABASE_ID, tableId: TABLES.hospitalLogos, rowId: accountId });
  } catch (e) {
    if (isNotFound(e)) return null;
    throw e;
  }
}

export async function GET() {
  if (!appwrite) return NextResponse.json({ enabled: false });
  const s = await hospital();
  if (!s) return NextResponse.json({ enabled: true, url: null }, { status: 401 });
  const row = await current(s.sub);
  return NextResponse.json({ enabled: true, url: row ? fileUrl(BUCKETS.hospitalLogos, row.fileId, row.$updatedAt) : null }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function PUT(req: NextRequest) {
  if (!appwrite) return NextResponse.json({ error: 'Logo storage is not set up.' }, { status: 503 });
  const s = await hospital();
  if (!s) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const type = (req.headers.get('content-type') ?? '').split(';')[0].trim();
  const ext = TYPES[type];
  if (!ext) return NextResponse.json({ error: 'Please upload a PNG, JPG or WebP image.' }, { status: 415 });
  const body = Buffer.from(await req.arrayBuffer());
  if (!body.length || body.length > MAX_BYTES) return NextResponse.json({ error: 'That image is too large.' }, { status: 413 });

  const old = await current(s.sub);
  const file = await appwrite.storage.createFile({ bucketId: BUCKETS.hospitalLogos, fileId: ID.unique(), file: InputFile.fromBuffer(body, `${s.sub}.${ext}`) });
  const row = await appwrite.tables.upsertRow<LogoRow>({
    databaseId: DATABASE_ID,
    tableId: TABLES.hospitalLogos,
    rowId: s.sub,
    data: { fileId: file.$id, facility: s.facility ?? '' },
  });
  if (old && old.fileId !== file.$id) await appwrite.storage.deleteFile({ bucketId: BUCKETS.hospitalLogos, fileId: old.fileId }).catch(() => {});
  return NextResponse.json({ enabled: true, url: fileUrl(BUCKETS.hospitalLogos, file.$id, row.$updatedAt) });
}

export async function DELETE(req: NextRequest) {
  if (!appwrite) return NextResponse.json({ error: 'Logo storage is not set up.' }, { status: 503 });
  const s = await hospital();
  if (!s) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Not allowed.' }, { status: 403 });
  const old = await current(s.sub);
  if (old) {
    await appwrite.tables.deleteRow({ databaseId: DATABASE_ID, tableId: TABLES.hospitalLogos, rowId: s.sub });
    await appwrite.storage.deleteFile({ bucketId: BUCKETS.hospitalLogos, fileId: old.fileId }).catch(() => {});
  }
  return NextResponse.json({ enabled: true, url: null });
}
