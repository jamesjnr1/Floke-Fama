'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CertificatesView } from '@/components/client/CertificatesView';
import { EquipmentSheet, RequestDialog } from '@/components/client/dialogs';
import { EquipmentView } from '@/components/client/EquipmentView';
import { Overview } from '@/components/client/Overview';
import { RequestsView } from '@/components/client/RequestsView';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { Notifications } from '@/components/service/Notifications';
import { useAccessibility } from '@/components/layout/accessibility';
import { Icon } from '@/components/ui/icon';
import { contact } from '@/data/seed';
import { logout } from '@/lib/auth/actions';
import { CLIENT_FACILITY, isOpen, nextTicketId, useServiceStore, type Action, type Notification } from '@/lib/service/store';
import { cn } from '@/lib/utils';

type View = 'overview' | 'requests' | 'equipment' | 'certificates';
const nav: { id: View; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'fi-rr-apps' },
  { id: 'requests', label: 'Service requests', icon: 'fi-rr-clipboard-list' },
  { id: 'equipment', label: 'Equipment', icon: 'fi-rr-microscope' },
  { id: 'certificates', label: 'Certificates', icon: 'fi-rr-badge-check' },
];

/** Client portal (Flokefama Care): the facility's service dashboard, on the shared service desk. */
export function ClientShell({ user }: { user: { name: string; email: string; facility?: string } }) {
  const facility = user.facility ?? CLIENT_FACILITY;
  const actor = useMemo(() => ({ name: user.name, role: 'client' as const, facility }), [user.name, facility]);
  const a11y = useAccessibility();
  const { state, dispatch: rawDispatch, ready, reset } = useServiceStore(actor);
  const [view, setView] = useState<View>('overview');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [requesting, setRequesting] = useState<{ open: boolean; assetId?: string }>({ open: false });

  // Only this facility's systems and requests
  const assets = useMemo(() => state.assets.filter((a) => a.facility === facility), [state.assets, facility]);
  const tickets = useMemo(() => state.tickets.filter((t) => assets.some((a) => a.id === t.assetId)), [state.tickets, assets]);
  const notifications = state.notifications.filter((n) => n.audience === 'client' && (!n.ticketId || tickets.some((t) => t.id === n.ticketId)) && (!n.assetId || assets.some((a) => a.id === n.assetId)));

  const dispatch = useCallback(
    (a: Action) => {
      rawDispatch(a);
      if (a.type === 'note') toast.success('Message sent to the service team');
      if (a.type === 'rate') toast.success('Thank you for your feedback');
    },
    [rawDispatch],
  );
  const openTicket = useCallback((id: string) => {
    setAssetId(null);
    setTicketId(id);
    setView('requests');
  }, []);
  const openAsset = useCallback((id: string) => setAssetId(id), []);
  const onNotification = (n: Notification) => (n.ticketId ? openTicket(n.ticketId) : n.assetId ? openAsset(n.assetId) : undefined);
  const openCount = tickets.filter(isOpen).length;

  return (
    <div className="flex min-h-svh bg-canvas text-ink">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-svh w-[248px] shrink-0 flex-col bg-midnight p-5 text-white lg:flex">
        <Link href="/" aria-label="Flokefama home" className="flex items-center gap-1.5">
          <LogoMark />
          <LogoWordmark className="h-[17px] text-white" />
          <span className="ml-auto rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/60">Care</span>
        </Link>
        <div className="mt-8 rounded-2xl bg-white/[0.06] p-3">
          <p className="truncate text-sm font-medium">{facility}</p>
          <p className="truncate text-xs text-white/50">{user.name}</p>
        </div>
        <nav aria-label="Client portal" className="mt-8">
          <ul className="space-y-1">
            {nav.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setView(n.id)}
                  aria-current={view === n.id ? 'page' : undefined}
                  className={cn('relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', view === n.id ? 'text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white')}
                >
                  {view === n.id && <motion.span layoutId="client-rail" className="absolute inset-0 rounded-xl bg-brand-600" />}
                  <Icon name={n.icon} className="relative" />
                  <span className="relative flex-1 text-left">{n.label}</span>
                  {n.id === 'requests' && openCount > 0 && <span className="relative rounded-full bg-white/15 px-1.5 font-mono text-[10px]">{openCount}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button onClick={() => setRequesting({ open: true })} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          <Icon name="fi-rr-wrench-simple" /> Request service
        </button>
        <div className="mt-auto space-y-3 text-xs">
          <div className="rounded-xl bg-white/[0.05] px-3 py-2 text-white/60">
            Demo data. Requests you submit appear in the engineer portal.
            <button
              onClick={() => {
                if (confirm('Reset the demo data? Changes in this browser will be cleared.')) {
                  reset();
                  setTicketId(null);
                  toast('Demo data reset');
                }
              }}
              className="mt-1 block text-brand-300 hover:text-white"
            >
              Reset demo data
            </button>
          </div>
          <button onClick={a11y.open} className="flex items-center gap-2 text-xs text-white/55 hover:text-white"><Icon name="fi-rr-universal-access" className="text-brand-300" /> Accessibility</button>
          <a href={contact.phoneHref} className="flex items-center gap-2 text-white/55 hover:text-white"><Icon name="fi-rr-phone-call" className="text-brand-300" /> {contact.phone}</a>
          <Link href="/" className="flex items-center gap-2 text-white/55 hover:text-white"><Icon name="fi-rr-arrow-small-left" /> Back to flokefama site</Link>
          <form action={logout}>
            <button type="submit" className="flex items-center gap-2 text-white/55 hover:text-white"><Icon name="fi-rr-sign-out-alt" /> Sign out</button>
          </form>
        </div>
      </aside>

      <main id="main" className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur md:px-8">
          <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Flokefama home"><LogoMark /></Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink-3">{facility}</p>
            <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-ink">{nav.find((n) => n.id === view)?.label}</h1>
          </div>
          <button onClick={() => setRequesting({ open: true })} className="hidden h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 sm:inline-flex lg:hidden">
            <Icon name="fi-rr-wrench-simple" /> Request service
          </button>
          <Notifications tone="light" items={notifications} onRead={(id) => rawDispatch({ type: 'read', id })} onReadAll={() => rawDispatch({ type: 'readAll', audience: 'client' })} onOpen={onNotification} />
          <button onClick={a11y.open} aria-label="Accessibility options" className="grid size-11 place-items-center rounded-xl border border-line bg-paper text-ink lg:hidden"><Icon name="fi-rr-universal-access" /></button>
          <form action={logout} className="lg:hidden">
            <button type="submit" aria-label="Sign out" className="grid size-11 place-items-center rounded-xl border border-line bg-paper text-ink"><Icon name="fi-rr-sign-out-alt" /></button>
          </form>
        </header>

        {/* Mobile nav */}
        <nav aria-label="Client portal sections" className="flex gap-1 overflow-x-auto border-b border-line bg-paper px-3 py-2 lg:hidden">
          {nav.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined} className={cn('shrink-0 rounded-lg px-3 py-2 text-sm', view === n.id ? 'bg-brand-600 text-white' : 'text-ink-3')}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="p-4 md:p-8">
          {!ready ? (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-mist" />)}</div>
          ) : (
            <>
              {view === 'overview' && <Overview name={user.name} assets={assets} tickets={tickets} onOpenTicket={openTicket} onOpenAsset={openAsset} onRequest={() => setRequesting({ open: true })} onGo={setView} />}
              {view === 'requests' && <RequestsView assets={assets} tickets={tickets} selectedId={ticketId} onSelect={setTicketId} onRequest={() => setRequesting({ open: true })} dispatch={dispatch} />}
              {view === 'equipment' && <EquipmentView assets={assets} tickets={tickets} onOpenAsset={openAsset} />}
              {view === 'certificates' && <CertificatesView assets={assets} onOpenAsset={openAsset} />}
            </>
          )}
        </div>
        {/* Mobile: floating request button */}
        <button onClick={() => setRequesting({ open: true })} className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_-10px_rgb(0_112_58/0.8)] sm:hidden">
          <Icon name="fi-rr-wrench-simple" /> Request service
        </button>
      </main>

      <EquipmentSheet
        asset={state.assets.find((a) => a.id === assetId) ?? null}
        tickets={tickets}
        onClose={() => setAssetId(null)}
        onRequest={(id) => {
          setAssetId(null);
          setRequesting({ open: true, assetId: id });
        }}
        onOpenTicket={openTicket}
      />
      <RequestDialog
        open={requesting.open}
        onOpenChange={(open) => setRequesting((r) => ({ ...r, open }))}
        assets={assets}
        defaultAssetId={requesting.assetId}
        onSubmit={(v) => {
          const id = nextTicketId(state);
          rawDispatch({ type: 'request', ticket: v });
          toast.success(`Request ${id} submitted`, { description: 'We’re assigning the nearest engineer. You can follow every step here.' });
          setTicketId(id);
          setView('requests');
        }}
      />
    </div>
  );
}
