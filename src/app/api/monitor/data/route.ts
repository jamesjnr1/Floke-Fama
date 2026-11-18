import { NextResponse, type NextRequest } from 'next/server';
import { Query } from 'node-appwrite';
import { appwrite, DATABASE_ID, TABLES } from '@/lib/appwrite';
import { recentErrors } from '@/lib/monitor';
import { hasMonitorToken, isOwner } from '@/lib/owner/auth';
import { gaConfigured } from '@/lib/pulse/ga';
import { daySummaries, isLive, latestVisits } from '@/lib/pulse/server';
import { merge } from '@/lib/pulse/types';
import { smsEnabled } from '@/lib/sms';
import { supportEmailConfigured } from '@/lib/support-email';

/**
 * The site monitor reads everything from here (signed in at /monitor):
 *   ?view=live            who is on the site now and who just left (asked every few seconds)
 *   ?view=stats&days=7    the totals for the period, the days before it for comparison, health and errors
 *   ?view=report          health, errors and totals only, no visitors: also open to MONITOR_TOKEN
 */
export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'private, no-store' };

async function health() {
  const started = Date.now();
  let database: 'ok' | 'down' | 'not set up' = 'not set up';
  if (appwrite) {
    database = await Promise.race([
      appwrite.tables.listRows({ databaseId: DATABASE_ID, tableId: TABLES.accounts, queries: [Query.select(['$id']), Query.limit(1)] }).then(() => 'ok' as const),
      new Promise<'down'>((r) => setTimeout(() => r('down'), 6000)),
    ]).catch(() => 'down' as const);
  }
  return { database, databaseMs: Date.now() - started, texts: smsEnabled, email: supportEmailConfigured(), version: (process.env.VERCEL_GIT_COMMIT_SHA ?? 'local').slice(0, 7), deployedMessage: (process.env.VERCEL_GIT_COMMIT_MESSAGE ?? '').split('\n')[0].slice(0, 120), region: process.env.VERCEL_REGION ?? '' };
}

export async function GET(req: NextRequest) {
  const view = req.nextUrl.searchParams.get('view') ?? 'live';
  const owner = await isOwner();
  if (!owner && !(view === 'report' && hasMonitorToken(req))) return NextResponse.json({ error: 'Not allowed.' }, { status: 401, headers: noStore });
  const now = Date.now();
  try {
    if (view === 'live') {
      const visits = await latestVisits(80);
      return NextResponse.json({ at: now, live: visits.filter((v) => isLive(v, now)), recent: visits.filter((v) => !isLive(v, now)).slice(0, 50) }, { headers: noStore });
    }
    const days = Math.max(1, Math.min(90, Number(req.nextUrl.searchParams.get('days')) || 7));
    const [all, errors, status] = await Promise.all([daySummaries(view === 'report' ? days : days * 2, now), recentErrors(14), health()]);
    const current = all.slice(-days);
    const summary = merge(current);
    if (view === 'report') {
      const { visits, visitors, views, secs, bounces, enquiries, vitals, notFound, events } = summary;
      return NextResponse.json({ at: now, days, health: status, errors, totals: { visits, visitors, views, secs, bounces, enquiries }, vitals, notFound, events, topPages: Object.entries(summary.pages).sort((a, b) => b[1].v - a[1].v).slice(0, 20) }, { headers: noStore });
    }
    const before = merge(all.slice(0, -days));
    return NextResponse.json(
      {
        at: now, days, health: status, errors, summary,
        previous: { visits: before.visits, visitors: before.visitors, views: before.views, secs: before.secs, bounces: before.bounces, enquiries: before.enquiries },
        series: current.map((d) => ({ day: d.day, visits: d.visits, visitors: d.visitors, views: d.views, enquiries: d.enquiries })),
        // The earliest day in the period that is the monitor's own (days before it are Google Analytics')
        google: { connected: gaConfigured(), days: current.filter((d) => d.from === 'ga' && d.visits > 0).length },
      },
      { headers: noStore },
    );
  } catch (e) {
    console.error('[owner] data:', e);
    return NextResponse.json({ error: 'The records could not be read just now.' }, { status: 503, headers: noStore });
  }
}
