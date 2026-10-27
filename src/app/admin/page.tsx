import Link from 'next/link';
import { Bars, Columns } from '@/components/admin/charts';
import { LiveRefresh } from '@/components/admin/live-refresh';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Hint } from '@/components/ui/hint';
import { Icon } from '@/components/ui/icon';
import { UserAvatar } from '@/components/ui/user-avatar';
import { removeEngineer, saveOrderNote, setOrderStatus } from '@/lib/admin/actions';
import { AddEngineerForm } from '@/components/admin/add-engineer-form';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { configChecks, loadAdminData, type AdminData } from '@/lib/admin/data';
import { brevoStatus } from '@/lib/support-email';
import { normalisePhone, smsProvider, smsStatus as smsGatewayStatus } from '@/lib/sms';
import { TestSmsForm } from '@/components/admin/test-sms-form';
import { HospitalTextsForm } from '@/components/admin/hospital-texts-form';
import { CALIBRATION_NOTICE_DAYS, CHECK_IN_DAYS, calibrationText, checkInText, clientTextsAuto, hospitalsToText, messageTemplates, upcomingClientTexts } from '@/lib/client-sms';
import { supportDetails, supportSubject } from '@/lib/support-schema';
import { adminLogout } from '@/lib/auth/actions';
import { requireSession } from '@/lib/auth/server';
import { catalogue } from '@/data/catalogue';
import type { OrderStatus, SavedOrder } from '@/lib/orders';
import { salesStages } from '@/lib/sales-stages';
import { departments, timelines } from '@/lib/order-needs';
import { cn } from '@/lib/utils';
import { statusStyle } from '@/components/client/ui';
import { visitStatus } from '@/lib/service/desk';
import type { TicketStatus as TicketStatusId } from '@/lib/service/store';

/**
 * Admin console (/admin, ADMIN_EMAILS only): who registers, who buys what, the service desk and the health of the
 * database and settings. Read from Appwrite on every visit; orders can be moved along from here, and every table
 * downloads as CSV.
 */
export const dynamic = 'force-dynamic';

type Tab = 'overview' | 'orders' | 'accounts' | 'products' | 'service' | 'texts' | 'system';
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'fi-rr-apps' },
  { id: 'orders', label: 'Orders', icon: 'fi-rr-box-open' },
  { id: 'accounts', label: 'Accounts', icon: 'fi-rr-users' },
  { id: 'products', label: 'Product demand', icon: 'fi-rr-shopping-cart' },
  { id: 'service', label: 'Service desk', icon: 'fi-rr-tools' },
  { id: 'texts', label: 'Text messages', icon: 'fi-rr-comment' },
  { id: 'system', label: 'Database & settings', icon: 'fi-rr-database' },
];

