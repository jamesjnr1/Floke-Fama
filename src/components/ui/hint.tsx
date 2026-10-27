'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * A small “?” beside something people may not understand: tap or click it for a short explanation, tap anywhere
 * else (or press Escape) to close it. Works the same with a finger, a mouse or the keyboard.
 */
export function Hint({ children, label = 'What does this mean?', className, align = 'left', onDark }: { children: React.ReactNode; label?: string; className?: string; align?: 'left' | 'right'; /** On a dark background. */ onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  // Which side it opens to: towards the middle of the screen, so it never runs off the edge
  const [side, setSide] = useState<'left' | 'right'>(align);
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
        onClick={() => {
          const r = box.current?.getBoundingClientRect();
          if (r) setSide(r.left + 352 > window.innerWidth - 16 ? 'right' : 'left');
          setOpen((o) => !o);
        }}
        className={cn('grid size-5 place-items-center rounded-full border border-current text-[0.6875rem] font-bold leading-none transition', onDark ? 'text-white/70 hover:text-white' : 'text-ink-3 hover:text-brand-700')}
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="note"
          className={cn(
            // Readable: a comfortable width, normal size text, room between lines and points
            'absolute top-8 z-50 block w-[min(22rem,calc(100vw-2rem))] whitespace-normal rounded-2xl bg-ink px-5 py-4 text-left text-[0.9375rem] font-normal normal-case leading-relaxed tracking-normal text-white shadow-[0_18px_40px_-14px_rgb(0_0_0/0.5)]',
            '[&_b]:font-semibold [&_b]:text-white [&_br]:mb-3 [&_br]:block [&_br]:content-[""]',
            side === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {children}
        </span>
      )}
    </span>
  );
}
