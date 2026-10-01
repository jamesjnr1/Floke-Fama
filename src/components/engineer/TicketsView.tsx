'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import { ticketStatusMeta } from '@/components/engineer/status';
import { fieldClass, GhostButton, Panel, PrimaryButton, PriorityBadge, SectionLabel } from '@/components/engineer/ui';
import { Icon } from '@/components/ui/icon';
import { fmtTime, isOpen, statusSteps, stepIndex, type Action, type EngineerState, type Ticket } from '@/lib/engineer/store';
import { cn } from '@/lib/utils';

type Filter = 'open' | 'mine' | 'new' | 'resolved' | 'all';
const filters: { id: Filter; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'mine', label: 'Mine' },
  { id: 'new', label: 'Unassigned' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'All' },
];
const rank = { critical: 0, high: 1, routine: 2 };

export function TicketsView({ state, me, selectedId, onSelect, dispatch, onResolve, onOpenAsset, onLogFault }: {
  state: EngineerState;
  me: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  dispatch: (a: Action) => void;
  onResolve: (t: Ticket) => void;
  onOpenAsset: (id: string) => void;
  onLogFault: () => void;
}) {
  const [filter, setFilter] = useState<Filter>('open');
  const [q, setQ] = useState('');
  const detail = useRef<HTMLElement>(null);
  /** On narrow screens the detail sits below the list, so bring it into view. */
  const select = (id: string) => {
    onSelect(id);
    if (window.innerWidth < 1280) requestAnimationFrame(() => detail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.tickets
      .filter((t) => {
        if (filter === 'open') return isOpen(t);
        if (filter === 'mine') return isOpen(t) && t.engineer === me;
        if (filter === 'new') return t.status === 'new';
        if (filter === 'resolved') return t.status === 'resolved';
        return true;
      })
      .filter((t) => {
        if (!term) return true;
        const a = state.assets.find((x) => x.id === t.assetId);
        return `${t.id} ${t.title} ${t.description} ${a?.facility} ${a?.location}`.toLowerCase().includes(term);
      })
      .sort((a, b) => Number(a.status === 'resolved') - Number(b.status === 'resolved') || rank[a.priority] - rank[b.priority] || b.openedAt.localeCompare(a.openedAt));
  }, [state, filter, q, me]);

  const selected = state.tickets.find((t) => t.id === selectedId) ?? list[0] ?? null;

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section aria-label="Ticket list" className="min-w-0">
        <div className="flex items-center gap-2">
          <label className="flex h-10 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 focus-within:border-brand-400">
            <Icon name="fi-rr-search" className="text-white/40" />
            <span className="sr-only">Filter tickets</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter tickets…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
          </label>
          <button onClick={onLogFault} className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700" aria-label="Log new fault">
            <Icon name="fi-rr-plus" />
          </button>
        </div>
        <div className="-mx-1 mt-3 flex gap-1 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Ticket filter">
          {filters.map((f) => {
            const count = f.id === 'all' ? state.tickets.length : state.tickets.filter((t) => (f.id === 'open' ? isOpen(t) : f.id === 'mine' ? isOpen(t) && t.engineer === me : f.id === 'new' ? t.status === 'new' : t.status === 'resolved')).length;
            return (
              <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn('shrink-0 rounded-lg px-3 py-1.5 text-xs transition', filter === f.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white')}>
                {f.label} <span className="ml-1 font-mono text-white/40">{count}</span>
              </button>
            );
          })}
        </div>
        <ul className="mt-3 space-y-2 xl:max-h-[calc(100svh-260px)] xl:overflow-y-auto xl:pr-1">
          {list.map((t) => {
            const a = state.assets.find((x) => x.id === t.assetId);
            const on = selected?.id === t.id;
            return (
              <li key={t.id}>
                <button
                  onClick={() => select(t.id)}
                  aria-current={on ? 'true' : undefined}
                  className={cn('w-full rounded-2xl border p-4 text-left transition', on ? 'border-brand-400/40 bg-brand-700/20' : 'border-white/[0.06] bg-white/[0.03] hover:border-white/15')}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-white/45">{t.id} · {fmtTime(t.openedAt)}</span>
                    <PriorityBadge priority={t.priority} />
                  </span>
                  <span className="mt-2 block text-sm font-medium text-white">{t.title}</span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-white/40">{a?.facility}</span>
                    <span className={cn('shrink-0', ticketStatusMeta[t.status].className)}>{ticketStatusMeta[t.status].label}{t.engineer && t.status !== 'new' ? ` · ${t.engineer === me ? 'you' : t.engineer.split(' ')[0]}` : ''}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">No tickets here.</li>}
        </ul>
      </section>

      <section ref={detail} aria-label="Ticket detail" className="min-w-0 scroll-mt-4">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <TicketDetail ticket={selected} state={state} me={me} dispatch={dispatch} onResolve={onResolve} onOpenAsset={onOpenAsset} />
            </motion.div>
          ) : (
            <Panel className="p-10 text-center text-white/50">Select a ticket.</Panel>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

const etas = ['15 mins', '30 mins', '45 mins', '1 hour', '2 hours'];

function TicketDetail({ ticket: t, state, me, dispatch, onResolve, onOpenAsset }: {
  ticket: Ticket;
  state: EngineerState;
  me: string;
  dispatch: (a: Action) => void;
  onResolve: (t: Ticket) => void;
  onOpenAsset: (id: string) => void;
}) {
  const asset = state.assets.find((a) => a.id === t.assetId);
  const idx = stepIndex(t.status);
  const mine = t.engineer === me;
  const [eta, setEta] = useState(etas[1]);
  const [note, setNote] = useState('');
  const [part, setPart] = useState('');
  const [qty, setQty] = useState(1);

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-white/[0.06] bg-[#17261e] p-6 md:p-8">
      <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgb(46_154_91/0.18),transparent_65%)]" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs tracking-wider text-white/40">{t.id} · Opened {fmtTime(t.openedAt)}</span>
          <PriorityBadge priority={t.priority} />
        </div>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.02em] text-white md:text-3xl">{t.title}</h2>
        <p className="mt-2 text-sm text-white/60">{t.description}</p>
        {asset && (
          <button onClick={() => onOpenAsset(asset.id)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/70 transition hover:bg-white/10 hover:text-white">
            <Icon name="fi-rr-hospital" className="text-brand-300" /> {asset.name} · {asset.facility}, {asset.location} · {asset.serial}
          </button>
        )}

        {/* Progress */}
        <ol className="mt-8 grid grid-cols-5 gap-2" aria-label="Progress">
          {statusSteps.map((s, i) => {
            const st = i < idx || t.status === 'resolved' ? 'done' : i === idx ? 'active' : 'pending';
            return (
              <li key={s.status} className="min-w-0">
                <span className={cn('block h-1.5 rounded-full', st === 'done' ? 'bg-surgical' : st === 'active' ? 'bg-brand-400 shadow-[0_0_12px_rgb(82_181_124/0.7)]' : 'bg-white/10')} />
                <span className={cn('mt-2 block truncate text-[11px]', st === 'pending' ? 'text-white/35' : 'text-white/80')}>{s.label}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-sm text-white/55">
          {t.status === 'new' && 'Waiting for an engineer.'}
          {t.status !== 'new' && t.engineer && <>Engineer: <span className="text-white">{mine ? `${t.engineer} (you)` : t.engineer}</span></>}
          {t.status === 'travelling' && t.eta && <> · ETA {t.eta}</>}
        </p>

        {/* Next action */}
        {t.status !== 'resolved' && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.06] bg-black/20 p-3">
            <span className="mr-auto pl-1 font-mono text-[11px] uppercase tracking-widest text-white/40">Next step</span>
            {(t.status === 'new' || (!mine && t.status !== 'onsite')) && (
              <PrimaryButton onClick={() => dispatch({ type: 'assign', id: t.id, engineer: me })}>
                <Icon name="fi-rr-user-add" /> {t.status === 'new' ? 'Assign to me' : 'Take over'}
              </PrimaryButton>
            )}
            {mine && t.status === 'assigned' && (
              <>
                <label className="sr-only" htmlFor={`eta-${t.id}`}>Estimated arrival</label>
                <select id={`eta-${t.id}`} value={eta} onChange={(e) => setEta(e.target.value)} className={cn(fieldClass, 'h-10 w-32')}>
                  {etas.map((x) => <option key={x} className="bg-midnight">{x}</option>)}
                </select>
                <PrimaryButton onClick={() => dispatch({ type: 'travel', id: t.id, eta })}><Icon name="fi-rr-truck-side" /> Start travel</PrimaryButton>
              </>
            )}
            {mine && t.status === 'travelling' && (
              <PrimaryButton onClick={() => dispatch({ type: 'arrive', id: t.id })}><Icon name="fi-rr-marker" /> Arrived on site</PrimaryButton>
            )}
            {mine && t.status === 'onsite' && (
              <PrimaryButton onClick={() => onResolve(t)}><Icon name="fi-rr-check" /> Resolve…</PrimaryButton>
            )}
            {!mine && t.status === 'onsite' && <span className="text-sm text-white/50">{t.engineer} is on site.</span>}
          </div>
        )}

        {t.status === 'resolved' && (
          <div className="mt-6 rounded-2xl border border-brand-400/30 bg-brand-500/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-white"><Icon name="fi-rr-badge-check" className="text-brand-300" /> Resolved {t.resolvedAt && fmtTime(t.resolvedAt)}</p>
            <p className="mt-2 text-sm text-white/70">{t.resolution}</p>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Work log */}
          <div>
            <SectionLabel>Work log</SectionLabel>
            <ol className="mt-3 space-y-3">
              {[...t.log].reverse().map((l, i) => (
                <li key={`${l.at}-${i}`} className="flex gap-3">
                  <span className={cn('mt-1 grid size-6 shrink-0 place-items-center rounded-full text-[11px]', l.kind === 'note' ? 'bg-white/10 text-white' : l.kind === 'part' ? 'bg-brand-500/20 text-brand-300' : 'bg-brand-600 text-white')}>
                    <Icon name={l.kind === 'note' ? 'fi-rr-comment' : l.kind === 'part' ? 'fi-rr-box-open' : 'fi-rr-check'} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-white/85">{l.text}</span>
                    <span className="text-xs text-white/35">{l.by} · {fmtTime(l.at)}</span>
                  </span>
                </li>
              ))}
            </ol>
            {t.status !== 'resolved' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  dispatch({ type: 'note', id: t.id, text: note.trim() });
                  setNote('');
                }}
                className="mt-4 flex gap-2"
              >
                <label className="sr-only" htmlFor={`note-${t.id}`}>Add a note</label>
                <input id={`note-${t.id}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className={cn(fieldClass, 'h-10')} />
                <GhostButton type="submit" disabled={!note.trim()} className="h-10 shrink-0">Add</GhostButton>
              </form>
            )}
          </div>

          {/* Parts */}
          <div>
            <SectionLabel>Parts used</SectionLabel>
            <ul className="mt-3 space-y-2">
              {t.parts.map((p, i) => (
                <li key={`${p.name}-${i}`} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 text-sm">
                  <span className="text-white/85">{p.name}</span>
                  <span className="font-mono text-xs text-white/50">× {p.qty}</span>
                </li>
              ))}
              {t.parts.length === 0 && <li className="text-sm text-white/40">None recorded.</li>}
            </ul>
            {t.status !== 'resolved' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!part.trim()) return;
                  dispatch({ type: 'part', id: t.id, part: { name: part.trim(), qty } });
                  setPart('');
                  setQty(1);
                }}
                className="mt-3 flex gap-2"
              >
                <label className="sr-only" htmlFor={`part-${t.id}`}>Part name</label>
                <input id={`part-${t.id}`} value={part} onChange={(e) => setPart(e.target.value)} placeholder="Part name" className={cn(fieldClass, 'h-10')} />
                <label className="sr-only" htmlFor={`qty-${t.id}`}>Quantity</label>
                <input id={`qty-${t.id}`} type="number" min={1} max={99} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} className={cn(fieldClass, 'h-10 w-16 shrink-0')} />
                <GhostButton type="submit" disabled={!part.trim()} className="h-10 shrink-0">Add</GhostButton>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