const DAY = 864e5;
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Accra' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Accra' });
const clockFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Accra' });
const fmt = (iso: string | undefined) => (iso ? dateFmt.format(new Date(iso)) : '—');
const units = (o: { items: { qty: number }[] }) => o.items.reduce((n, i) => n + i.qty, 0);
// Kept here: '@/lib/orders' is a browser module, so its constants can't be read on the server
const orderStatusLabel = Object.fromEntries(salesStages.map((x) => [x.id, x.label])) as Record<OrderStatus, string>;
/** "AUTO HEAMATOLOGY ANALYZER BC5150" → "Auto Heamatology Analyzer BC5150" (model codes stay upper case). */
const tidy = (n: string) => n.split(/(\s+|[()])/).map((w) => (/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
const methodLabel: Record<string, string> = { momo: 'Mobile money', card: 'Card', bank: 'Bank transfer' };
const ticketLabel: Record<string, string> = { new: 'Logged', assigned: 'Assigned', travelling: 'En route', onsite: 'On site', resolved: 'Resolved' };
const smsKind: Record<string, string> = { website: 'Website fault', urgent: 'Urgent fault', assigned: 'Job given', message: 'Hospital message', escalation: 'Not taken', test: 'Test text', hospitals: 'To all hospitals', checkin: 'Check-in', calibration: 'Calibration reminder', holiday: 'Holiday greeting', update: 'Update to hospital' };
const smsStatus: Record<string, string> = { sent: 'Sent', logged: 'Recorded only', failed: 'Not sent', sending: 'Sending' };
const categoryName = (slug: string) => slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

/** Counts per key, largest first. */
function tally<T>(xs: T[], key: (x: T) => string, weight: (x: T) => number = () => 1) {
  const m = new Map<string, number>();
  for (const x of xs) m.set(key(x), (m.get(key(x)) ?? 0) + weight(x));
  return [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

/** Counts per week for the last `weeks` weeks (oldest first). */
function weekly(dates: string[], weeks: number, now: number) {
  const start = now - weeks * 7 * DAY;
  const out = Array.from({ length: weeks }, (_, i) => ({ label: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(start + i * 7 * DAY)), value: 0 }));
  for (const d of dates) {
    const i = Math.floor((new Date(d).getTime() - start) / (7 * DAY));
    if (i >= 0 && i < weeks) out[i].value++;
  }
  return out;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const session = await requireSession('admin', '/admin');
  const params = await searchParams;
  const tab: Tab = tabs.some((t) => t.id === params.tab) ? (params.tab as Tab) : 'overview';
  const data = await loadAdminData();
  const now = data.source === 'sample' ? Date.UTC(2026, 9, 19, 12) : Date.now();

  const menu = tabs.filter((t) => t.id !== 'system');
  // A mark on a tab when something there needs a look: red for action, green for news
  const badges: Partial<Record<Tab, { n: number; tone: 'red' | 'green'; title: string }>> = {
    orders: { n: data.orders.filter((o) => o.status === 'awaiting-payment').length, tone: 'red', title: 'new orders to call' },
    service: { n: data.supportRequests.filter((r) => r.status === 'new' && !r.ticketId).length + data.desk.tickets.filter((t) => t.status === 'new').length, tone: 'red', title: 'new Support page requests and jobs no engineer has taken' },
    accounts: { n: data.accounts.filter((a) => now - Date.parse(a.createdAt) < DAY).length, tone: 'green', title: 'registered in the last 24 hours' },
    texts: { n: data.sms.filter((m) => m.status === 'failed' && now - Date.parse(m.at) < DAY).length, tone: 'red', title: 'texts not sent in the last 24 hours' },
  };
  const badge = (id: Tab, phone?: boolean) => {
    const b = badges[id];
    if (!b?.n) return null;
    return (
      <span title={`${b.n} ${b.title}`} className={cn('rounded-full px-2 py-0.5 text-[0.75rem] font-bold tabular-nums text-white', phone ? 'ml-1' : 'ml-auto', b.tone === 'red' ? 'bg-signal' : 'bg-brand-600')}>
        {b.n}
        <span className="sr-only"> {b.title}</span>
      </span>
    );
  };
  const href = (id: Tab) => (id === 'overview' ? '/admin' : `/admin?tab=${id}`);
  const item = (active: boolean) =>
    cn('flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[0.9375rem] font-medium transition', active ? 'bg-brand-50 text-brand-800 shadow-[inset_0_0_0_1px_rgb(0_122_77/0.12)]' : 'text-ink-3 hover:bg-[#f1f4f2] hover:text-ink');

  return (
    <div className="min-h-svh bg-[#e9eeeb] p-3 text-ink md:p-4">
      <div className="mx-auto flex max-w-[1600px] gap-4">
        {/* Sidebar */}
        <aside className="sticky top-4 hidden h-[calc(100svh-2rem)] w-64 shrink-0 flex-col rounded-[1.75rem] bg-white p-5 shadow-[0_1px_2px_rgb(16_25_30/0.04)] lg:flex">
          <Link href="/admin" className="flex items-center gap-2 px-2 pt-1">
            <LogoMark className="size-9" />
            <LogoWordmark className="h-[19px] text-brand-800" />
          </Link>
          <p className="mt-9 px-3.5 text-[0.8125rem] font-semibold tracking-[0.08em] text-ink-3">MENU</p>
          <nav aria-label="Admin sections" className="mt-2 space-y-1">
            {menu.map((t) => (
              <Link key={t.id} href={href(t.id)} aria-current={t.id === tab ? 'page' : undefined} className={item(t.id === tab)}>
                <Icon name={t.icon} className={t.id === tab ? 'text-brand-600' : ''} /> {t.label}
                {badge(t.id)}
              </Link>
            ))}
          </nav>
          <p className="mt-8 px-3.5 text-[0.8125rem] font-semibold tracking-[0.08em] text-ink-3">GENERAL</p>
          <div className="mt-2 space-y-1">
            <Link href={href('system')} aria-current={tab === 'system' ? 'page' : undefined} className={item(tab === 'system')}>
              <Icon name="fi-rr-database" className={tab === 'system' ? 'text-brand-600' : ''} /> Database &amp; settings
            </Link>
            <Link href="/admin/password" className={item(false)}>
              <Icon name="fi-rr-lock" /> Change password
            </Link>
            <form action={adminLogout}>
              <button className={cn(item(false), 'w-full')}>
                <Icon name="fi-rr-sign-out-alt" /> Sign out
              </button>
            </form>
          </div>

          <div className="relative mt-auto overflow-hidden rounded-2xl bg-[radial-gradient(120%_90%_at_10%_0%,#0d7a4b_0%,#06482a_55%,#032a19_100%)] p-5 text-white">
            <div aria-hidden className="absolute -right-10 -top-10 size-36 rounded-full border border-white/10" />
            <div aria-hidden className="absolute -right-4 top-6 size-24 rounded-full border border-white/10" />
            <span className="grid size-9 place-items-center rounded-full bg-white/10"><Icon name="fi-rr-download" /></span>
            <p className="mt-4 text-lg font-semibold leading-tight">Export your data</p>
            <p className="mt-1 text-[0.875rem] text-white/70">Every order as a spreadsheet, ready for Excel.</p>
            <a href="/api/admin/export?table=orders" className="mt-4 flex h-11 items-center justify-center rounded-xl bg-white text-[0.9375rem] font-semibold text-brand-800 transition hover:bg-brand-50">
              Download orders
            </a>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {/* Profile bar */}
          <header className="flex items-center gap-4 rounded-[1.75rem] bg-white px-5 py-4 shadow-[0_1px_2px_rgb(16_25_30/0.04)]">
            <Link href="/admin" className="flex items-center gap-2 lg:hidden">
              <LogoMark className="size-8" />
            </Link>
            <UserAvatar className="size-11 rounded-full bg-[linear-gradient(135deg,#0d7a4b,#04331f)] text-lg text-white" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{session.name}</p>
              <p className="truncate text-[0.875rem] text-ink-3">{session.email}</p>
            </div>
            <p className="ml-auto hidden items-center gap-2 whitespace-nowrap text-[0.875rem] text-ink-3 xl:flex" title="This page updates by itself every 30 seconds">
              <span aria-hidden className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
              </span>
              Live · updated {clockFmt.format(new Date(now))}
            </p>
            <p className="hidden items-center gap-2 rounded-xl bg-[#f1f4f2] px-4 py-2.5 text-[0.9375rem] text-ink-2 md:ml-auto md:flex xl:ml-0">
              <Icon name="fi-rr-calendar" className="text-brand-600" /> {dateFmt.format(new Date(now))}
            </p>
            <form action={adminLogout} className="ml-auto md:ml-0 lg:hidden">
              <button className="h-10 whitespace-nowrap rounded-xl border border-line px-4 text-[0.9375rem] font-medium">Sign out</button>
            </form>
          </header>

          {/* Sections on phones and tablets */}
          <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-2 lg:hidden">
            {tabs.map((t) => (
              <Link key={t.id} href={href(t.id)} aria-current={t.id === tab ? 'page' : undefined} className={cn(item(t.id === tab), 'shrink-0 whitespace-nowrap')}>
                <Icon name={t.icon} /> {t.label}
                {badge(t.id, true)}
              </Link>
            ))}
          </nav>

          <main className="rounded-[1.75rem] bg-[#f6f8f7] p-5 md:p-8">
            {data.source === 'off' && (
              <Notice tone="warn">
                The database (Appwrite) isn’t connected, so there is nothing to show yet. Add APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID and APPWRITE_API_KEY in Vercel, then run <code>npm run appwrite:setup</code>. See <Link href="/admin?tab=system" className="font-semibold underline">Database &amp; settings</Link>.
              </Notice>
            )}
            {data.source === 'sample' && <Notice tone="info">Sample data for a local preview: the database isn’t connected on this computer. The live site shows the real figures.</Notice>}
            {data.tables.some((t) => !t.ok) && (
              <Notice tone="warn">
                Some tables couldn’t be read. See <Link href="/admin?tab=system" className="font-semibold underline">Database &amp; settings</Link>.
              </Notice>
            )}

            {tab === 'overview' && <Overview data={data} now={now} />}
            {/* The overview and the accounts read again every 30 s, so who is on which job stays current */}
            {/* Every tab reads the latest every 30 seconds (not while an engineer is being added, so the form is left alone) */}
            {params.add !== 'engineer' && <LiveRefresh seconds={30} />}
            {tab === 'orders' && <Orders data={data} q={params.q} open={params.order} stage={params.stage} now={now} />}
            {tab === 'accounts' && (params.account ? <AccountDetail data={data} id={params.account} now={now} /> : <Accounts data={data} q={params.q} role={roles.some((r) => r.id && r.id === params.role) ? params.role : undefined} adding={params.add === 'engineer'} />)}
            {tab === 'products' && <Products data={data} />}
            {tab === 'service' && <Service data={data} now={now} />}
            {tab === 'texts' && <Texts data={data} now={now} />}
            {tab === 'system' && <System data={data} phone={session.phone} />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- Pieces ---------- */

function Notice({ tone, children }: { tone: 'warn' | 'info'; children: React.ReactNode }) {
  return (
    <p className={cn('mb-6 flex gap-3 rounded-2xl px-4 py-3 text-[0.9375rem] leading-relaxed', tone === 'warn' ? 'bg-[#fdecec] text-ink' : 'bg-brand-50 text-ink')}>
      <Icon name={tone === 'warn' ? 'fi-rr-exclamation' : 'fi-rr-info'} className={cn('mt-1', tone === 'warn' ? 'text-signal-700' : 'text-brand-600')} />
      <span>{children}</span>
    </p>
  );
}

function Heading({ title, lead, action, picture, hint }: { title: string; lead?: React.ReactNode; action?: React.ReactNode; picture?: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-5">
        {picture}
        <div>
          <h1 className="flex items-center gap-3 text-[clamp(2rem,1.6rem+1.2vw,2.625rem)] font-semibold leading-tight tracking-[-0.03em]">
            {title}
            {hint && <Hint label={`About ${title}`}>{hint}</Hint>}
          </h1>
          {lead && <p className="mt-1.5 text-ink-3">{lead}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

const card = 'rounded-[1.25rem] bg-white shadow-[0_1px_2px_rgb(16_25_30/0.04),0_8px_24px_-12px_rgb(16_25_30/0.08)]';

function Panel({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn(card, 'p-5 md:p-6', className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A figure; `feature` is the green card that leads the row. */
function Stat({ label, value, note, href, feature }: { label: string; value: string | number; note?: string; href: string; feature?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[1.25rem] p-5 transition hover:-translate-y-0.5',
        feature ? 'bg-[radial-gradient(130%_120%_at_0%_0%,#0f8a55_0%,#06482a_55%,#032a19_100%)] text-white shadow-[0_12px_30px_-14px_rgb(4_56_34/0.7)]' : `${card} text-ink`,
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span className="text-[1.0625rem] font-medium">{label}</span>
        <span className={cn('grid size-9 shrink-0 place-items-center rounded-full transition group-hover:rotate-45', feature ? 'bg-white text-brand-800' : 'border border-line text-ink-2')}>
          <Icon name="fi-rr-arrow-up-right" className="text-[0.8125rem]" />
        </span>
      </span>
      <span className="mt-4 text-[2.75rem] font-semibold leading-none tracking-[-0.03em] tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</span>
      {note && (
        <span className={cn('mt-4 flex items-center gap-2 text-[0.875rem]', feature ? 'text-white/80' : 'text-ink-3')}>
          <Icon name="fi-rr-arrow-trend-up" className={feature ? 'text-brand-300' : 'text-brand-600'} /> {note}
        </span>
      )}
    </Link>
  );
}

function Csv({ table, label = 'Download CSV' }: { table: string; label?: string }) {
  return (
    <a href={`/api/admin/export?table=${table}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-4 text-[0.9375rem] font-medium transition hover:border-brand-600 hover:text-brand-700">
      <Icon name="fi-rr-download" /> {label}
    </a>
  );
}

function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className={cn(card, 'overflow-x-auto')}>
      <table className="w-full min-w-[760px] text-left text-[0.9375rem]">
        <thead className="text-[0.875rem] text-ink-3">
          <tr className="border-b border-[#edf1ef]">{head.map((h) => <th key={h} className="px-5 py-4 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-[#edf1ef] [&_td]:px-5 [&_td]:py-3.5 [&_tr:hover]:bg-[#fafbfa]">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-10 text-center text-ink-3">Nothing to show.</p>}
    </div>
  );
}

/** A service request's status in the hospital portal's colours (a dot and coloured text), so both read the same. */
const TicketStatus = ({ status }: { status: TicketStatusId }) => (
  <span className={cn('inline-flex items-center gap-2 whitespace-nowrap text-[0.875rem] font-semibold', statusStyle[status].split(' ').find((c) => c.startsWith('text-')))}>
    <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
    {ticketLabel[status]}
  </span>
);

/** A status as a coloured dot and coloured text (no box). */
const Badge = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) => (
  <span className={cn('inline-flex items-center gap-2 whitespace-nowrap text-[0.875rem] font-semibold', { neutral: 'text-ink-3', good: 'text-brand-700', warn: 'text-[#9a6700]', bad: 'text-signal-700' }[tone])}>
    <span aria-hidden className="size-2 shrink-0 rounded-full bg-current" />
    {children}
  </span>
);
const orderTone = (s: OrderStatus) => (s === 'delivered' ? 'good' : s === 'awaiting-payment' ? 'bad' : s === 'lost' ? 'neutral' : 'warn');

function SearchBox({ tab, q, placeholder, extra }: { tab: Tab; q?: string; placeholder: string; extra?: Record<string, string | undefined> }) {
  return (
    <form className="flex gap-2" action="/admin">
      <input type="hidden" name="tab" value={tab} />
      {Object.entries(extra ?? {}).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      <span className="relative">
        <Icon name="fi-rr-search" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3" />
        <input name="q" defaultValue={q} placeholder={placeholder} className="h-11 w-64 rounded-xl border border-line bg-white pl-10 pr-3 text-[0.9375rem] outline-none focus:border-brand-600" />
      </span>
      <button className="h-11 rounded-xl bg-brand-700 px-4 text-[0.9375rem] font-semibold text-white hover:bg-brand-800">Search</button>
    </form>
  );
}

/* ---------- Tabs ---------- */

function Overview({ data, now }: { data: AdminData; now: number }) {
  const since = (days: number) => new Date(now - days * DAY).toISOString();
  const clients = data.accounts.filter((a) => a.role === 'client');
  const buyers = new Set(data.orders.map((o) => o.account));
  const open = data.desk.tickets.filter((t) => t.status !== 'resolved');
  const rated = data.desk.tickets.filter((t) => t.rating);
  const dueSoon = data.desk.assets.filter((a) => a.nextCalibration && a.nextCalibration < since(-30));
  const orgOf = (email: string) => data.accounts.find((a) => a.email === email)?.organisation ?? email;

  return (
    <>
      <Heading title="Dashboard" lead="Who registers, who buys and what the service desk is doing. Figures update on every visit." />
      <WebsiteRequestsNotice data={data} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat feature href="/admin?tab=orders" label="Orders" value={data.orders.length} note={`${data.orders.filter((o) => o.placedAt > since(30)).length} in the last 30 days`} />
        <Stat href="/admin?tab=accounts" label="Hospital accounts" value={clients.length} note={`${clients.filter((a) => a.createdAt > since(30)).length} new in the last 30 days`} />
        <Stat href="/admin?tab=accounts" label="Hospitals that bought" value={buyers.size} note={clients.length ? `${Math.round((buyers.size / clients.length) * 100)}% of accounts` : 'No accounts yet'} />
        <Stat href="/admin?tab=products" label="Items ordered" value={data.orders.reduce((n, o) => n + units(o), 0)} note={`${data.orders.filter((o) => o.status === 'awaiting-payment').length} new orders to call`} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Mini label="Open service requests" value={open.length} note={`${open.filter((t) => t.priority === 'critical').length} critical`} />
        <Mini label="Equipment under care" value={data.desk.assets.length} note={`${dueSoon.length} due for calibration`} />
        <Mini label="Service rating" value={rated.length ? `${(rated.reduce((n, t) => n + (t.rating ?? 0), 0) / rated.length).toFixed(1)}/5` : '—'} note={`${rated.length} rated visits`} />
        <Mini label="Phones with alerts on" value={data.pushSubscriptions} note="Push subscribers" />
      </div>

      <div className="mt-4">
        <EngineersNow data={data} now={now} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Panel title="Orders per week" className="xl:col-span-7" action={<span className="text-[0.875rem] text-ink-3">Last 12 weeks</span>}>
          <Columns label="Orders per week" data={weekly(data.orders.map((o) => o.placedAt), 12, now)} />
        </Panel>
        <Panel title="Recent orders" className="xl:col-span-5" action={<Link href="/admin?tab=orders" className="rounded-lg border border-ink px-3 py-1.5 text-[0.875rem] font-medium hover:bg-ink hover:text-white">View all</Link>}>
          {data.orders.length ? (
            <ul className="space-y-4">
              {data.orders.slice(0, 5).map((o) => (
                <li key={o.reference} className="flex items-center gap-3">
                  <UserAvatar className="size-11 rounded-full bg-[#eaf5ef] text-base text-brand-800 ring-2 ring-white" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{orgOf(o.account)}</span>
                    <span className="block truncate text-[0.8125rem] text-ink-3">{o.reference} · {units(o)} item{units(o) === 1 ? '' : 's'} · {timeFmt.format(new Date(o.placedAt))}</span>
                  </span>
                  <Badge tone={orderTone(o.status)}>{orderStatusLabel[o.status]}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-3">No orders yet.</p>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Panel title="New accounts per week" className="xl:col-span-7" action={<span className="text-[0.875rem] text-ink-3">Last 12 weeks</span>}>
          <Columns label="New accounts per week" data={weekly(data.accounts.map((a) => a.createdAt), 12, now)} />
        </Panel>
        <Panel title="Most ordered products" className="xl:col-span-5" action={<Link href="/admin?tab=products" className="rounded-lg border border-ink px-3 py-1.5 text-[0.875rem] font-medium hover:bg-ink hover:text-white">View all</Link>}>
          <Bars data={tally(data.orders.flatMap((o) => o.items), (i) => tidy(i.name), (i) => i.qty).slice(0, 6)} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="Order status">
          <Bars data={(Object.keys(orderStatusLabel) as OrderStatus[]).map((s) => ({ label: orderStatusLabel[s], value: data.orders.filter((o) => o.status === s).length }))} />
        </Panel>
        <Panel title="Orders by region">
          <Bars data={tally(data.orders, (o) => o.region || 'Not given').slice(0, 5)} />
        </Panel>
        <Panel title="Payment methods">
          <Bars data={tally(data.orders, (o) => methodLabel[o.method] ?? o.method)} />
        </Panel>
        <Panel title="Service requests">
          <Bars data={Object.keys(ticketLabel).map((s) => ({ label: ticketLabel[s], value: data.desk.tickets.filter((t) => t.status === s).length }))} />
        </Panel>
      </div>

      <p className="mt-6 text-[0.9375rem] text-ink-3">
        Website visits, page views and button clicks (quotes, WhatsApp, calls, brochure downloads) are in{' '}
        <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">Vercel Analytics</a>. Orders are followed up on the{' '}
        <Link href="/admin?tab=orders" className="font-semibold text-brand-700 underline">sales board</Link>.
      </p>
    </>
  );
}

function Mini({ label, value, note }: { label: string; value: string | number; note: string }) {
  return (
    <div className={cn(card, 'px-5 py-4')}>
      <p className="text-[0.875rem] text-ink-3">{label}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-[1.75rem] font-semibold tracking-[-0.02em] tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        <span className="text-[0.8125rem] text-ink-3">{note}</span>
      </p>
    </div>
  );
}

const cedis = (n: number) => `GHS ${n.toLocaleString('en-GB')}`;
/** The stages sales works on: everything before Delivered (and not Lost). */
const openStages: OrderStatus[] = ['awaiting-payment', 'called', 'priced', 'paid', 'processing'];
/** What the next step is called on an order's button, by its stage. */
const nextStep: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  'awaiting-payment': { to: 'called', label: 'Mark as called' },
  called: { to: 'priced', label: 'Price sent' },
  priced: { to: 'paid', label: 'Mark as paid' },
  paid: { to: 'processing', label: 'Start preparing' },
  processing: { to: 'delivered', label: 'Mark as delivered' },
};
const stageDot: Record<OrderStatus, string> = {
  'awaiting-payment': 'bg-signal',
  called: 'bg-[#e8ab00]',
  priced: 'bg-[#e8ab00]',
  paid: 'bg-brand-500',
  processing: 'bg-brand-500',
  delivered: 'bg-brand-800',
  lost: 'bg-ink-3/50',
};

/**
 * The sales board: a line of the stages (how many orders and how much at each), then one list of orders to work
 * through, most urgent and longest-waiting first. A row has the hospital, the order, the phone to tap and one button
 * for the next step; it opens in place for the details, the price, notes and its history.
 */
function Orders({ data, q, open, stage, now }: { data: AdminData; q?: string; open?: string; stage?: string; now: number }) {
  const needle = q?.trim().toLowerCase();
  const account = (email: string) => data.accounts.find((a) => a.email === email);
  const who = (o: SavedOrder) => ({
    name: o.contact?.name || account(o.account)?.name || o.account,
    facility: o.contact?.organisation || account(o.account)?.organisation || '—',
    phone: o.contact?.phone || account(o.account)?.phone || '',
  });
  const matches = (o: SavedOrder) => !needle || [o.reference, o.account, who(o).facility, who(o).name, o.region, ...o.items.map((i) => i.name)].join(' ').toLowerCase().includes(needle);
  const orders = data.orders.filter(matches);
  const live = data.source === 'live';
  const chosen = salesStages.find((x) => x.id === stage)?.id;
  const urgent = (o: SavedOrder) => (o.needs?.timeline === 'urgent' ? 0 : 1);
  const list = orders
    .filter((o) => (chosen ? o.status === chosen : openStages.includes(o.status)))
    .sort((x, y) =>
      chosen === 'delivered' || chosen === 'lost'
        ? y.placedAt.localeCompare(x.placedAt)
        : openStages.indexOf(x.status) - openStages.indexOf(y.status) || urgent(x) - urgent(y) || x.placedAt.localeCompare(y.placedAt),
    );
  const link = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams({ tab: 'orders' });
    for (const [k, v] of Object.entries({ q, stage: chosen, ...extra })) if (v) p.set(k, v);
    return `/admin?${p}`;
  };
  const total = (os: SavedOrder[]) => os.reduce((n, o) => n + (o.amount ?? 0), 0);

  const move = (o: SavedOrder, to: OrderStatus, label: string, primary = false) =>
    live ? (
      <form action={setOrderStatus}>
        <input type="hidden" name="reference" value={o.reference} />
        <input type="hidden" name="status" value={to} />
        <button className={cn('h-9 whitespace-nowrap rounded-lg px-3.5 text-[0.875rem] font-semibold transition', primary ? 'bg-brand-700 text-white hover:bg-brand-800' : 'border border-line bg-white hover:border-brand-600')}>{label}</button>
      </form>
    ) : null;

  const openCount = orders.filter((o) => openStages.includes(o.status)).length;
  return (
    <>
      <Heading
        hint={<>Every order placed in the shop. Call each new one, agree the price, then press the next step: <b>Mark as called</b> → <b>Price sent</b> → <b>Mark as paid</b> → <b>Start preparing</b> → <b>Mark as delivered</b>. The hospital sees each stage in its dashboard. Open an order to record the amount and notes, or move it to any stage (Lost if it did not go ahead).</>}
        title="Sales board"
        lead="Call each new order, agree the price, then press the next step. The hospital follows Price sent, Paid, Being prepared and Delivered in its dashboard."
        action={<div className="flex flex-wrap items-center gap-2"><SearchBox tab="orders" q={q} placeholder="Reference, hospital, product…" extra={{ stage: chosen }} /><Csv table="orders" /></div>}
      />

      {/* The stages as a line with dots: how many orders and how much at each; pick one to see only those */}
      <nav aria-label="Stages" className={cn(card, 'mb-5 overflow-x-auto p-2')}>
        <ol className="flex min-w-max items-stretch">
          <li>
            <Link href={link({ stage: undefined })} aria-current={!chosen ? 'page' : undefined} className={cn('flex h-full flex-col justify-center rounded-xl px-4 py-3 transition', !chosen ? 'bg-brand-700 text-white' : 'hover:bg-[#f1f4f2]')}>
              <span className="text-[0.8125rem] font-medium opacity-80">To work on</span>
              <span className="text-2xl font-semibold tabular-nums">{openCount}</span>
            </Link>
          </li>
          {salesStages.filter((x) => x.id !== 'lost').map((st, i, all) => {
            const at = orders.filter((o) => o.status === st.id);
            const on = chosen === st.id;
            return (
              <li key={st.id} className="relative flex-1">
                <Link href={link({ stage: st.id })} aria-current={on ? 'page' : undefined} className={cn('group relative flex h-full min-w-[9.5rem] flex-col items-center rounded-xl px-3 pb-3 pt-4 text-center transition', on ? 'bg-brand-50' : 'hover:bg-[#f1f4f2]')}>
                  {/* the line joining the dots */}
                  {i > 0 && <span aria-hidden className="absolute left-0 right-1/2 top-[1.375rem] h-0.5 bg-[#dbe5df]" />}
                  {i < all.length - 1 && <span aria-hidden className="absolute left-1/2 right-0 top-[1.375rem] h-0.5 bg-[#dbe5df]" />}
                  <span className={cn('relative z-10 size-3.5 rounded-full ring-4 ring-white', stageDot[st.id], on && 'ring-brand-50')} />
                  <span className={cn('mt-2 text-[0.9375rem] font-semibold', on ? 'text-brand-800' : 'text-ink')}>{st.label}</span>
                  <span className="text-[0.875rem] tabular-nums text-ink-3">
                    {at.length} {at.length === 1 ? 'order' : 'orders'}
                    {total(at) > 0 && <span className="block text-[0.8125rem]">{cedis(total(at))}</span>}
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link href={link({ stage: 'lost' })} aria-current={chosen === 'lost' ? 'page' : undefined} className={cn('flex h-full flex-col justify-center rounded-xl px-4 py-3 text-ink-3 transition', chosen === 'lost' ? 'bg-[#f1f4f2] text-ink' : 'hover:bg-[#f1f4f2]')}>
              <span className="text-[0.8125rem] font-medium">Lost</span>
              <span className="text-lg font-semibold tabular-nums">{orders.filter((o) => o.status === 'lost').length}</span>
            </Link>
          </li>
        </ol>
      </nav>

      {/* The orders as one list to work down */}
      <ul className={cn(card, 'divide-y divide-[#edf1ef] overflow-hidden')}>
        {list.map((o) => {
          const w = who(o);
          const isOpen = open === o.reference;
          const next = nextStep[o.status];
          return (
            <li key={o.reference} className={cn(isOpen && 'bg-[#fafcfb]')}>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
                <Link href={isOpen ? link({}) : link({ order: o.reference })} aria-expanded={isOpen} className="flex min-w-0 flex-1 basis-80 items-start gap-3.5">
                  <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', stageDot[o.status])} aria-hidden />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="font-semibold text-ink">{w.facility}</span>
                      {o.needs?.timeline === 'urgent' && <span className="text-[0.8125rem] font-semibold uppercase tracking-wide text-signal-700">Urgent</span>}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.9375rem] text-ink-2">
                      {o.items.map((i) => `${i.qty} × ${tidy(i.name)}`).join(', ')}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] text-ink-3">
                      <span className="font-mono">{o.reference}</span> · {orderStatusLabel[o.status]} · {ago(o.placedAt, now)} ago{o.log?.length ? ` · ${o.log.length} ${o.log.length === 1 ? 'note' : 'notes'}` : ''}
                    </span>
                  </span>
                </Link>
                <span className="w-28 text-right font-semibold tabular-nums text-brand-800">{o.amount !== undefined ? cedis(o.amount) : <span className="font-normal text-ink-3">No price yet</span>}</span>
                {w.phone ? (
                  <a href={`tel:${w.phone.replace(/[^\d+]/g, '')}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line px-3 text-[0.875rem] font-medium text-brand-700 hover:border-brand-600">
                    <Icon name="fi-rr-phone-call" /> {w.phone}
                  </a>
                ) : null}
                {next && move(o, next.to, next.label, true)}
              </div>
              {isOpen && (
                <div className="border-t border-[#edf1ef] px-5 pb-6 pt-5">
                  <OrderDetail o={o} who={w} live={live} now={now} move={move} />
                </div>
              )}
            </li>
          );
        })}
        {!list.length && <li className="px-5 py-12 text-center text-ink-3">{chosen ? 'No orders at this stage.' : 'Nothing to work on. New orders appear here.'}</li>}
      </ul>
    </>
  );
}

/** One order opened from the board: everything sales needs to call, the price, notes and what happened when. */
function OrderDetail({ o, who, live, now, move }: { o: SavedOrder; who: { name: string; facility: string; phone: string }; live: boolean; now: number; move: (o: SavedOrder, to: OrderStatus, label: string, primary?: boolean) => React.ReactNode }) {
  const department = o.needs?.department && departments.find((d) => d.id === o.needs!.department)?.label;
  const needed = o.needs?.timeline && timelines.find((t) => t.id === o.needs!.timeline);
  const rows: [string, React.ReactNode][] = [
    ['Hospital', who.facility],
    ['Contact', <>{who.name}{who.phone && <> · <a href={`tel:${who.phone.replace(/[^\d+]/g, '')}`} className="font-medium text-brand-700 underline">{who.phone}</a></>} · <a href={`mailto:${o.account}`} className="text-brand-700 underline">{o.account}</a></>],
    ['Items', <span key="i">{o.items.map((i) => <span key={i.slug} className="block">{i.qty} × {tidy(i.name)}</span>)}</span>],
    ...(department ? [['Department', department] as [string, React.ReactNode]] : []),
    ...(needed ? [['Needed', `${needed.label} (${needed.detail.toLowerCase()})`] as [string, React.ReactNode]] : []),
    ...(o.needs?.notes ? [['Their notes', o.needs.notes] as [string, React.ReactNode]] : []),
    ['Payment', methodLabel[o.method] ?? o.method],
    ['Deliver to', [o.address, o.region].filter(Boolean).join(', ') || '—'],
    ['Placed', `${fmt(o.placedAt)} (${ago(o.placedAt, now)} ago)`],
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2.5 text-[0.9375rem]">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-ink-3">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[0.875rem] font-medium text-ink-3">Move to any stage</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {salesStages.map((st) =>
            st.id === o.status ? (
              <span key={st.id} className="inline-flex h-9 items-center rounded-lg bg-brand-700 px-3 text-[0.875rem] font-semibold text-white">{st.label}</span>
            ) : live ? (
              <div key={st.id}>{move(o, st.id, st.label)}</div>
            ) : null,
          )}
        </div>
      </div>
      <div>
        {live && (
          <form action={saveOrderNote} className="space-y-3 rounded-xl border border-line p-4">
            <input type="hidden" name="reference" value={o.reference} />
            <label className="block">
              <span className="text-[0.875rem] font-medium text-ink-3">Agreed price (GHS)</span>
              <input name="amount" inputMode="decimal" defaultValue={o.amount ?? ''} placeholder="e.g. 85000" className="mt-1 h-10 w-full rounded-lg border border-line px-3" />
            </label>
            <label className="block">
              <span className="text-[0.875rem] font-medium text-ink-3">Add a note</span>
              <textarea name="note" rows={2} maxLength={1000} placeholder="e.g. Called, sending pro-forma today" className="mt-1 w-full resize-none rounded-lg border border-line px-3 py-2" />
            </label>
            <button className="h-10 rounded-lg bg-brand-700 px-4 text-[0.9375rem] font-semibold text-white hover:bg-brand-800">Save</button>
          </form>
        )}
        <p className="mt-5 text-[0.875rem] font-medium text-ink-3">History</p>
        <ol className="mt-2 space-y-2 text-[0.9375rem]">
          {[...(o.log ?? [])].reverse().map((l, i) => (
            <li key={i} className="border-l-2 border-[#bfd9c9] pl-3">
              {l.text}
              <span className="block text-[0.8125rem] text-ink-3">{l.by} · {timeFmt.format(new Date(l.at))}</span>
            </li>
          ))}
          <li className="border-l-2 border-[#e3e9e6] pl-3 text-ink-3">Order placed on the website · {timeFmt.format(new Date(o.placedAt))}</li>
        </ol>
      </div>
    </div>
  );
}

const roleLabel = (r: string) => (r === 'client' ? 'Hospital' : r === 'engineer' ? 'Engineer' : 'Admin');
const roles = [
  { id: '', label: 'All' },
  { id: 'client', label: 'Hospitals' },
  { id: 'engineer', label: 'Engineers' },
  { id: 'admin', label: 'Admins' },
];

function Accounts({ data, q, role, adding }: { data: AdminData; q?: string; role?: string; adding?: boolean }) {
  const needle = q?.trim().toLowerCase();
  const list = data.accounts.filter((a) => (!role || a.role === role) && (!needle || [a.name, a.email, a.organisation, a.phone].join(' ').toLowerCase().includes(needle)));
  const ordersOf = (email: string) => data.orders.filter((o) => o.account === email);
  const engineers = data.accounts.filter((a) => a.role === 'engineer');
  return (
    <>
      <Heading
        hint={<>Hospitals register themselves at /login. Engineers are added here (Add engineer) and sign in at /engineer/login. Admins are the emails listed in ADMIN_EMAILS in Vercel. Passwords are never shown.</>}
        title="Accounts"
        lead={`${data.accounts.length} registered accounts: hospitals, ${engineers.length} engineer${engineers.length === 1 ? '' : 's'} and admins. Click an account for its details. Passwords are never shown or stored in readable form.`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin?tab=accounts&role=engineer&add=engineer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-[0.9375rem] font-semibold text-white hover:bg-brand-800">
              <Icon name="fi-rr-user-add" /> Add engineer
            </Link>
            <Csv table="accounts" />
          </div>
        }
      />
      {adding && (
        <Panel title="Add an engineer" className="mb-6">
          <p className="-mt-3 mb-5 text-[0.9375rem] text-ink-3">They sign in to the engineer portal with this email and password, and appear in Engineers now and on the service desk.</p>
          <AddEngineerForm />
        </Panel>
      )}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <Link
              key={r.id}
              href={`/admin?tab=accounts${r.id ? `&role=${r.id}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={cn('rounded-xl border px-3.5 py-2 text-[0.9375rem] font-medium', (role ?? '') === r.id ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-line bg-white hover:border-ink/30')}
            >
              {r.label} <span className="tabular-nums text-ink-3">{r.id ? data.accounts.filter((a) => a.role === r.id).length : data.accounts.length}</span>
            </Link>
          ))}
        </div>
        <SearchBox tab="accounts" q={q} placeholder="Name, hospital, email, phone…" extra={{ role }} />
      </div>
      <Table head={['Hospital / organisation', 'Contact', 'Phone', 'Role', 'Registered', role === 'engineer' ? 'Now' : 'Orders', '']} empty={!list.length}>
        {list.map((a) => {
          const orders = ordersOf(a.email);
          const job = a.role === 'engineer' ? currentJob(data, a.name) : undefined;
          const href = `/admin?tab=accounts&account=${encodeURIComponent(a.id)}`;
          return (
            <tr key={a.id} className="relative cursor-pointer">
              <td className="font-medium">
                {/* The whole row opens the account */}
                <Link href={href} className="after:absolute after:inset-0 hover:text-brand-700">{a.organisation}</Link>
              </td>
              <td>
                <span className="flex items-center gap-3">
                  {a.role === 'engineer' && <UserAvatar src={data.pictures[a.id]} className="size-9 bg-[#eaf5ef] text-sm text-brand-800" />}
                  <span>
                    {a.name}
                    <span className="block text-[0.8125rem] text-ink-3">{a.email}</span>
                  </span>
                </span>
              </td>
              <td className="whitespace-nowrap">{a.phone || '—'}</td>
              <td><Badge tone={a.role === 'client' ? 'neutral' : 'good'}>{roleLabel(a.role)}</Badge></td>
              <td className="whitespace-nowrap">{fmt(a.createdAt)}</td>
              <td className="tabular-nums">{a.role === 'engineer' ? <JobBadge job={job} /> : orders.length}</td>
              <td className="text-right text-ink-3"><Icon name="fi-rr-angle-small-right" /></td>
            </tr>
          );
        })}
      </Table>
      {role === 'engineer' && <p className="mt-4 text-[0.875rem] text-ink-3">Add engineers with the button above. Emails listed in ENGINEER_EMAILS (Vercel) are engineers too.</p>}
    </>
  );
}

/** One account in full: the hospital or company, its people, orders, equipment and service requests; for an engineer, their jobs. */
function AccountDetail({ data, id, now }: { data: AdminData; id: string; now: number }) {
  const a = data.accounts.find((x) => x.id === id);
  if (!a) {
    return (
      <>
        <BackToAccounts />
        <Heading title="Account not found" lead="It may have been removed." />
      </>
    );
  }
  const sameOrg = (o: string) => o.trim().toLowerCase() === a.organisation.trim().toLowerCase();
  const people = data.accounts.filter((x) => sameOrg(x.organisation));
  const orders = data.orders.filter((o) => people.some((p) => p.email === o.account));
  const assets = data.desk.assets.filter((x) => sameOrg(x.facility));
  const tickets = data.desk.tickets.filter((t) => assets.some((x) => x.id === t.assetId));
  const addresses = [...new Set(orders.map((o) => o.address).filter(Boolean))];
  const regions = [...new Set(orders.map((o) => o.region).filter(Boolean))];
  const assetOf = (aid: string) => data.desk.assets.find((x) => x.id === aid);

  if (a.role === 'engineer') {
    const jobs = data.desk.tickets.filter((t) => t.engineer === a.name);
    const job = currentJob(data, a.name);
    const done = jobs.filter((t) => t.status === 'resolved');
    const rated = done.filter((t) => t.rating);
    return (
      <>
        <BackToAccounts role="engineer" />
        <Heading
          title={a.name}
          picture={<UserAvatar src={data.pictures[a.id]} label={a.name} className="size-24 bg-[#eaf5ef] text-4xl text-brand-800" />}
          lead={
            <>
              Engineer · {a.organisation}
              {!data.pictures[a.id] && data.source === 'live' && <span className="mt-1 block text-[0.875rem] font-medium text-[#9a6700]">No photo yet: they’ll be asked to add one when they next open the engineer portal.</span>}
            </>
          }
          action={
            a.id.startsWith('eng-') ? (
              <form action={removeEngineer}>
                <input type="hidden" name="id" value={a.id} />
                <ConfirmButton message={`Remove ${a.name}'s engineer account? They will no longer be able to sign in. Their past jobs stay on the service desk.`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#f3a7ab] bg-white px-4 text-[0.9375rem] font-medium text-signal-700 hover:bg-[#fff3f3]">
                  <Icon name="fi-rr-user-minus" /> Remove engineer
                </ConfirmButton>
              </form>
            ) : undefined
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          <Panel title="Contact">
            <Facts rows={[['Email', <a key="e" href={`mailto:${a.email}`} className="text-brand-700 underline">{a.email}</a>], ['Phone', a.phone ? <a key="p" href={`tel:${a.phone.replace(/\s/g, '')}`} className="text-brand-700 underline">{a.phone}</a> : '—'], ['Registered', fmt(a.createdAt)]]} />
          </Panel>
          <Panel title="Right now" className="lg:col-span-2">
            {job ? <JobLine job={job} data={data} now={now} /> : <p className="text-ink-3">No open job: available.</p>}
          </Panel>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
          <Mini label="Jobs assigned" value={jobs.length} note="all time" />
          <Mini label="Open" value={jobs.length - done.length} note="not yet resolved" />
          <Mini label="Resolved" value={done.length} note="jobs closed" />
          <Mini label="Rating" value={rated.length ? `${(rated.reduce((n, t) => n + (t.rating ?? 0), 0) / rated.length).toFixed(1)}/5` : '—'} note={`${rated.length} rated`} />
        </div>
        <h2 className="mb-3 mt-8 text-lg font-semibold">Jobs</h2>
        <TicketTable tickets={jobs} assetOf={assetOf} />
      </>
    );
  }

  const items = orders.reduce((n, o) => n + units(o), 0);
  return (
    <>
      <BackToAccounts role={a.role === 'client' ? 'client' : undefined} />
      <Heading
        title={a.organisation}
        lead={`${roleLabel(a.role)} account · registered ${fmt(a.createdAt)}`}
        picture={
          people.map((p) => data.pictures[p.id]).find(Boolean) ? (
            // eslint-disable-next-line @next/next/no-img-element -- the hospital's own logo from Appwrite storage
            <img src={people.map((p) => data.pictures[p.id]).find(Boolean)} alt={`${a.organisation} logo`} className="size-24 shrink-0 rounded-2xl bg-white object-contain p-2 ring-1 ring-line" />
          ) : undefined
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Hospital / company">
          <Facts
            rows={[
              ['Name', a.organisation],
              ['Region', regions.join(', ') || '—'],
              ['Delivery address', addresses.length ? addresses.map((x) => <span key={x} className="block">{x}</span>) : '—'],
              ['Customer since', fmt(people.reduce((m, p) => (p.createdAt < m ? p.createdAt : m), a.createdAt))],
            ]}
          />
        </Panel>
        <Panel title={`People (${people.length})`} className="lg:col-span-2">
          <ul className="divide-y divide-[#edf1ef]">
            {people.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-6 gap-y-1 py-3 first:pt-0">
                <UserAvatar src={p.role === 'engineer' ? data.pictures[p.id] : undefined} className="size-10 rounded-full bg-[#eaf5ef] text-base text-brand-800" />
                <span className="min-w-40 font-medium">{p.name}</span>
                <a href={`mailto:${p.email}`} className="text-brand-700 underline">{p.email}</a>
                <span className="text-ink-2">{p.phone ? <a href={`tel:${p.phone.replace(/\s/g, '')}`}>{p.phone}</a> : '—'}</span>
                <span className="text-[0.875rem] text-ink-3">since {fmt(p.createdAt)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Mini label="Orders" value={orders.length} note={`last ${fmt(orders[0]?.placedAt)}`} />
        <Mini label="Items ordered" value={items} note={`${orders.filter((o) => o.status === 'awaiting-payment').length} new`} />
        <Mini label="Equipment under care" value={assets.length} note={`${assets.filter((x) => x.nextCalibration && x.nextCalibration < new Date(now + 30 * DAY).toISOString()).length} due for calibration`} />
        <Mini label="Service requests" value={tickets.length} note={`${tickets.filter((t) => t.status !== 'resolved').length} open`} />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Orders</h2>
      <Table head={['Reference', 'Placed', 'Items', 'Payment', 'Region', 'Status']} empty={!orders.length}>
        {orders.map((o) => (
          <tr key={o.reference}>
            <td className="font-mono text-[0.875rem] font-semibold">{o.reference}</td>
            <td className="whitespace-nowrap">{timeFmt.format(new Date(o.placedAt))}</td>
            <td>{o.items.map((i) => <span key={i.slug} className="block">{i.qty} × {tidy(i.name)}</span>)}</td>
            <td>{methodLabel[o.method] ?? o.method}</td>
            <td>{o.region || '—'}</td>
            <td><Badge tone={orderTone(o.status)}>{orderStatusLabel[o.status]}</Badge></td>
          </tr>
        ))}
      </Table>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Equipment</h2>
      <Table head={['Equipment', 'Serial', 'Location', 'Installed', 'Warranty until', 'Next calibration']} empty={!assets.length}>
        {assets.map((x) => (
          <tr key={x.id}>
            <td className="font-medium">{tidy(x.name)}</td>
            <td className="font-mono text-[0.875rem]">{x.serial}</td>
            <td>{x.location}</td>
            <td className="whitespace-nowrap">{fmt(x.installed)}</td>
            <td className="whitespace-nowrap">{fmt(x.warrantyUntil)}</td>
            <td className="whitespace-nowrap">{x.nextCalibration ? <Badge tone={x.nextCalibration < new Date(now).toISOString() ? 'bad' : x.nextCalibration < new Date(now + 30 * DAY).toISOString() ? 'warn' : 'neutral'}>{fmt(x.nextCalibration)}</Badge> : '—'}</td>
          </tr>
        ))}
      </Table>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Service requests</h2>
      <TicketTable tickets={tickets} assetOf={assetOf} />
    </>
  );
}

function BackToAccounts({ role }: { role?: string }) {
  return (
    <Link href={`/admin?tab=accounts${role ? `&role=${role}` : ''}`} className="mb-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-3 hover:text-ink">
      <Icon name="fi-rr-arrow-small-left" /> All accounts
    </Link>
  );
}

function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="space-y-3">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="text-[0.8125rem] text-ink-3">{k}</dt>
          <dd className="mt-0.5 font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function TicketTable({ tickets, assetOf }: { tickets: AdminData['desk']['tickets']; assetOf: (id: string) => AdminData['desk']['assets'][number] | undefined }) {
  return (
    <Table head={['Request', 'Opened', 'Equipment', 'Hospital', 'Priority', 'Status', 'Engineer', 'Rating']} empty={!tickets.length}>
      {tickets.map((t) => {
        const a = assetOf(t.assetId);
        return (
          <tr key={t.id}>
            <td>
              <span className="font-mono text-[0.875rem] font-semibold">{t.id}</span>
              <span className="block text-[0.8125rem] text-ink-3">{t.title}</span>
            </td>
            <td className="whitespace-nowrap">{fmt(t.openedAt)}</td>
            <td>{a ? tidy(a.name) : t.assetId}</td>
            <td>{a?.facility ?? '—'}</td>
            <td><Badge tone={t.priority === 'critical' ? 'bad' : t.priority === 'high' ? 'warn' : 'neutral'}>{t.priority[0].toUpperCase() + t.priority.slice(1)}</Badge></td>
            <td><TicketStatus status={t.status} /></td>
            <td>{t.engineer ?? <span className="text-signal-700">Unassigned</span>}</td>
            <td>{t.rating ? `${t.rating}/5` : '—'}</td>
          </tr>
        );
      })}
    </Table>
  );
}

/* ---------- Engineers, live ---------- */

/** On site first, then en route, then assigned. */
const busy: Record<string, number> = { onsite: 0, travelling: 1, assigned: 2 };

/** The job an engineer is on now (the furthest along of their open ones), and since when. */
function currentJob(data: AdminData, name: string) {
  const open = data.desk.tickets.filter((t) => t.engineer === name && t.status in busy).sort((x, y) => busy[x.status] - busy[y.status]);
  const t = open[0];
  if (!t) return undefined;
  const since = [...t.log].reverse().find((l) => l.kind === 'status' || l.kind === 'system')?.at ?? t.openedAt;
  return { ticket: t, since, queue: open.length - 1 };
}
type Job = NonNullable<ReturnType<typeof currentJob>>;

const ago = (iso: string, now: number) => {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 6e4));
  return m < 60 ? `${m} min` : m < 48 * 60 ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim() : `${Math.floor(m / 1440)} days`;
};

function JobBadge({ job }: { job?: Job }) {
  if (!job) return <Badge tone="good">Available</Badge>;
  return <TicketStatus status={job.ticket.status} />;
}

function JobLine({ job, data, now }: { job: Job; data: AdminData; now: number }) {
  const t = job.ticket;
  const a = data.desk.assets.find((x) => x.id === t.assetId);
  return (
    <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
      <JobBadge job={job} />
      <span className="min-w-0 flex-1">
        <span className="block font-medium">
          <span className="font-mono text-[0.875rem]">{t.id}</span> · {t.title}
        </span>
        <span className="block text-[0.875rem] text-ink-3">
          {a ? `${tidy(a.name)} · ${a.facility}${a.location ? `, ${a.location}` : ''}` : t.assetId}
        </span>
      </span>
      <span className="text-right text-[0.875rem]">
        <span className="block font-medium">{ticketLabel[t.status]} since {timeFmt.format(new Date(job.since))}</span>
        <span className="block text-ink-3">
          {ago(job.since, now)} ago{t.status === 'travelling' && t.eta ? ` · ETA ${t.eta}` : ''}
          {job.queue ? ` · ${job.queue} more queued` : ''}
        </span>
      </span>
    </div>
  );
}

/** Every engineer (accounts and anyone named on a request) with what they are on now. */
function EngineersNow({ data, now }: { data: AdminData; now: number }) {
  const names = [...new Set([...data.accounts.filter((a) => a.role === 'engineer').map((a) => a.name), ...data.desk.tickets.flatMap((t) => (t.engineer ? [t.engineer] : []))])];
  const rows = names
    .map((name) => ({ name, account: data.accounts.find((a) => a.role === 'engineer' && a.name === name), job: currentJob(data, name) }))
    .sort((x, y) => (x.job ? busy[x.job.ticket.status] : 9) - (y.job ? busy[y.job.ticket.status] : 9));
  const unassigned = data.desk.tickets.filter((t) => t.status === 'new');
  return (
    <Panel
      title="Engineers now"
      action={<span className="flex items-center gap-2 text-[0.875rem] text-ink-3"><span className="size-2 animate-status-pulse rounded-full bg-[#4cc96e]" /> Live · updates every 30 s</span>}
    >
      {rows.length ? (
        <ul className="divide-y divide-[#edf1ef]">
          {rows.map((r) => (
            <li key={r.name} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3.5 first:pt-0 last:pb-0">
              <UserAvatar src={r.account ? data.pictures[r.account.id] : undefined} label={r.name} className="size-10 rounded-full bg-[#eaf5ef] text-base text-brand-800" />
              <span className="w-44 shrink-0">
                {r.account ? (
                  <Link href={`/admin?tab=accounts&account=${encodeURIComponent(r.account.id)}`} className="font-medium hover:text-brand-700">{r.name}</Link>
                ) : (
                  <span className="font-medium">{r.name}</span>
                )}
                <span className="block text-[0.8125rem] text-ink-3">{r.account?.phone || 'Engineer'}</span>
              </span>
              <span className="min-w-0 flex-1">{r.job ? <JobLine job={r.job} data={data} now={now} /> : <JobBadge />}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-3">No engineers yet. Add their emails to ENGINEER_EMAILS.</p>
      )}
      {unassigned.length > 0 && (
        <p className="mt-4 text-[0.875rem]">
          <Link href="/admin?tab=service" className="font-semibold text-signal-700 underline">{unassigned.length} request{unassigned.length === 1 ? '' : 's'} waiting for an engineer</Link>
        </p>
      )}
    </Panel>
  );
}

function Products({ data }: { data: AdminData }) {
  const rows = new Map<string, { name: string; units: number; orders: number; hospitals: Set<string>; last: string }>();
  for (const o of data.orders)
    for (const i of o.items) {
      const r = rows.get(i.slug) ?? { name: tidy(i.name), units: 0, orders: 0, hospitals: new Set<string>(), last: '' };
      r.units += i.qty;
      r.orders += 1;
      r.hospitals.add(o.account);
      if (o.placedAt > r.last) r.last = o.placedAt;
      rows.set(i.slug, r);
    }
  const list = [...rows.entries()].sort((a, b) => b[1].units - a[1].units);
  const categoryOf = new Map(catalogue.map((p) => [p.slug, p.category]));
  const byCategory = tally(data.orders.flatMap((o) => o.items), (i) => categoryName(categoryOf.get(i.slug) ?? 'other'), (i) => i.qty);
  const never = catalogue.length - rows.size;
  return (
    <>
      <Heading title="Product demand" lead={`What hospitals buy. ${rows.size} of the ${catalogue.length} catalogue products have been ordered; ${never} not yet.`} />
      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Items ordered by category">
          <Bars data={byCategory} />
        </Panel>
        <Panel title="Top 8 products by items ordered">
          <Bars data={list.slice(0, 8).map(([, r]) => ({ label: r.name, value: r.units }))} />
        </Panel>
      </div>
      <Table head={['Product', 'Category', 'Items ordered', 'Orders', 'Hospitals', 'Last ordered']} empty={!list.length}>
        {list.map(([slug, r]) => (
          <tr key={slug}>
            <td className="font-medium">
              {r.name}
            </td>
            <td>{categoryName(categoryOf.get(slug) ?? '—')}</td>
            <td className="tabular-nums">{r.units}</td>
            <td className="tabular-nums">{r.orders}</td>
            <td className="tabular-nums">{r.hospitals.size}</td>
            <td className="whitespace-nowrap">{fmt(r.last)}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}

function Service({ data, now }: { data: AdminData; now: number }) {
  const assetOf = (id: string) => data.desk.assets.find((a) => a.id === id);
  const soon = new Date(now + 30 * DAY).toISOString();
  const due = data.desk.assets.filter((a) => a.nextCalibration && a.nextCalibration < soon).sort((a, b) => a.nextCalibration.localeCompare(b.nextCalibration));
  return (
    <>
      <Heading hint={<><b>Service requests</b> are jobs on equipment, followed by the engineers in their portal. <b>Requests from the Support page</b> come from anyone; engineers call back, then mark them Called back, book a visit (it becomes a service request) or close them. “Visit booked · waiting for an engineer” means nobody has taken the job yet.</>}
        title="Service desk" lead="Service requests from hospitals and the equipment Flokefama looks after." action={<div className="flex gap-2"><Csv table="tickets" label="Requests CSV" /><Csv table="equipment" label="Equipment CSV" /></div>} />
      <WebsiteRequests data={data} />
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Requests by priority">
          <Bars data={['critical', 'high', 'routine'].map((p) => ({ label: p[0].toUpperCase() + p.slice(1), value: data.desk.tickets.filter((t) => t.priority === p && t.status !== 'resolved').length, note: 'open' }))} />
        </Panel>
        <Panel title="Requests per engineer">
          <Bars data={tally(data.desk.tickets.filter((t) => t.engineer), (t) => t.engineer!)} />
        </Panel>
        <Panel title="Equipment by hospital">
          <Bars data={tally(data.desk.assets, (a) => a.facility).slice(0, 6)} />
        </Panel>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Service requests</h2>
      <TicketTable tickets={data.desk.tickets} assetOf={assetOf} />

      <h2 className="mb-3 mt-8 text-lg font-semibold">Calibration due within 30 days ({due.length})</h2>
      <Table head={['Equipment', 'Serial', 'Hospital', 'Location', 'Last calibration', 'Due']} empty={!due.length}>
        {due.map((a) => (
          <tr key={a.id}>
            <td className="font-medium">{tidy(a.name)}</td>
            <td className="font-mono text-[0.875rem]">{a.serial}</td>
            <td>{a.facility}</td>
            <td>{a.location}</td>
            <td className="whitespace-nowrap">{fmt(a.lastCalibration)}</td>
            <td className="whitespace-nowrap">
              <Badge tone={a.nextCalibration < new Date(now).toISOString() ? 'bad' : 'warn'}>{fmt(a.nextCalibration)}</Badge>
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

const supportTypeLabel: Record<string, string> = { fault: 'Report a fault', maintenance: 'Book maintenance', installation: 'Installation', assistance: 'Other assistance' };
const supportStatusLabel: Record<string, string> = { new: 'New', called: 'Called back', closed: 'Closed' };

/** On the dashboard: requests from the Support page nobody has called back yet. */
function WebsiteRequestsNotice({ data }: { data: AdminData }) {
  const fresh = data.supportRequests.filter((r) => r.status === 'new');
  if (!fresh.length) return null;
  const faults = fresh.filter((r) => r.type === 'fault').length;
  return (
    <Link href="/admin?tab=service#website-requests" className="mb-4 flex items-center gap-4 rounded-2xl border border-signal/30 bg-[#fdf1f0] px-5 py-4 hover:border-signal/60">
      <Icon name="fi-rr-exclamation" className="text-xl text-signal-700" />
      <span className="flex-1">
        <span className="block font-semibold text-ink">{fresh.length} new request{fresh.length === 1 ? '' : 's'} from the Support page{faults ? ` (${faults} fault${faults === 1 ? '' : 's'})` : ''}</span>
        <span className="block text-[0.9375rem] text-ink-3">Latest: {fresh[0].facility}, {fresh[0].equipment}. Engineers see it in their portal under From the website and call back.</span>
      </span>
      <span className="font-semibold text-signal-700">View</span>
    </Link>
  );
}

/** Service desk tab: everything sent with the Support page's form, with who to call and where each one stands (read-only). */
function WebsiteRequests({ data }: { data: AdminData }) {
  const rows = data.supportRequests;
  return (
    <section id="website-requests" className="mb-8 scroll-mt-6">
      <h2 className="mb-1 text-lg font-semibold">Requests from the Support page ({rows.filter((r) => r.status === 'new').length} new)</h2>
      <p className="mb-3 text-[0.9375rem] text-ink-3">Sent with the Report a fault form by anyone, client or not. Engineers see them in their portal (From the website), call back and, when a visit is needed, book a visit (a service request). The engineers set the status; this list shows where each one stands.</p>
      <Table head={['Received', 'Reference', 'Request', 'Hospital', 'Who to call', 'Equipment & details', 'Status']} empty={!rows.length}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td className="whitespace-nowrap">{timeFmt.format(new Date(r.at))}</td>
            <td className="whitespace-nowrap font-mono text-[0.875rem]">{r.id}</td>
            <td className="whitespace-nowrap">{r.type === 'fault' ? <Badge tone="bad">{supportTypeLabel[r.type]}</Badge> : supportTypeLabel[r.type] ?? r.type}</td>
            <td className="font-medium">{r.facility}</td>
            <td className="whitespace-nowrap">
              {r.name}
              <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`} className="block font-medium text-brand-700 hover:underline">{r.phone}</a>
            </td>
            <td className="min-w-[16rem]">
              <span className="font-medium">{supportSubject(r)}</span>
              {supportDetails(r)
                .filter(([k]) => k !== 'Equipment' && k !== 'Help with')
                .map(([k, v]) => (
                  <span key={k} className={cn('mt-0.5 block text-[0.875rem]', k === 'Status' && r.working === 'down' ? 'font-semibold text-signal-700' : 'text-ink-3')}>
                    {k}: {v}
                  </span>
                ))}
            </td>
            <td>
              {/* Engineers move requests on in their portal; the console only shows where each one stands */}
              {r.ticketId ? (
                <Badge tone={visitStatus(data.desk.tickets.find((t) => t.id === r.ticketId)).tone}>{visitStatus(data.desk.tickets.find((t) => t.id === r.ticketId)).label}</Badge>
              ) : (
                <Badge tone={r.status === 'new' ? 'bad' : r.status === 'called' ? 'warn' : 'good'}>{supportStatusLabel[r.status]}</Badge>
              )}
              {r.status !== 'new' && r.handledBy && (
                <span className="mt-1 block whitespace-nowrap text-[0.8125rem] text-ink-3">
                  {r.ticketId ? 'booked by' : 'by'} {r.handledBy}
                  {r.handledAt ? `, ${timeFmt.format(new Date(r.handledAt))}` : ''}
                  {r.ticketId ? ` · ${r.ticketId}` : ''}
                </span>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </section>
  );
}

/**
 * Every text the website has sent, newest first: what it was about, who got it (by name where the number belongs to
 * an account), the message exactly as sent, and whether the gateway accepted it (with its reason if not).
 */
async function Texts({ data, now }: { data: AdminData; now: number }) {
  const [hospitals, templates, upcoming] = await Promise.all([hospitalsToText().catch(() => []), messageTemplates(), upcomingClientTexts(data.desk, now)]);
  const auto = [
    { title: 'Updates on a request', when: 'When an engineer is assigned, and when it is fixed, to the number the hospital gave with the request', text: 'Request TK-1042 (Mindray BC-5150 analyser): engineer Samuel Owusu is assigned. You can reach Samuel on 024 555 0101.', note: 'Then: “your … is fixed, please rate the visit”. On the way and on site show in the portal only.' },
    { title: 'Check-in after a repair', when: `${CHECK_IN_DAYS} days after a job is resolved, to that hospital`, text: checkInText('Mindray BC-5150 analyser', 'Ridge Hospital', '20 Oct', upcoming.phone), note: `${upcoming.checkIns} due in the coming days` },
    { title: 'Calibration reminder', when: `${CALIBRATION_NOTICE_DAYS} days before a machine is due, to that hospital`, text: calibrationText('Mindray BC-5150 analyser', 'Ridge Hospital', '12 Nov', upcoming.phone), note: `${upcoming.calibrations} machines due in the next six weeks` },
    { title: 'Holidays and health days', when: `${upcoming.calendar.filter((o) => !o.off).length} a year: ${upcoming.calendar.filter((o) => !o.off).map((o) => o.name).join(', ')}, to every hospital`, text: upcoming.next?.text ?? '', note: upcoming.next ? `Next: ${upcoming.next.name}, ${dateFmt.format(upcoming.next.date)}` : '' },
  ];
  const byNumber = new Map(data.accounts.flatMap((a) => (a.phone && normalisePhone(a.phone) ? [[normalisePhone(a.phone)!, a.name] as const] : [])));
  const recent = data.sms.filter((m) => Date.parse(m.at) > now - 30 * DAY);
  const people = (to: string) => to.split(',').filter(Boolean);
  return (
    <>
      <Heading
        hint={<>Every text the website sends, through Arkesel from “Flokefama”: to engineers about urgent faults, to admins when nobody takes an urgent job in 30 minutes, and to hospitals when an engineer is assigned and when a job is fixed, plus check-ins, calibration reminders and five greetings a year. “Not sent” shows Arkesel’s reason.</>}
        title="Text messages"
        lead={<>Texts to engineers about their work, and to hospitals to keep in touch. Below, every text sent, newest first: what it was about, who got it, the message exactly as it arrived, and whether it went out. Texts are sent from “Flokefama”{smsProvider === 'arkesel' ? ' through Arkesel' : ''}; send a test from <Link href="/admin?tab=system" className="font-medium text-brand-700 underline">Database &amp; settings</Link>.</>}
      />
      {!smsProvider && <p className="mb-5 rounded-xl bg-[#fdf6e3] px-4 py-3 text-[0.9375rem] text-[#7a5200]">Texts are off: set SMS_PROVIDER and SMS_API_KEY in Vercel (see Database &amp; settings).</p>}

      <h2 className="mb-1 text-lg font-semibold">Texts to hospitals</h2>
      <p className="mb-4 text-[0.9375rem] text-ink-3">
        To keep in touch between visits. The automatic ones go out once a day at 9:00, each only once.{' '}
        {clientTextsAuto ? (process.env.CRON_SECRET ? 'They are on.' : 'They are on, but need CRON_SECRET set in Vercel for the daily run.') : 'They are off (CLIENT_TEXTS=off, or texts are off).'}{' '}
        {hospitals.length} hospital{hospitals.length === 1 ? '' : 's'} can be texted; any hospital can turn texts off in its portal.
      </p>
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {auto.map((a) => (
          <div key={a.title} className={cn(card, 'p-5')}>
            <p className="font-semibold">{a.title}</p>
            <p className="mt-0.5 text-[0.875rem] text-ink-3">{a.when}</p>
            <p className="mt-3 rounded-2xl rounded-bl-md bg-[#eef3f0] px-3.5 py-2.5 text-[0.9375rem] leading-snug">{a.text}</p>
            {a.note && <p className="mt-2 text-[0.8125rem] text-ink-3">{a.note}</p>}
          </div>
        ))}
      </div>
      <details className={cn(card, 'mb-5 p-5')}>
        <summary className="cursor-pointer font-semibold">The greetings calendar: holidays and health days for the next 12 months, with their messages</summary>
        <p className="mt-1 text-[0.875rem] text-ink-3">To keep texts few, only the days marked “sent automatically” go out by themselves, at 9:00 on the day. The rest, and Eid, can be sent from the box below (Holiday or health day…). In Vercel, CLIENT_TEXTS_ADD adds a day to the automatic ones and CLIENT_TEXTS_SKIP takes one off (by the key shown).</p>
        <ul className="mt-4 divide-y divide-line">
          {upcoming.calendar.map((o) => (
            <li key={`${o.key}-${o.date.getUTCFullYear()}`} className={cn('grid gap-2 py-3 md:grid-cols-[14rem_1fr]', o.off && 'opacity-75')}>
              <div>
                <p className="font-medium">{o.name}</p>
                <p className="text-[0.875rem] text-ink-3">
                  {dateFmt.format(o.date)} · <span className="font-mono">{o.key}</span>
                  {o.off ? ' · send by hand' : ' · sent automatically'}
                </p>
              </div>
              <div>
                <p className="rounded-2xl rounded-bl-md bg-[#eef3f0] px-3.5 py-2.5 text-[0.9375rem] leading-snug">{o.text}</p>
                <p className="mt-1 text-[0.8125rem] text-ink-3">
                  {o.text.length} characters · {o.text.length <= 160 ? 1 : Math.ceil(o.text.length / 153)} SMS per hospital
                </p>
              </div>
            </li>
          ))}
        </ul>
      </details>
      <div className="mb-8"><HospitalTextsForm templates={templates} hospitals={hospitals.length} /></div>

      <h2 className="mb-3 text-lg font-semibold">Every text sent</h2>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Mini label="Texts in the last 30 days" value={recent.length} note={`to ${recent.reduce((n, m) => n + people(m.to).length, 0)} phones`} />
        <Mini label="Sent" value={recent.filter((m) => m.status === 'sent').length} note="accepted by the gateway" />
        <Mini label="Not sent" value={recent.filter((m) => m.status === 'failed').length} note="the reason is shown on each" />
      </div>
      <Table head={['When', 'About', 'To', 'Message', 'Status']} empty={!data.sms.length}>
        {data.sms.map((m) => (
          <tr key={m.id} className="align-top">
            <td className="whitespace-nowrap">{timeFmt.format(new Date(m.at))}</td>
            <td className="whitespace-nowrap">
              {smsKind[m.kind] ?? m.kind}
              {m.ref && m.ref !== 'TEST' && <span className="block font-mono text-[0.8125rem] text-ink-3">{m.ref}</span>}
            </td>
            <td className="min-w-[12rem]">
              {people(m.to).map((n) => (
                <span key={n} className="block whitespace-nowrap text-[0.875rem]">
                  {byNumber.get(n) ?? 'Number'} <span className="font-mono text-[0.8125rem] text-ink-3">+{n}</span>
                </span>
              ))}
            </td>
            <td className="min-w-[20rem]">
              <span className="block rounded-2xl rounded-bl-md bg-[#eef3f0] px-3.5 py-2.5 text-[0.9375rem] leading-snug">{m.text}</span>
              <span className="mt-1 block text-[0.8125rem] text-ink-3">{m.text.length} characters · {m.text.length <= 160 ? '1 SMS' : `${Math.ceil(m.text.length / 153)} SMS`} per phone</span>
            </td>
            <td className="whitespace-nowrap">
              <Badge tone={m.status === 'sent' ? 'good' : m.status === 'failed' ? 'bad' : 'neutral'}>{smsStatus[m.status] ?? m.status}</Badge>
              {m.status === 'failed' && m.detail && <span className="mt-1 block max-w-[16rem] whitespace-normal text-[0.8125rem] text-signal-700">{m.detail}</span>}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

async function System({ data, phone }: { data: AdminData; phone?: string }) {
  // Brevo and Arkesel are checked live (nothing is sent), so the reason shows here when emails or texts aren't going out
  const [brevo, sms] = await Promise.all([brevoStatus(), smsGatewayStatus()]);
  const checks = [...configChecks().map((c) => (c.label === 'Text messages (SMS)' && sms ? { ...c, ...sms } : c)), { label: 'Support requests and new orders by email (Brevo)', ...brevo }];
  return (
    <>
      <Heading title="Database & settings" lead="Whether each table answers and how many rows it holds, and the settings the site depends on (set in Vercel → Settings → Environment Variables)." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Database tables (Appwrite)">
          {data.tables.length ? (
            <ul className="divide-y divide-[#edf1ef]">
              {data.tables.map((t) => (
                <li key={t.table} className="flex items-start justify-between gap-4 py-3">
                  <span>
                    <span className="font-medium">{t.label}</span>
                    <span className="block font-mono text-[0.8125rem] text-ink-3">{t.table}</span>
                    {t.error && <span className="mt-1 block text-[0.875rem] text-signal-700">{t.error}</span>}
                  </span>
                  {t.ok ? <Badge tone="good">{t.rows?.toLocaleString()} rows</Badge> : <Badge tone="bad">Not reachable</Badge>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-3">Not connected.</p>
          )}
          <p className="mt-4 text-[0.875rem] text-ink-3">
            Tables are created with <code>npm run appwrite:setup</code>. Manage rows, backups and API keys in the{' '}
            <a href="https://cloud.appwrite.io/console" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">Appwrite console</a>.
          </p>
        </Panel>
        <Panel title="Settings">
          <ul className="divide-y divide-[#edf1ef]">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3 py-3">
                <Icon name={c.ok ? 'fi-rr-check-circle' : 'fi-rr-exclamation'} className={cn('mt-1', c.ok ? 'text-brand-600' : 'text-[#b07800]')} />
                <span>
                  <span className="font-medium">{c.label}</span>
                  <span className="block text-[0.875rem] text-ink-3">{c.detail}</span>
                  {c.label === 'Text messages (SMS)' && smsProvider && <TestSmsForm defaultPhone={phone} />}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
