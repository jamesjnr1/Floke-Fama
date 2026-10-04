import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Accent colours for outlined icon boxes, so a row of icons is never one flat colour. */
export const tones = {
  green: 'border-brand-600/30 bg-brand-50 text-brand-600',
  teal: 'border-[#0d9ba8]/30 bg-[#e6f7f8] text-[#087d88]',
  red: 'border-signal/30 bg-[#fdecec] text-signal-700',
  amber: 'border-[#e8ab00]/35 bg-[#fff8e6] text-[#a87a00]',
  blue: 'border-[#0074bb]/30 bg-[#e0f0fb] text-[#0068a8]',
} as const;

export type Tone = keyof typeof tones;

/** A square, outlined icon box (FLOKE_BOLT style) in one of the accent tones. */
export function ToneIcon({ icon: Ico, tone, className, size = 'md' }: { icon: LucideIcon; tone: Tone; className?: string; size?: 'md' | 'lg' }) {
  return (
    <span className={cn('grid shrink-0 place-items-center border transition-colors duration-300', size === 'lg' ? 'size-16' : 'size-14', tones[tone], className)}>
      <Ico className={size === 'lg' ? 'size-7' : 'size-6'} strokeWidth={1.6} aria-hidden />
    </span>
  );
}
