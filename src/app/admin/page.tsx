import Link from 'next/link';
import { Bars, Columns } from '@/components/admin/charts';
import { LiveRefresh } from '@/components/admin/live-refresh';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { UserAvatar } from '@/components/ui/user-avatar';
import { setOrderStatus } from '@/lib/admin/actions';
import { configChecks, loadAdminData, type AdminData } from '@/lib/admin/data';
import { adminLogout } from '@/lib/auth/actions';
import { requireSession } from '@/lib/auth/server';
import { catalogue } from '@/data/catalogue';
import type { OrderStatus } from '@/lib/orders';
import { cn } from '@/lib/utils';

/**
 * Admin console (/admin, ADMIN_EMAILS only): who registers, who buys what, the service desk and the health of the
 * database and settings. Read from Appwrite on every visit; orders can be moved along from here, and every table
 * downloads as CSV.
 */
export const dynamic = 'force-dynamic';

type Tab = 'overview' | 'orders' | 'accounts' | 'products' | 'service' | 'system';
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'fi-rr-apps' },
  { id: 'orders', label: 'Orders', icon: 'fi-rr-box-open' },
  { id: 'accounts', label: 'Accounts', icon: 'fi-rr-users' },
  { id: 'products', label: 'Product demand', icon: 'fi-rr-shopping-cart' },
  { id: 'service', label: 'Service desk', icon: 'fi-rr-tools' },
  { id: 'system', label: 'Database & settings', icon: 'fi-rr-database' },
];

const DAY = 864e5;
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Accra' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Accra' });
const fmt = (iso: string | undefined) => (iso ? dateFmt.format(new Date(iso)) : '—');
const units = (o: { items: { qty: number }[] }) => o.items.reduce((n, i) => n + i.qty, 0);
// Kept here: '@/lib/orders' is a browser module, so its constants can't be read on the server
const orderStatusLabel: Record<OrderStatus, string> = { 'awaiting-payment': 'Awaiting payment', paid: 'Paid', processing: 'Being prepared', delivered: 'Delivered' };
/** "AUTO HEAMATOLOGY ANALYZER BC5150" → "Auto Heamatology Analyzer BC5150" (model codes stay upper case). */
const tidy = (n: string) => n.split(/(\s+|[()])/).map((w) => (/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');
const methodLabel: Record<string, string> = { momo: 'Mobile money', card: 'Card', bank: 'Bank transfer' };
const ticketLabel: Record<string, string> = { new: 'Logged', assigned: 'Assigned', travelling: 'En route', onsite: 'On site', resolved: 'Resolved' };
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
              </Link>
            ))}
          </nav>
          <p className="mt-8 px-3.5 text-[0.8125rem] font-semibold tracking-[0.08em] text-ink-3">GENERAL</p>
          <div className="mt-2 space-y-1">
            <Link href={href('system')} aria-current={tab === 'system' ? 'page' : undefined} className={item(tab === 'system')}>
              <Icon name="fi-rr-database" className={tab === 'system' ? 'text-brand-600' : ''} /> Database &amp; settings
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
            <p className="ml-auto hidden items-center gap-2 rounded-xl bg-[#f1f4f2] px-4 py-2.5 text-[0.9375rem] text-ink-2 md:flex">
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
            {(tab === 'overview' || (tab === 'accounts' && params.account)) && <LiveRefresh seconds={30} />}
            {tab === 'orders' && <Orders data={data} status={params.status} q={params.q} />}
            {tab === 'accounts' && (params.account ? <AccountDetail data={data} id={params.account} now={now} /> : <Accounts data={data} q={params.q} role={roles.some((r) => r.id && r.id === params.role) ? params.role : undefined} />)}
            {tab === 'products' && <Products data={data} />}
            {tab === 'service' && <Service data={data} now={now} />}
            {tab === 'system' && <System data={data} />}
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

