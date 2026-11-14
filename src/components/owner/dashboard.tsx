'use client';

import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Check, ChevronDown, Clock, Copy, Database, Eye, Gauge, Globe, LogOut, Mail, MessageSquare, Monitor, MousePointerClick, RefreshCw, Smartphone, Tablet, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { clearError, lock } from '@/lib/owner/actions';
import type { SiteError } from '@/lib/monitor';
import { sourceOf, vitalLimits, type DaySummary, type PageHit, type Visit, type VisitEvent, type Vital } from '@/lib/pulse/types';
import { cn } from '@/lib/utils';

/**
 * The owner's dashboard: who is on the site now and what they are doing, the period's figures against the period
 * before, where visitors come from and what they look at, page speed, the site's health and its errors.
 * The live part is read again every 8 seconds, the figures every 2 minutes, both only while this tab is in front.
 */
type Live = { at: number; live: Visit[]; recent: Visit[] };
type Health = { database: 'ok' | 'down' | 'not set up'; databaseMs: number; texts: boolean; email: boolean; version: string; deployedMessage: string; region: string };
type Totals = Pick<DaySummary, 'visits' | 'visitors' | 'views' | 'secs' | 'bounces' | 'enquiries'>;
type Stats = { at: number; days: number; health: Health; errors: SiteError[]; summary: DaySummary; previous: Totals; series: { day: string; visits: number; visitors: number; views: number; enquiries: number }[] };

const RANGES = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

/* ---------- words and numbers ---------- */
const n = (x: number) => x.toLocaleString('en-GB');
const duration = (secs: number) => {
  const s = Math.round(secs);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
  return `${Math.floor(s / 3600)}h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}m`;
};
const ago = (ms: number, now: number) => {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};
const clock = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Accra' });
const dayLabel = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

let regionNames: Intl.DisplayNames | null = null;
const country = (code?: string) => {
  if (!code || code === '??') return 'Unknown place';
  try {
    regionNames ??= new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};
const flag = (code?: string) => (code && /^[A-Za-z]{2}$/.test(code) ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0))) : '🌐');
const place = (v: Visit) => [v.city, country(v.country)].filter(Boolean).join(', ');

const pageNames: Record<string, string> = { '/': 'Home', '/products': 'Shop', '/services': 'Products & Services', '/events': 'Events & News', '/csr': 'CSR', '/support': 'Support', '/about': 'About', '/awards': 'Awards', '/checkout': 'Quote list', '/login': 'Hospital sign-in', '/portal': 'Hospital portal', '/admin': 'Admin console', '/engineer': 'Engineer portal' };
const pageName = (p: string, title?: string) => pageNames[p] ?? title ?? p;

const eventNames: Record<string, string> = {
  quote_submitted: 'Sent a quote request', demo_submitted: 'Asked for a demo', quote_list_add: 'Added to the quote list', quote_list_request: 'Sent their quote list', whatsapp_click: 'Opened WhatsApp',
  call_click: 'Tapped to call', email_click: 'Tapped to email', brochure_download: 'Downloaded the brochure', datasheet_request: 'Asked for a datasheet', checkout_pay: 'Went to pay', chat_open: 'Opened the chat',
  chat_request_start: 'Started a chat request', chat_request_sent: 'Sent a chat request', search: 'Searched the shop', download: 'Downloaded a file', outbound: 'Left to another site', js_error: 'Hit an error on the page',
};
const eventName = (name: string) => eventNames[name] ?? name.replace(/_/g, ' ');

const person = (v: Visit) => {
  if (!v.who) return `Visitor ${v.vid.slice(0, 4).toUpperCase()}`;
  if (v.who.role === 'client') return v.who.facility || v.who.name;
  return v.who.name;
};
const personTag = (v: Visit) => (!v.who ? (v.isNew ? 'New' : 'Returning') : v.who.role === 'client' ? 'Hospital' : v.who.role === 'engineer' ? 'Engineer' : 'Staff');
const DeviceIcon = ({ device, className }: { device: Visit['device']; className?: string }) => (device === 'Phone' ? <Smartphone className={className} /> : device === 'Tablet' ? <Tablet className={className} /> : <Monitor className={className} />);

