import { cn } from '@/lib/utils';
import type { Priority, TicketStatus } from '@/lib/service/store';

/** Light dashboard primitives for the client portal. */
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('min-w-0 rounded-3xl border border-line bg-paper', className)}>{children}</div>;
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[1.125rem] font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}

export const statusStyle: Record<TicketStatus, string> = {
  new: 'bg-mist text-ink-2',
  assigned: 'bg-brand-50 text-brand-700',
  travelling: 'bg-brand-600 text-white',
  onsite: 'bg-brand-700 text-white',
  resolved: 'bg-paper text-ink-3 ring-1 ring-line',
};

export const urgency: Record<Priority, { label: string; hint: string; className: string }> = {
  critical: { label: 'System down', hint: 'Patient care affected', className: 'bg-signal/10 text-signal-700' },
  high: { label: 'Degraded', hint: 'Working, but not right', className: 'bg-brand-50 text-brand-700' },
  routine: { label: 'Routine', hint: 'Maintenance or advice', className: 'bg-mist text-ink-2' },
};

export const inputClass =
  'w-full rounded-xl border border-line bg-paper px-3.5 text-[1.125rem] text-ink outline-none transition placeholder:text-ink-3/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';
