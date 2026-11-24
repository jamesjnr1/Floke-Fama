'use client';

import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Check, ChevronDown, Clock, Copy, Database, Eye, FileText, Gauge, Globe, HeartPulse, Layers,
  LayoutDashboard, Lock, Mail, MapPin, MessageSquare, Monitor, MousePointerClick, Percent, Radio, RefreshCw, Search, Server, ShoppingCart, Smartphone, Tablet,
  UserPlus, Users, Volume2, VolumeX, Zap,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { clearError, lock } from '@/lib/owner/actions';
import type { SiteError } from '@/lib/monitor';
import { ENQUIRIES, isNoiseError, sourceOf, vitalLimits, type DaySummary, type PageHit, type Visit, type VisitEvent, type Vital } from '@/lib/pulse/types';
import { cn } from '@/lib/utils';

/**
 * The site monitor, in sections chosen from the menu on the left:
 *   Live              who is on the site now, what they are doing, today so far, and the log of recent visits
 *   Overview          the period's figures against the period before, the trend, the busiest hours and days
 *   Visitors          new and returning, where they come from, where they are, their devices
 *   Pages             every page with its views, time spent, where visits start and end, pages not found
 *   Shop & enquiries  from looking at products to sending a request; what people search for and do
 *   Speed             how fast the site feels in visitors' own browsers
 *   Health & errors   the site's services and everything that went wrong
 * The live part is read again every 20 seconds and the figures every 2 minutes, only while this tab is in front.
 */
type Live = { at: number; live: Visit[]; recent: Visit[] };
type Health = { database: 'ok' | 'down' | 'not set up'; databaseMs: number; texts: boolean; email: boolean; version: string; deployedMessage: string; region: string };
type Totals = Pick<DaySummary, 'visits' | 'visitors' | 'views' | 'secs' | 'bounces' | 'enquiries'>;
type Point = { day: string; visits: number; visitors: number; newVisitors?: number; views: number; enquiries: number; bounces?: number; secs?: number };
type Stats = { at: number; days: number; health: Health; errors: SiteError[]; summary: DaySummary; previous: Totals; series: Point[]; google?: { connected: boolean; days: number } };

const RANGES = [
  { days: 1, label: 'Today' },
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

const SECTIONS = [
  { id: 'live', label: 'Live', icon: Radio, lead: 'Who is on flokefama.com right now, today so far, and the latest visits' },
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, lead: 'The period’s figures against the period before' },
  { id: 'visitors', label: 'Visitors', icon: Users, lead: 'Who they are, where they come from and what they use' },
  { id: 'pages', label: 'Pages', icon: FileText, lead: 'What people read, how long they stay, where they start and leave' },
  { id: 'shop', label: 'Shop & enquiries', icon: ShoppingCart, lead: 'From looking at products to asking Flokefama for a quote' },
  { id: 'speed', label: 'Speed', icon: Gauge, lead: 'How fast the site feels, measured in visitors’ own browsers' },
  { id: 'health', label: 'Health & errors', icon: HeartPulse, lead: 'The site’s services, and everything that went wrong' },
] as const;
type Section = (typeof SECTIONS)[number]['id'];

/* ---------- words and numbers ---------- */
const n = (x: number) => Math.round(x).toLocaleString('en-GB');
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
const rate = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const ranked = (m: Record<string, number> | undefined) => Object.entries(m ?? {}).sort((a, b) => b[1] - a[1]);

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
const CONTACT = ['whatsapp_click', 'call_click', 'email_click', 'chat_open', 'brochure_download', 'download'];

const person = (v: Visit) => {
  if (!v.who) return `Visitor ${v.vid.slice(0, 4).toUpperCase()}`;
  if (v.who.role === 'client') return v.who.facility || v.who.name;
  return v.who.name;
};
const personTag = (v: Visit) => (!v.who ? (v.isNew ? 'New' : 'Returning') : v.who.role === 'client' ? 'Hospital' : v.who.role === 'engineer' ? 'Engineer' : 'Staff');
const isPublic = (v: Visit) => !v.who || v.who.role === 'client';
const DeviceIcon = ({ device, className }: { device: Visit['device']; className?: string }) => (device === 'Phone' ? <Smartphone className={className} /> : device === 'Tablet' ? <Tablet className={className} /> : <Monitor className={className} />);

/** The accent colours: the company green first, then its neighbours. */
const TONES = {
  green: { chip: 'from-[#12a871] to-[#007a4d]', hex: '#0b8a57', soft: 'bg-[#e6f4ec] text-[#06603c]' },
  teal: { chip: 'from-[#149aa3] to-[#075056]', hex: '#0d7f88', soft: 'bg-[#e3f2f3] text-[#075056]' },
  blue: { chip: 'from-[#4a90d2] to-[#1f5585]', hex: '#2f6fae', soft: 'bg-[#e8f0f9] text-[#1f5585]' },
  violet: { chip: 'from-[#8474e0] to-[#4f3f9a]', hex: '#6554c0', soft: 'bg-[#eeebfa] text-[#4f3f9a]' },
  amber: { chip: 'from-[#f3bd4a] to-[#d18a12]', hex: '#d9961c', soft: 'bg-[#fdf3e0] text-[#8a5c00]' },
  red: { chip: 'from-[#f0646c] to-[#dc2430]', hex: '#dc2430', soft: 'bg-[#fdecee] text-[#a3162a]' },
} as const;
type Tone = keyof typeof TONES;

