'use client';

import { motion } from 'motion/react';
import { Icon } from '@/components/ui/icon';
import type { Asset, Ticket } from '@/data/engineer-demo';
import { cn } from '@/lib/utils';

const priorityStyle = {
  critical: 'bg-signal/20 text-white ring-signal/50',
  high: 'bg-brand-500/15 text-brand-300 ring-brand-400/30',
  routine: 'bg-white/5 text-white/60 ring-white/15',
};

/** Interactive Timeline Block: ticket progress as step nodes (done ✓ · active glow · pending). */
export function TimelineTracker({ ticket, asset, onAdvance }: { ticket: Ticket; asset?: Asset; onAdvance: () => void }) {
  const resolved = ticket.current >= ticket.steps.length;
  return (
    <motion.article
      layoutId="timeline-block"
      transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
      className="relative overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#17261e] p-6 md:p-8"
    >
      <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.18),transparent_65%)]" />
      <motion.div key={ticket.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs tracking-wider text-white/40">{ticket.id} · {ticket.opened}</span>
          <span className={cn('rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ring-1', priorityStyle[ticket.priority])}>{ticket.priority}</span>
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">{ticket.title}</h2>
        <p className="mt-1 text-sm text-white/50">
          {asset?.location ?? 'Facility'}{ticket.engineer ? ` · Engineer ${ticket.engineer.name}` : ' · Awaiting assignment'}
          {ticket.engineer?.eta ? ` · ETA ${ticket.engineer.eta}` : ''}
        </p>

        <ol className="relative mt-8 space-y-4">
          {ticket.steps.map((step, i) => {
            const state = i < ticket.current || resolved ? 'done' : i === ticket.current ? 'active' : 'pending';
            return (
              <li key={step.label} className="relative flex gap-4">
                {i < ticket.steps.length - 1 && (
                  <span aria-hidden className={cn('absolute left-[15px] top-8 h-[calc(100%-8px)] w-px', state === 'done' ? 'bg-surgical/60' : 'bg-white/10')} />
                )}
                <span
                  className={cn(
                    'relative z-10 grid size-8 shrink-0 place-items-center rounded-full text-sm',
                    state === 'done' && 'bg-surgical text-white',
                    state === 'active' && 'bg-brand-500 text-white shadow-[0_0_0_6px_rgb(46_154_91/0.18),0_0_30px_rgb(46_154_91/0.6)]',
                    state === 'pending' && 'border border-white/20 text-white/30',
                  )}
                >
                  {state === 'done' && <Icon name="fi-rr-check" />}
                  {state === 'active' && <Icon name="fi-rr-clock-three" />}
                  {state === 'pending' && <span className="size-1.5 rounded-full bg-white/30" />}
                  {state === 'active' && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-brand-500/40" />}
                </span>
                <div className={cn('flex-1 rounded-xl px-4 py-2.5', state === 'active' && 'bg-brand-500/10 ring-1 ring-brand-500/30')}>
                  <p className="flex items-center gap-2 text-sm font-medium text-white">
                    <span className="font-mono text-[11px] text-white/35">{String(i + 1).padStart(2, '0')}</span>
                    {step.label}
                    {state === 'active' && <span className="font-mono text-[10px] uppercase tracking-widest text-brand-300">Active</span>}
                  </p>
                  {step.detail && <p className="mt-0.5 text-xs text-white/45">{step.detail}</p>}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/35">Coordinator view · demo</p>
          <button
            onClick={onAdvance}
            disabled={resolved}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
          >
            {resolved ? 'Resolved' : ticket.current === ticket.steps.length - 1 ? 'Mark resolved' : 'Advance to next step'}
            {!resolved && <Icon name="fi-rr-arrow-small-right" />}
          </button>
        </div>
      </motion.div>
    </motion.article>
  );
}
