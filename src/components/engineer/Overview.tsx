'use client';

import Image from 'next/image';
import { statusMeta, ticketStatusMeta } from '@/components/service/status';
import { linkButton, Panel, PanelHead, PrimaryButton, PriorityBadge, tag } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import { assetImage, assetStatus, daysUntil, dueLabel, fmtTime, isOpen, statusSteps, stepIndex, type EngineerState } from '@/lib/service/store';
import { cn } from '@/lib/utils';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Overview: today at a glance, laid out like the hospital dashboard. Every figure comes from the live service desk. */
export function Overview({ state, me, onOpenTicket, onOpenAsset, onGo, onLogFault }: {
  state: EngineerState;
  me: string;
  onOpenTicket: (id: string) => void;
  onOpenAsset: (id: string) => void;
  onGo: (view: 'tickets' | 'calibration' | 'systems') => void;
  onLogFault: () => void;
}) {
  const open = state.tickets.filter(isOpen);
  const mine = open.filter((t) => t.engineer === me);
  const unassigned = open.filter((t) => t.status === 'new');
  const statuses = state.assets.map((a) => assetStatus(a, state.tickets));
  const attention = statuses.filter((s) => s === 'attention' || s === 'maintenance').length;
  const installing = statuses.filter((s) => s === 'installing').length;
  const schedule = state.assets.filter((a) => !a.installation).sort((a, b) => a.nextCalibration.localeCompare(b.nextCalibration));
  const due = schedule.filter((a) => daysUntil(a.nextCalibration) <= 30);
  const overdue = due.filter((a) => daysUntil(a.nextCalibration) < 0).length;
  const queue = [...unassigned, ...mine.filter((t) => t.status !== 'new')];
  const activity = state.tickets
    .flatMap((t) => t.log.map((l) => ({ ...l, ticket: t })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  const hour = new Date().getHours();
  const greeting = `${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, ${me.split(' ')[0]}`;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const summary =
    open.length === 0
      ? 'No open service requests. New requests from hospitals appear here.'
      : `${open.length} open request${open.length === 1 ? '' : 's'}${unassigned.length ? `, ${unassigned.length} waiting for an engineer` : ''}${mine.length ? `; ${mine.length} assigned to you` : ''}.`;

  const stats = [
    { label: 'Open requests', value: open.length, note: unassigned.length ? `${unassigned.length} unassigned` : open.length ? 'All assigned' : 'Nothing outstanding', tone: unassigned.length ? 'text-bad' : 'text-ink-3', go: 'tickets' as const },
    { label: 'Assigned to me', value: mine.length, note: mine[0] ? `Next: ${mine[0].title.split(':')[0]}` : 'Your queue is clear', tone: 'text-ink-3', go: 'tickets' as const },
    { label: 'Need attention', value: attention, suffix: ` of ${state.assets.length}`, note: installing ? `${installing} to install` : state.assets.length ? (attention ? 'Systems with open faults' : 'All systems running') : 'No equipment yet', tone: attention ? 'text-warn' : installing ? 'text-violet' : 'text-ink-3', go: 'systems' as const },
    { label: 'Calibrations due', value: due.length, suffix: ' in 30 days', note: overdue ? `${overdue} overdue` : schedule[0] ? `Next: ${schedule[0].name.split(' ').slice(0, 3).join(' ')}` : 'None scheduled', tone: overdue ? 'text-bad' : 'text-ink-3', go: 'calibration' as const },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-5 border-b border-line pb-8 md:flex-row md:items-end">
        <div>
          <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-brand-700">{today}</p>
          <h2 className="mt-2 text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] font-semibold leading-tight tracking-[-0.025em] text-ink">{greeting}</h2>
          <p className="mt-2 max-w-xl text-ink-3">{summary}</p>
        </div>
        <PrimaryButton onClick={onLogFault} className="h-11 shrink-0 px-5">
          <Icon name="fi-rr-plus" /> Log equipment fault
        </PrimaryButton>
      </div>

      {/* Key figures: one strip, divided */}
      <ul className="grid grid-cols-2 overflow-hidden rounded-xl border border-line bg-paper xl:grid-cols-4">
        {stats.map((s, i) => (
          <li key={s.label} className={cn('min-w-0 border-line', i % 2 === 1 && 'border-l', i >= 2 && 'border-t xl:border-t-0', i === 2 && 'xl:border-l')}>
            <button onClick={() => onGo(s.go)} className="flex h-full w-full flex-col p-5 text-left transition hover:bg-canvas md:p-6">
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
          {/* Work queue */}
          <Panel>
            <PanelHead title="Work queue" action={<button onClick={() => onGo('tickets')} className={linkButton}>All requests →</button>} />
            {queue.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-ink-3">Nothing waiting. Requests from hospitals appear here.</p>
            ) : (
              <ul className="divide-y divide-line">
                {queue.slice(0, 6).map((t) => {
                  const a = state.assets.find((x) => x.id === t.assetId);
                  const idx = stepIndex(t.status);
                  const st = ticketStatusMeta[t.status];
                  return (
                    <li key={t.id}>
                      <button onClick={() => onOpenTicket(t.id)} className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-canvas md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center md:gap-6 md:px-6">
                        <span className="min-w-0">
                          <span className="block font-mono text-xs text-ink-3">{t.id} · {fmtTime(t.openedAt)}</span>
                          <span className="mt-1 block truncate font-semibold text-ink">{a?.name ?? t.title}</span>
                          <span className="block truncate text-sm text-ink-3">{a ? `${a.facility} · ${a.location}` : t.description}</span>
                        </span>
                        <span className="min-w-0">
                          <span className="grid grid-cols-5 gap-1" aria-hidden>
                            {statusSteps.map((s, i) => <span key={s.status} className={cn('h-1 rounded-[1px]', i <= idx ? st.bar : 'bg-line')} />)}
                          </span>
                          <span className="mt-2 block truncate text-sm text-ink-2">{t.engineer ? (t.engineer === me ? 'You' : t.engineer) : 'Waiting for an engineer'}</span>
                        </span>
                        <span className="flex gap-1.5 md:justify-self-end">
                          <PriorityBadge priority={t.priority} />
                          <span className={cn(tag, st.tag)}>{st.label}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* Recent activity */}
          <Panel>
            <PanelHead title="Recent activity" />
            {activity.length === 0 ? (
              <p className="px-6 py-8 text-sm text-ink-3">No activity yet.</p>
            ) : (
              <ol className="relative px-6 py-5">
                <span aria-hidden className="absolute bottom-7 left-[1.84rem] top-7 w-px bg-line" />
                {activity.map((l, i) => (
                  <li key={`${l.ticket.id}-${l.at}-${i}`}>
                    <button onClick={() => onOpenTicket(l.ticket.id)} className="relative flex w-full gap-4 py-2.5 text-left">
                      <span className={cn('relative mt-1.5 size-2.5 shrink-0 rounded-[2px] ring-4 ring-paper', i === 0 ? 'bg-brand-600' : 'bg-line')} aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-ink">{l.text}</span>
                        <span className="text-xs text-ink-3"><span className="font-mono">{l.ticket.id}</span> · {l.by} · {fmtTime(l.at)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          {/* Equipment health */}
          <Panel>
            <PanelHead title="Equipment health" action={<button onClick={() => onGo('systems')} className={linkButton}>Equipment →</button>} />
            {state.assets.length === 0 ? (
              <p className="px-6 py-8 text-sm text-ink-3">No equipment yet. Systems appear here once hospitals buy them.</p>
            ) : (
              <>
                <div className="px-6 pt-5">
                  <div className="flex h-2 overflow-hidden rounded-[2px] bg-line" aria-hidden>
                    {(['online', 'attention', 'maintenance', 'installing'] as const).map((k) => {
                      const n = statuses.filter((s) => s === k).length;
                      return n ? <span key={k} className={statusMeta[k].dot} style={{ width: `${(n / statuses.length) * 100}%` }} /> : null;
                    })}
                  </div>
                </div>
                <ul className="divide-y divide-line px-6 py-2">
                  {state.assets.slice(0, 6).map((a, i) => {
                    const h = statusMeta[statuses[i]];
                    const img = assetImage(a);
                    return (
                      <li key={a.id}>
                        <button onClick={() => onOpenAsset(a.id)} className="flex w-full items-center gap-3 py-3 text-left">
                          <span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-line bg-white">
                            {img && <Image src={img} alt="" fill sizes="44px" className="object-contain p-1" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                            <span className="block truncate text-xs text-ink-3">{a.facility}</span>
                          </span>
                          <span className={cn('shrink-0 text-xs font-medium', h.text)}>{h.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Panel>

          {/* Calibration schedule */}
          <Panel>
            <PanelHead title="Calibration schedule" action={<button onClick={() => onGo('calibration')} className={linkButton}>Calibration →</button>} />
            <ul className="divide-y divide-line px-6 py-1">
              {schedule.length === 0 && <li className="py-4 text-sm text-ink-3">Calibrations are scheduled when equipment is installed.</li>}
              {schedule.slice(0, 4).map((a) => {
                const d = daysUntil(a.nextCalibration);
                const dt = new Date(a.nextCalibration);
                return (
                  <li key={a.id}>
                    <button onClick={() => onOpenAsset(a.id)} className="flex w-full items-center gap-4 py-3.5 text-left">
                      <span className={cn('grid w-11 shrink-0 border-l-2 pl-2.5 leading-none', d < 0 ? 'border-bad' : d <= 30 ? 'border-warn' : 'border-line')}>
                        <span className="text-lg font-semibold text-ink tabular-nums">{dt.getDate()}</span>
                        <span className="mt-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-3">{months[dt.getMonth()]}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{a.name}</span>
                        <span className="block truncate text-xs text-ink-3">{a.facility}</span>
                      </span>
                      <span className={cn('shrink-0 text-xs', d < 0 ? 'font-semibold text-bad' : d <= 30 ? 'font-medium text-warn' : 'text-ink-3')}>{dueLabel(a.nextCalibration)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