/* ---------- small pieces ---------- */
function Card({ title, hint, action, children, className }: { title?: string; hint?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('min-w-0 rounded-3xl bg-paper p-6 shadow-[0_1px_2px_rgb(22_35_42/0.04),0_18px_40px_-24px_rgb(22_35_42/0.22)] ring-1 ring-line/60', className)}>
      {title && (
        <header className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[1.0625rem] font-bold tracking-[-0.01em] text-ink">{title}</h2>
            {hint && <p className="mt-1 text-[0.8125rem] leading-snug text-ink-3">{hint}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

const Empty = ({ children }: { children: ReactNode }) => <p className="py-8 text-center text-sm text-ink-3">{children}</p>;

/** A figure with its change against the period before. `lowerIsBetter` turns the colours round (bounce rate). */
function Figure({ icon, label, value, now, before, lowerIsBetter, hint, tone }: { icon: ReactNode; label: string; value: string; now?: number; before?: number; lowerIsBetter?: boolean; hint?: string; tone: Tone }) {
  const change = now !== undefined && before ? Math.round(((now - before) / before) * 100) : null;
  const good = change === null || change === 0 ? null : change > 0 !== Boolean(lowerIsBetter);
  return (
    <div className="relative min-w-0 rounded-3xl bg-paper p-5 shadow-[0_1px_2px_rgb(22_35_42/0.04),0_18px_40px_-24px_rgb(22_35_42/0.22)] ring-1 ring-line/60">
      <div className="flex items-center justify-between">
        <p className="text-[0.8125rem] font-semibold text-ink-3">{label}</p>
        <span className={cn('grid size-8 place-items-center rounded-xl bg-gradient-to-br text-white', TONES[tone].chip)}>{icon}</span>
      </div>
      <p className="mt-3 text-[1.875rem] font-bold leading-none tracking-[-0.03em] tabular-nums text-ink">{value}</p>
      <p className="mt-3 flex items-center gap-1.5 text-[0.8125rem] text-ink-3">
        {change === null ? (
          hint ?? 'No earlier figure yet'
        ) : (
          <>
            <span className={cn('inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold', good === null ? 'bg-mist text-ink-3' : good ? 'bg-[#e6f4ec] text-ok' : 'bg-[#fdecee] text-bad')}>
              {change > 0 ? <ArrowUpRight className="size-3.5" /> : change < 0 ? <ArrowDownRight className="size-3.5" /> : null}
              {Math.abs(change)}%
            </span>
            <span>{hint ?? 'vs the period before'}</span>
          </>
        )}
      </p>
    </div>
  );
}

/** A ranked list with a bar behind each line. */
function Bars({ rows, empty, limit = 8, tone = 'green' }: { rows: { label: ReactNode; key?: string; sub?: string; value: number; right?: string }[]; empty: string; limit?: number; tone?: Tone }) {
  const [all, setAll] = useState(false);
  const shown = all ? rows : rows.slice(0, limit);
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <>
      <ul className="space-y-1">
        {shown.map((r, i) => (
          <li key={r.key ?? `${String(r.label)}${r.sub ?? ''}${i}`} className="relative isolate flex items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-2">
            <span aria-hidden className="absolute inset-y-0 left-0 -z-10 rounded-lg" style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: `linear-gradient(90deg, ${TONES[tone].hex}2b, ${TONES[tone].hex}0d)` }} />
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

/** A bar split into coloured parts, with a legend: new against returning, phones against computers. */
function Split({ parts }: { parts: { label: string; value: number; hex: string; icon?: ReactNode }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (!total) return <Empty>Nothing in this period yet.</Empty>;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-mist">
        {parts.map((p) => <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.hex }} />)}
      </div>
      <ul className="mt-5 grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(parts.length, 3)}, minmax(0, 1fr))` }}>
        {parts.map((p) => (
          <li key={p.label} className="min-w-0">
            <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-3">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.hex }} /> {p.icon} <span className="truncate">{p.label}</span>
            </p>
            <p className="mt-1 text-2xl font-bold tabular-nums tracking-[-0.02em] text-ink">{rate(p.value, total)}%</p>
            <p className="text-xs tabular-nums text-ink-3">{n(p.value)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Two figures over the period as soft curves: per hour for today, per day otherwise. */
function Trend({ points, a, b }: { points: { label: string; a: number; b: number }[]; a: { name: string; hex: string }; b?: { name: string; hex: string } }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(4, ...points.map((p) => p.a), ...(b ? points.map((p) => p.b) : []));
  const top = Math.ceil(max / 4) * 4;
  const W = 1000;
  const H = 280;
  const pad = { l: 40, r: 12, t: 14, b: 28 };
  const step = (W - pad.l - pad.r) / Math.max(1, points.length - 1);
  const x = (i: number) => pad.l + i * step;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / top);
  const curve = (key: 'a' | 'b') => points.map((pt, i) => (i === 0 ? `M ${x(0)} ${y(pt[key])}` : `C ${x(i) - step / 2} ${y(points[i - 1][key])}, ${x(i) - step / 2} ${y(pt[key])}, ${x(i)} ${y(pt[key])}`)).join(' ');
  const area = (key: 'a' | 'b') => `${curve(key)} L ${x(points.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;
  const every = Math.max(1, Math.ceil(points.length / 12));
  const p = hover === null ? null : points[hover];
  const series = [{ key: 'a' as const, ...a }, ...(b ? [{ key: 'b' as const, ...b }] : [])];
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-5 text-[0.8125rem] text-ink-3">
        {series.map((s) => <span key={s.key} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: s.hex }} /> {s.name}</span>)}
        <span className="ml-auto rounded-full bg-mist px-3 py-1 font-semibold tabular-nums text-ink-2">{p ? `${p.label} · ${series.map((s) => `${n(p[s.key])} ${s.name.toLowerCase()}`).join(' · ')}` : 'Move over the chart for the figures'}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-72 w-full" role="img" aria-label={`${series.map((s) => s.name).join(' and ')} over the period`} onMouseLeave={() => setHover(null)}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`trend-${s.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={s.hex} stopOpacity="0.32" />
              <stop offset="100%" stopColor={s.hex} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={pad.l} x2={W - pad.r} y1={y(top * f)} y2={y(top * f)} className="stroke-line" strokeWidth={1} strokeDasharray={f ? '3 5' : undefined} />
            <text x={pad.l - 8} y={y(top * f) + 4} textAnchor="end" className="fill-ink-3 text-[11px] tabular-nums">{Math.round(top * f)}</text>
          </g>
        ))}
        {points.length > 1 &&
          series.map((s) => (
            <g key={s.key}>
              <path d={area(s.key)} fill={`url(#trend-${s.key})`} />
              <path d={curve(s.key)} fill="none" stroke={s.hex} strokeWidth={2.5} strokeLinecap="round" />
            </g>
          ))}
        {points.map((pt, i) => (
          <g key={pt.label + i} onMouseEnter={() => setHover(i)}>
            <rect x={x(i) - step / 2} y={pad.t} width={step} height={H - pad.t - pad.b} fill="transparent" />
            {hover === i && (
              <>
                <line x1={x(i)} x2={x(i)} y1={pad.t} y2={y(0)} className="stroke-ink-3/40" strokeWidth={1} />
                {series.map((s) => <circle key={s.key} cx={x(i)} cy={y(pt[s.key])} r={5} fill={s.hex} stroke="#fff" strokeWidth={2} />)}
              </>
            )}
            {i % every === 0 && <text x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'} className="fill-ink-3 text-[11px]">{pt.label}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** Columns for a set of buckets (hours of the day, days of the week), the busiest one marked. */
function Columns({ data, tone = 'green', unit }: { data: { label: string; value: number }[]; tone?: Tone; unit: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const best = data.findIndex((d) => d.value === max && max > 0);
  const every = data.length > 12 ? 3 : 1;
  return (
    <div>
      <div className="flex h-40 items-end gap-[3px]">
        {data.map((d, i) => (
          <div key={d.label} className="group relative flex h-full flex-1 items-end" title={`${d.label}: ${n(d.value)} ${unit}`}>
            <span className="w-full rounded-t-md transition group-hover:brightness-110" style={{ height: `${Math.max(2, (d.value / max) * 100)}%`, background: i === best ? TONES[tone].hex : `${TONES[tone].hex}55` }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-[3px] text-[11px] text-ink-3">
        {data.map((d, i) => <span key={d.label} className="flex-1 text-center">{i % every === 0 ? d.label : ''}</span>)}
      </div>
      {best >= 0 && <p className="mt-3 text-[0.8125rem] text-ink-3">Busiest: <span className="font-semibold text-ink">{data[best].label}</span> · {n(data[best].value)} {unit}</p>}
    </div>
  );
}

/** A visit's pages and actions in the order they happened. */
function Journey({ v }: { v: Visit }) {
  const start = Date.parse(v.startedAt);
  const steps: { at: number; page?: PageHit; event?: VisitEvent }[] = [...v.pages.map((p) => ({ at: p.at, page: p })), ...v.events.filter((e) => !(e.n === 'js_error' && isNoiseError(e.v))).map((e) => ({ at: e.at, event: e }))].sort((a, b) => a.at - b.at);
  return (
    <div className="mt-1 rounded-xl bg-[#f4f8f6] p-5 ring-1 ring-[#e3e9e6]">
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
            <span aria-hidden className={cn('absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full ring-2 ring-[#f4f8f6]', s.event ? 'bg-signal' : 'bg-brand-600')} />
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
  const enquired = v.events.some((e) => ENQUIRIES.includes(e.n));
  return (
    <li className="border-b border-[#edf1ef] last:border-0">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 py-3 text-left">
        <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-[#eef4f1] text-lg ring-1 ring-[#e3e9e6]" title={country(v.country)}>
          {flag(v.country)}
          {live && <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full bg-brand-500 ring-2 ring-white" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-ink">{person(v)}</span>
            <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold', tag === 'New' ? 'bg-[#e6f4ec] text-brand-700' : tag === 'Returning' ? 'bg-mist text-ink-2' : 'bg-midnight text-white')}>{tag}</span>
            {enquired && <span className="shrink-0 rounded-full bg-[#fdecee] px-2 py-0.5 text-[0.6875rem] font-semibold text-[#a3162a]">Enquired</span>}
          </span>
          <span className="mt-0.5 block truncate text-[0.8125rem] text-ink-3">
            {live ? 'On' : 'Last on'} <span className="font-medium text-ink-2">{page ? pageName(page.p, page.t) : 'the site'}</span> · {place(v)}
          </span>
        </span>
        <span className="hidden shrink-0 text-right text-[0.8125rem] text-ink-3 sm:block">
          <span className="flex items-center justify-end gap-1.5 font-medium tabular-nums text-ink-2"><DeviceIcon device={v.device} className="size-3.5" /> {v.pages.length} {v.pages.length === 1 ? 'page' : 'pages'} · {duration(v.secs)}</span>
          <span>{live ? sourceOf(v) : `${sourceOf(v)} · ${ago(Date.parse(v.lastAt), now)}`}</span>
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-ink-3 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-4"><Journey v={v} /></div>}
    </li>
  );
}

const vitalNames: Record<Vital, { name: string; what: string }> = {
  LCP: { name: 'Main content appears', what: 'How long until the biggest part of the page shows. Good: under 2.5 seconds.' },
  FCP: { name: 'First thing appears', what: 'How long until anything shows at all. Good: under 1.8 seconds.' },
  INP: { name: 'Answers a tap', what: 'How quickly the page reacts to a tap or a click. Good: under 0.2 seconds.' },
  CLS: { name: 'Stays still', what: 'How much the page jumps about while it loads. Good: under 0.1.' },
  TTFB: { name: 'Server answers', what: 'How long the server takes to start sending the page. Good: under 0.8 seconds.' },
};
const vitalValue = (k: Vital, v: number) => (k === 'CLS' ? v.toFixed(2) : v >= 1000 ? `${(v / 1000).toFixed(1)}s` : `${Math.round(v)}ms`);

/* ---------- the arrival chime ---------- */
/**
 * A soft two-note chime, made in the browser (no sound file). Browsers only allow sound after a click on the page, so
 * the sound starts working with the first click anywhere on the monitor (or on the sound button).
 */
let audio: AudioContext | null = null;
const audioCtx = () => {
  if (typeof window === 'undefined') return null;
  try {
    audio ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch {
    return null;
  }
  return audio;
};
function chime() {
  const ctx = audioCtx();
  if (!ctx || ctx.state !== 'running') return false;
  const t = ctx.currentTime;
  [659.25, 987.77].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = f;
    const start = t + i * 0.16;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.14, start + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
    o.connect(g).connect(ctx.destination);
    o.start(start);
    o.stop(start + 0.95);
  });
  return true;
}

/* ---------- the dashboard ---------- */
export function Dashboard({ name }: { name: string }) {
  const [section, setSection] = useState<Section>('live');
  const [days, setDays] = useState(7);
  const [live, setLive] = useState<Live | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [today, setToday] = useState<Stats | null>(null);
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState('');
  const [trendOf, setTrendOf] = useState<'visits' | 'visitors' | 'enquiries'>('visits');
  const [filter, setFilter] = useState('');
  const daysRef = useRef(days);
  daysRef.current = days;

  // The section is kept in the address (#pages), so a reload or a bookmark opens the same one
  useEffect(() => {
    const fromHash = () => {
      const h = location.hash.slice(1);
      if (h === 'log') {
        setSection('live');
        setTimeout(() => document.getElementById('visit-log')?.scrollIntoView(), 300);
      } else if (SECTIONS.some((s) => s.id === h)) setSection(h as Section);
    };
    fromHash();
    addEventListener('hashchange', fromHash);
    return () => removeEventListener('hashchange', fromHash);
  }, []);
  const open = (id: Section) => {
    setSection(id);
    history.replaceState(null, '', `#${id}`);
    scrollTo({ top: 0 });
  };

  // The chime when someone arrives on the site (on by default; the choice is kept in this browser)
  const [sound, setSound] = useState(true);
  const [soundReady, setSoundReady] = useState(false);
  const seen = useRef<Set<string> | null>(null);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  useEffect(() => {
    try {
      if (localStorage.getItem('ff-monitor-sound') === 'off') setSound(false);
    } catch {
      /* storage unavailable */
    }
    // The browser lets sound play only after a click: the first click anywhere switches it on
    const unlock = () => {
      const ctx = audioCtx();
      void ctx?.resume().then(() => setSoundReady(ctx.state === 'running'));
    };
    addEventListener('pointerdown', unlock);
    addEventListener('keydown', unlock);
    return () => {
      removeEventListener('pointerdown', unlock);
      removeEventListener('keydown', unlock);
    };
  }, []);
  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem('ff-monitor-sound', next ? 'on' : 'off');
    } catch {
      /* storage unavailable */
    }
    if (next) setTimeout(() => chime(), 50); // a sample, so it's clear what it sounds like
  };

  const read = useCallback(async <T,>(query: string): Promise<T | null> => {
    const res = await fetch(`/api/monitor/data?${query}`, { cache: 'no-store', credentials: 'same-origin' });
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
      if (d) {
        // A visitor not seen before (staff aside): the chime. The visitors already there when the page opens don't count
        const ids = [...d.live, ...d.recent].filter(isPublic).map((v) => v.id);
        if (seen.current) {
          const arrived = d.live.some((v) => isPublic(v) && !seen.current!.has(v.id));
          if (arrived && soundRef.current) chime();
          ids.forEach((id) => seen.current!.add(id));
        } else seen.current = new Set(ids);
        setLive(d);
      }
      setProblem('');
    } catch {
      setProblem('The live feed could not be read just now. Trying again.');
    }
  }, [read]);

  const loadStats = useCallback(async () => {
    setBusy(true);
    try {
      const [d, t] = await Promise.all([read<Stats>(`view=stats&days=${daysRef.current}`), read<Stats>('view=stats&days=1')]);
      if (d && d.days === daysRef.current) setStats(d);
      if (t) setToday(t);
    } catch {
      setProblem('The figures could not be read just now. Trying again.');
    } finally {
      setBusy(false);
    }
  }, [read]);

  useEffect(() => {
    void loadLive();
    const fast = setInterval(() => document.visibilityState === 'visible' && void loadLive(), 20_000);
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
  const prev = stats?.previous;
  const t = today?.summary;
  const online = useMemo(() => live?.live ?? [], [live]);
  const publicOnline = online.filter(isPublic);

  /** What just happened across everyone on the site, newest first. */
  const feed = useMemo(() => {
    const items: { at: number; v: Visit; text: string; detail?: string; action: boolean }[] = [];
    for (const v of [...(live?.live ?? []), ...(live?.recent ?? [])]) {
      const start = Date.parse(v.startedAt);
      for (const p of v.pages) items.push({ at: start + p.at * 1000, v, text: `opened ${pageName(p.p, p.t)}`, action: false });
      for (const e of v.events) if (!(e.n === 'js_error' && isNoiseError(e.v))) items.push({ at: start + e.at * 1000, v, text: eventName(e.n).toLowerCase(), detail: e.v, action: true });
    }
    return items.sort((a, b) => b.at - a.at).slice(0, 40);
  }, [live]);

  const countBy = (vs: Visit[], key: (v: Visit) => string) => {
    const m = new Map<string, number>();
    for (const v of vs) m.set(key(v), (m.get(key(v)) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const nowOn = useMemo(() => {
    const m = new Map<string, { label: string; value: number }>();
    for (const v of online) {
      const p = v.pages[v.pages.length - 1];
      if (!p) continue;
      const row = m.get(p.p) ?? { label: pageName(p.p, p.t), value: 0 };
      row.value++;
      m.set(p.p, row);
    }
    return [...m.entries()].map(([path, r]) => ({ label: r.label, key: path, sub: path, value: r.value })).sort((a, b) => b.value - a.value);
  }, [online]);

  const trend = useMemo(() => {
    if (!stats || !s) return [];
    if (stats.days === 1) return s.hours.map((visits, h) => ({ label: `${String(h).padStart(2, '0')}:00`, a: trendOf === 'enquiries' ? 0 : visits, b: s.viewHours[h] ?? 0 }));
    return stats.series.map((d) => ({ label: dayLabel(d.day), a: d[trendOf], b: trendOf === 'visits' ? d.views : trendOf === 'visitors' ? (d.newVisitors ?? 0) : 0 }));
  }, [stats, s, trendOf]);
  const trendSeries =
    trendOf === 'visits' ? { a: { name: 'Visits', hex: '#075056' }, b: { name: 'Pages opened', hex: '#12a871' } } : trendOf === 'visitors' ? { a: { name: 'Visitors', hex: '#2f6fae' }, b: stats?.days === 1 ? undefined : { name: 'New visitors', hex: '#8474e0' } } : { a: { name: 'Enquiries', hex: '#dc2430' }, b: undefined };

  const weekdays = useMemo(() => {
    const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const out = names.map((label) => ({ label, value: 0 }));
    for (const d of stats?.series ?? []) out[(new Date(`${d.day}T12:00:00Z`).getUTCDay() + 6) % 7].value += d.visits;
    return out;
  }, [stats]);

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

  const rangeLabel = RANGES.find((r) => r.days === days)?.label ?? '';
  const periodWords = days === 1 ? 'today' : `in the last ${rangeLabel}`;
  const hour = Number(new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Africa/Accra' }));
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const meta = SECTIONS.find((x) => x.id === section)!;
  const usesPeriod = section !== 'live';

  const health = [
    { icon: <Globe className="size-5" />, label: 'Website', ok: Boolean(stats) && !problem, short: stats ? 'Up' : '…', tiny: stats ? `Version ${stats.health.version}` : 'Checking', text: stats ? 'Up and answering' : 'Checking…', sub: stats ? `Version ${stats.health.version}${stats.health.region ? ` · server ${stats.health.region}` : ''}` : '' },
    { icon: <Database className="size-5" />, label: 'Database', ok: stats?.health.database === 'ok', short: !stats ? '…' : stats.health.database === 'ok' ? 'Answering' : stats.health.database === 'down' ? 'Not answering' : 'Not set up', tiny: stats ? `${stats.health.databaseMs} ms` : 'Checking', text: !stats ? 'Checking…' : stats.health.database === 'ok' ? 'Answering' : stats.health.database === 'down' ? 'Not answering' : 'Not set up', sub: stats ? `Answered in ${stats.health.databaseMs} ms` : '' },
    { icon: <Mail className="size-5" />, label: 'Email', ok: Boolean(stats?.health.email), short: !stats ? '…' : stats.health.email ? 'On' : 'Off', tiny: 'Requests, alerts', text: !stats ? 'Checking…' : stats.health.email ? 'On' : 'Off', sub: 'Quote requests, support requests and alerts' },
    { icon: <MessageSquare className="size-5" />, label: 'Texts', ok: Boolean(stats?.health.texts), short: !stats ? '…' : stats.health.texts ? 'On' : 'Off', tiny: 'SMS', text: !stats ? 'Checking…' : stats.health.texts ? 'On' : 'Off', sub: 'Quotes to the company line, engineers’ jobs' },
    { icon: <AlertTriangle className="size-5" />, label: 'Errors', ok: errors24 === 0, short: !stats ? '…' : errors24 ? `${errors24} today` : 'None today', tiny: `${errors.length} in 14 days`, text: !stats ? 'Checking…' : errors24 ? `${errors24} in the last 24 hours` : 'None in the last 24 hours', sub: `${errors.length} kind${errors.length === 1 ? '' : 's'} in the last 14 days` },
  ];

  /* ---------- the figures of a period (Overview) ---------- */
  const perVisit = (x?: Totals) => (x && x.visits ? x.secs / x.visits : undefined);
  const pagesPer = (x?: Totals) => (x && x.visits ? x.views / x.visits : undefined);
  const convert = (x?: Totals) => (x && x.visits ? (x.enquiries / x.visits) * 100 : undefined);

  const contactRows = ranked(s?.events).filter(([k]) => CONTACT.includes(k));
  const enquiryRows = ranked(s?.events).filter(([k]) => ENQUIRIES.includes(k));
  const productViews = Object.values(s?.products ?? {}).reduce((sum, r) => sum + r.v, 0);
  const funnel = [
    { label: 'Visits', value: s?.visits ?? 0, hex: '#075056' },
    { label: 'Product pages opened', value: productViews, hex: '#0d7f88' },
    { label: 'Added to the quote list', value: s?.events.quote_list_add ?? 0, hex: '#2f6fae' },
    { label: 'Sent an enquiry', value: s?.enquiries ?? 0, hex: '#dc2430' },
  ];

  const pageTable = useMemo(() => {
    const total = s?.views ?? 0;
    return Object.entries(s?.pages ?? {})
      .sort((a, b) => b[1].v - a[1].v)
      .map(([p, r]) => ({ p, name: pageName(p, r.t), views: r.v, share: rate(r.v, total), avg: r.v ? r.s / r.v : 0, starts: s?.entries[p] ?? 0, ends: s?.exits[p] ?? 0 }));
  }, [s]);
  const [allPages, setAllPages] = useState(false);

  const logVisits = useMemo(() => {
    const all = (live?.recent ?? []).map((v) => ({ v, live: false }));
    const q = filter.trim().toLowerCase();
    if (!q) return all;
    return all.filter(({ v }) => [person(v), place(v), sourceOf(v), v.device, v.browser, ...v.pages.map((p) => `${p.p} ${p.t ?? ''}`), ...v.events.map((e) => `${eventName(e.n)} ${e.v ?? ''}`)].join(' ').toLowerCase().includes(q));
  }, [live, filter]);

  return (
    <div className="min-h-svh bg-[#eef2f0] text-ink">
      {/* The top of the page: the deep green band, with the bar, the live count and the site's health */}
      <div className="relative isolate overflow-hidden bg-[radial-gradient(140%_120%_at_0%_0%,#0f8a55_0%,#06482a_55%,#032a19_100%)] pb-28 text-white">
        <div aria-hidden className="absolute -right-24 -top-24 -z-10 size-[26rem] rounded-full border border-white/10" />
        <div aria-hidden className="absolute -right-6 top-16 -z-10 size-64 rounded-full border border-white/10" />
        <header className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-5 lg:px-8">
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
            <div className={cn('flex rounded-full bg-white/10 p-1 ring-1 ring-white/10 transition', !usesPeriod && 'opacity-50')} role="tablist" aria-label="Period" title={usesPeriod ? undefined : 'The period applies to the other sections'}>
              {RANGES.map((r) => (
                <button key={r.days} type="button" role="tab" aria-selected={days === r.days} onClick={() => setDays(r.days)} className={cn('whitespace-nowrap rounded-full px-4 py-1.5 text-[0.8125rem] font-semibold transition', days === r.days ? 'bg-white text-midnight shadow' : 'text-white/75 hover:text-white')}>
                  {r.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={toggleSound} aria-pressed={sound} title={!sound ? 'Sound is off: turn on the chime for each new visitor' : soundReady ? 'A chime plays for each new visitor. Click to turn it off' : 'Sound is on: it starts after your first click on the page'} className={cn('grid size-9 place-items-center rounded-full ring-1 transition', sound ? 'bg-white text-[#06482a] ring-white' : 'bg-white/10 text-white/80 ring-white/10 hover:bg-white/20 hover:text-white')}>
              {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </button>
            <button type="button" onClick={() => void Promise.all([loadLive(), loadStats()])} title="Read again now" className="grid size-9 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white">
              <RefreshCw className={cn('size-4', busy && 'animate-spin')} />
            </button>
            <form action={lock}>
              <button type="submit" title="Lock the monitor" className="grid size-9 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-white">
                <Lock className="size-4" />
              </button>
            </form>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1500px] flex-col gap-8 px-6 pt-8 lg:px-8 xl:flex-row xl:items-end xl:justify-between xl:gap-10">
          <div>
            <p className="text-sm font-semibold text-brand-300">{greeting}, {name}. This is flokefama.com right now.</p>
            <div className="mt-5 flex items-end gap-6">
              <p className="text-[5.5rem] font-extrabold lg:text-[7rem] leading-[0.8] tracking-[-0.05em] tabular-nums text-white">{live ? publicOnline.length : '–'}</p>
              <div className="pb-1">
                <p className="text-2xl font-bold tracking-[-0.02em]">{publicOnline.length === 1 ? 'person' : 'people'} on the site</p>
                <p className="mt-1.5 text-sm text-white/70">
                  {publicOnline.filter((v) => !v.who && v.isNew).length} new · {publicOnline.filter((v) => !v.who && !v.isNew).length} returning · {online.filter((v) => v.who?.role === 'client').length} hospitals signed in · {online.length - publicOnline.length} staff · {online.filter((v) => v.device === 'Phone').length} on phones
                </p>
              </div>
            </div>
          </div>
          <ul className="grid shrink-0 grid-cols-5 gap-2 lg:gap-3">
            {health.map((h) => (
              <li key={h.label}>
                <button type="button" onClick={() => open('health')} className="block w-full rounded-2xl bg-white/[0.08] p-3 text-left lg:p-4 xl:w-[8.75rem] ring-1 ring-white/15 backdrop-blur-md transition hover:bg-white/[0.14]">
                  <span className="flex items-center justify-between text-white/70">
                    {h.icon}
                    <span className={cn('size-2.5 rounded-full', !stats ? 'bg-white/40' : h.ok ? 'bg-[#5fe0a3] shadow-[0_0_0_4px_rgb(95_224_163/0.2)]' : 'bg-[#ff6b75] shadow-[0_0_0_4px_rgb(255_107_117/0.25)]')} />
                  </span>
                  <span className="mt-3 block text-xs font-semibold text-white/65">{h.label}</span>
                  <span className="block truncate text-[0.9375rem] font-bold">{h.short}</span>
                  <span className="block truncate text-xs text-white/55">{h.tiny}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The sections, as tabs over the green band; they stay at the top while scrolling */}
      <nav aria-label="Monitor sections" className="sticky top-0 z-20 mx-auto -mt-20 max-w-[1500px] px-6 pt-3 lg:px-8">
        <div className="flex gap-1 overflow-x-auto rounded-2xl bg-white/95 p-1.5 [scrollbar-width:none] shadow-[0_18px_40px_-20px_rgb(4_56_34/0.45)] ring-1 ring-black/5 backdrop-blur">
          {SECTIONS.map((x) => {
            const on = section === x.id;
            const badge = x.id === 'health' ? errors24 : x.id === 'live' ? publicOnline.length : 0;
            return (
              <button key={x.id} type="button" onClick={() => open(x.id)} aria-current={on ? 'page' : undefined} className={cn('flex shrink-0 grow items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-[0.875rem] font-semibold transition', on ? 'bg-[linear-gradient(135deg,#0f8a55,#06482a)] text-white shadow-[0_8px_18px_-10px_rgb(4_56_34/0.8)]' : 'text-ink-2 hover:bg-[#eef4f1] hover:text-ink')}>
                <x.icon className={cn('size-4', on ? 'text-white' : 'text-brand-700')} /> {x.label}
                {badge > 0 && <span className={cn('rounded-full px-1.5 py-px text-[0.6875rem] font-bold tabular-nums', x.id === 'health' ? 'bg-signal text-white' : on ? 'bg-white text-[#06482a]' : 'bg-[#e6f4ec] text-brand-700')}>{badge}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      <main id="main" className="relative mx-auto max-w-[1500px] space-y-6 px-6 pb-10 pt-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em]">{meta.label}</h1>
            <p className="mt-1 text-sm text-ink-3">{meta.lead}{section === 'live' ? '' : usesPeriod ? `, ${periodWords}.` : '.'}</p>
          </div>
          {usesPeriod && (
            <p className="max-w-xl text-[0.8125rem] text-ink-3 xl:text-right">
              {stats?.google?.days ? `${stats.google.days} ${stats.google.days === 1 ? 'day is' : 'days are'} from Google Analytics (before the monitor started) · ` : stats && !stats.google?.connected && days > 1 ? 'Google Analytics is not connected, so days before the monitor started are empty · ' : ''}
              Staff visits are left out · Ghana time
            </p>
          )}
        </div>

          {/* ---------- Live ---------- */}
          {section === 'live' && (
            <>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Figure tone="green" icon={<Activity className="size-4" />} label="Visits today" value={t ? n(t.visits) : '–'} now={t?.visits} before={today?.previous.visits} hint="vs yesterday" />
                <Figure tone="teal" icon={<Users className="size-4" />} label="Visitors today" value={t ? n(t.visitors) : '–'} hint={t ? `${n(t.newVisitors)} new today` : undefined} />
                <Figure tone="blue" icon={<Eye className="size-4" />} label="Pages opened today" value={t ? n(t.views) : '–'} now={t?.views} before={today?.previous.views} hint="vs yesterday" />
                <Figure tone="red" icon={<MousePointerClick className="size-4" />} label="Enquiries today" value={t ? n(t.enquiries) : '–'} hint="Quotes, demos and chat requests" />
                </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <Card title="On the site now" hint="Open a visitor to see every page and action, in order">
                  {!live ? <Empty>Connecting to the site…</Empty> : online.length ? <ul>{online.map((v) => <VisitRow key={v.id} v={v} now={now} live />)}</ul> : <Empty>Nobody is on the site at this moment. This list fills by itself when someone arrives.</Empty>}
                </Card>
                <Card title="Happening now" hint="Pages opened and actions taken, newest first">
                  {feed.length ? (
                    <ol className="max-h-[30rem] space-y-3.5 overflow-y-auto pr-1">
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
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Card title="Pages open right now">
                  <Bars rows={nowOn} empty="No page is open at this moment." limit={6} tone="teal" />
                </Card>
                <Card title="Where they are">
                  <Bars tone="violet" limit={6} empty="Nobody on the site right now." rows={countBy(online, (v) => v.city ? `${v.city}|${v.country ?? ''}` : `|${v.country ?? ''}`).map(([k, v]) => ({ key: k, label: `${flag(k.split('|')[1])}  ${k.split('|')[0] || country(k.split('|')[1])}`, sub: k.split('|')[0] ? country(k.split('|')[1]) : undefined, value: v }))} />
                </Card>
                <Card title="How they found the site">
                  <Bars tone="blue" limit={6} empty="Nobody on the site right now." rows={countBy(online, (v) => sourceOf(v)).map(([k, v]) => ({ label: k, value: v }))} />
                </Card>
              </div>
              <div id="visit-log" className="scroll-mt-28">
              <Card
              title="Visit log"
              hint={`The latest ${logVisits.length} visit${logVisits.length === 1 ? '' : 's'} by people who have left. Open one to see every page and action, in order.`}
              action={
                <span className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
                  <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Town, page, product, source…" className="h-10 w-72 rounded-xl border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-brand-600" />
                </span>
              }
            >
              {!live ? <Empty>Reading…</Empty> : logVisits.length ? <ul>{logVisits.map(({ v, live: on }) => <VisitRow key={v.id} v={v} now={now} live={on} />)}</ul> : <Empty>{filter ? 'No visit matches that.' : 'No visits yet.'}</Empty>}
            </Card>
              </div>
            </>
          )}

          {/* ---------- Overview ---------- */}
          {section === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Figure icon={<Activity className="size-4" />} tone="green" label="Visits" value={s ? n(s.visits) : '–'} now={s?.visits} before={prev?.visits} />
                <Figure icon={<Users className="size-4" />} tone="teal" label="Visitors" value={s ? n(s.visitors) : '–'} now={s?.visitors} before={prev?.visitors} />
                <Figure icon={<UserPlus className="size-4" />} tone="violet" label="New visitors" value={s ? n(s.newVisitors) : '–'} hint={s ? `${rate(s.newVisitors, s.visits)}% of visits were someone new` : undefined} />
                <Figure icon={<Eye className="size-4" />} tone="blue" label="Pages opened" value={s ? n(s.views) : '–'} now={s?.views} before={prev?.views} />
                <Figure icon={<Layers className="size-4" />} tone="teal" label="Pages per visit" value={s ? (pagesPer(s) ?? 0).toFixed(1) : '–'} now={pagesPer(s)} before={pagesPer(prev)} />
                <Figure icon={<Clock className="size-4" />} tone="violet" label="Time per visit" value={s ? duration(perVisit(s) ?? 0) : '–'} now={perVisit(s)} before={perVisit(prev)} />
                <Figure icon={<ArrowDownRight className="size-4" />} tone="amber" label="Left after one page" value={s ? `${rate(s.bounces, s.visits)}%` : '–'} now={s ? rate(s.bounces, s.visits) : undefined} before={prev ? rate(prev.bounces, prev.visits) : undefined} lowerIsBetter />
                <Figure icon={<Percent className="size-4" />} tone="red" label="Enquiries" value={s ? n(s.enquiries) : '–'} now={s?.enquiries} before={prev?.enquiries} hint={s ? `${(convert(s) ?? 0).toFixed(1)}% of visits ended in an enquiry` : undefined} />
              </div>

              <Card
                title={days === 1 ? 'Through the day' : 'Day by day'}
                hint={days === 1 ? 'Each hour today' : 'Each day of the period'}
                action={
                  <div className="flex rounded-full bg-[#eef2f0] p-1">
                    {(['visits', 'visitors', 'enquiries'] as const).map((k) => (
                      <button key={k} type="button" onClick={() => setTrendOf(k)} className={cn('rounded-full px-3.5 py-1 text-[0.8125rem] font-semibold capitalize transition', trendOf === k ? 'bg-white text-ink shadow-[0_1px_3px_rgb(22_35_42/0.15)]' : 'text-ink-3 hover:text-ink')}>
                        {k}
                      </button>
                    ))}
                  </div>
                }
              >
                {trend.length ? <Trend points={trend} a={trendSeries.a} b={trendSeries.b} /> : <Empty>Reading the figures…</Empty>}
              </Card>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card title="Busiest hours" hint={`Visits started in each hour ${periodWords}, Ghana time`}>
                  {s ? <Columns data={s.hours.map((v, h) => ({ label: String(h).padStart(2, '0'), value: v }))} unit="visits" /> : <Empty>Reading…</Empty>}
                </Card>
                <Card title="Busiest days of the week" hint={days === 1 ? 'Choose 7 days or more to compare the days of the week' : `Visits on each day of the week ${periodWords}`}>
                  {days > 1 && s ? <Columns data={weekdays} tone="teal" unit="visits" /> : <Empty>Choose 7, 30 or 90 days above.</Empty>}
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {[
                  { icon: <FileText className="size-4" />, label: 'Most opened page', top: ranked(Object.fromEntries(Object.entries(s?.pages ?? {}).map(([k, r]) => [k, r.v])))[0], show: (k: string) => pageName(k, s?.pages[k]?.t) },
                  { icon: <Globe className="size-4" />, label: 'Top source', top: ranked(s?.sources)[0], show: (k: string) => k },
                  { icon: <ShoppingCart className="size-4" />, label: 'Most viewed product', top: ranked(Object.fromEntries(Object.entries(s?.products ?? {}).map(([k, r]) => [k, r.v])))[0], show: (k: string) => s?.products[k]?.t ?? k },
                  { icon: <MapPin className="size-4" />, label: 'Top town', top: ranked(s?.cities)[0], show: (k: string) => `${flag(k.split(', ').pop())} ${k.split(', ')[0]}` },
                  { icon: <Search className="size-4" />, label: 'Top search', top: ranked(s?.searches)[0], show: (k: string) => `“${k}”` },
                ].map((h) => (
                  <div key={h.label} className="min-w-0 rounded-3xl bg-paper p-5 shadow-[0_1px_2px_rgb(22_35_42/0.04),0_18px_40px_-24px_rgb(22_35_42/0.22)] ring-1 ring-line/60">
                    <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-3">{h.icon} {h.label}</p>
                    <p className="mt-2 truncate font-bold text-ink" title={h.top ? h.show(h.top[0]) : undefined}>{h.top ? h.show(h.top[0]) : '—'}</p>
                    <p className="text-[0.8125rem] tabular-nums text-ink-3">{h.top ? `${n(h.top[1])} ${periodWords}` : 'Nothing yet'}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ---------- Visitors ---------- */}
          {section === 'visitors' && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Card title="New and returning" hint="Visits by someone on the site for the first time, and by someone who has been before">
                  <Split parts={[{ label: 'New', value: s?.newVisitors ?? 0, hex: '#12a871' }, { label: 'Returning', value: Math.max(0, (s?.visits ?? 0) - (s?.newVisitors ?? 0)), hex: '#075056' }]} />
                </Card>
                <Card title="Devices" hint="What they used to open the site">
                  <Split parts={['Phone', 'Computer', 'Tablet'].map((d, i) => ({ label: d === 'Phone' ? 'Phones' : d === 'Computer' ? 'Computers' : 'Tablets', value: s?.devices[d] ?? 0, hex: ['#2f6fae', '#0d7f88', '#8474e0'][i] }))} />
                </Card>
                <Card title="Staff visits" hint="Admins, sales and engineers using the site">
                  <div className="flex h-full flex-col justify-center pb-6">
                    <p className="text-[2.5rem] font-bold leading-none tracking-[-0.03em] tabular-nums">{s ? n(s.staff) : '–'}</p>
                    <p className="mt-2 text-sm text-ink-3">visits by staff {periodWords}, left out of every other figure here. Hospitals signed in to their portal are counted with the public.</p>
                  </div>
                </Card>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Card title="Where visitors came from" hint="The website or app that sent them">
                  <Bars tone="blue" limit={10} empty="No visits in this period yet." rows={ranked(s?.sources).map(([k, v]) => ({ label: k, value: v, right: `${n(v)} · ${rate(v, s?.visits ?? 0)}%` }))} />
                </Card>
                <Card title="Countries">
                  <Bars tone="violet" limit={10} empty="No visits in this period yet." rows={ranked(s?.countries).map(([k, v]) => ({ key: k, label: `${flag(k)}  ${country(k)}`, value: v, right: `${n(v)} · ${rate(v, s?.visits ?? 0)}%` }))} />
                </Card>
                <Card title="Towns and cities">
                  <Bars tone="violet" limit={10} empty="No visits in this period yet." rows={ranked(s?.cities).map(([k, v]) => ({ key: k, label: `${flag(k.split(', ').pop())}  ${k.split(', ')[0]}`, sub: country(k.split(', ').pop()), value: v }))} />
                </Card>
                <Card title="Browsers">
                  <Bars tone="teal" empty="No visits in this period yet." rows={ranked(s?.browsers).map(([k, v]) => ({ label: k, value: v, right: `${rate(v, s?.visits ?? 0)}%` }))} />
                </Card>
                <Card title="Systems">
                  <Bars tone="teal" empty="No visits in this period yet." rows={ranked(s?.systems).map(([k, v]) => ({ label: k, value: v, right: `${rate(v, s?.visits ?? 0)}%` }))} />
                </Card>
                <Card title="Campaigns" hint="Visits from links tagged with a campaign name">
                  <Bars tone="amber" empty="No campaign links used in this period." rows={ranked(s?.sources).filter(([k]) => k.startsWith('Campaign: ')).map(([k, v]) => ({ label: k.replace('Campaign: ', ''), value: v }))} />
                </Card>
              </div>
            </>
          )}

          {/* ---------- Pages ---------- */}
          {section === 'pages' && (
            <>
              <Card title="Every page" hint="How often each page was opened, its share of all pages opened, the time spent on it, and how many visits started or ended there">
                {pageTable.length ? (
                  <>
                    <table className="w-full table-fixed text-left text-sm">
                      <thead className="text-[0.8125rem] text-ink-3">
                        <tr className="border-b border-[#e3e9e6]">
                          <th className="w-[34%] py-2.5 pr-4 font-semibold">Page</th>
                          <th className="py-2.5 pr-4 text-right font-semibold">Opened</th>
                          <th className="w-[18%] py-2.5 pr-4 font-semibold">Share</th>
                          <th className="py-2.5 pr-4 text-right font-semibold">Time on page</th>
                          <th className="py-2.5 pr-4 text-right font-semibold">Visits started</th>
                          <th className="py-2.5 text-right font-semibold">Visits ended</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf1ef]">
                        {(allPages ? pageTable : pageTable.slice(0, 15)).map((r) => (
                          <tr key={r.p} className="hover:bg-[#f7faf8]">
                            <td className="py-3 pr-4">
                              <span className="block truncate font-medium text-ink">{r.name}</span>
                              <span className="block truncate text-xs text-ink-3">{r.p}</span>
                            </td>
                            <td className="py-3 pr-4 text-right font-semibold tabular-nums">{n(r.views)}</td>
                            <td className="py-3 pr-4">
                              <span className="flex items-center gap-2">
                                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-mist"><span className="block h-full rounded-full bg-[#12a871]" style={{ width: `${Math.max(2, r.share)}%` }} /></span>
                                <span className="w-9 text-right text-xs tabular-nums text-ink-3">{r.share}%</span>
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right tabular-nums">{duration(r.avg)}</td>
                            <td className="py-3 pr-4 text-right tabular-nums">{n(r.starts)}</td>
                            <td className="py-3 text-right tabular-nums">{n(r.ends)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {pageTable.length > 15 && (
                      <button type="button" onClick={() => setAllPages((a) => !a)} className="mt-4 text-[0.8125rem] font-semibold text-brand-700 hover:text-brand-800">
                        {allPages ? 'Show fewer' : `Show all ${pageTable.length} pages`}
                      </button>
                    )}
                  </>
                ) : (
                  <Empty>No pages opened in this period yet.</Empty>
                )}
              </Card>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Card title="Where visits start" hint="The first page people land on">
                  <Bars tone="teal" empty="No visits in this period yet." rows={ranked(s?.entries).map(([k, v]) => ({ key: k, label: pageName(k, s?.pages[k]?.t), sub: k, value: v }))} />
                </Card>
                <Card title="Where visits end" hint="The last page before people leave">
                  <Bars tone="amber" empty="No visits in this period yet." rows={ranked(s?.exits).map(([k, v]) => ({ key: k, label: pageName(k, s?.pages[k]?.t), sub: k, value: v }))} />
                </Card>
                <Card title="“Page not found”" hint="Addresses people tried that don’t exist: old links or typing mistakes">
                  <Bars tone="red" empty="No missing pages in this period." rows={ranked(s?.notFound).map(([k, v]) => ({ label: k, value: v }))} />
                </Card>
              </div>
            </>
          )}

          {/* ---------- Shop & enquiries ---------- */}
          {section === 'shop' && (
            <>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <Figure icon={<MousePointerClick className="size-4" />} tone="red" label="Enquiries" value={s ? n(s.enquiries) : '–'} now={s?.enquiries} before={prev?.enquiries} />
                <Figure icon={<Percent className="size-4" />} tone="amber" label="Visits that enquired" value={s ? `${(convert(s) ?? 0).toFixed(1)}%` : '–'} now={convert(s)} before={convert(prev)} />
                <Figure icon={<Eye className="size-4" />} tone="teal" label="Product pages opened" value={s ? n(productViews) : '–'} hint={s ? `${Object.keys(s.products).length} different products` : undefined} />
                <Figure icon={<Search className="size-4" />} tone="blue" label="Shop searches" value={s ? n(s.events.search ?? 0) : '–'} hint={s ? `${Object.keys(s.searches).length} different searches` : undefined} />
              </div>

              <Card title="From visit to enquiry" hint={`How many got to each step ${periodWords}`}>
                {s && s.visits ? (
                  <ol className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {funnel.map((f, i) => (
                      <li key={f.label} className="min-w-0">
                        <div className="flex h-36 items-end rounded-xl bg-[#f4f8f6] p-2">
                          <span className="w-full rounded-lg" style={{ height: `${Math.max(3, (f.value / Math.max(1, funnel[0].value)) * 100)}%`, background: f.hex }} />
                        </div>
                        <p className="mt-3 text-[0.8125rem] font-semibold text-ink-3">{i + 1}. {f.label}</p>
                        <p className="text-2xl font-bold tabular-nums tracking-[-0.02em]">{n(f.value)}</p>
                        <p className="text-xs text-ink-3">{i === 0 ? 'Everyone' : `${rate(f.value, funnel[0].value)}% of visits`}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <Empty>No visits in this period yet.</Empty>
                )}
              </Card>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <Card title="Products looked at" hint="Product pages opened in the shop">
                  <Bars tone="teal" limit={10} empty="No product pages opened in this period yet." rows={Object.entries(s?.products ?? {}).sort((a, b) => b[1].v - a[1].v).map(([slug, r]) => ({ key: slug, label: r.t ?? slug, sub: `/products/${slug}`, value: r.v }))} />
                </Card>
                <Card title="What people searched for" hint="Words typed into the shop’s search">
                  <Bars tone="blue" limit={10} empty="No searches in this period yet." rows={ranked(s?.searches).map(([k, v]) => ({ label: `“${k}”`, key: k, value: v }))} />
                </Card>
                <div className="space-y-6">
                  <Card title="Enquiries by kind">
                    <Bars tone="red" empty="No enquiries in this period yet." rows={enquiryRows.map(([k, v]) => ({ label: eventName(k), value: v }))} />
                  </Card>
                  <Card title="Getting in touch" hint="WhatsApp, calls, emails, the chat and downloads">
                    <Bars tone="amber" empty="Nothing in this period yet." rows={contactRows.map(([k, v]) => ({ label: eventName(k), value: v }))} />
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* ---------- Speed ---------- */}
          {section === 'speed' && (
            <>
              {s && Object.keys(s.vitals).length ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                  {(['LCP', 'FCP', 'INP', 'CLS', 'TTFB'] as Vital[]).map((k) => {
                    const row = s.vitals[k];
                    if (!row) return null;
                    const avg = row.sum / row.n;
                    const tone = avg <= vitalLimits[k].good ? 'good' : avg > vitalLimits[k].poor ? 'poor' : 'fair';
                    return (
                      <div key={k} className="min-w-0 rounded-3xl bg-paper p-5 shadow-[0_1px_2px_rgb(22_35_42/0.04),0_18px_40px_-24px_rgb(22_35_42/0.22)] ring-1 ring-line/60">
                        <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-3"><Zap className="size-4 text-brand-600" /> {vitalNames[k].name}</p>
                        <p className={cn('mt-3 text-[2rem] font-bold leading-none tabular-nums tracking-[-0.03em]', tone === 'good' ? 'text-ok' : tone === 'poor' ? 'text-bad' : 'text-warn')}>{vitalValue(k, avg)}</p>
                        <p className={cn('mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold', tone === 'good' ? 'bg-[#e6f4ec] text-ok' : tone === 'poor' ? 'bg-[#fdecee] text-bad' : 'bg-[#fdf3e0] text-warn')}>{tone === 'good' ? 'Good' : tone === 'poor' ? 'Slow' : 'Could be better'}</p>
                        <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-mist">
                          <span className="bg-brand-500" style={{ width: `${rate(row.good, row.n)}%` }} />
                          <span className="bg-[#e0a52b]" style={{ width: `${rate(row.n - row.good - row.poor, row.n)}%` }} />
                          <span className="bg-signal" style={{ width: `${rate(row.poor, row.n)}%` }} />
                        </div>
                        <p className="mt-2 text-xs tabular-nums text-ink-3">{rate(row.good, row.n)}% good · {rate(row.n - row.good - row.poor, row.n)}% fair · {rate(row.poor, row.n)}% slow</p>
                        <p className="mt-3 text-[0.8125rem] leading-snug text-ink-3">{vitalNames[k].what}</p>
                        <p className="mt-2 text-xs tabular-nums text-ink-3">{n(row.n)} visits measured · {k}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Card><Empty>{s ? 'No speed readings in this period yet.' : 'Reading…'}</Empty></Card>
              )}
              <Card title="What this means">
                <p className="max-w-3xl text-sm leading-relaxed text-ink-2">
                  Each figure is the average over the first page of every visit, measured in visitors’ own browsers on their own phones and networks. Green is within Google’s limit for a good site, amber is close, red is slow. The bar under each figure shows how many visits were good, fair and slow, so one slow phone does not hide a fast site. Google uses these same measures when it ranks sites in search.
                </p>
              </Card>
            </>
          )}

          {/* ---------- Health & errors ---------- */}
          {section === 'health' && (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
                {health.map((h) => (
                  <div key={h.label} className={cn('min-w-0 rounded-2xl bg-white p-5 ring-1', !stats ? 'ring-[#e3e9e6]' : h.ok ? 'ring-[#cfe9db]' : 'ring-[#f5c4ca]')}>
                    <span className="flex items-center justify-between">
                      <span className={cn('grid size-10 place-items-center rounded-xl', !stats ? 'bg-mist text-ink-3' : h.ok ? 'bg-[#e6f4ec] text-ok' : 'bg-[#fdecee] text-bad')}>{h.icon}</span>
                      <span className={cn('size-2.5 rounded-full', !stats ? 'bg-ink-3/40' : h.ok ? 'bg-ok shadow-[0_0_0_4px_rgb(11_138_87/0.15)]' : 'bg-bad shadow-[0_0_0_4px_rgb(220_36_48/0.15)]')} />
                    </span>
                    <p className="mt-4 text-[0.8125rem] font-semibold text-ink-3">{h.label}</p>
                    <p className="font-bold text-ink">{h.text}</p>
                    <p className="mt-1 text-xs leading-snug text-ink-3">{h.sub}</p>
                  </div>
                ))}
              </div>
              {stats?.health.deployedMessage && (
                <p className="flex items-center gap-2 text-[0.8125rem] text-ink-3"><Server className="size-4" /> Latest update to the site: <span className="font-medium text-ink-2">{stats.health.deployedMessage}</span></p>
              )}

              <Card title="Errors" hint="Everything that went wrong on the site and the portals in the last 14 days, the most recent first. Copy one and paste it to Claude to have it fixed.">
                {errors.length ? (
                  <ul className="divide-y divide-[#edf1ef]">
                    {errors.map((e) => (
                      <li key={e.id} className="flex flex-wrap items-start gap-x-4 gap-y-2 py-3.5">
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[#fdecee] text-signal-700"><AlertTriangle className="size-4" /></span>
                        <div className="min-w-0 flex-1 basis-64">
                          <p className="break-words text-sm font-semibold text-ink">{e.message}</p>
                          <p className="mt-0.5 text-[0.8125rem] text-ink-3">{e.area} · {e.path} · {e.source === 'browser' ? 'on a visitor’s screen' : 'on the server'} · first seen {ago(Date.parse(e.firstAt), now)}</p>
                        </div>
                        <p className="shrink-0 text-right text-[0.8125rem] text-ink-3">
                          <span className="block font-semibold tabular-nums text-ink-2">{n(e.count)} {e.count === 1 ? 'time' : 'times'}</span>
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
                  <div className="flex flex-col items-center py-8 text-center">
                    <span className="grid size-12 place-items-center rounded-full bg-[#e6f4ec] text-ok"><Check className="size-6" /></span>
                    <p className="mt-3 font-semibold">{stats ? 'No errors in the last 14 days' : 'Reading…'}</p>
                    {stats && <p className="mt-1 text-sm text-ink-3">Errors on the site or the portals appear here with what to copy to have them fixed.</p>}
                  </div>
                )}
              </Card>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card title="“Page not found”" hint={`Addresses people tried ${periodWords} that don’t exist`}>
                  <Bars tone="red" empty="No missing pages in this period." rows={ranked(s?.notFound).map(([k, v]) => ({ label: k, value: v }))} />
                </Card>
                <Card title="Errors visitors hit on the page" hint={`Visits where the page showed an error ${periodWords}`}>
                  <div className="flex items-end gap-3 pb-4">
                    <p className="text-[2.5rem] font-bold leading-none tracking-[-0.03em] tabular-nums">{s ? n(s.events.js_error ?? 0) : '–'}</p>
                    <p className="pb-1 text-sm text-ink-3">{s && s.visits ? `${rate(s.events.js_error ?? 0, s.visits)}% of visits` : ''}</p>
                  </div>
                  <p className="text-sm text-ink-3">Errors from browser add-ons and in-app browsers (Facebook, Instagram, TikTok) are left out: only the site’s own errors count.</p>
                </Card>
              </div>
            </>
          )}

          <p className="pb-2 pt-2 text-center text-xs text-ink-3">Visitors are shown as a random code with their country and town: no names, emails or addresses of the public are kept. Visits are kept 30 days, the daily totals for good.</p>
      </main>
    </div>
  );
}
