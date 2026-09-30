import type { AssetStatus } from '@/data/portal-demo';

export const statusMeta: Record<AssetStatus, { label: string; dot: string; tone: string }> = {
  online: { label: 'Online', dot: 'status-dot', tone: '#10b981' },
  maintenance: { label: 'In service', dot: 'inline-block size-2 shrink-0 rounded-full bg-neon-500', tone: '#3b82f6' },
  attention: { label: 'Needs attention', dot: 'inline-block size-2 shrink-0 rounded-full bg-amber-400 animate-pulse', tone: '#fbbf24' },
};
