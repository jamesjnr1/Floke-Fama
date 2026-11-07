'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/components/ui/icon';
import type { EventPhoto } from '@/lib/types';
import { cn } from '@/lib/utils';

/**
 * Photos from an event as a mosaic: the first photo large, with four (or five) around it; any beyond show as "+N more". Any photo opens a full-screen viewer: arrows, the keyboard (← → Esc) or a swipe move through them.
 */
export function EventGallery({ photos, title }: { photos: EventPhoto[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  // Six photos: one large with two beside it and three below (three columns); five: one large with four around it
  const six = photos.length >= 6;
  const shown = photos.slice(0, six ? 6 : 5);
  const more = photos.length - shown.length;
  const alt = (p: EventPhoto, i: number) => p.alt || `${title}, photo ${i + 1}`;

  return (
    <>
      <ul aria-label={`Photos from ${title}`} className={cn('grid grid-cols-2 gap-2 md:gap-3', six ? 'md:grid-cols-3' : 'md:grid-cols-4 md:grid-rows-2')}>
        {shown.map((p, i) => (
          <li key={`${p.src}-${i}`} className={cn(i === 0 && 'col-span-2 md:row-span-2', shown.length === 2 && i === 1 && 'col-span-2', i > 0 && i === shown.length - 1 && shown.length % 2 === 0 && 'col-span-2 md:col-span-1')}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo ${i + 1} of ${photos.length}: ${alt(p, i)}`}
              className={cn('group relative block w-full overflow-hidden bg-mist', i === 0 ? 'aspect-[4/3] md:aspect-auto md:h-full md:min-h-[420px]' : i === shown.length - 1 && shown.length % 2 === 0 ? 'aspect-[4/3] max-md:aspect-[16/9]' : 'aspect-[4/3]')}
            >
              <Image src={p.src} alt={alt(p, i)} fill sizes={i === 0 ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 50vw'} className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]" />
              <span aria-hidden className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              {i === shown.length - 1 && more > 0 && (
                <span className="absolute inset-0 grid place-items-center bg-black/55 text-2xl font-bold text-white">+{more} more</span>
              )}
            </button>
            {p.caption && <p className="mt-2 text-sm leading-snug text-ink-3">{p.caption}</p>}
          </li>
        ))}
      </ul>
      {open !== null && <Viewer photos={photos} start={open} title={title} onClose={() => setOpen(null)} />}
    </>
  );
}

/**
 * The full-screen viewer: one photo at a time on black, with its number. Also used by the CSR page's galleries. Drawn
 * straight into the page body, so a section with an animation (which would trap a fixed layer inside it) can't clip it.
 */
export function Viewer({ photos, start, title, onClose }: { photos: EventPhoto[]; start: number; title: string; onClose: () => void }) {
  const [i, setI] = useState(start);
  const go = useCallback((d: number) => setI((x) => (x + d + photos.length) % photos.length), [photos.length]);
  const touch = useRef<number | null>(null);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    const prev = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    close.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      prev?.focus();
    };
  }, [go, onClose]);

  const p = photos[i];
  const arrow = 'absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/25';
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: photos`}
      className="fixed inset-0 z-[1000] flex flex-col bg-black"
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 md:px-6">
        <span>
          {title} · {i + 1} / {photos.length}
        </span>
        <button ref={close} type="button" onClick={onClose} aria-label="Close photos" className="grid size-11 place-items-center rounded-full text-2xl text-white hover:bg-white/15">
          <Icon name="fi-rr-cross-small" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <Image key={p.src} src={p.src} alt={p.alt || `${title}, photo ${i + 1}`} fill sizes="100vw" className="object-contain" priority />
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className={cn(arrow, 'left-3 md:left-6')}>
              <Icon name="fi-rr-angle-small-right" className="rotate-180" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className={cn(arrow, 'right-3 md:right-6')}>
              <Icon name="fi-rr-angle-small-right" />
            </button>
          </>
        )}
      </div>
      <div className="h-6" />
    </div>,
    document.body,
  );
}
