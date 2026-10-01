'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useMemo, useState } from 'react';
import { PriorityBadge } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import type { EngineerState } from '@/lib/service/store';
import { cn } from '@/lib/utils';

export type Command = { id: string; label: string; hint?: string; icon: string; group: 'Actions' | 'Tickets' | 'Systems'; run: () => void; priority?: 'critical' | 'high' | 'routine' };

/** ⌘K / Ctrl+K search across tickets, systems and actions. Arrow keys + Enter to run. */
export function CommandPalette({ open, onOpenChange, state, actions, onOpenTicket, onOpenAsset }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  state: EngineerState;
  actions: Command[];
  onOpenTicket: (id: string) => void;
  onOpenAsset: (id: string) => void;
}) {
  const [q, setQ] = useState('');
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (open) {
      setQ('');
      setIndex(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const match = (s: string) => !term || s.toLowerCase().includes(term);
    const tickets: Command[] = state.tickets.map((t) => {
      const a = state.assets.find((x) => x.id === t.assetId);
      return { id: t.id, label: `${t.id} · ${t.title}`, hint: a?.facility, icon: 'fi-rr-headset', group: 'Tickets', priority: t.priority, run: () => onOpenTicket(t.id) };
    });
    const systems: Command[] = state.assets.map((a) => ({ id: a.id, label: a.name, hint: `${a.facility} · ${a.serial}`, icon: 'fi-rr-microscope', group: 'Systems', run: () => onOpenAsset(a.id) }));
    return [...actions, ...tickets, ...systems].filter((c) => match(`${c.label} ${c.hint ?? ''}`)).slice(0, 12);
  }, [q, state, actions, onOpenTicket, onOpenAsset]);

  const run = (c?: Command) => {
    if (!c) return;
    onOpenChange(false);
    c.run();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-[12vh] z-[70] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-3xl border border-white/10 bg-[#004726] text-white shadow-2xl outline-none">
          <Dialog.Title className="sr-only">Search the portal</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-white/10 px-5">
            <Icon name="fi-rr-search" className="text-white/40" />
            <input
              autoFocus
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setIndex(0);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(i + 1, results.length - 1)); }
                if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
                if (e.key === 'Enter') { e.preventDefault(); run(results[index]); }
              }}
              placeholder="Search tickets, systems, actions…"
              aria-label="Search tickets, systems and actions"
              role="combobox"
              aria-expanded
              aria-controls="palette-results"
              aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
              className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-white/35"
            />
            <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/40">Esc</kbd>
          </div>
          <ul id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((c, i) => (
              <li key={`${c.group}-${c.id}`} id={`cmd-${c.id}`} role="option" aria-selected={i === index}>
                {(i === 0 || results[i - 1].group !== c.group) && <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-white/35">{c.group}</p>}
                <button
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(c)}
                  className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition', i === index ? 'bg-white/[0.08] text-white' : 'text-white/75')}
                >
                  <Icon name={c.icon} className="text-brand-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{c.label}</span>
                    {c.hint && <span className="block truncate text-xs text-white/40">{c.hint}</span>}
                  </span>
                  {c.priority && <PriorityBadge priority={c.priority} />}
                </button>
              </li>
            ))}
            {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-white/45">No results for “{q}”.</li>}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
