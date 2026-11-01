'use client';

import { useState } from 'react';
import { ticketStatusMeta } from '@/components/service/status';
import { PriorityBadge } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import { fmtTime, isOpen, jobKind, type Action, type EngineerState, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

const urgentFirst = (a: Ticket, b: Ticket) => {
  const rank = { critical: 0, high: 1, medium: 2, low: 3 } as Record<string, number>;
  return (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9) || a.openedAt.localeCompare(b.openedAt);
};

const big = 'inline-flex h-14 items-center justify-center gap-2 rounded-xl px-5 text-[1.0625rem] font-semibold transition';

/**
 * The engineer's day in two lists, made to be used on a phone in the field: “Your jobs”, each with one big button
 * for the next step and one to call the hospital, and “Waiting for an engineer”, each with Take it.
 */
export function MyJobs({ state, me, dispatch, onResolve, onOpenTicket }: {
  state: EngineerState;
  me: string;
  dispatch: (a: Action) => void;
  onResolve: (t: Ticket) => void;
  onOpenTicket: (id: string) => void;
}) {
  const open = state.tickets.filter(isOpen);
  const mine = open.filter((t) => t.engineer === me && t.status !== 'new').sort(urgentFirst);
  const waiting = open.filter((t) => t.status === 'new').sort(urgentFirst);
  const [more, setMore] = useState(false);
  /** The job whose arrival time is being asked (Start travel asks how long, in one tap). */
  const [eta, setEta] = useState<string | null>(null);
  const where = (t: Ticket) => state.assets.find((a) => a.id === t.assetId);

  const next = (t: Ticket) =>
    t.status === 'assigned'
      ? { label: 'Start travel', icon: 'fi-rr-truck-side', go: () => setEta(t.id) }
      : t.status === 'travelling'
        ? { label: 'I have arrived', icon: 'fi-rr-marker', go: () => dispatch({ type: 'arrive', id: t.id }) }
        : { label: 'Job done', icon: 'fi-rr-check', go: () => onResolve(t) };

  const head = (t: Ticket) => {
    const a = where(t);
    return (
      <button onClick={() => onOpenTicket(t.id)} className="block min-w-0 flex-1 text-left">
        <span className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-3">
          <span className="font-mono">{t.id}</span>
          <PriorityBadge priority={t.priority} />
          <span>{jobKind(t)}</span>
        </span>
        <span className="mt-1.5 block text-[1.125rem] font-semibold leading-snug text-ink">{a?.facility ?? 'Hospital'}</span>
        <span className="block text-[0.9375rem] text-ink-2">{t.title}</span>
        {a?.location && <span className="block text-sm text-ink-3">{a.location}</span>}
      </button>
    );
  };

  return (
    <section aria-label="Your jobs" className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div className="rounded-2xl border border-line bg-paper p-4 md:p-6">
        <h3 className="text-[1.25rem] font-semibold text-ink">Your jobs <span className="text-ink-3">({mine.length})</span></h3>
        {mine.length === 0 ? (
          <p className="mt-3 text-[1.0625rem] text-ink-2">You have no jobs right now. {waiting.length ? 'Take one from the list.' : 'New jobs will show here, and you get a text.'}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mine.map((t) => {
              const n = next(t);
              const phone = t.contactPhone;
              const s = ticketStatusMeta[t.status];
              return (
                <li key={t.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-start gap-3">
                    {head(t)}
                    <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[0.8125rem] font-semibold', s.tag)}>{s.label}</span>
                  </div>
                  {t.status === 'travelling' && t.eta && <p className="mt-2 text-sm text-ink-3">You told the hospital: {t.eta}</p>}
                  {eta === t.id ? (
                    <div className="mt-4">
                      <p className="font-medium text-ink">How long until you get there? The hospital sees it.</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {['30 mins', '1 hour', '2 hours', '3+ hours'].map((x) => (
                          <button key={x} onClick={() => { setEta(null); dispatch({ type: 'travel', id: t.id, eta: x }); }} className={cn(big, 'bg-brand-700 px-3 text-white hover:bg-brand-800')}>{x}</button>
                        ))}
                      </div>
                      <button onClick={() => setEta(null)} className="mt-2 text-sm font-semibold text-ink-3 hover:text-ink">Cancel</button>
                    </div>
                  ) : (
                  <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <button onClick={n.go} className={cn(big, 'bg-brand-700 text-white hover:bg-brand-800')}><Icon name={n.icon} /> {n.label}</button>
                    {phone && <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={cn(big, 'border border-line text-ink hover:border-ink/30')}><Icon name="fi-rr-phone-call" /> Call hospital</a>}
                  </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-paper p-4 md:p-6">
        <h3 className="text-[1.25rem] font-semibold text-ink">Waiting for an engineer <span className="text-ink-3">({waiting.length})</span></h3>
        {waiting.length === 0 ? (
          <p className="mt-3 text-[1.0625rem] text-ink-2">Every job has an engineer.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-ink-3">Urgent jobs nobody takes are given to an engineer automatically.</p>
            <ul className="mt-4 space-y-3">
              {(more ? waiting : waiting.slice(0, 4)).map((t) => (
                <li key={t.id} className="rounded-xl border border-line p-4">
                  <div className="flex items-start gap-3">
                    {head(t)}
                    <span className="shrink-0 text-sm text-ink-3">{fmtTime(t.openedAt)}</span>
                  </div>
                  <button onClick={() => dispatch({ type: 'assign', id: t.id, engineer: me })} className={cn(big, 'mt-4 w-full border-2 border-brand-700 text-brand-800 hover:bg-brand-700 hover:text-white')}>
                    <Icon name="fi-rr-user-add" /> Take this job
                  </button>
                </li>
              ))}
            </ul>
            {waiting.length > 4 && (
              <button onClick={() => setMore((x) => !x)} className="mt-3 text-sm font-semibold text-brand-700 hover:underline">{more ? 'Show fewer' : `Show all ${waiting.length}`}</button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
