import type { AssetStatus, Priority, TicketStatus } from '@/lib/service/store';

/** Equipment states in the engineer portal: a label, a small square dot, and the text colour. */
export const statusMeta: Record<AssetStatus, { label: string; dot: string; text: string }> = {
  online: { label: 'Operational', dot: 'bg-ok', text: 'text-ok' },
  attention: { label: 'Needs attention', dot: 'bg-bad', text: 'text-bad' },
  maintenance: { label: 'Engineer on site', dot: 'bg-info', text: 'text-info' },
  installing: { label: 'To install', dot: 'bg-violet', text: 'text-violet' },
};

export const priorityStyle: Record<Priority, string> = {
  critical: 'bg-bad/12 text-bad',
  high: 'bg-warn/12 text-warn',
  routine: 'bg-ink-3/12 text-ink-3',
};

export const ticketStatusMeta: Record<TicketStatus, { label: string; tag: string; text: string; bar: string }> = {
  new: { label: 'Unassigned', tag: 'bg-bad/12 text-bad', text: 'text-bad', bar: 'bg-bad' },
  assigned: { label: 'Assigned', tag: 'bg-ok/12 text-ok', text: 'text-ok', bar: 'bg-ok' },
  travelling: { label: 'En route', tag: 'bg-warn/12 text-warn', text: 'text-warn', bar: 'bg-warn' },
  onsite: { label: 'On site', tag: 'bg-info/12 text-info', text: 'text-info', bar: 'bg-info' },
  resolved: { label: 'Resolved', tag: 'bg-ink-3/12 text-ink-3', text: 'text-ink-3', bar: 'bg-ink-3' },
};
