import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * F_Logo_Mark: vector interpretation of the Flokefama mark (green disc, leaf strokes, red dot).
 * TODO: replace with the official vector logo once supplied by Flokefama.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="#1F7A45" />
      <path d="M14.2 6.8C8.4 11.6 8.6 21.4 15.2 24.8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18.4 5.6C23.8 10.8 23.4 19.8 17.4 24.6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      <ellipse cx="15.6" cy="16.4" rx="2.2" ry="2.9" transform="rotate(-18 15.6 16.4)" fill="#E4283C" />
    </svg>
  );
}

/** Left Brand Node: mark + wordmark (gap 8px). */
export function Logo({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  return (
    <Link href="/" aria-label="Flokefama home" className={cn('flex items-center gap-2', className)}>
      <LogoMark />
      <span className={cn('text-xl font-semibold tracking-[-0.02em]', tone === 'dark' ? 'text-white' : 'text-ink')}>Flokefama</span>
    </Link>
  );
}