/* ---------- small pieces ---------- */
function Card({ title, hint, action, children, className }: { title?: string; hint?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 rounded-3xl bg-paper p-6 shadow-[0_1px_2px_rgb(22_35_42/0.04),0_18px_40px_-24px_rgb(22_35_42/0.22)] ring-1 ring-line/60', className)}>
      {title && (
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">{title}</h2>
            {hint && <p className="mt-1 text-[0.8125rem] text-ink-3">{hint}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: ReactNode }) => <p className="py-6 text-center text-sm text-ink-3">{children}</p>;

/** The dashboard's accent colours: the company green first, then its neighbours. */
const TONES = {
  green: { chip: 'from-[#12a871] to-[#007a4d]', hex: '#007a4d' },
  teal: { chip: 'from-[#149aa3] to-[#075056]', hex: '#0d7f88' },
  blue: { chip: 'from-[#4a90d2] to-[#1f5585]', hex: '#2f6fae' },
  violet: { chip: 'from-[#8474e0] to-[#4f3f9a]', hex: '#6554c0' },
  amber: { chip: 'from-[#f3bd4a] to-[#d18a12]', hex: '#d9961c' },
  red: { chip: 'from-[#f0646c] to-[#dc2430]', hex: '#dc2430' },
} as const;
type Tone = keyof typeof TONES;

/** A figure with its change against the period before. `lowerIsBetter` turns the colours round (bounce rate). */
function Figure({ icon, label, value, now, before, lowerIsBetter, hint, tone }: { icon: ReactNode; label: string; value: string; now?: number; before?: number; lowerIsBetter?: boolean; hint?: string; tone: Tone }) {
  const change = now !== undefined && before ? Math.round(((now - before) / before) * 100) : null;
  const good = change === null || change === 0 ? null : change > 0 !== Boolean(lowerIsBetter);
  return (
    <div className="relative isolate overflow-hidden rounded-3xl bg-paper p-5 shadow-[0_1px_2px_rgb(22_35_42/0.04),0_18px_40px_-24px_rgb(22_35_42/0.22)] ring-1 ring-line/60">
      <span aria-hidden className="absolute -right-10 -top-10 -z-10 size-32 rounded-full opacity-[0.09] blur-xl" style={{ background: TONES[tone].hex }} />
      <span className={cn('grid size-10 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-[0_8px_16px_-8px_rgb(22_35_42/0.45)]', TONES[tone].chip)}>{icon}</span>
      <p className="mt-4 text-[0.8125rem] font-semibold text-ink-3">{label}</p>
      <p className="mt-1 text-[2rem] font-bold leading-none tracking-[-0.03em] tabular-nums text-ink">{value}</p>
      <p className="mt-3 flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
        {change === null ? (
          hint ?? 'No earlier figure yet'
        ) : (
          <>
            <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold', good === null ? 'bg-mist text-ink-3' : good ? 'bg-brand-50 text-ok' : 'bg-signal/10 text-bad')}>
              {change > 0 ? <ArrowUpRight className="size-3.5" /> : change < 0 ? <ArrowDownRight className="size-3.5" /> : null}
              {Math.abs(change)}%
            </span>
            vs before
          </>
        )}
      </p>
    </div>
  );
}

/** A ranked list with a bar behind each line. */
function Bars({ rows, empty, limit = 8, tone = 'green' }: { rows: { label: string; sub?: string; value: number; right?: string }[]; empty: string; limit?: number; tone?: Tone }) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, limit);
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <>
      <ul className="space-y-1.5">
        {shown.map((r) => (
          <li key={r.label + (r.sub ?? '')} className="relative isolate flex items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-2">
            <span aria-hidden className="absolute inset-y-0 left-0 -z-10 rounded-lg" style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: `linear-gradient(90deg, ${TONES[tone].hex}30, ${TONES[tone].hex}0f)` }} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{r.label}</span>
              {r.sub && <span className="block truncate text-xs text-ink-3">{r.sub}</span>}
            </span>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-2">{r.right ?? n(r.value)}</span>
          </li>
        ))}
      </ul>
      {rows.length > limit && (
        <button type="button" onClick={() => setAll((a) => !a)} className="mt-3 text-[0.8125rem] font-semibold text-brand-700 hover:text-brand-800">
          {all ? 'Show fewer' : `Show all ${rows.length}`}
        </button>
      )}
    </>
  );
}

const ranked = (m: Record<string, number> | undefined) => Object.entries(m ?? {}).sort((a, b) => b[1] - a[1]);

