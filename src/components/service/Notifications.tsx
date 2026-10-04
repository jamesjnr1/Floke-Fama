'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { fmtTime, type Notification } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/** Bell with unread count and a dropdown list; clicking a notification opens what it refers to. */
export function Notifications({ items, onRead, onReadAll, onOpen, tone = 'dark' }: {
  tone?: 'dark' | 'light';
  items: Notification[];
  onRead: (id: string) => void;
  onReadAll: () => void;
  onOpen: (n: Notification) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="notif-panel"
        aria-label={unread ? `Notifications (${unread} unread)` : 'Notifications'}
        className={cn('relative grid size-11 place-items-center rounded-xl border', tone === 'dark' ? 'border-white/10 bg-white/[0.04] text-white hover:bg-white/10' : 'border-line bg-paper text-ink hover:border-ink/25')}
      >
        <Icon name="fi-rr-bell" />
        {unread > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-signal px-1 text-[0.75rem] font-semibold text-white">{unread}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="notif-panel"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#111d17] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-semibold text-white">Notifications</p>
              <button onClick={onReadAll} disabled={!unread} className="text-xs text-brand-300 hover:text-white disabled:text-white/60">Mark all read</button>
            </div>
            <ul className="max-h-[60vh] overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => {
                      onRead(n.id);
                      setOpen(false);
                      onOpen(n);
                    }}
                    className={cn('flex w-full gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.04]', !n.read && 'bg-brand-500/[0.06]')}
                  >
                    <span className={cn('mt-1.5 inline-block size-2 shrink-0 rounded-full', n.read ? 'bg-white/15' : 'bg-brand-400')} aria-hidden />
                    <span>
                      <span className={cn('block text-sm', n.read ? 'text-white/75' : 'text-white')}>{n.text}</span>
                      <span className="text-xs text-white/60">{fmtTime(n.at)}</span>
                    </span>
                  </button>
                </li>
              ))}
              {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-white/65">You’re all caught up.</li>}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
