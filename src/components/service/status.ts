import type { AssetStatus, Priority, TicketStatus } from '@/lib/service/store';

export const statusMeta: Record<AssetStatus, { label: string; dot: string; tone: string }> = {
  online: { label: 'Online', dot: 'status-dot', tone: '#3fa06d' },
  maintenance: { label: 'In service', dot: 'inline-block size-2 shrink-0 rounded-full bg-white/60', tone: '#9fc4ae' },
  attention: { label: 'Needs attention', dot: 'inline-block size-2 shrink-0 rounded-full bg-signal animate-pulse', tone: '#ed1c24' },
};

export const priorityStyle: Record<Priority, string> = {
  critical: 'bg-signal/20 text-white ring-signal/50',
  high: 'bg-brand-500/15 text-brand-300 ring-brand-400/30',
  routine: 'bg-white/5 text-white/60 ring-white/15',
};

export const ticketStatusMeta: Record<TicketStatus, { label: string; className: string }> = {
  new: { label: 'Unassigned', className: 'text-signal' },
  assigned: { label: 'Assigned', className: 'text-brand-300' },
  travelling: { label: 'En route', className: 'text-brand-300' },
  onsite: { label: 'On site', className: 'text-white' },
  resolved: { label: 'Resolved', className: 'text-white/40' },
};
