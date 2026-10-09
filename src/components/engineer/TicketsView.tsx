'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import { ticketStatusMeta } from '@/components/service/status';
import { fieldClass, GhostButton, Panel, PrimaryButton, PriorityBadge, SectionLabel, tag } from '@/components/service/ui';
import { Icon } from '@/components/ui/icon';
import { fmtTime, isOpen, statusSteps, stepIndex, type Action, type EngineerState, type Ticket } from '@/lib/service/store';
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
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <section aria-label="Ticket list" className="min-w-0">
        <div className="flex items-center gap-2">
          <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-line bg-paper px-3 focus-within:border-brand-500">
            <Icon name="fi-rr-search" className="text-ink-3" />
            <span className="sr-only">Search requests</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search requests…" className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3/70" />
          </label>
          <button onClick={onLogFault} className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-600 text-white hover:bg-[#006b42]" aria-label="Log equipment fault">
            <Icon name="fi-rr-plus" />
          </button>
        </div>
        <div className="mt-3 flex gap-4 overflow-x-auto border-b border-line" role="tablist" aria-label="Request filter">
          {filters.map((f) => {
            const count = f.id === 'all' ? state.tickets.length : state.tickets.filter((t) => (f.id === 'open' ? isOpen(t) : f.id === 'mine' ? isOpen(t) && t.engineer === me : f.id === 'new' ? t.status === 'new' : t.status === 'resolved')).length;
            return (
              <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn('-mb-px shrink-0 border-b-2 py-2.5 text-sm', filter === f.id ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
                {f.label} <span className="ml-0.5 tabular-nums text-ink-3">{count}</span>
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
                  className={cn('w-full rounded-xl border p-4 text-left transition', on ? 'border-brand-500 bg-brand-50' : 'border-line bg-paper hover:border-ink/20')}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-ink-3">{t.id} · {fmtTime(t.openedAt)}</span>
                    <PriorityBadge priority={t.priority} />
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-ink">{t.title}</span>
                  <span className="mt-1 flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-ink-3">{a?.facility}</span>
                    <span className={cn('shrink-0 font-medium', ticketStatusMeta[t.status].text)}>{ticketStatusMeta[t.status].label}{t.engineer && t.status !== 'new' ? ` · ${t.engineer === me ? 'you' : t.engineer.split(' ')[0]}` : ''}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-3">{state.tickets.length ? 'No requests here.' : 'No service requests yet. Requests from hospitals appear here.'}</li>}
        </ul>
      </section>

      <section ref={detail} aria-label="Ticket detail" className="min-w-0 scroll-mt-4">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <TicketDetail ticket={selected} state={state} me={me} dispatch={dispatch} onResolve={onResolve} onOpenAsset={onOpenAsset} />
            </motion.div>
          ) : (
            <Panel className="p-10 text-center text-sm text-ink-3">Select a request.</Panel>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

const stepLabel: Record<string, string> = { new: 'Logged', assigned: 'Assigned', travelling: 'En route', onsite: 'On site', resolved: 'Resolved' };
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
    <Panel className="p-6 md:p-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-xs text-ink-3">{t.id} · Opened {fmtTime(t.openedAt)}</span>
          <PriorityBadge priority={t.priority} />
          <span className={cn(tag, ticketStatusMeta[t.status].tag)}>{ticketStatusMeta[t.status].label}</span>
        </div>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-ink">{t.title}</h2>
        <p className="mt-2 text-sm text-ink-2">{t.description}</p>
        {(t.requestedBy || t.contactPhone || t.preferredVisit) && (
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
            {t.requestedBy && <span>Raised by <span className="text-ink-2">{t.requestedBy}</span></span>}
            {t.contactPhone && <a href={`tel:${t.contactPhone.replace(/\s/g, '')}`} className="font-medium text-brand-700 hover:underline">{t.contactPhone}</a>}
            {t.preferredVisit && <span>Preferred visit: <span className="text-ink-2">{t.preferredVisit}</span></span>}
            {t.rating && <span>Client rating: <span className="text-ink-2">{t.rating}/5</span></span>}
          </p>
        )}
        {asset && (
          <button onClick={() => onOpenAsset(asset.id)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-left text-xs text-ink-2 transition hover:border-ink/25 hover:text-ink">
            <Icon name="fi-rr-hospital" className="text-brand-700" /> {asset.name} · {asset.facility}, {asset.location} · {asset.serial}
          </button>
        )}

        {/* Progress */}
        <ol className="mt-8 grid grid-cols-5 gap-2" aria-label="Progress">
          {statusSteps.map((s, i) => {
            const st = i < idx || t.status === 'resolved' ? 'done' : i === idx ? 'active' : 'pending';
            return (
              <li key={s.status} className="min-w-0">
                <span className={cn('block h-1 rounded-[1px]', st === 'pending' ? 'bg-line' : 'bg-brand-600')} />
                <span className={cn('mt-2 block truncate text-xs', st === 'pending' ? 'text-ink-3' : st === 'active' ? 'font-semibold text-ink' : 'text-ink-2')}>{stepLabel[s.status]}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-sm text-ink-3">
          {t.status === 'new' && 'Waiting for an engineer.'}
          {t.status !== 'new' && t.engineer && <>Engineer: <span className="font-medium text-ink">{mine ? `${t.engineer} (you)` : t.engineer}</span></>}
          {t.status === 'travelling' && t.eta && <> · ETA {t.eta}</>}
        </p>

        {/* Next action */}
        {t.status !== 'resolved' && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-canvas p-3">
            <span className="mr-auto pl-1 text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-ink-3">Next step</span>
            {(t.status === 'new' || (!mine && t.status !== 'onsite')) && (
              <PrimaryButton onClick={() => dispatch({ type: 'assign', id: t.id, engineer: me })}>
                <Icon name="fi-rr-user-add" /> {t.status === 'new' ? 'Assign to me' : 'Take over'}
              </PrimaryButton>
            )}
            {mine && t.status === 'assigned' && (
              <>
                <label className="sr-only" htmlFor={`eta-${t.id}`}>Estimated arrival</label>
                <select id={`eta-${t.id}`} value={eta} onChange={(e) => setEta(e.target.value)} className={cn(fieldClass, 'h-10 w-32')}>
                  {etas.map((x) => <option key={x}>{x}</option>)}
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
            {!mine && t.status === 'onsite' && <span className="text-sm text-ink-3">{t.engineer} is on site.</span>}
          </div>
        )}

        {t.status === 'resolved' && (
          <div className="mt-6 rounded-lg border border-ok/30 bg-ok/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink"><Icon name="fi-rr-badge-check" className="text-ok" /> Resolved {t.resolvedAt && fmtTime(t.resolvedAt)}</p>
            <p className="mt-2 text-sm text-ink-2">{t.resolution}</p>
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Work log */}
          <div>
            <SectionLabel>Work log</SectionLabel>
            <ol className="mt-3 space-y-3">
              {[...t.log].reverse().map((l, i) => (
                <li key={`${l.at}-${i}`} className="flex gap-3">
                  <span className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-md text-xs', l.kind === 'note' ? 'bg-mist text-ink-2' : l.kind === 'part' ? 'bg-brand-50 text-brand-700' : 'bg-brand-600 text-white')}>
                    <Icon name={l.kind === 'note' ? 'fi-rr-comment' : l.kind === 'part' ? 'fi-rr-box-open' : 'fi-rr-check'} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-ink">{l.text}</span>
                    <span className="text-xs text-ink-3">{l.by} · {fmtTime(l.at)}</span>
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
                <li key={`${p.name}-${i}`} className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-sm">
                  <span className="text-ink">{p.name}</span>
                  <span className="font-mono text-xs text-ink-3">× {p.qty}</span>
                </li>
              ))}
              {t.parts.length === 0 && <li className="text-sm text-ink-3">None recorded.</li>}
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
    </Panel>
  );
}
