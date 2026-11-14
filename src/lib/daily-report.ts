import 'server-only';
import { loadAdminData } from '@/lib/admin/data';
import { monitorRecipients } from '@/lib/monitor';
import { emailSupport, supportEmailConfigured } from '@/lib/support-email';
import { smsStatus as smsGatewayStatus } from '@/lib/sms';
import { siteUrl } from '@/lib/utils';
import { ownerName } from '@/lib/owner/auth';
import { ownerMailOn, sendOwnerMail } from '@/lib/owner/email';
import { daySummaries } from '@/lib/pulse/server';

/**
 * The morning report (sent by the 9:00 job): what happened on the site in the last 24 hours, whether anything is
 * wrong, and the SMS balance, to MONITOR_EMAIL_TO (or the ADMIN_EMAILS). Returns what it sent, for the job's answer.
 */
export async function sendDailyReport(now = Date.now()) {
  // With MONITOR_REPORT_TO set the report is the site's manager's alone (lib/owner/email.ts); the admins' plain one stops
  const owner = ownerMailOn();
  const to = monitorRecipients();
  if (!owner && (!to.length || !supportEmailConfigured())) return { sent: false, reason: 'no recipients or email not set up' };
  const data = await loadAdminData();
  const since = (iso?: string) => Boolean(iso) && now - Date.parse(iso!) < 864e5;
  const hospitals = data.accounts.filter((a) => a.role === 'client' && since(a.createdAt));
  const engineers = data.accounts.filter((a) => a.role === 'engineer' && since(a.createdAt));
  const orders = data.orders.filter((o) => since(o.placedAt));
  const requests = data.supportRequests.filter((r) => since(r.at));
  const opened = data.desk.tickets.filter((t) => since(t.openedAt));
  const resolved = data.desk.tickets.filter((t) => since(t.resolvedAt));
  const waiting = data.desk.tickets.filter((t) => t.status === 'new');
  const texts = data.sms.filter((m) => since(m.at) && m.status !== 'sending');
  const failed = texts.filter((m) => m.status === 'failed');
  const errors = data.errors.filter((e) => since(e.lastAt));
  const down = data.tables.filter((t) => !t.ok);
  const sms = await smsGatewayStatus().catch(() => null);
  const problems = [
    ...down.map((t) => `Database: ${t.label} not answering`),
    ...(failed.length ? [`${failed.length} text${failed.length === 1 ? '' : 's'} not sent`] : []),
    ...(sms && !sms.ok ? [`SMS: ${sms.detail}`] : []),
    ...(errors.length ? [`${errors.length} kind${errors.length === 1 ? '' : 's'} of error`] : []),
  ];
  const list = (xs: string[]) => (xs.length ? xs.slice(0, 8).join('\n') + (xs.length > 8 ? `\n…and ${xs.length - 8} more` : '') : 'None');
  const day = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Accra' }).format(new Date(now));
  if (owner) {
    // Yesterday on the site, from the site monitor's own records
    const [y] = await daySummaries(2, now).catch(() => []);
    const top = (m: Record<string, number>, n: number) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]): [string, string] => [k, v.toLocaleString('en-GB')]);
    const mins = (secs: number) => (secs < 60 ? `${Math.round(secs)}s` : `${Math.floor(secs / 60)}m ${String(Math.round(secs % 60)).padStart(2, '0')}s`);
    const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Africa/Accra' }).format(new Date(now)));
    await sendOwnerMail({
      subject: `Flokefama site, ${day}: ${problems.length ? `${problems.length} thing${problems.length === 1 ? '' : 's'} to look at` : 'all working'}`,
      kicker: day,
      heading: `${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, ${ownerName()}`,
      intro: y ? `Yesterday flokefama.com had ${y.visits.toLocaleString('en-GB')} visit${y.visits === 1 ? '' : 's'} and ${y.enquiries.toLocaleString('en-GB')} enquir${y.enquiries === 1 ? 'y' : 'ies'}. Here is the last 24 hours.` : 'Here is the last 24 hours on flokefama.com.',
      status: problems.length ? { kind: 'alert', text: `${problems.length} thing${problems.length === 1 ? '' : 's'} to look at`, items: problems } : { kind: 'ok', text: 'Everything is working' },
      tiles: [
        { label: 'Visits yesterday', value: (y?.visits ?? 0).toLocaleString('en-GB'), note: `${(y?.visitors ?? 0).toLocaleString('en-GB')} visitors, ${(y?.newVisitors ?? 0).toLocaleString('en-GB')} new` },
        { label: 'Pages opened', value: (y?.views ?? 0).toLocaleString('en-GB'), note: y?.visits ? `${mins(y.secs / y.visits)} per visit` : undefined },
        { label: 'Enquiries', value: (y?.enquiries ?? 0).toLocaleString('en-GB'), note: 'Quotes, demos, chat' },
        { label: 'Orders', value: String(orders.length), note: 'Last 24 hours' },
        { label: 'New hospitals', value: String(hospitals.length), note: engineers.length ? `${engineers.length} new engineer${engineers.length === 1 ? '' : 's'}` : 'Last 24 hours' },
        { label: 'Service jobs', value: String(opened.length), note: `${resolved.length} resolved, ${waiting.length} waiting` },
      ],
      sections: [
        { title: 'Most opened pages yesterday', rows: y ? Object.entries(y.pages).sort((a, b) => b[1].v - a[1].v).slice(0, 6).map(([path, r]): [string, string] => [r.t ? `${r.t} (${path})` : path, r.v.toLocaleString('en-GB')]) : [], empty: 'No visits recorded yesterday.' },
        { title: 'Where visitors came from', rows: y ? top(y.sources, 5) : [], empty: 'No visits recorded yesterday.' },
        { title: 'Orders', lines: orders.slice(0, 8).map((o) => `${o.reference}: ${o.contact?.organisation || o.account} (${o.items.reduce((n, i) => n + i.qty, 0)} items)`), empty: 'No orders in the last 24 hours.' },
        { title: 'Support page requests', lines: requests.slice(0, 8).map((r) => `${r.type}: ${r.facility || r.name}`), empty: 'No requests in the last 24 hours.' },
        { title: 'New hospitals', lines: hospitals.slice(0, 8).map((a) => `${a.organisation || a.name}`), empty: 'No new hospitals in the last 24 hours.' },
        { title: 'Texts (SMS)', lines: [`${texts.length - failed.length} sent${failed.length ? `, ${failed.length} not sent` : ''}${sms?.ok ? ` · ${sms.detail}` : ''}`] },
        { title: 'Errors', lines: errors.slice(0, 8).map((e) => `${e.area} ${e.path}: ${e.message}${e.count > 1 ? ` (${e.count}×)` : ''}`), empty: 'No errors in the last 24 hours.' },
      ],
      footer: 'Your morning report from the Flokefama site monitor, sent to you alone at 9:00 each day.',
    });
    return { sent: true, to: 'manager', problems: problems.length };
  }
  await emailSupport(
    `Flokefama website, ${day}: ${problems.length ? `${problems.length} thing${problems.length === 1 ? '' : 's'} to look at` : 'all working'}`,
    {
      'Needs a look': problems.length ? problems.join('\n') : 'Nothing. Everything is working.',
      'New hospitals': list(hospitals.map((a) => `${a.organisation || a.name}`)),
      'New engineers': list(engineers.map((a) => a.name)),
      Orders: list(orders.map((o) => `${o.reference}: ${o.contact?.organisation || o.account} (${o.items.reduce((n, i) => n + i.qty, 0)} items)`)),
      'Support page requests': list(requests.map((r) => `${r.type}: ${r.facility || r.name}`)),
      'Service jobs': `${opened.length} opened, ${resolved.length} resolved, ${waiting.length} waiting for an engineer`,
      Texts: `${texts.length - failed.length} sent${failed.length ? `, ${failed.length} not sent` : ''}${sms?.ok ? ` · ${sms.detail}` : ''}`,
      Errors: list(errors.map((e) => `${e.area} ${e.path}: ${e.message}${e.count > 1 ? ` (${e.count}×)` : ''}`)),
    },
    undefined,
    { to, link: { href: `${siteUrl}/admin?tab=health`, label: 'Open Site health' }, footer: 'The Flokefama website’s morning report: the last 24 hours. Visitor numbers are in Vercel → Analytics.' },
  );
  return { sent: true, problems: problems.length };
}
