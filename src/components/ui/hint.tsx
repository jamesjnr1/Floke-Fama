'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * A small “?” beside something people may not understand: tap or click it for a short explanation, tap anywhere
 * else (or press Escape) to close it. Works the same with a finger, a mouse or the keyboard.
 */
export function Hint({ children, label = 'What does this mean?', className, align = 'left', onDark }: { children: React.ReactNode; label?: string; className?: string; align?: 'left' | 'right'; /** On a dark background. */ onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const box = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <span ref={box} className={cn('relative inline-flex align-middle', className)}>
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn('grid size-5 place-items-center rounded-full border border-current text-[0.6875rem] font-bold leading-none transition', onDark ? 'text-white/70 hover:text-white' : 'text-ink-3 hover:text-brand-700')}
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="note"
          className={cn(
            'absolute top-7 z-40 w-[min(18rem,80vw)] rounded-xl bg-ink px-3.5 py-3 text-left text-[0.8125rem] font-normal normal-case leading-snug tracking-normal text-white shadow-[0_12px_30px_-12px_rgb(0_0_0/0.45)]',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
