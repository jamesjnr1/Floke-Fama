'use client';

import { cn } from '@/lib/utils';

/**
 * "Live · updated 21:30": shows that the portal keeps itself up to date (it reads the latest every 15 seconds) and
 * when it last did. Nothing shows while the desk is kept in this browser only.
 */
export function LiveStatus({ at, className, queued = 0 }: { at: Date | null; className?: string; queued?: number }) {
  // Changes kept on this device while there was no connection: shown everywhere (also on phones, in the field)
  if (queued > 0)
    return (
      <span role="status" className="inline-flex items-center gap-2 whitespace-nowrap rounded-md bg-[#fff4dc] px-2.5 py-1 text-xs font-semibold text-[#8a5a00]" title="Saved on this device; sent automatically when the connection is back">
        <span aria-hidden className="size-2 rounded-full bg-[#d39a1c]" />
        Offline · {queued} change{queued === 1 ? '' : 's'} waiting
      </span>
    );
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
