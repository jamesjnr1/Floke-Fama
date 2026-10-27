'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { GhostButton, Panel, PrimaryButton, tag } from '@/components/service/ui';
import { Hint } from '@/components/ui/hint';
import { Icon } from '@/components/ui/icon';
import { fmtTime, visitStatus, type Ticket } from '@/lib/service/store';
import { supportDetails, supportSubject, type SupportInput } from '@/lib/support-schema';
import { cn } from '@/lib/utils';

/** A request sent with the Support page's form (see lib/support-requests.ts): the tab's own answers plus these. */
export interface WebsiteRequest extends Partial<Omit<SupportInput, 'website'>> {
  id: string;
  at: string;
  status: 'new' | 'called' | 'closed';
  type: SupportInput['type'];
  name: string;
  facility: string;
  phone: string;
  handledBy?: string;
  handledAt?: string;
  ticketId?: string;
}

const POLL_MS = 30_000;
const typeLabel: Record<WebsiteRequest['type'], string> = { fault: 'Fault', maintenance: 'Maintenance', installation: 'Installation', assistance: 'Other assistance' };
const statusLabel: Record<WebsiteRequest['status'], string> = { new: 'New', called: 'Called back', closed: 'Closed' };

/** The requests, refreshed every 30 seconds while the portal is open (null until loaded; enabled false without the database). */
export function useWebsiteRequests() {
  const [requests, setRequests] = useState<WebsiteRequest[] | null>(null);
  const [enabled, setEnabled] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/support-requests', { cache: 'no-store' });
      const j = (await r.json()) as { enabled?: boolean; requests?: WebsiteRequest[] };
      if (j.enabled === false) setEnabled(false);
      if (j.requests) setRequests(j.requests);
    } catch {
      /* offline: keep what is shown */
    }
  }, []);
  useEffect(() => {
    refresh();
    const tick = () => document.visibilityState === 'visible' && refresh();
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refresh]);

  /** Marks a request called back or closed (or records the service request it became); shown straight away, saved on the server. */
  const update = useCallback(
    async (id: string, status: WebsiteRequest['status'], me: string, ticketId?: string) => {
      setRequests((rs) => rs?.map((r) => (r.id === id ? { ...r, status, handledBy: me, handledAt: new Date().toISOString(), ticketId: ticketId ?? r.ticketId } : r)) ?? rs);
      const res = await fetch('/api/support-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, ticketId }) }).catch(() => null);
      if (!res?.ok) {
        toast.error('That change wasn’t saved', { description: 'Check your connection and try again.' });
        refresh();
      }
    },
    [refresh],
  );
  return { requests, enabled, update };
}

type Filter = 'new' | 'called' | 'closed' | 'all';
const filters: { id: Filter; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'called', label: 'Called back' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
];

/**
 * From the website: what people sent with the Support page's form, client or not. Call them back, then mark it;
 * when it needs a visit, "Book a visit" opens a service request for the hospital's equipment.
 */
