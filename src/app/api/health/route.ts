import { NextResponse } from 'next/server';
import { Query } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { smsEnabled } from '@/lib/sms';
import { supportEmailConfigured } from '@/lib/support-email';

/**
 * A status check for uptime monitors (e.g. UptimeRobot) and for Claude's check-ins: is the site up, and does the
 * database answer? 200 when everything works, 503 when the database doesn't. Shows no data and no secrets.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  let database: 'ok' | 'down' | 'not set up' = 'not set up';
  if (appwrite) {
    database = await Promise.race([
      appwrite.tables.listRows({ databaseId: DATABASE_ID, tableId: TABLES.accounts, queries: [Query.select(['$id']), Query.limit(1)] }).then(() => 'ok' as const),
      new Promise<'down'>((r) => setTimeout(() => r('down'), 6000)),
    ]).catch(() => 'down' as const);
  }
  const ok = database === 'ok';
  return NextResponse.json(
    { ok, database, texts: smsEnabled ? 'on' : 'off', email: supportEmailConfigured() ? 'on' : 'off', ms: Date.now() - started, at: new Date().toISOString(), version: (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7) },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
