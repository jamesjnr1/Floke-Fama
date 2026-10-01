'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Sparkline } from '@/components/service/Sparkline';
import { statusMeta, ticketStatusMeta } from '@/components/service/status';
import { Panel, PriorityBadge, SectionLabel } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import { assetStatus, daysUntil, dueLabel, fmtTime, isOpen, type EngineerState } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/** Overview: today at a glance. Every number is derived from the live portal state. */
export function Overview({ state, me, onOpenTicket, onOpenAsset, onGo }: {
  state: EngineerState;
  me: string;
  onOpenTicket: (id: string) => void;
  onOpenAsset: (id: string) => void;
  onGo: (view: 'tickets' | 'calibration' | 'systems') => void;
}) {
  const open = state.tickets.filter(isOpen);
  const mine = open.filter((t) => t.engineer === me);
  const unassigned = open.filter((t) => t.status === 'new');
  const attention = state.assets.filter((a) => assetStatus(a, state.tickets) !== 'online');
  const due = [...state.assets].sort((a, b) => a.nextCalibration.localeCompare(b.nextCalibration)).filter((a) => daysUntil(a.nextCalibration) <= 30);
  const healthy = state.assets.length - attention.length;
  const fleet = Math.round((healthy / state.assets.length) * 1000) / 10;

  const kpis = [
    { label: 'Open tickets', value: open.length, hint: `${unassigned.length} unassigned`, icon: 'fi-rr-headset', go: 'tickets' as const, alert: unassigned.length > 0 },
    { label: 'My queue', value: mine.length, hint: 'Assigned to me', icon: 'fi-rr-user', go: 'tickets' as const },
    { label: 'Systems needing attention', value: attention.length, hint: `of ${state.assets.length} installed`, icon: 'fi-rr-heart-rate', go: 'systems' as const, alert: attention.length > 0 },
    { label: 'Calibrations due (30 days)', value: due.length, hint: `${due.filter((a) => daysUntil(a.nextCalibration) < 0).length} overdue`, icon: 'fi-rr-chart-line-up', go: 'calibration' as const, alert: due.some((a) => daysUntil(a.nextCalibration) < 0) },
  ];

  return (
    <div className="mt-8 space-y-6">
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <li key={k.label} className="min-w-0">
            <button onClick={() => onGo(k.go)} className="group flex h-full w-full flex-col rounded-[20px] border border-white/[0.06] bg-white/[0.03] p-5 text-left transition hover:border-white/15 hover:bg-white/[0.05]">
              <span className="flex items-center justify-between">
                <Icon name={k.icon} className="text-brand-300" />
                {k.alert && <span className="inline-block size-2 rounded-full bg-signal" aria-label="Needs action" />}
              </span>
              <span className="mt-6 text-4xl font-bold tracking-[-0.03em] text-white">{k.value}</span>
              <span className="mt-1 text-sm text-white/70">{k.label}</span>
              <span className="text-xs text-white/40">{k.hint}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel className="p-5 md:p-6">
          <div className="flex items-center justify-between">
            <SectionLabel>Work queue</SectionLabel>
            <button onClick={() => onGo('tickets')} className="text-xs text-brand-300 hover:text-white">All tickets →</button>
          </div>
          <ul className="mt-4 divide-y divide-white/[0.06]">
            {[...unassigned, ...mine].slice(0, 6).map((t) => {
              const asset = state.assets.find((a) => a.id === t.assetId);
              return (
                <li key={t.id} className="min-w-0">
                  <button onClick={() => onOpenTicket(t.id)} className="flex w-full items-center gap-4 py-3.5 text-left transition hover:bg-white/[0.02]">
                    <span className="w-16 shrink-0 font-mono text-xs text-white/45">{t.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">{t.title}</span>
                      <span className="block truncate text-xs text-white/40">{asset?.facility} · {fmtTime(t.openedAt)}</span>
                    </span>
                    <PriorityBadge priority={t.priority} />
                    <span className={cn('hidden w-24 shrink-0 text-right text-xs sm:block', ticketStatusMeta[t.status].className)}>{ticketStatusMeta[t.status].label}</span>
                  </button>
                </li>
              );
            })}
            {unassigned.length + mine.length === 0 && <li className="py-6 text-sm text-white/45">Nothing in your queue. Nice work.</li>}
          </ul>
        </Panel>

        <Panel className="flex flex-col items-center justify-center p-6">
          <SectionLabel className="self-start">Fleet health</SectionLabel>
          <Radial value={fleet} />
          <p className="text-center text-xs text-white/40">{healthy} of {state.assets.length} systems online with no open faults</p>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="p-5 md:p-6">
          <div className="flex items-center justify-between">
            <SectionLabel>Calibrations due</SectionLabel>
            <button onClick={() => onGo('calibration')} className="text-xs text-brand-300 hover:text-white">Schedule →</button>
          </div>
          <ul className="mt-4 space-y-2">
            {due.slice(0, 4).map((a) => {
              const d = daysUntil(a.nextCalibration);
              return (
                <li key={a.id} className="min-w-0">
                  <button onClick={() => onOpenAsset(a.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.04]">
                    <span className={cn('inline-block size-2 shrink-0 rounded-full', d < 0 ? 'bg-signal' : 'bg-brand-400')} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-white">{a.name}</span>
                      <span className="block truncate text-xs text-white/40">{a.facility}</span>
                    </span>
                    <span className={cn('shrink-0 text-xs', d < 0 ? 'text-signal' : 'text-white/60')}>{dueLabel(a.nextCalibration)}</span>
                  </button>
                </li>
              );
            })}
            {due.length === 0 && <li className="px-3 py-4 text-sm text-white/45">No calibrations due in the next 30 days.</li>}
          </ul>
        </Panel>

        <Panel className="p-5 md:p-6">
          <SectionLabel>Recent activity</SectionLabel>
          <ul className="mt-4 space-y-3">
            {state.tickets
              .flatMap((t) => t.log.map((l) => ({ ...l, ticket: t.id })))
              .sort((a, b) => b.at.localeCompare(a.at))
              .slice(0, 6)
              .map((l, i) => (
                <li key={`${l.ticket}-${l.at}-${i}`}>
                  <button onClick={() => onOpenTicket(l.ticket)} className="flex w-full gap-3 text-left">
                    <span className="mt-1.5 inline-block size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm text-white/80"><span className="font-mono text-xs text-white/45">{l.ticket}</span> {l.text}</span>
                      <span className="text-xs text-white/35">{l.by} · {fmtTime(l.at)}</span>
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </Panel>
      </div>

      <Panel className="p-5 md:p-6">
        <SectionLabel>System pulse</SectionLabel>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {state.assets.map((a) => {
            const s = statusMeta[assetStatus(a, state.tickets)];
            return (
              <li key={a.id} className="min-w-0">
                <button onClick={() => onOpenAsset(a.id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-left transition hover:border-white/15">
                  <span className={s.dot} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{a.name}</span>
                    <span className="block truncate font-mono text-[11px] uppercase tracking-wider text-white/40">{a.facility} · {s.label}</span>
                  </span>
                  <Sparkline values={a.readings} tone={s.tone} />
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}

function Radial({ value }: { value: number }) {
  const reduce = useReducedMotion();
  const r = 70, c = 2 * Math.PI * r;
  return (
    <div className="relative my-4 size-44">
      <svg viewBox="0 0 180 180" className="size-full -rotate-90" role="img" aria-label={`${value}% of systems healthy`}>
        <circle cx="90" cy="90" r={r} fill="none" stroke="rgb(255 255 255 / 0.07)" strokeWidth="12" />
        <motion.circle
          cx="90" cy="90" r={r} fill="none" stroke="#3aa867" strokeWidth="12" strokeLinecap="round" strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c * (1 - value / 100) : c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-4xl font-bold tracking-[-0.03em] text-white">{value}%</p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-surgical">Healthy</p>
        </div>
      </div>
    </div>
  );
}