export function WebsiteView({ requests, tickets, enabled, me, onCalled, onClose, onMakeJob, onOpenTicket }: {
  requests: WebsiteRequest[] | null;
  /** The service desk's requests, to show where each booked visit stands. */
  tickets: Ticket[];
  enabled: boolean;
  me: string;
  onCalled: (r: WebsiteRequest) => void;
  onClose: (r: WebsiteRequest) => void;
  onMakeJob: (r: WebsiteRequest) => void;
  onOpenTicket: (id: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>('new');
  const list = useMemo(() => (requests ?? []).filter((r) => filter === 'all' || r.status === filter), [requests, filter]);

  if (!enabled) return <Panel className="p-10 text-center text-sm text-ink-3">Requests from the website need the database (Appwrite), which isn’t connected here.</Panel>;
  if (!requests) return <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-mist" />)}</div>;

  return (
    <div>
      <p className="max-w-3xl text-sm text-ink-3">
        Sent with the form on the Support page, by anyone, client or not. Call them back first.{' '}
        <Hint>
          <b className="font-semibold">Called back:</b> settled on the phone, no visit needed.
          <br />
          <b className="font-semibold">Book a visit:</b> it needs an engineer on site. It becomes a service request, with the priority set from what the caller said; tick “Assign to me” to take it yourself, or leave it for any engineer under Unassigned. The caller is texted when an engineer takes it and when it is fixed.
          <br />
          <b className="font-semibold">Close:</b> nothing more to do (a test or a duplicate).
        </Hint>
      </p>
      <div className="mt-4 flex gap-4 overflow-x-auto border-b border-line" role="tablist" aria-label="Request filter">
        {filters.map((f) => (
          <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)} className={cn('-mb-px shrink-0 border-b-2 py-2.5 text-sm', filter === f.id ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-3 hover:text-ink')}>
            {f.label} <span className="ml-0.5 tabular-nums text-ink-3">{f.id === 'all' ? requests.length : requests.filter((r) => r.status === f.id).length}</span>
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-3 xl:grid-cols-2">
        {list.map((r) => (
          <li key={r.id} id={r.id}>
            <Panel className={cn('flex h-full flex-col p-5', r.status === 'new' && r.type === 'fault' && 'border-[#e4b4ae]')}>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs text-ink-3">{r.id} · {fmtTime(r.at)}</span>
                <span className={cn(tag, r.type === 'fault' ? 'bg-[#fdecea] text-[#b42318]' : 'bg-brand-50 text-brand-700')}>{typeLabel[r.type]}</span>
              </div>
              <p className="mt-3 text-base font-semibold text-ink">{r.facility}</p>
              <p className="text-sm font-medium text-ink-2">{supportSubject(r)}</p>
              {r.working === 'down' && <p className="mt-2 text-sm font-semibold text-[#b42318]">Not working at all</p>}
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                {supportDetails(r)
                  .filter(([k]) => k !== 'Equipment' && k !== 'Help with' && !(k === 'Status' && r.working === 'down'))
                  .map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className="whitespace-pre-line leading-relaxed text-ink-2">{v}</dd>
                    </div>
                  ))}
              </dl>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-canvas px-3 py-2.5 text-sm">
                <span className="flex items-center gap-2 text-ink-2"><Icon name="fi-rr-user" className="text-ink-3" /> {r.name}</span>
                <a href={`tel:${r.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 font-semibold text-brand-700 hover:underline"><Icon name="fi-rr-phone-call" /> {r.phone}</a>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                {r.status !== 'closed' && r.type !== 'assistance' && !r.ticketId && (
                  <PrimaryButton onClick={() => onMakeJob(r)}><Icon name="fi-rr-calendar" /> Book a visit</PrimaryButton>
                )}
                {r.status === 'new' && <GhostButton onClick={() => onCalled(r)}><Icon name="fi-rr-check" /> Called back</GhostButton>}
                {r.status !== 'closed' && <GhostButton onClick={() => onClose(r)}>Close</GhostButton>}
                {r.ticketId && (
                  <button onClick={() => onOpenTicket(r.ticketId!)} className="text-sm font-semibold text-brand-700 hover:underline">View service request {r.ticketId}</button>
                )}
                <span className="ml-auto text-xs text-ink-3">
                  {r.ticketId ? visitStatus(tickets.find((t) => t.id === r.ticketId)).label : statusLabel[r.status]}
                  {r.status !== 'new' && r.handledBy && ` · ${r.handledBy === me ? 'you' : r.handledBy}`}
                  {r.status !== 'new' && r.handledAt && `, ${fmtTime(r.handledAt)}`}
                </span>
              </div>
            </Panel>
          </li>
        ))}
        {list.length === 0 && (
          <li className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-3 xl:col-span-2">
            {requests.length ? 'Nothing here.' : 'No requests from the website yet. They appear here the moment someone sends the Support page’s form.'}
          </li>
        )}
      </ul>
    </div>
  );
}
