import type { AssetStatus } from '@/data/engineer-demo';

export const statusMeta: Record<AssetStatus, { label: string; dot: string; tone: string }> = {
  online: { label: 'Online', dot: 'status-dot', tone: '#3aa867' },
  maintenance: { label: 'In service', dot: 'inline-block size-2 shrink-0 rounded-full bg-white/60', tone: '#a3b3aa' },
  attention: { label: 'Needs attention', dot: 'inline-block size-2 shrink-0 rounded-full bg-signal animate-pulse', tone: '#e4283c' },
};
