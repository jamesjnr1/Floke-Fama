'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const WIDTH = 352; // 22rem
const GAP = 10;

/**
 * A “?” beside something people may not understand: tap or click it for a short explanation, tap anywhere else (or
 * press Escape) to close it. The explanation floats above the page (it never pushes content or makes a box scroll),
 * below the “?” when there is room, else above it, and always inside the screen.
 */
export function Hint({ children, label = 'What does this mean?', className, onDark }: { children: React.ReactNode; label?: string; className?: string; align?: 'left' | 'right'; /** On a dark background. */ onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const note = useRef<HTMLSpanElement>(null);

  // Place it next to the “?”: below when it fits, else above; never past the screen's edges
  const place = () => {
    const b = button.current?.getBoundingClientRect();
    if (!b) return;
    const w = Math.min(WIDTH, window.innerWidth - 32);
    const h = note.current?.offsetHeight ?? 160;
    const left = Math.min(Math.max(16, b.left + b.width / 2 - w / 2), window.innerWidth - 16 - w);
    const below = b.bottom + GAP + h <= window.innerHeight - 12;
    setPos({ left, top: below ? b.bottom + GAP : Math.max(12, b.top - GAP - h), above: !below });
  };
  useLayoutEffect(() => {
    if (open) place();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => e.target !== button.current && !button.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && (e.stopPropagation(), setOpen(false));
    const close = () => setOpen(false);
    document.addEventListener('pointerdown', away, true);
    document.addEventListener('keydown', esc, true);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', away, true);
      document.removeEventListener('keydown', esc, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <span className={cn('relative inline-flex align-middle', className)}>
      <button
        ref={button}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          // Big enough to tap easily: a 28px circle with a clear “?”
          'grid size-7 place-items-center rounded-full border-[1.5px] border-current text-[0.8125rem] font-bold leading-none transition',
          onDark ? 'text-white/75 hover:text-white' : open ? 'text-brand-700' : 'text-ink-3 hover:text-brand-700',
        )}
      >
        ?
      </button>
      {open &&
        createPortal(
          <span
            ref={note}
            id={id}
            role="note"
            style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: `min(${WIDTH}px, calc(100vw - 32px))` }}
            className={cn(
              // Readable: a comfortable width, normal size text, room between lines and points. It only explains, so
              // taps go through it (inside a dialog, a tap on it must not count as a tap outside the dialog).
              'pointer-events-none fixed z-[200] block whitespace-normal rounded-2xl bg-ink px-5 py-4 text-left text-[0.9375rem] font-normal normal-case leading-relaxed tracking-normal text-paper shadow-[0_18px_40px_-14px_rgb(0_0_0/0.5)]',
              '[&_b]:font-semibold [&_br]:mb-3 [&_br]:block [&_br]:content-[""]',
            )}
          >
            {children}
          </span>,
          document.body,
        )}
    </span>
  );
}
