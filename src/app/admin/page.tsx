import Link from 'next/link';
import { Bars, Columns } from '@/components/admin/charts';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Icon } from '@/components/ui/icon';
import { setOrderStatus } from '@/lib/admin/actions';
import { configChecks, loadAdminData, type AdminData } from '@/lib/admin/data';
import { logout } from '@/lib/auth/actions';
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

  return (
    <div className="min-h-svh bg-canvas text-ink">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-midnight text-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <LogoWordmark className="h-[18px] text-white" />
          </Link>
          <span className="whitespace-nowrap border-l border-white/20 pl-4 text-[0.9375rem] font-semibold tracking-wide">Admin<span className="hidden sm:inline"> console</span></span>
          <span className="ml-auto hidden text-[0.9375rem] text-white/70 sm:block">{session.name}</span>
          <form action={logout}>
            <button className="h-10 whitespace-nowrap border border-white/25 px-4 text-[0.9375rem] font-medium hover:bg-white/10">Sign out</button>
          </form>
        </div>
        <nav aria-label="Admin sections" className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-3 md:px-6">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={t.id === 'overview' ? '/admin' : `/admin?tab=${t.id}`}
              aria-current={t.id === tab ? 'page' : undefined}
              className={cn('flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[0.9375rem] font-medium transition', t.id === tab ? 'border-brand-300 text-white' : 'border-transparent text-white/65 hover:text-white')}
            >
              <Icon name={t.icon} /> {t.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-8 md:py-10">
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
        {tab === 'orders' && <Orders data={data} status={params.status} q={params.q} />}
        {tab === 'accounts' && <Accounts data={data} q={params.q} />}
        {tab === 'products' && <Products data={data} />}
        {tab === 'service' && <Service data={data} now={now} />}
        {tab === 'system' && <System data={data} />}
      </main>
    </div>
  );
}

/* ---------- Pieces ---------- */

function Notice({ tone, children }: { tone: 'warn' | 'info'; children: React.ReactNode }) {
  return (
    <p className={cn('mb-6 border-l-4 px-4 py-3 text-[0.9375rem] leading-relaxed', tone === 'warn' ? 'border-signal bg-[#fdecec] text-ink' : 'border-brand-600 bg-brand-50 text-ink')}>
      {children}
    </p>
  );
}