/** Visits and pages opened over the period, as two soft curves: per hour for today, per day otherwise. */
function Trend({ points }: { points: { label: string; visits: number; views: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(4, ...points.map((p) => p.views), ...points.map((p) => p.visits));
  const top = Math.ceil(max / 4) * 4;
  const W = 1000;
  const H = 260;
  const pad = { l: 36, r: 12, t: 14, b: 28 };
  const step = (W - pad.l - pad.r) / Math.max(1, points.length - 1);
  const x = (i: number) => pad.l + i * step;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / top);
  const curve = (key: 'visits' | 'views') => points.map((pt, i) => (i === 0 ? `M ${x(0)} ${y(pt[key])}` : `C ${x(i) - step / 2} ${y(points[i - 1][key])}, ${x(i) - step / 2} ${y(pt[key])}, ${x(i)} ${y(pt[key])}`)).join(' ');
  const area = (key: 'visits' | 'views') => `${curve(key)} L ${x(points.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const every = Math.max(1, Math.ceil(points.length / 12));
  const p = hover === null ? null : points[hover];
  return (
    <div>
      <div className="mb-3 flex items-center gap-5 text-[0.8125rem] text-ink-3">
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#12a871]" /> Pages opened</span>
        <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#075056]" /> Visits</span>
        <span className="ml-auto rounded-full bg-mist px-3 py-1 font-semibold text-ink-2">{p ? `${p.label} · ${n(p.visits)} visits · ${n(p.views)} pages` : 'Move over the chart for a day’s figures'}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-64 w-full" role="img" aria-label="Visits and pages opened over the period" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="trend-views" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#12a871" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#12a871" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trend-visits" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#075056" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#075056" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={pad.l} x2={W - pad.r} y1={y(top * f)} y2={y(top * f)} className="stroke-line" strokeWidth={1} strokeDasharray={f ? '3 5' : undefined} />
            <text x={pad.l - 8} y={y(top * f) + 4} textAnchor="end" className="fill-ink-3 text-[11px] tabular-nums">{Math.round(top * f)}</text>
          </g>
        ))}
        {points.length > 1 && (
          <>
            <path d={area('views')} fill="url(#trend-views)" />
            <path d={curve('views')} fill="none" stroke="#12a871" strokeWidth={2.5} strokeLinecap="round" />
            <path d={area('visits')} fill="url(#trend-visits)" />
            <path d={curve('visits')} fill="none" stroke="#075056" strokeWidth={2.5} strokeLinecap="round" />
          </>
        )}
        {points.map((pt, i) => (
          <g key={pt.label + i} onMouseEnter={() => setHover(i)}>
            <rect x={x(i) - step / 2} y={pad.t} width={step} height={H - pad.t - pad.b} fill="transparent" />
            {hover === i && (
              <>
                <line x1={x(i)} x2={x(i)} y1={pad.t} y2={y(0)} className="stroke-ink-3/40" strokeWidth={1} />
                <circle cx={x(i)} cy={y(pt.views)} r={5} fill="#12a871" stroke="#fff" strokeWidth={2} />
                <circle cx={x(i)} cy={y(pt.visits)} r={5} fill="#075056" stroke="#fff" strokeWidth={2} />
              </>
            )}
            {i % every === 0 && <text x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} className="fill-ink-3 text-[11px]">{pt.label}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** A visit's pages and actions in the order they happened. */
function Journey({ v }: { v: Visit }) {
  const start = Date.parse(v.startedAt);
  const steps: { at: number; page?: PageHit; event?: VisitEvent }[] = [...v.pages.map((p) => ({ at: p.at, page: p })), ...v.events.map((e) => ({ at: e.at, event: e }))].sort((a, b) => a.at - b.at);
  return (
    <div className="mt-1 rounded-2xl bg-[linear-gradient(180deg,#f4f8f9,#eef5f3)] p-5 ring-1 ring-line/60">
      <dl className="mb-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[0.8125rem] sm:grid-cols-4">
        {[
          ['Came from', sourceOf(v)],
          ['Device', `${v.device} · ${v.browser} · ${v.os}`],
          ['Started', `${clock(start)} · ${dayLabel(v.day)}`],
          ['Time on site', duration(v.secs)],
        ].map(([k, val]) => (
          <div key={k}>
            <dt className="text-ink-3">{k}</dt>
            <dd className="font-medium text-ink">{val}</dd>
          </div>
        ))}
      </dl>
      <ol className="space-y-2 border-l-2 border-line pl-4">
        {steps.map((s, i) => (
          <li key={i} className="relative break-words text-sm">
            <span aria-hidden className={cn('absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full ring-2 ring-canvas', s.event ? 'bg-signal' : 'bg-brand-600')} />
            <span className="mr-2 text-xs tabular-nums text-ink-3">{clock(start + s.at * 1000)}</span>
            {s.page ? (
              <>
                <span className="font-medium text-ink">{pageName(s.page.p, s.page.t)}</span>
                <span className="text-ink-3"> · {s.page.p}{s.page.nf ? ' · page not found' : ''}{s.page.s ? ` · ${duration(s.page.s)}` : ''}{s.page.d ? ` · scrolled ${s.page.d}%` : ''}</span>
              </>
            ) : (
              <>
                <span className="font-semibold text-signal-700">{eventName(s.event!.n)}</span>
                {s.event!.v && <span className="text-ink-3"> · {s.event!.v}</span>}
              </>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function VisitRow({ v, now, live }: { v: Visit; now: number; live?: boolean }) {
  const [open, setOpen] = useState(false);
  const page = v.pages[v.pages.length - 1];
  const tag = personTag(v);
  return (
    <li className="border-b border-line last:border-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 py-3 text-left">
        <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#e8f5ee,#e4eef0)] text-lg ring-1 ring-line" title={country(v.country)}>
          {flag(v.country)}
          {live && <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-brand-500 ring-2 ring-paper" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink">{person(v)}</span>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold', tag === 'New' ? 'bg-brand-50 text-brand-700' : tag === 'Returning' ? 'bg-mist text-ink-2' : 'bg-midnight text-white')}>{tag}</span>
          </span>
          <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-3">
            {live ? 'On' : 'Last on'} <span className="font-medium text-ink-2">{page ? pageName(page.p, page.t) : 'the site'}</span> · {place(v)}
          </span>
        </span>
        <span className="hidden shrink-0 text-right text-[0.8125rem] text-ink-3 sm:block">
          <span className="flex items-center justify-end gap-1.5 font-medium text-ink-2"><DeviceIcon device={v.device} className="size-3.5" /> {v.pages.length} {v.pages.length === 1 ? 'page' : 'pages'} · {duration(v.secs)}</span>
          <span>{live ? sourceOf(v) : ago(Date.parse(v.lastAt), now)}</span>
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-ink-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-4"><Journey v={v} /></div>}
    </li>
  );
}

const vitalNames: Record<Vital, { name: string; what: string }> = {
  LCP: { name: 'Main content appears', what: 'How long until the biggest part of the page shows' },
  INP: { name: 'Answers a tap', what: 'How quickly the page reacts to a tap or click' },
  CLS: { name: 'Stays still', what: 'How much the page jumps about while it loads' },
  TTFB: { name: 'Server answers', what: 'How long the server takes to start sending the page' },
  FCP: { name: 'First thing appears', what: 'How long until anything shows' },
};
const vitalValue = (k: Vital, v: number) => (k === 'CLS' ? v.toFixed(2) : v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${Math.round(v)}ms`);

/* ---------- the dashboard ---------- */
export function Dashboard() {
  const [days, setDays] = useState(1);
  const [live, setLive] = useState<Live | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState('');
  const daysRef = useRef(days);
  daysRef.current = days;

  const read = useCallback(async <T,>(query: string): Promise<T | null> => {
    const res = await fetch(`/api/owner/data?${query}`, { cache: 'no-store', credentials: 'same-origin' });
    if (res.status === 401) {
      location.reload();
      return null;
    }
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as T;
  }, []);

  const loadLive = useCallback(async () => {
    try {
      const d = await read<Live>('view=live');
      if (d) setLive(d);
      setProblem('');
    } catch {
      setProblem('The live feed could not be read just now. Trying again.');
    }
  }, [read]);

  const loadStats = useCallback(async () => {
    setBusy(true);
    try {
      const d = await read<Stats>(`view=stats&days=${daysRef.current}`);
      if (d && d.days === daysRef.current) setStats(d);
    } catch {
      setProblem('The figures could not be read just now. Trying again.');
    } finally {
      setBusy(false);
    }
  }, [read]);

  useEffect(() => {
    void loadLive();
    const fast = setInterval(() => document.visibilityState === 'visible' && void loadLive(), 8000);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const back = () => document.visibilityState === 'visible' && void loadLive();
    document.addEventListener('visibilitychange', back);
    return () => {
      clearInterval(fast);
      clearInterval(tick);
      document.removeEventListener('visibilitychange', back);
    };
  }, [loadLive]);

  useEffect(() => {
    void loadStats();
    const slow = setInterval(() => document.visibilityState === 'visible' && void loadStats(), 120_000);
    return () => clearInterval(slow);
  }, [days, loadStats]);

  const s = stats?.summary;
  const online = useMemo(() => live?.live ?? [], [live]);
  const publicOnline = online.filter((v) => !v.who || v.who.role === 'client');

  /** What just happened across everyone on the site, newest first. */
  const feed = useMemo(() => {
    const items: { at: number; v: Visit; text: string; detail?: string; action: boolean }[] = [];
    for (const v of [...(live?.live ?? []), ...(live?.recent ?? [])]) {
      const start = Date.parse(v.startedAt);
      for (const p of v.pages) items.push({ at: start + p.at * 1000, v, text: `opened ${pageName(p.p, p.t)}`, action: false });
      for (const e of v.events) items.push({ at: start + e.at * 1000, v, text: eventName(e.n).toLowerCase(), detail: e.v, action: true });
    }
    return items.sort((a, b) => b.at - a.at).slice(0, 30);
  }, [live]);

  const nowOn = useMemo(() => {
    const m = new Map<string, { label: string; value: number }>();
    for (const v of online) {
      const p = v.pages[v.pages.length - 1];
      if (!p) continue;
      const row = m.get(p.p) ?? { label: pageName(p.p, p.t), value: 0 };
      row.value++;
      m.set(p.p, row);
    }
    return [...m.entries()].map(([path, r]) => ({ label: r.label, sub: path, value: r.value })).sort((a, b) => b.value - a.value);
  }, [online]);

  const points = useMemo(() => {
    if (!stats || !s) return [];
    if (stats.days === 1) return s.hours.map((visits, h) => ({ label: `${String(h).padStart(2, '0')}:00`, visits, views: s.viewHours[h] ?? 0 }));
    return stats.series.map((d) => ({ label: dayLabel(d.day), visits: d.visits, views: d.views }));
  }, [stats, s]);

  const errors = stats?.errors ?? [];
  const errors24 = errors.filter((e) => now - Date.parse(e.lastAt) < 864e5).length;
  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      /* the clipboard is not available */
    }
  };
  const errorText = (e: SiteError) => `Flokefama site error\nWhere: ${e.area} · ${e.path}\nError: ${e.message}\nSeen: ${e.count} time(s), first ${e.firstAt}, last ${e.lastAt}\nSource: ${e.source}${e.digest ? `\nVercel digest: ${e.digest}` : ''}`;
  const dismiss = async (id: string) => {
    setStats((st) => (st ? { ...st, errors: st.errors.filter((e) => e.id !== id) } : st));
    await clearError(id).catch(() => {});
  };

  const rate = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
  const prev = stats?.previous;
  const rangeLabel = RANGES.find((r) => r.days === days)?.label ?? '';

  const hour = Number(new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Africa/Accra' }));
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const health = [
    { icon: <Globe className="size-4" />, label: 'Website', ok: Boolean(stats) && !problem, text: stats ? 'Up' : '…', sub: stats ? `Version ${stats.health.version}` : 'Checking' },
    { icon: <Database className="size-4" />, label: 'Database', ok: stats?.health.database === 'ok', text: !stats ? '…' : stats.health.database === 'ok' ? 'Answering' : stats.health.database === 'down' ? 'Not answering' : 'Not set up', sub: stats ? `${stats.health.databaseMs} ms` : 'Checking' },
    { icon: <Mail className="size-4" />, label: 'Email', ok: Boolean(stats?.health.email), text: !stats ? '…' : stats.health.email ? 'On' : 'Off', sub: 'Requests, alerts' },
    { icon: <MessageSquare className="size-4" />, label: 'Texts', ok: Boolean(stats?.health.texts), text: !stats ? '…' : stats.health.texts ? 'On' : 'Off', sub: 'SMS' },
    { icon: <AlertTriangle className="size-4" />, label: 'Errors', ok: errors24 === 0, text: !stats ? '…' : errors24 ? `${errors24} today` : 'None today', sub: `${errors.length} in 14 days` },
  ];

  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#eef5f3_0%,#f4f8f9_40%)] text-ink">
      {/* The top of the page: a deep green band with the bar, the live count and the site's health */}
      <div className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#04402a_0%,#075056_50%,#16232a_100%)] pb-32 text-white">
        <div aria-hidden className="absolute -left-40 -top-48 -z-10 size-[38rem] rounded-full bg-[radial-gradient(circle,rgb(127_209_165/0.30),transparent_65%)]" />
        <div aria-hidden className="absolute -bottom-40 right-[18%] -z-10 size-[30rem] rounded-full bg-[radial-gradient(circle,rgb(18_168_113/0.26),transparent_65%)]" />
        <div aria-hidden className="absolute -right-32 -top-32 -z-10 size-[26rem] rounded-full border border-white/10" />
        <div aria-hidden className="absolute -right-52 -top-52 -z-10 size-[40rem] rounded-full border border-white/[0.06]" />

        <header className="mx-auto flex max-w-[1500px] items-center gap-6 px-8 py-5">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-9" />
            <LogoWordmark className="h-4 text-white" />
            <span className="ml-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 ring-1 ring-white/15">Site monitor</span>
          </div>
          <p className="flex items-center gap-2 text-[0.8125rem] text-white/75">
            <span className="relative flex size-2.5">
              <span className={cn('absolute inline-flex size-full rounded-full opacity-70', problem ? 'bg-signal' : 'animate-ping bg-brand-300')} />
              <span className={cn('relative inline-flex size-2.5 rounded-full', problem ? 'bg-signal' : 'bg-brand-300')} />
            </span>
            {problem || (live ? `Live · updated ${ago(live.at, now)}` : 'Connecting…')}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-full bg-white/10 p-1 ring-1 ring-white/10" role="tablist" aria-label="Period">
              {RANGES.map((r) => (
                <button key={r.days} type="button" role="tab" aria-selected={days === r.days} onClick={() => setDays(r.days)} className={cn('whitespace-nowrap rounded-full px-4 py-1.5 text-[0.8125rem] font-semibold transition', days === r.days ? 'bg-white text-midnight shadow' : 'text-white/75 hover:text-white')}>
                  {r.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => void Promise.all([loadLive(), loadStats()])} title="Read again now" className="grid size-9 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white">
              <RefreshCw className={cn('size-4', busy && 'animate-spin')} />
            </button>
            <form action={lock}>
              <button type="submit" title="Lock the dashboard" className="grid size-9 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white">
                <LogOut className="size-4" />
              </button>
            </form>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1500px] items-end justify-between gap-10 px-8 pt-10">
          <div>
            <p className="text-sm font-semibold text-brand-300">{greeting}. This is flokefama.com right now.</p>
            <div className="mt-5 flex items-end gap-6">
              <p className="bg-[linear-gradient(180deg,#ffffff_30%,#9fe0bf)] bg-clip-text text-[7rem] font-extrabold leading-[0.8] tracking-[-0.05em] tabular-nums text-transparent">{live ? publicOnline.length : '–'}</p>
              <div className="pb-1">
                <p className="text-2xl font-bold tracking-[-0.02em]">{publicOnline.length === 1 ? 'person' : 'people'} on the site</p>
                <p className="mt-1.5 text-sm text-white/70">
                  {online.filter((v) => v.who?.role === 'client').length} hospitals signed in · {online.length - publicOnline.length} staff · {online.filter((v) => v.device === 'Phone').length} on phones
                </p>
              </div>
            </div>
          </div>
          <ul className="grid shrink-0 grid-cols-5 gap-3">
            {health.map((h) => (
              <li key={h.label} className="w-[8.75rem] rounded-2xl bg-white/[0.08] p-4 ring-1 ring-white/15 backdrop-blur-md">
                <span className="flex items-center justify-between text-white/70">
                  {h.icon}
                  <span className={cn('size-2.5 rounded-full', !stats ? 'bg-white/40' : h.ok ? 'bg-[#5fe0a3] shadow-[0_0_0_4px_rgb(95_224_163/0.2)]' : 'bg-[#ff6b75] shadow-[0_0_0_4px_rgb(255_107_117/0.25)]')} />
                </span>
                <span className="mt-3 block text-xs font-semibold text-white/65">{h.label}</span>
                <span className="block truncate text-[0.9375rem] font-bold">{h.text}</span>
                <span className="block truncate text-xs text-white/55">{h.sub}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <main id="main" className="relative mx-auto -mt-20 max-w-[1500px] space-y-6 px-8 pb-10">
        {/* Live */}
        <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6">
          <Card title="On the site now" hint="Open a visitor to see every page and action, in order">
            {!live ? <Empty>Connecting to the site…</Empty> : online.length ? <ul>{online.map((v) => <VisitRow key={v.id} v={v} now={now} live />)}</ul> : <Empty>Nobody is on the site at this moment. This list fills by itself when someone arrives.</Empty>}
          </Card>

          <div className="min-w-0 space-y-6">
            <Card title="Happening now" hint="What visitors just did, newest first">
              {feed.length ? (
                <ol className="max-h-[22rem] space-y-3.5 overflow-y-auto pr-1">
                  {feed.map((f, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', f.action ? 'bg-signal shadow-[0_0_0_4px_rgb(220_36_48/0.12)]' : 'bg-brand-500 shadow-[0_0_0_4px_rgb(0_138_87/0.12)]')} />
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold text-ink">{person(f.v)}</span> <span className={f.action ? 'font-medium text-signal-700' : 'text-ink-2'}>{f.text}</span>
                        {f.detail && <span className="text-ink-3"> · {f.detail}</span>}
                        <span className="block text-xs text-ink-3">{flag(f.v.country)} {place(f.v)} · {ago(f.at, now)}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <Empty>Nothing yet. Pages opened and actions taken appear here as they happen.</Empty>
              )}
            </Card>
            <Card title="Pages open right now">
              <Bars rows={nowOn} empty="No page is open at this moment." limit={6} tone="teal" />
            </Card>
          </div>
        </div>

        {/* Figures */}
        <div className="flex items-baseline justify-between pt-4">
          <h2 className="text-xl font-bold tracking-[-0.02em]">{rangeLabel === 'Today' ? 'Today' : `The last ${rangeLabel}`}</h2>
          <p className="text-[0.8125rem] text-ink-3">Staff visits are left out · Ghana time</p>
        </div>
        <div className="grid grid-cols-3 gap-4 xl:grid-cols-6">
          <Figure icon={<Activity className="size-4" />} tone="green" label="Visits" value={s ? n(s.visits) : '–'} now={s?.visits} before={prev?.visits} />
          <Figure icon={<Users className="size-4" />} tone="teal" label="Visitors" value={s ? n(s.visitors) : '–'} now={s?.visitors} before={prev?.visitors} hint={s ? `${n(s.newVisitors)} new` : undefined} />
          <Figure icon={<Eye className="size-4" />} tone="blue" label="Pages opened" value={s ? n(s.views) : '–'} now={s?.views} before={prev?.views} />
          <Figure icon={<Clock className="size-4" />} tone="violet" label="Time per visit" value={s ? duration(s.visits ? s.secs / s.visits : 0) : '–'} now={s && s.visits ? s.secs / s.visits : undefined} before={prev?.visits ? prev.secs / prev.visits : undefined} />
          <Figure icon={<ArrowDownRight className="size-4" />} tone="amber" label="Left after one page" value={s ? `${rate(s.bounces, s.visits)}%` : '–'} now={s ? rate(s.bounces, s.visits) : undefined} before={prev ? rate(prev.bounces, prev.visits) : undefined} lowerIsBetter />
          <Figure icon={<MousePointerClick className="size-4" />} tone="red" label="Enquiries" value={s ? n(s.enquiries) : '–'} now={s?.enquiries} before={prev?.enquiries} hint="Quotes, demos, chat requests" />
        </div>

        <Card title={days === 1 ? 'Through the day' : 'Day by day'} hint={days === 1 ? 'Visits and pages opened in each hour today' : 'Visits and pages opened each day'}>
          {points.length ? <Trend points={points} /> : <Empty>Reading the figures…</Empty>}
        </Card>

        <div className="grid grid-cols-2 gap-6 xl:grid-cols-3">
          <Card title="Most opened pages" hint="With the time spent on each">
            <Bars empty="No pages opened in this period yet." rows={Object.entries(s?.pages ?? {}).sort((a, b) => b[1].v - a[1].v).map(([p, r]) => ({ label: pageName(p, r.t), sub: `${p} · ${duration(r.v ? r.s / r.v : 0)} each`, value: r.v }))} />
          </Card>
          <Card title="Products looked at" hint="Product pages opened in the shop">
            <Bars tone="teal" empty="No product pages opened in this period yet." rows={Object.entries(s?.products ?? {}).sort((a, b) => b[1].v - a[1].v).map(([slug, r]) => ({ label: r.t ?? slug, sub: `/products/${slug}`, value: r.v }))} />
          </Card>
          <Card title="What visitors did" hint="Actions taken on the site">
            <Bars tone="red" empty="No actions in this period yet." rows={ranked(s?.events).map(([k, v]) => ({ label: eventName(k), value: v }))} />
          </Card>
          <Card title="Where visitors came from">
            <Bars tone="blue" empty="No visits in this period yet." rows={ranked(s?.sources).map(([k, v]) => ({ label: k, value: v, right: `${n(v)} · ${rate(v, s?.visits ?? 0)}%` }))} />
          </Card>
          <Card title="Countries">
            <Bars tone="violet" empty="No visits in this period yet." rows={ranked(s?.countries).map(([k, v]) => ({ label: `${flag(k)}  ${country(k)}`, value: v, right: `${n(v)} · ${rate(v, s?.visits ?? 0)}%` }))} />
          </Card>
          <Card title="Towns and cities">
            <Bars tone="violet" empty="No visits in this period yet." rows={ranked(s?.cities).map(([k, v]) => ({ label: `${flag(k.split(', ').pop())}  ${k.split(', ')[0]}`, sub: country(k.split(', ').pop()), value: v }))} />
          </Card>
          <Card title="Searches in the shop" hint="What people typed into the shop's search">
            <Bars tone="amber" empty="No searches in this period yet." rows={ranked(s?.searches).map(([k, v]) => ({ label: k, value: v }))} />
          </Card>
          <Card title="Devices and browsers">
            <Bars tone="blue" empty="No visits in this period yet." limit={9} rows={[...ranked(s?.devices).map(([k, v]) => ({ label: k, sub: 'Device', value: v, right: `${rate(v, s?.visits ?? 0)}%` })), ...ranked(s?.browsers).map(([k, v]) => ({ label: k, sub: 'Browser', value: v, right: `${rate(v, s?.visits ?? 0)}%` })), ...ranked(s?.systems).map(([k, v]) => ({ label: k, sub: 'System', value: v, right: `${rate(v, s?.visits ?? 0)}%` }))]} />
          </Card>
          <Card title="First and last pages" hint="Where visits start, and where they end">
            <Bars tone="teal" empty="No visits in this period yet." rows={[...ranked(s?.entries).slice(0, 5).map(([k, v]) => ({ label: pageName(k), sub: `Starts here · ${k}`, value: v })), ...ranked(s?.exits).slice(0, 5).map(([k, v]) => ({ label: pageName(k), sub: `Ends here · ${k}`, value: v }))]} limit={10} />
          </Card>
        </div>

        {/* Speed */}
        <Card title="How fast the site feels" hint="Measured in visitors' own browsers, on the first page of each visit. Green is good by Google's limits.">
          {s && Object.keys(s.vitals).length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {(['LCP', 'INP', 'CLS', 'TTFB', 'FCP'] as Vital[]).map((k) => {
                const row = s.vitals[k];
                if (!row) return null;
                const avg = row.sum / row.n;
                const tone = avg <= vitalLimits[k].good ? 'good' : avg > vitalLimits[k].poor ? 'poor' : 'fair';
                return (
                  <div key={k} className="rounded-2xl bg-[linear-gradient(180deg,#f7faf9,#ffffff)] p-4 ring-1 ring-line/70" title={vitalNames[k].what}>
                    <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-3"><Gauge className="size-4 text-brand-600" /> {vitalNames[k].name}</p>
                    <p className={cn('mt-2 text-2xl font-bold tabular-nums tracking-[-0.02em]', tone === 'good' ? 'text-ok' : tone === 'poor' ? 'text-bad' : 'text-warn')}>{vitalValue(k, avg)}</p>
                    <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-mist">
                      <span className="bg-brand-500" style={{ width: `${rate(row.good, row.n)}%` }} />
                      <span className="bg-[#e0a52b]" style={{ width: `${rate(row.n - row.good - row.poor, row.n)}%` }} />
                      <span className="bg-signal" style={{ width: `${rate(row.poor, row.n)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-ink-3">{rate(row.good, row.n)}% good · {n(row.n)} visits · {k}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty>No speed readings in this period yet.</Empty>
          )}
        </Card>

        {/* Errors */}
        <Card title="Errors" hint="Everything that went wrong on the site and the portals in the last 14 days. Copy one and paste it to Claude to have it fixed.">
          {errors.length ? (
            <ul className="divide-y divide-line">
              {errors.map((e) => (
                <li key={e.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 py-3.5">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-signal/10 text-signal-700"><AlertTriangle className="size-4" /></span>
                  <div className="min-w-0 flex-1 basis-64">
                    <p className="break-words text-sm font-semibold text-ink">{e.message}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-3">{e.area} · {e.path} · {e.source === 'browser' ? 'on a visitor’s screen' : 'on the server'}</p>
                  </div>
                  <p className="shrink-0 text-right text-[0.8125rem] text-ink-3">
                    <span className="block font-semibold text-ink-2">{n(e.count)} {e.count === 1 ? 'time' : 'times'}</span>
                    last {ago(Date.parse(e.lastAt), now)}
                  </p>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => void copy(e.id, errorText(e))} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[0.8125rem] font-semibold text-ink-2 transition hover:border-ink/30">
                      {copied === e.id ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />} {copied === e.id ? 'Copied' : 'Copy'}
                    </button>
                    <button type="button" onClick={() => void dismiss(e.id)} className="rounded-lg bg-mist px-3 py-1.5 text-[0.8125rem] font-semibold text-ink-2 transition hover:bg-line">Clear</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>{stats ? 'No errors in the last 14 days.' : 'Reading…'}</Empty>
          )}
          {s && Object.keys(s.notFound).length > 0 && (
            <div className="mt-5 border-t border-line pt-5">
              <h3 className="mb-3 text-sm font-bold text-ink">Addresses that showed “Page not found”</h3>
              <Bars rows={ranked(s.notFound).map(([k, v]) => ({ label: k, value: v }))} empty="" limit={6} />
            </div>
          )}
        </Card>

        {/* Recent visits */}
        <Card title="Recent visits" hint="The latest visitors who have left. Open one to see every page and action, in order.">
          {live?.recent.length ? <ul>{live.recent.map((v) => <VisitRow key={v.id} v={v} now={now} />)}</ul> : <Empty>{live ? 'No finished visits yet.' : 'Reading…'}</Empty>}
        </Card>

        <p className="pb-4 text-center text-xs text-ink-3">Visitors are shown as a random code with their country and town: no names, emails or addresses of the public are kept. Visits are kept 30 days, the daily totals for good.</p>
      </main>
    </div>
  );
}
