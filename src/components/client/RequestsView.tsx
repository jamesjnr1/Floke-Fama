'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { Card, inputClass, statusStyle, urgency } from '@/components/client/ui';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { clientSteps, fmtTime, isOpen, statusSteps, stepIndex, type Action, type Asset, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

type Filter = 'open' | 'resolved' | 'all';

export function RequestsView({ assets, tickets, selectedId, onSelect, onRequest, dispatch }: {
  assets: Asset[];
  tickets: Ticket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRequest: () => void;
  dispatch: (a: Action) => void;
}) {
  const [filter, setFilter] = useState<Filter>('open');
  const detail = useRef<HTMLElement>(null);
  const list = tickets
    .filter((t) => (filter === 'open' ? isOpen(t) : filter === 'resolved' ? !isOpen(t) : true))
    .sort((a, b) => b.openedAt.localeCompare(a.openedAt));
  const selected = tickets.find((t) => t.id === selectedId) ?? list[0] ?? null;
  const select = (id: string) => {
    onSelect(id);
    if (window.innerWidth < 1280) requestAnimationFrame(() => detail.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <section aria-label="Requests" className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1 rounded-xl bg-mist p-1" role="tablist" aria-label="Filter requests">
            {(['open', 'resolved', 'all'] as const).map((f) => (
              <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={cn('flex-1 rounded-lg py-1.5 text-sm capitalize transition', filter === f ? 'bg-paper font-medium text-ink shadow-sm' : 'text-ink-3 hover:text-ink')}>
                {f} <span className="text-xs text-ink-3">{f === 'open' ? tickets.filter(isOpen).length : f === 'resolved' ? tickets.filter((t) => !isOpen(t)).length : tickets.length}</span>
              </button>
            ))}
          </div>
          <button onClick={onRequest} className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white hover:bg-brand-700" aria-label="New request">
            <Icon name="fi-rr-plus" />
          </button>
        </div>
        <ul className="mt-3 space-y-2">
          {list.map((t) => {
            const on = selected?.id === t.id;
            const a = assets.find((x) => x.id === t.assetId);
            return (
              <li key={t.id}>
                <button onClick={() => select(t.id)} aria-current={on ? 'true' : undefined} className={cn('w-full rounded-2xl border p-4 text-left transition', on ? 'border-brand-600 bg-brand-50/60' : 'border-line bg-paper hover:border-ink/20')}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-ink-3">{t.id} · {fmtTime(t.openedAt)}</span>
                    <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', statusStyle[t.status])}>{clientSteps[t.status]}</span>
                  </span>
                  <span className="mt-2 block font-medium text-ink">{a?.name}</span>
                  <span className="mt-0.5 block truncate text-sm text-ink-3">{t.description}</span>
                </button>
              </li>
            );
          })}
          {list.length === 0 && <li className="rounded-2xl border border-dashed border-line p-6 text-center text-sm text-ink-3">No {filter === 'all' ? '' : filter} requests.</li>}
        </ul>
      </section>

      <section ref={detail} aria-label="Request detail" className="min-w-0 scroll-mt-4">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <Detail ticket={selected} asset={assets.find((a) => a.id === selected.assetId)} dispatch={dispatch} />
            </motion.div>
          ) : (
            <Card className="p-10 text-center text-ink-3">Select a request.</Card>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function Detail({ ticket: t, asset, dispatch }: { ticket: Ticket; asset?: Asset; dispatch: (a: Action) => void }) {
  const idx = stepIndex(t.status);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  return (
    <Card className="p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-ink-3">{t.id} · Opened {fmtTime(t.openedAt)}</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', urgency[t.priority].className)}>{urgency[t.priority].label}</span>
      </div>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{asset?.name}</h2>
      <p className="mt-1 text-ink-2">{t.description}</p>
      <p className="mt-1 text-sm text-ink-3">{asset?.location}{t.requestedBy ? ` · Requested by ${t.requestedBy}` : ''}{t.preferredVisit ? ` · Preferred visit: ${t.preferredVisit}` : ''}</p>

      {/* Progress */}
      <ol className="mt-8 grid grid-cols-5 gap-2" aria-label="Progress">
        {statusSteps.map((s, i) => {
          const done = i < idx || t.status === 'resolved';
          const active = i === idx && t.status !== 'resolved';
          return (
            <li key={s.status} className="min-w-0">
              <span className={cn('flex size-8 items-center justify-center rounded-full text-sm', done ? 'bg-brand-600 text-white' : active ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-600' : 'bg-mist text-ink-3')}>
                {done ? <Icon name="fi-rr-check" /> : i + 1}
              </span>
              <span className={cn('mt-2 block text-[11px] leading-tight sm:text-xs', done || active ? 'text-ink' : 'text-ink-3')}>{clientSteps[s.status]}</span>
            </li>
          );
        })}
      </ol>

      {/* Engineer */}
      {t.status !== 'resolved' && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-canvas p-4">
          <span className="grid size-11 place-items-center rounded-full bg-brand-600 text-white"><Icon name={t.engineer ? 'fi-rr-user' : 'fi-rr-time-fast'} /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-medium text-ink">{t.engineer ?? 'Assigning an engineer'}</span>
            <span className="block text-sm text-ink-3">
              {t.status === 'new' && 'We’ve received your request and are assigning the nearest engineer.'}
              {t.status === 'assigned' && 'Your engineer has been assigned and will set off shortly.'}
              {t.status === 'travelling' && `On the way${t.eta ? ` · arriving in about ${t.eta}` : ''}.`}
              {t.status === 'onsite' && 'On site and working on your system.'}
            </span>
          </span>
          <a href={contact.phoneHref} className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-3.5 py-2 text-sm font-medium text-ink hover:border-ink/30">
            <Icon name="fi-rr-phone-call" className="text-brand-600" /> Call
          </a>
        </div>
      )}

      {/* Resolution + rating */}
      {t.status === 'resolved' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <p className="flex items-center gap-2 font-medium text-brand-700"><Icon name="fi-rr-badge-check" /> Resolved {t.resolvedAt && fmtTime(t.resolvedAt)}{t.engineer ? ` by ${t.engineer}` : ''}</p>
            <p className="mt-2 text-sm text-ink-2">{t.resolution}</p>
            {t.parts.length > 0 && <p className="mt-2 text-xs text-ink-3">Parts: {t.parts.map((p) => `${p.qty} × ${p.name}`).join(', ')}</p>}
          </div>
          {t.rating ? (
            <p className="flex items-center gap-2 text-sm text-ink-3">
              <span className="flex text-brand-600" aria-label={`Rated ${t.rating} out of 5`}>{[1, 2, 3, 4, 5].map((n) => <Icon key={n} name="fi-rr-star" className={n <= t.rating! ? 'text-brand-600' : 'text-line'} />)}</span>
              Thanks for your feedback{t.feedback ? `: “${t.feedback}”` : '.'}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!rating) return;
                dispatch({ type: 'rate', id: t.id, rating, feedback: feedback.trim() || undefined });
              }}
              className="rounded-2xl border border-line p-4"
            >
              <p className="font-medium text-ink">How did we do?</p>
              <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)} className={cn('grid size-10 place-items-center rounded-xl text-lg transition', n <= rating ? 'bg-brand-600 text-white' : 'bg-mist text-ink-3 hover:bg-brand-50')}>
                    <Icon name="fi-rr-star" />
                  </button>
                ))}
              </div>
              <label className="mt-3 block">
                <span className="sr-only">Comments (optional)</span>
                <input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Comments (optional)" className={cn(inputClass, 'h-11')} />
              </label>
              <button type="submit" disabled={!rating} className="mt-3 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40">Send rating</button>
            </form>
          )}
        </div>
      )}

      {/* Updates & messages */}
      <section className="mt-8">
        <h3 className="text-[15px] font-semibold text-ink">Updates</h3>
        <ol className="mt-3 space-y-3">
          {[...t.log].reverse().map((l, i) => (
            <li key={`${l.at}-${i}`} className="flex gap-3">
              <span className={cn('mt-1 grid size-6 shrink-0 place-items-center rounded-full text-[11px]', l.kind === 'note' ? 'bg-mist text-ink-2' : 'bg-brand-600 text-white')}>
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
              if (!message.trim()) return;
              dispatch({ type: 'note', id: t.id, text: message.trim() });
              setMessage('');
            }}
            className="mt-4 flex gap-2"
          >
            <label className="sr-only" htmlFor={`msg-${t.id}`}>Message the engineer</label>
            <input id={`msg-${t.id}`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add information or message the engineer…" className={cn(inputClass, 'h-11')} />
            <button type="submit" disabled={!message.trim()} className="shrink-0 rounded-xl bg-ink px-4 text-sm font-medium text-white hover:bg-ink-2 disabled:opacity-40">Send</button>
          </form>
        )}
      </section>
    </Card>
  );
}
