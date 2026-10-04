'use client';

import Link from 'next/link';
import { Card, CardTitle, statusStyle } from '@/components/client/ui';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { assetStatus, clientSteps, daysUntil, dueLabel, fmtTime, isOpen, statusSteps, stepIndex, type Asset, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/** Overview: the facility at a glance. Every figure is derived from live service-desk data. */
export function Overview({ name, assets, tickets, onOpenTicket, onOpenAsset, onRequest, onGo }: {
  name: string;
  assets: Asset[];
  tickets: Ticket[];
  onOpenTicket: (id: string) => void;
  onOpenAsset: (id: string) => void;
  onRequest: () => void;
  onGo: (v: 'requests' | 'equipment' | 'certificates') => void;
}) {
  const open = tickets.filter(isOpen).sort((a, b) => stepIndex(b.status) - stepIndex(a.status));
  const enRoute = open.filter((t) => t.status === 'travelling' || t.status === 'onsite');
  const operational = assets.filter((a) => assetStatus(a, tickets) === 'online').length;
  const due = [...assets].sort((a, b) => a.nextCalibration.localeCompare(b.nextCalibration)).filter((a) => daysUntil(a.nextCalibration) <= 30);
  const activity = tickets
    .flatMap((t) => t.log.map((l) => ({ ...l, ticket: t })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);
  const hour = new Date().getHours();

  const kpis = [
    { label: 'Open requests', value: open.length, icon: 'fi-rr-clipboard-list', go: 'requests' as const },
    { label: 'Engineers on the way or on site', value: enRoute.length, icon: 'fi-rr-truck-side', go: 'requests' as const },
    { label: 'Systems operational', value: `${operational}/${assets.length}`, icon: 'fi-rr-heart-rate', go: 'equipment' as const },
    { label: 'Calibrations due (30 days)', value: due.length, icon: 'fi-rr-badge-check', go: 'certificates' as const },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting + primary action */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl bg-[linear-gradient(135deg,#1a5a3c,#0f3b27)] p-6 text-white md:flex-row md:items-center md:p-8">
        <div>
          <p className="text-sm text-white/80">{hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, {name}</p>
          <p className="mt-1 text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
            {open.length === 0 ? 'All systems are running. No open requests.' : `${open.length} service request${open.length === 1 ? '' : 's'} in progress.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onRequest} className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            <Icon name="fi-rr-wrench-simple" /> Request service
          </button>
          <a href={contact.phoneHref} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-4 text-sm text-white hover:bg-white/10">
            <Icon name="fi-rr-phone-call" /> Call support
          </a>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((k) => (
          <li key={k.label} className="min-w-0">
            <button onClick={() => onGo(k.go)} className="flex h-full w-full flex-col rounded-3xl border border-line bg-paper p-5 text-left transition hover:border-ink/20 hover:shadow-[0_20px_40px_-30px_rgb(11_21_16/0.4)]">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50 text-brand-700"><Icon name={k.icon} /></span>
              <span className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-ink">{k.value}</span>
              <span className="mt-1 text-sm text-ink-3">{k.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Live tracker */}
        <Card className="p-5 md:p-6">
          <CardTitle action={<button onClick={() => onGo('requests')} className="text-sm text-brand-700 hover:underline">All requests</button>}>Live service tracker</CardTitle>
          <ul className="mt-4 space-y-3">
            {open.slice(0, 3).map((t) => {
              const a = assets.find((x) => x.id === t.assetId);
              const idx = stepIndex(t.status);
              return (
                <li key={t.id}>
                  <button onClick={() => onOpenTicket(t.id)} className="w-full rounded-2xl border border-line p-4 text-left transition hover:border-ink/20">
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block font-mono text-xs text-ink-3">{t.id} · {fmtTime(t.openedAt)}</span>
                        <span className="mt-1 block truncate font-medium text-ink">{a?.name ?? t.title}</span>
                      </span>
                      <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', statusStyle[t.status])}>{clientSteps[t.status]}</span>
                    </span>
                    <span className="mt-4 grid grid-cols-5 gap-1.5" aria-hidden>
                      {statusSteps.map((s, i) => <span key={s.status} className={cn('h-1.5 rounded-full', i <= idx ? 'bg-brand-600' : 'bg-mist')} />)}
                    </span>
                    <span className="mt-3 block text-sm text-ink-3">
                      {t.engineer ? <>Engineer <span className="text-ink">{t.engineer}</span>{t.eta ? ` · arriving in about ${t.eta}` : t.status === 'onsite' ? ' · on site now' : ''}</> : 'Assigning the nearest engineer…'}
                    </span>
                  </button>
                </li>
              );
            })}
            {open.length === 0 && (
              <li className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-3">
                No open requests. <button onClick={onRequest} className="font-medium text-brand-700 hover:underline">Request service</button>
              </li>
            )}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card className="p-5 md:p-6">
            <CardTitle action={<button onClick={() => onGo('equipment')} className="text-sm text-brand-700 hover:underline">Equipment</button>}>Calibrations due</CardTitle>
            <ul className="mt-3 divide-y divide-line">
              {due.slice(0, 4).map((a) => {
                const d = daysUntil(a.nextCalibration);
                return (
                  <li key={a.id}>
                    <button onClick={() => onOpenAsset(a.id)} className="flex w-full items-center gap-3 py-3 text-left">
                      <span className={cn('size-2 shrink-0 rounded-full', d < 0 ? 'bg-signal' : 'bg-brand-500')} aria-hidden />
                      <span className="min-w-0 flex-1 truncate text-sm text-ink">{a.name}</span>
                      <span className={cn('shrink-0 text-xs', d < 0 ? 'text-signal-700' : 'text-ink-3')}>{dueLabel(a.nextCalibration)}</span>
                    </button>
                  </li>
                );
              })}
              {due.length === 0 && <li className="py-4 text-sm text-ink-3">Nothing due in the next 30 days.</li>}
            </ul>
          </Card>

          <Card className="p-5 md:p-6">
            <CardTitle>Recent updates</CardTitle>
            <ul className="mt-3 space-y-3">
              {activity.map((l, i) => (
                <li key={`${l.ticket.id}-${l.at}-${i}`}>
                  <button onClick={() => onOpenTicket(l.ticket.id)} className="flex w-full gap-3 text-left">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm text-ink"><span className="font-mono text-xs text-ink-3">{l.ticket.id}</span> {l.text}</span>
                      <span className="text-xs text-ink-3">{l.by} · {fmtTime(l.at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: 'fi-rr-shopping-cart', title: 'Order consumables or new equipment', href: '/quote' },
          { icon: 'fi-rr-graduation-cap', title: 'Book staff training', href: '/quote?intent=demo' },
          { icon: 'fi-rr-envelope', title: `Email support · ${contact.support}`, href: `mailto:${contact.support}` },
        ].map((q) => (
          <Link key={q.title} href={q.href} className="flex items-center gap-3 rounded-2xl border border-line bg-paper p-4 text-sm font-medium text-ink transition hover:border-ink/20">
            <Icon name={q.icon} className="text-brand-600" /> <span className="flex-1">{q.title}</span> <Icon name="fi-rr-arrow-small-right" className="text-ink-3" />
          </Link>
        ))}
      </div>
    </div>
  );
}