function Heading({ title, lead, action }: { title: string; lead?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[1.75rem] font-bold tracking-[-0.02em]">{title}</h1>
        {lead && <p className="mt-1 text-ink-3">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

function Panel({ title, children, className, action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section className={cn('border border-line bg-paper p-5 md:p-6', className)}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-[-0.01em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, note, icon }: { label: string; value: string | number; note?: string; icon: string }) {
  return (
    <div className="border border-line bg-paper p-5">
      <p className="flex items-center gap-2 text-[0.9375rem] font-medium text-ink-3">
        <Icon name={icon} className="text-brand-600" /> {label}
      </p>
      <p className="mt-2 text-[2rem] font-bold leading-none tracking-[-0.02em] tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {note && <p className="mt-2 text-[0.875rem] text-ink-3">{note}</p>}
    </div>
  );
}

function Csv({ table, label = 'Download CSV' }: { table: string; label?: string }) {
  return (
    <a href={`/api/admin/export?table=${table}`} className="inline-flex h-10 items-center gap-2 border border-line bg-paper px-4 text-[0.9375rem] font-medium hover:border-brand-600 hover:text-brand-700">
      <Icon name="fi-rr-download" /> {label}
    </a>
  );
}

function Table({ head, children, empty }: { head: string[]; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto border border-line bg-paper">
      <table className="w-full min-w-[760px] text-left text-[0.9375rem]">
        <thead className="border-b border-line bg-mist/60 text-[0.875rem] text-ink-3">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-10 text-center text-ink-3">Nothing to show.</p>}
    </div>
  );
}

const Badge = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) => (
  <span className={cn('inline-block whitespace-nowrap px-2 py-0.5 text-[0.8125rem] font-semibold', { neutral: 'bg-mist text-ink-2', good: 'bg-brand-50 text-brand-700', warn: 'bg-[#fff4d6] text-[#7a5300]', bad: 'bg-[#fdecec] text-signal-700' }[tone])}>
    {children}
  </span>
);
const orderTone = (s: OrderStatus) => (s === 'delivered' ? 'good' : s === 'awaiting-payment' ? 'warn' : 'neutral');

function SearchBox({ tab, q, placeholder, extra }: { tab: Tab; q?: string; placeholder: string; extra?: Record<string, string | undefined> }) {
  return (
    <form className="flex gap-2" action="/admin">
      <input type="hidden" name="tab" value={tab} />
      {Object.entries(extra ?? {}).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      <input name="q" defaultValue={q} placeholder={placeholder} className="h-10 w-64 border border-line bg-paper px-3 text-[0.9375rem] outline-none focus:border-brand-600" />
      <button className="h-10 bg-brand-600 px-4 text-[0.9375rem] font-semibold text-white hover:bg-brand-700">Search</button>
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

  const activity = [
    ...data.orders.slice(0, 8).map((o) => ({ at: o.placedAt, icon: 'fi-rr-box-open', text: `${o.reference}: ${units(o)} item${units(o) === 1 ? '' : 's'} ordered by ${data.accounts.find((a) => a.email === o.account)?.organisation ?? o.account}` })),
    ...data.accounts.slice(0, 8).map((a) => ({ at: a.createdAt, icon: 'fi-rr-user-add', text: `${a.organisation} registered (${a.name})` })),
    ...data.desk.tickets.slice(0, 8).map((t) => ({ at: t.openedAt, icon: 'fi-rr-tools', text: `${t.id}: ${t.title} (${t.priority})` })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);

  return (
    <>
      <Heading title="Overview" lead="Everything happening on the site at a glance. Figures update on every visit." />
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Stat icon="fi-rr-hospital" label="Hospital accounts" value={clients.length} note={`${clients.filter((a) => a.createdAt > since(30)).length} new in the last 30 days`} />
        <Stat icon="fi-rr-shopping-bag" label="Hospitals that bought" value={buyers.size} note={clients.length ? `${Math.round((buyers.size / clients.length) * 100)}% of accounts` : undefined} />
        <Stat icon="fi-rr-box-open" label="Orders" value={data.orders.length} note={`${data.orders.filter((o) => o.placedAt > since(30)).length} in the last 30 days`} />
        <Stat icon="fi-rr-boxes" label="Items ordered" value={data.orders.reduce((n, o) => n + units(o), 0)} note={`${data.orders.filter((o) => o.status === 'awaiting-payment').length} orders awaiting payment`} />
        <Stat icon="fi-rr-tools" label="Open service requests" value={open.length} note={`${open.filter((t) => t.priority === 'critical').length} critical`} />
        <Stat icon="fi-rr-microscope" label="Equipment under care" value={data.desk.assets.length} note={`${dueSoon.length} due for calibration within 30 days`} />
        <Stat icon="fi-rr-star" label="Service rating" value={rated.length ? (rated.reduce((n, t) => n + (t.rating ?? 0), 0) / rated.length).toFixed(1) : '—'} note={`${rated.length} rated visits (out of 5)`} />
        <Stat icon="fi-rr-bell" label="Phones with alerts on" value={data.pushSubscriptions} note="Push notification subscribers" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Orders per week (last 12 weeks)">
          <Columns label="Orders per week" data={weekly(data.orders.map((o) => o.placedAt), 12, now)} />
        </Panel>
        <Panel title="New accounts per week (last 12 weeks)">
          <Columns label="New accounts per week" data={weekly(data.accounts.map((a) => a.createdAt), 12, now)} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Most ordered products" action={<Link href="/admin?tab=products" className="text-[0.9375rem] font-semibold text-brand-700">All</Link>}>
          <Bars data={tally(data.orders.flatMap((o) => o.items), (i) => tidy(i.name), (i) => i.qty).slice(0, 6)} />
        </Panel>
        <Panel title="Orders by region">
          <Bars data={tally(data.orders, (o) => o.region || 'Not given').slice(0, 6)} />
        </Panel>
        <Panel title="Recent activity">
          {activity.length ? (
            <ol className="space-y-3">
              {activity.map((a, i) => (
                <li key={i} className="flex gap-3 text-[0.9375rem]">
                  <Icon name={a.icon} className="mt-1 text-brand-600" />
                  <span>
                    <span className="text-ink-2">{a.text}</span>
                    <span className="block text-[0.8125rem] text-ink-3">{timeFmt.format(new Date(a.at))}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-ink-3">Nothing yet.</p>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Panel title="Order status">
          <Bars data={(Object.keys(orderStatusLabel) as OrderStatus[]).map((s) => ({ label: orderStatusLabel[s], value: data.orders.filter((o) => o.status === s).length }))} />
        </Panel>
        <Panel title="Payment methods">
          <Bars data={tally(data.orders, (o) => methodLabel[o.method] ?? o.method)} />
        </Panel>
        <Panel title="Service requests by status">
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
              className={cn('h-10 border px-3 py-2 text-[0.9375rem] font-medium', status === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-paper hover:border-brand-600')}
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
            <td className="px-4 py-3 font-mono text-[0.875rem] font-semibold">{o.reference}</td>
            <td className="whitespace-nowrap px-4 py-3">{fmt(o.placedAt)}</td>
            <td className="px-4 py-3">
              {orgOf(o.account) || '—'}
              <span className="block text-[0.8125rem] text-ink-3">{o.account}</span>
            </td>
            <td className="px-4 py-3">
              {o.items.map((i) => (
                <span key={i.slug} className="block">
                  {i.qty} × {tidy(i.name)}
                </span>
              ))}
            </td>
            <td className="whitespace-nowrap px-4 py-3">{methodLabel[o.method] ?? o.method}</td>
            <td className="px-4 py-3">{o.region || '—'}</td>
            <td className="px-4 py-3">
              {data.source === 'live' ? (
                <form action={setOrderStatus} className="flex items-center gap-2">
                  <input type="hidden" name="reference" value={o.reference} />
                  <select name="status" defaultValue={o.status} aria-label={`Status of ${o.reference}`} className="h-9 border border-line bg-paper px-2 text-[0.9375rem]">
                    {(Object.keys(orderStatusLabel) as OrderStatus[]).map((s) => <option key={s} value={s}>{orderStatusLabel[s]}</option>)}
                  </select>
                  <button className="h-9 border border-brand-600 px-3 text-[0.875rem] font-semibold text-brand-700 hover:bg-brand-50">Save</button>
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

function Accounts({ data, q }: { data: AdminData; q?: string }) {
  const needle = q?.trim().toLowerCase();
  const list = data.accounts.filter((a) => !needle || [a.name, a.email, a.organisation, a.phone].join(' ').toLowerCase().includes(needle));
  const ordersOf = (email: string) => data.orders.filter((o) => o.account === email);
  return (
    <>
      <Heading title="Accounts" lead={`${data.accounts.length} registered accounts: hospitals, engineers and admins. Passwords are never shown or stored in readable form.`} action={<Csv table="accounts" />} />
      <div className="mb-4 flex justify-end">
        <SearchBox tab="accounts" q={q} placeholder="Name, hospital, email, phone…" />
      </div>
      <Table head={['Hospital / organisation', 'Contact', 'Phone', 'Role', 'Registered', 'Orders', 'Last order']} empty={!list.length}>
        {list.map((a) => {
          const orders = ordersOf(a.email);
          return (
            <tr key={a.id}>
              <td className="px-4 py-3 font-medium">{a.organisation}</td>
              <td className="px-4 py-3">
                {a.name}
                <span className="block text-[0.8125rem] text-ink-3">{a.email}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-3">{a.phone || '—'}</td>
              <td className="px-4 py-3"><Badge tone={a.role === 'client' ? 'neutral' : 'good'}>{a.role === 'client' ? 'Hospital' : a.role === 'engineer' ? 'Engineer' : 'Admin'}</Badge></td>
              <td className="whitespace-nowrap px-4 py-3">{fmt(a.createdAt)}</td>
              <td className="px-4 py-3 tabular-nums">{orders.length}</td>
              <td className="whitespace-nowrap px-4 py-3">{fmt(orders[0]?.placedAt)}</td>
            </tr>
          );
        })}
      </Table>
    </>
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
            <td className="px-4 py-3 font-medium">
              <Link href={`/products/${slug}`} className="hover:text-brand-700 hover:underline">{r.name}</Link>
            </td>
            <td className="px-4 py-3">{categoryName(categoryOf.get(slug) ?? '—')}</td>
            <td className="px-4 py-3 tabular-nums">{r.units}</td>
            <td className="px-4 py-3 tabular-nums">{r.orders}</td>
            <td className="px-4 py-3 tabular-nums">{r.hospitals.size}</td>
            <td className="whitespace-nowrap px-4 py-3">{fmt(r.last)}</td>
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
      <Table head={['Request', 'Opened', 'Equipment', 'Hospital', 'Priority', 'Status', 'Engineer', 'Rating']} empty={!data.desk.tickets.length}>
        {data.desk.tickets.map((t) => {
          const a = assetOf(t.assetId);
          return (
            <tr key={t.id}>
              <td className="px-4 py-3">
                <span className="font-mono text-[0.875rem] font-semibold">{t.id}</span>
                <span className="block text-[0.8125rem] text-ink-3">{t.title}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-3">{fmt(t.openedAt)}</td>
              <td className="px-4 py-3">{a ? tidy(a.name) : t.assetId}</td>
              <td className="px-4 py-3">{a?.facility ?? '—'}</td>
              <td className="px-4 py-3"><Badge tone={t.priority === 'critical' ? 'bad' : t.priority === 'high' ? 'warn' : 'neutral'}>{t.priority}</Badge></td>
              <td className="px-4 py-3"><Badge tone={t.status === 'resolved' ? 'good' : 'neutral'}>{ticketLabel[t.status]}</Badge></td>
              <td className="px-4 py-3">{t.engineer ?? <span className="text-signal-700">Unassigned</span>}</td>
              <td className="px-4 py-3">{t.rating ? `${t.rating}/5` : '—'}</td>
            </tr>
          );
        })}
      </Table>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Calibration due within 30 days ({due.length})</h2>
      <Table head={['Equipment', 'Serial', 'Hospital', 'Location', 'Last calibration', 'Due']} empty={!due.length}>
        {due.map((a) => (
          <tr key={a.id}>
            <td className="px-4 py-3 font-medium">{tidy(a.name)}</td>
            <td className="px-4 py-3 font-mono text-[0.875rem]">{a.serial}</td>
            <td className="px-4 py-3">{a.facility}</td>
            <td className="px-4 py-3">{a.location}</td>
            <td className="whitespace-nowrap px-4 py-3">{fmt(a.lastCalibration)}</td>
            <td className="whitespace-nowrap px-4 py-3">
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
            <ul className="divide-y divide-line">
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
          <ul className="divide-y divide-line">
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
