import { cn } from '@/lib/utils';
import type { Priority, TicketStatus } from '@/lib/service/store';

/** Light dashboard primitives for the client portal. */
export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('min-w-0 rounded-xl border border-line bg-paper', className)}>{children}</div>;
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-3">{children}</h2>
      {action}
    </div>
  );
}

/** Small square status tag (no pills). Combine with a colour from statusStyle / urgency. */
export const tag = 'inline-flex shrink-0 items-center gap-1.5 rounded-[4px] px-2 py-1 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.07em]';

export const statusStyle: Record<TicketStatus, string> = {
  new: 'bg-[#eef1f4] text-[#3f5260]',
  assigned: 'bg-[#e6f2ec] text-[#0b6b45]',
  travelling: 'bg-[#fdf1d8] text-[#7a5200]',
  onsite: 'bg-[#e4eef8] text-[#1f5585]',
  resolved: 'bg-[#f0f2f1] text-[#5b6b66]',
};

/** The bar colour for each stage, used in progress tracks. */
export const statusBar: Record<TicketStatus, string> = {
  new: 'bg-[#8a9aa6]',
  assigned: 'bg-[#0b8a58]',
  travelling: 'bg-[#d39a1c]',
  onsite: 'bg-[#2f6fa8]',
  resolved: 'bg-[#9aa8a3]',
};

export const urgency: Record<Priority, { label: string; hint: string; className: string }> = {
  critical: { label: 'System down', hint: 'Patient care affected', className: 'bg-[#fbe7e9] text-[#a3172a]' },
  high: { label: 'Degraded', hint: 'Working, but not right', className: 'bg-[#fdf1d8] text-[#7a5200]' },
  routine: { label: 'Routine', hint: 'Maintenance or advice', className: 'bg-[#eef1f4] text-[#3f5260]' },
};

export const inputClass =
  'w-full rounded-lg border border-line bg-paper px-3.5 text-[1.125rem] text-ink outline-none transition placeholder:text-ink-3/60 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';
