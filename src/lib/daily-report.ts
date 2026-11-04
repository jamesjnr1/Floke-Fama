import 'server-only';
import { loadAdminData } from '@/lib/admin/data';
import { monitorRecipients } from '@/lib/monitor';
import { emailSupport, supportEmailConfigured } from '@/lib/support-email';
import { smsStatus as smsGatewayStatus } from '@/lib/sms';
import { siteUrl } from '@/lib/utils';

/**
 * The morning report (sent by the 9:00 job): what happened on the site in the last 24 hours, whether anything is
 * wrong, and the SMS balance, to MONITOR_EMAIL_TO (or the ADMIN_EMAILS). Returns what it sent, for the job's answer.
 */
export async function sendDailyReport(now = Date.now()) {
  const to = monitorRecipients();
  if (!to.length || !supportEmailConfigured()) return { sent: false, reason: 'no recipients or email not set up' };
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
