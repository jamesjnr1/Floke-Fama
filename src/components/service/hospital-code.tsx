'use client';

import { useFacilityCode } from '@/lib/service/codes';
import { cn } from '@/lib/utils';

/** The hospital's code beside its name (nothing when it has none yet). */
export function HospitalCode({ name, className }: { name: string | undefined; className?: string }) {
  const code = useFacilityCode(name);
  if (!code) return null;
  return <span className={cn('inline-block whitespace-nowrap rounded bg-mist px-1.5 py-px font-mono text-[0.75rem] font-semibold text-ink-2', className)} title="Hospital code">{code}</span>;
}
