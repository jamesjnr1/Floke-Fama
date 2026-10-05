'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardTitle, statusBar, statusStyle, tag } from '@/components/client/ui';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { assetImage, assetStatus, clientSteps, daysUntil, dueLabel, fmtTime, isOpen, statusSteps, stepIndex, type Asset, type AssetStatus, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

const health: Record<AssetStatus, { label: string; dot: string; text: string }> = {
  online: { label: 'Operational', dot: 'bg-[#0b8a58]', text: 'text-[#0b6b45]' },
  attention: { label: 'Service requested', dot: 'bg-[#d39a1c]', text: 'text-[#7a5200]' },
  maintenance: { label: 'Engineer on site', dot: 'bg-[#2f6fa8]', text: 'text-[#1f5585]' },
  installing: { label: 'Awaiting installation', dot: 'bg-[#7c6bc4]', text: 'text-[#4f3f9a]' },
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Overview: the facility at a glance. Every figure is derived from live service-desk data. */
export function Overview({ name, facility, assets, tickets, orders, onOpenTicket, onOpenAsset, onRequest, onGo }: {
  name: string;
  facility: string;
  orders: number;
  assets: Asset[];
  tickets: Ticket[];
  onOpenTicket: (id: string) => void;
  onOpenAsset: (id: string) => void;
  onRequest: () => void;
  onGo: (v: 'requests' | 'equipment' | 'certificates' | 'orders') => void;
}) {
  const { contact } = useSite();
  const open = tickets.filter(isOpen).sort((a, b) => stepIndex(b.status) - stepIndex(a.status));
  const enRoute = open.filter((t) => t.status === 'travelling' || t.status === 'onsite');
  const urgent = open.filter((t) => t.priority === 'critical').length;
  const statuses = assets.map((a) => assetStatus(a, tickets));
  const operational = statuses.filter((s) => s === 'online').length;
  const installing = statuses.filter((s) => s === 'installing').length;
  const inService = assets.length - installing;
  const schedule = assets.filter((a) => !a.installation).sort((a, b) => a.nextCalibration.localeCompare(b.nextCalibration));
  const due = schedule.filter((a) => daysUntil(a.nextCalibration) <= 30);
  const activity = tickets
    .flatMap((t) => t.log.map((l) => ({ ...l, ticket: t })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);
  const hour = new Date().getHours();
  const first = name.split(' ')[0];
  const greeting = `${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, ${first}`;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const next = enRoute[0];

  const header = (summary: string) => (
    <div className="flex flex-col justify-between gap-5 border-b border-line pb-8 md:flex-row md:items-end">
      <div>
        <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand-700">{today}</p>
        <h2 className="mt-2 text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] font-semibold leading-tight tracking-[-0.025em] text-ink">{greeting}</h2>
        <p className="mt-2 max-w-xl text-ink-3">{summary}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <a href={contact.phoneHref} className="inline-flex h-11 items-center gap-2 rounded-lg border border-line bg-paper px-4 text-sm font-medium text-ink transition hover:border-ink/30">
          <Icon name="fi-rr-phone-call" className="text-ink-3" /> Call support
        </a>
        {assets.length ? (
          <button onClick={onRequest} className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-[#006b42]">
            <Icon name="fi-rr-wrench-simple" /> Request service
          </button>
        ) : (
          <Link href="/products" className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-[#006b42]">
            <Icon name="fi-rr-shopping-cart" /> Shop equipment
          </Link>
        )}
      </div>
    </div>
  );

  // A newly registered facility: nothing to show yet, so show how to get started.
  if (assets.length === 0)
    return (
      <div className="space-y-8">
        {header(`Welcome to the ${facility} dashboard. Equipment you buy from Flokefama appears here by itself: we install it, look after it and keep every certificate in one place.`)}
        <ol className="grid divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            { n: '01', title: 'Buy equipment', body: 'Order from the Flokefama shop and check out. Each machine is added to your equipment automatically.', action: <Link href="/products" className="text-sm font-semibold text-brand-700 hover:underline">Shop equipment →</Link> },
            { n: '02', title: 'We install it', body: 'Our engineers deliver, install, commission and train your staff. You follow the job here and get the installation certificate.', action: <button onClick={() => onGo('orders')} className="text-sm font-semibold text-brand-700 hover:underline">Your orders →</button> },
            { n: '03', title: 'We look after it', body: 'Request service in a few clicks, follow the engineer, and keep warranty, calibration dates and certificates in one place.', action: <a href={contact.phoneHref} className="text-sm font-semibold text-brand-700 hover:underline">Already own Flokefama equipment? Call {contact.phone}</a> },
          ].map((s) => (
            <li key={s.n} className="flex flex-col p-7">
              <span className="font-mono text-sm text-ink-3">{s.n}</span>
              <p className="mt-6 text-lg font-semibold text-ink">{s.title}</p>
              <p className="mb-6 mt-1.5 text-sm leading-relaxed text-ink-3">{s.body}</p>
              <div className="mt-auto">{s.action}</div>
            </li>
          ))}
        </ol>
        {orders > 0 && (
          <button onClick={() => onGo('orders')} className="flex w-full items-center gap-3 rounded-xl border border-line bg-paper p-5 text-left text-sm font-medium text-ink hover:border-ink/20">
            <Icon name="fi-rr-box-open" className="text-brand-600" /> <span className="flex-1">You have {orders} order{orders === 1 ? '' : 's'}</span> <Icon name="fi-rr-arrow-small-right" className="text-ink-3" />
          </button>
        )}
      </div>
    );

  const stats = [
    {
      label: 'Open requests',
      value: String(open.length),
      note: urgent ? `${urgent} marked system down` : open.length ? 'None marked urgent' : 'Nothing outstanding',
      tone: urgent ? 'text-[#a3172a]' : 'text-ink-3',
      go: 'requests' as const,
    },
    {
      label: 'Engineers active',
      value: String(enRoute.length),
      note: next ? `${next.engineer ?? 'Engineer'} · ${next.status === 'onsite' ? 'on site now' : next.eta ? `ETA ${next.eta}` : 'on the way'}` : 'No visits in progress',
      tone: next ? 'text-[#7a5200]' : 'text-ink-3',
      go: 'requests' as const,
    },
    {
      label: 'Systems operational',
      value: inService ? `${operational}` : String(installing),
      suffix: inService ? ` / ${inService}` : ' being installed',
      note: installing ? `${installing} awaiting installation` : operational === inService ? 'All systems running' : `${inService - operational} need${inService - operational === 1 ? 's' : ''} attention`,
      tone: installing ? 'text-[#4f3f9a]' : operational === inService ? 'text-[#0b6b45]' : 'text-[#7a5200]',
      go: 'equipment' as const,
    },
    {
      label: 'Calibrations due',
      value: String(due.length),
      suffix: ' in 30 days',
      note: schedule[0] ? `Next: ${schedule[0].name.split(' ').slice(0, 3).join(' ')}` : '—',
      tone: due.some((a) => daysUntil(a.nextCalibration) < 0) ? 'text-[#a3172a]' : 'text-ink-3',
      go: 'certificates' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {header(open.length === 0 ? 'All systems are running. There are no open service requests.' : `${open.length} service request${open.length === 1 ? ' is' : 's are'} in progress${next ? `; ${next.engineer} is ${next.status === 'onsite' ? 'on site' : 'on the way'}` : ''}.`)}

      {/* Key figures: one strip, divided */}
      <ul className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-paper xl:grid-cols-4">
        {stats.map((s, i) => (
          <li key={s.label} className={cn('min-w-0 border-line', i % 2 === 1 && 'border-l', i >= 2 && 'border-t xl:border-t-0', i === 2 && 'xl:border-l')}>
            <button onClick={() => onGo(s.go)} className="group flex h-full w-full flex-col p-5 text-left transition hover:bg-canvas/60 md:p-6">
              <span className="text-[0.75rem] font-semibold uppercase tracking-[0.09em] text-ink-3">{s.label}</span>
              <span className="mt-4 flex items-baseline gap-1">
                <span className="text-[2.5rem] font-semibold leading-none tracking-[-0.04em] text-ink tabular-nums">{s.value}</span>
                {s.suffix && <span className="text-sm text-ink-3">{s.suffix}</span>}
              </span>
              <span className={cn('mt-3 truncate text-sm', s.tone)}>{s.note}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          {/* Active service */}
          <Card>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <CardTitle>Active service</CardTitle>
              <button onClick={() => onGo('requests')} className="text-sm font-medium text-ink-2 hover:text-ink">All requests →</button>
            </div>
            {open.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-3">
                No open requests. <button onClick={onRequest} className="font-medium text-brand-700 hover:underline">Request service</button>
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {open.map((t) => {
                  const a = assets.find((x) => x.id === t.assetId);
                  const idx = stepIndex(t.status);
                  return (
                    <li key={t.id}>
                      <button onClick={() => onOpenTicket(t.id)} className="grid w-full gap-3 px-6 py-5 text-left transition hover:bg-canvas/60 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center md:gap-6">
                        <span className="min-w-0">
                          <span className="block font-mono text-xs text-ink-3">{t.id} · {fmtTime(t.openedAt)}</span>
                          <span className="mt-1 block truncate font-semibold text-ink">{a?.name ?? t.title}</span>
                          <span className="block truncate text-sm text-ink-3">{a?.location}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="grid grid-cols-5 gap-1" aria-hidden>
                            {statusSteps.map((s, i) => <span key={s.status} className={cn('h-1 rounded-[1px]', i <= idx ? statusBar[t.status] : 'bg-[#e7ebe9]')} />)}
                          </span>
                          <span className="mt-2 block truncate text-sm text-ink-2">
                            {t.engineer ? <>{t.engineer}{t.eta ? <span className="text-ink-3"> · ETA {t.eta}</span> : t.status === 'onsite' ? <span className="text-ink-3"> · on site</span> : null}</> : <span className="text-ink-3">Assigning an engineer…</span>}
                          </span>
                        </span>
                        <span className={cn(tag, statusStyle[t.status], 'justify-self-start md:justify-self-end')}>{clientSteps[t.status]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Recent activity */}
          <Card>
            <div className="border-b border-line px-6 py-4"><CardTitle>Recent activity</CardTitle></div>
            <ol className="relative px-6 py-5">
              <span aria-hidden className="absolute bottom-7 left-[1.84rem] top-7 w-px bg-line" />
              {activity.map((l, i) => (
                <li key={`${l.ticket.id}-${l.at}-${i}`}>
                  <button onClick={() => onOpenTicket(l.ticket.id)} className="relative flex w-full gap-4 py-2.5 text-left">
                    <span className={cn('relative mt-1.5 size-2.5 shrink-0 rounded-[2px] ring-4 ring-paper', i === 0 ? 'bg-brand-600' : 'bg-[#c4ccc8]')} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-ink">{l.text}</span>
                      <span className="text-xs text-ink-3"><span className="font-mono">{l.ticket.id}</span> · {l.by} · {fmtTime(l.at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          {/* Equipment health */}
          <Card>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <CardTitle>Equipment health</CardTitle>
              <button onClick={() => onGo('equipment')} className="text-sm font-medium text-ink-2 hover:text-ink">Equipment →</button>
            </div>
            <div className="px-6 pt-5">
              <div className="flex h-2 overflow-hidden rounded-[2px] bg-[#e7ebe9]" aria-hidden>
                {(['online', 'attention', 'maintenance', 'installing'] as const).map((k) => {
                  const n = statuses.filter((s) => s === k).length;
                  return n ? <span key={k} className={health[k].dot} style={{ width: `${(n / assets.length) * 100}%` }} /> : null;
                })}
              </div>
            </div>
            <ul className="divide-y divide-line px-6 py-2">
              {assets.map((a, i) => {
                const h = health[statuses[i]];
                return (
                  <li key={a.id}>
                    <button onClick={() => onOpenAsset(a.id)} className="flex w-full items-center gap-3 py-3 text-left">
                      <span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-line bg-white">
                        {assetImage(a) && <Image src={assetImage(a)!} alt="" fill sizes="44px" className="object-contain p-1" />}
                        <span className={cn('absolute bottom-0.5 right-0.5 size-2 rounded-[2px] ring-2 ring-paper', h.dot)} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                        <span className="block truncate text-xs text-ink-3">{a.location}</span>
                      </span>
                      <span className={cn('shrink-0 text-xs font-medium', h.text)}>{h.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Calibration schedule */}
          <Card>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <CardTitle>Calibration schedule</CardTitle>
              <button onClick={() => onGo('certificates')} className="text-sm font-medium text-ink-2 hover:text-ink">Certificates →</button>
            </div>
            <ul className="divide-y divide-line px-6 py-1">
              {schedule.length === 0 && <li className="py-4 text-sm text-ink-3">Calibrations are scheduled when the engineer installs your equipment.</li>}
              {schedule.slice(0, 4).map((a) => {
                const d = daysUntil(a.nextCalibration);
                const dt = new Date(a.nextCalibration);
                return (
                  <li key={a.id}>
                    <button onClick={() => onOpenAsset(a.id)} className="flex w-full items-center gap-4 py-3.5 text-left">
                      <span className={cn('grid w-11 shrink-0 border-l-2 pl-2.5 leading-none', d < 0 ? 'border-[#c8213a]' : d <= 30 ? 'border-[#d39a1c]' : 'border-[#c4ccc8]')}>
                        <span className="text-lg font-semibold text-ink tabular-nums">{dt.getDate()}</span>
                        <span className="mt-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-3">{months[dt.getMonth()]}</span>
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{a.name}</span>
                      <span className={cn('shrink-0 text-xs', d < 0 ? 'font-semibold text-[#a3172a]' : d <= 30 ? 'font-medium text-[#7a5200]' : 'text-ink-3')}>{dueLabel(a.nextCalibration)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Support */}
          <div className="overflow-hidden rounded-xl bg-[linear-gradient(150deg,#00804f_0%,#005a38_100%)] text-white">
            <div className="p-6">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.09em] text-white/75">Flokefama support</p>
              <p className="mt-3 text-lg font-semibold">Here when you need us.</p>
              <a href={contact.phoneHref} className="mt-4 block text-2xl font-semibold tracking-[-0.02em] hover:text-white/85">{contact.phone}</a>
              <a href={`mailto:${contact.support}`} className="mt-1 block text-sm text-white/70 hover:text-white">{contact.support}</a>
            </div>
            <div className="grid grid-cols-2 border-t border-white/15 text-sm">
              <Link href="/products" className="px-6 py-4 text-white/85 transition hover:bg-white/5 hover:text-white">Order equipment →</Link>
              <Link href="/quote?intent=demo" className="border-l border-white/15 px-6 py-4 text-white/85 transition hover:bg-white/5 hover:text-white">Book training →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