function Heading({ title, lead, action }: { title: string; lead?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[clamp(2rem,1.6rem+1.2vw,2.625rem)] font-semibold leading-tight tracking-[-0.03em]">{title}</h1>
        {lead && <p className="mt-1.5 text-ink-3">{lead}</p>}
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

const Badge = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) => (
  <span
    className={cn(
      'inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-[0.8125rem] font-medium',
      { neutral: 'border-line bg-[#f6f8f7] text-ink-2', good: 'border-[#9fdcbb] bg-[#effaf4] text-brand-700', warn: 'border-[#f2d37a] bg-[#fffaeb] text-[#7a5300]', bad: 'border-[#f3a7ab] bg-[#fff3f3] text-signal-700' }[tone],
    )}
  >
    {children}
  </span>
);
const orderTone = (s: OrderStatus) => (s === 'delivered' ? 'good' : s === 'awaiting-payment' ? 'bad' : 'warn');

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat feature href="/admin?tab=orders" label="Orders" value={data.orders.length} note={`${data.orders.filter((o) => o.placedAt > since(30)).length} in the last 30 days`} />
        <Stat href="/admin?tab=accounts" label="Hospital accounts" value={clients.length} note={`${clients.filter((a) => a.createdAt > since(30)).length} new in the last 30 days`} />
        <Stat href="/admin?tab=accounts" label="Hospitals that bought" value={buyers.size} note={clients.length ? `${Math.round((buyers.size / clients.length) * 100)}% of accounts` : 'No accounts yet'} />
        <Stat href="/admin?tab=products" label="Items ordered" value={data.orders.reduce((n, o) => n + units(o), 0)} note={`${data.orders.filter((o) => o.status === 'awaiting-payment').length} orders awaiting payment`} />
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
        <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">Vercel Analytics</a>. Quote, demo and support requests arrive in{' '}
        <a href="https://app.hubspot.com" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">HubSpot</a>.
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

function Orders({ data, status, q }: { data: AdminData; status?: string; q?: string }) {
  const needle = q?.trim().toLowerCase();
  const orgOf = (email: string) => data.accounts.find((a) => a.email === email)?.organisation ?? '';
  const list = data.orders.filter(
    (o) => (!status || o.status === status) && (!needle || [o.reference, o.account, orgOf(o.account), o.region, ...o.items.map((i) => i.name)].join(' ').toLowerCase().includes(needle)),
  );
  return (
    <>
      <Heading title="Orders" lead={`${data.orders.length} orders placed at checkout. Move an order along as payment arrives and it ships.`} action={<Csv table="orders" />} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {[undefined, ...(Object.keys(orderStatusLabel) as OrderStatus[])].map((s) => (
            <Link
              key={s ?? 'all'}
              href={`/admin?tab=orders${s ? `&status=${s}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
              className={cn('rounded-xl border px-3.5 py-2.5 text-[0.9375rem] font-medium transition', status === s ? 'border-brand-700 bg-brand-700 text-white' : 'border-line bg-white hover:border-brand-600')}
            >
              {s ? orderStatusLabel[s] : 'All'} ({s ? data.orders.filter((o) => o.status === s).length : data.orders.length})
            </Link>
          ))}
        </div>
        <SearchBox tab="orders" q={q} placeholder="Reference, hospital, product…" extra={{ status }} />
      </div>
      <Table head={['Reference', 'Placed', 'Hospital', 'Items', 'Payment', 'Region', 'Status']} empty={!list.length}>
        {list.map((o) => (
          <tr key={o.reference} className="align-top">
            <td className="font-mono text-[0.875rem] font-semibold">{o.reference}</td>
            <td className="whitespace-nowrap">{fmt(o.placedAt)}</td>
            <td>
              {orgOf(o.account) || '—'}
              <span className="block text-[0.8125rem] text-ink-3">{o.account}</span>
            </td>
            <td>
              {o.items.map((i) => (
                <span key={i.slug} className="block">
                  {i.qty} × {tidy(i.name)}
                </span>
              ))}
            </td>
            <td className="whitespace-nowrap">{methodLabel[o.method] ?? o.method}</td>
            <td>{o.region || '—'}</td>
            <td>
              {data.source === 'live' ? (
                <form action={setOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="reference" value={o.reference} />
                  <select name="status" defaultValue={o.status} aria-label={`Status of ${o.reference}`} className="h-9 rounded-lg border border-line bg-white px-2 text-[0.9375rem]">
                    {(Object.keys(orderStatusLabel) as OrderStatus[]).map((s) => <option key={s} value={s}>{orderStatusLabel[s]}</option>)}
                  </select>
                  <button className="h-9 rounded-lg bg-brand-700 px-3 text-[0.875rem] font-semibold text-white hover:bg-brand-800">Save</button>
                </form>
              ) : (
                <Badge tone={orderTone(o.status)}>{orderStatusLabel[o.status]}</Badge>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}

const roleLabel = (r: string) => (r === 'client' ? 'Hospital' : r === 'engineer' ? 'Engineer' : 'Admin');
const roles = [
  { id: '', label: 'All' },
  { id: 'client', label: 'Hospitals' },
  { id: 'engineer', label: 'Engineers' },
  { id: 'admin', label: 'Admins' },
];

function Accounts({ data, q, role }: { data: AdminData; q?: string; role?: string }) {
  const needle = q?.trim().toLowerCase();
  const list = data.accounts.filter((a) => (!role || a.role === role) && (!needle || [a.name, a.email, a.organisation, a.phone].join(' ').toLowerCase().includes(needle)));
  const ordersOf = (email: string) => data.orders.filter((o) => o.account === email);
  const engineers = data.accounts.filter((a) => a.role === 'engineer');
  return (
    <>
      <Heading
        title="Accounts"
        lead={`${data.accounts.length} registered accounts: hospitals, ${engineers.length} engineer${engineers.length === 1 ? '' : 's'} and admins. Click an account for its details. Passwords are never shown or stored in readable form.`}
        action={<Csv table="accounts" />}
      />
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
                {a.name}
                <span className="block text-[0.8125rem] text-ink-3">{a.email}</span>
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
      {role === 'engineer' && <p className="mt-4 text-[0.875rem] text-ink-3">Engineer accounts are the emails listed in ENGINEER_EMAILS (Vercel → Settings → Environment Variables). Add an email there and that person signs in to the engineer portal.</p>}
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
        <Heading title={a.name} lead={`Engineer · ${a.organisation}`} />
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
      <Heading title={a.organisation} lead={`${roleLabel(a.role)} account · registered ${fmt(a.createdAt)}`} />
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
                <UserAvatar className="size-10 rounded-full bg-[#eaf5ef] text-base text-brand-800" />
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
        <Mini label="Items ordered" value={items} note={`${orders.filter((o) => o.status === 'awaiting-payment').length} awaiting payment`} />
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
            <td><Badge tone={t.status === 'resolved' ? 'good' : 'neutral'}>{ticketLabel[t.status]}</Badge></td>
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
  return <Badge tone={job.ticket.status === 'onsite' ? 'warn' : 'neutral'}>{ticketLabel[job.ticket.status]}</Badge>;
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
              <UserAvatar className="size-10 rounded-full bg-[#eaf5ef] text-base text-brand-800" />
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
      <Heading title="Service desk" lead="Service requests from hospitals and the equipment Flokefama looks after." action={<div className="flex gap-2"><Csv table="tickets" label="Requests CSV" /><Csv table="equipment" label="Equipment CSV" /></div>} />
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

function System({ data }: { data: AdminData }) {
  const checks = configChecks();
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
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
