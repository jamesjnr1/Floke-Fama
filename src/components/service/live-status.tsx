'use client';

import { cn } from '@/lib/utils';

/**
 * "Live · updated 21:30": shows that the portal keeps itself up to date (it reads the latest every 15 seconds) and
 * when it last did. Nothing shows while the desk is kept in this browser only.
 */
export function LiveStatus({ at, className }: { at: Date | null; className?: string }) {
  if (!at) return null;
  const time = at.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return (
    <span className={cn('inline-flex items-center gap-2 whitespace-nowrap text-xs text-ink-3', className)} title="This page updates by itself every few seconds">
      <span aria-hidden className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
      </span>
      Live · updated {time}
    </span>
  );
}
