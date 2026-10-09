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
      return { id: t.id, label: `${t.id} · ${t.title}`, hint: a?.facility, icon: 'fi-rr-clipboard-list', group: 'Tickets', priority: t.priority, run: () => onOpenTicket(t.id) };
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
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-[12vh] z-[70] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-line bg-paper text-ink shadow-2xl outline-none">
          <Dialog.Title className="sr-only">Search the portal</Dialog.Title>
          <div className="flex items-center gap-3 border-b border-line px-5">
            <Icon name="fi-rr-search" className="text-ink-3" />
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
              placeholder="Search requests, equipment, actions…"
              aria-label="Search requests, equipment and actions"
              role="combobox"
              aria-expanded
              aria-controls="palette-results"
              aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
              className="h-14 w-full bg-transparent text-[1.0625rem] outline-none placeholder:text-ink-3/70"
            />
            <kbd className="rounded-[4px] border border-line px-1.5 py-0.5 font-mono text-xs text-ink-3">Esc</kbd>
          </div>
          <ul id="palette-results" role="listbox" className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((c, i) => (
              <li key={`${c.group}-${c.id}`} id={`cmd-${c.id}`} role="option" aria-selected={i === index}>
                {(i === 0 || results[i - 1].group !== c.group) && <p className="px-3 pb-1 pt-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-3">{c.group === 'Tickets' ? 'Requests' : c.group === 'Systems' ? 'Equipment' : c.group}</p>}
                <button
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => run(c)}
                  className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition', i === index ? 'bg-canvas text-ink' : 'text-ink-2')}
                >
                  <Icon name={c.icon} className="text-brand-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{c.label}</span>
                    {c.hint && <span className="block truncate text-xs text-ink-3">{c.hint}</span>}
                  </span>
                  {c.priority && <PriorityBadge priority={c.priority} />}
                </button>
              </li>
            ))}
            {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-ink-3">No results for “{q}”.</li>}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
