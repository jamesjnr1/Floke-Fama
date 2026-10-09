'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalibrationView } from '@/components/engineer/CalibrationView';
import { CommandPalette, type Command } from '@/components/engineer/CommandPalette';
import { CalibrationDialog, LogFaultDialog, ResolveDialog } from '@/components/engineer/dialogs';
import { AssetSheet, Inventory } from '@/components/engineer/inventory';
import { Notifications } from '@/components/service/Notifications';
import { Overview } from '@/components/engineer/Overview';
import { SystemsView } from '@/components/engineer/SystemsView';
import { TicketsView } from '@/components/engineer/TicketsView';
import { LogoMark } from '@/components/layout/logo';
import { useAccessibility } from '@/components/layout/accessibility';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { logout } from '@/lib/auth/actions';
import { daysUntil, isOpen, nextTicketId, useEngineerStore, type Action, type Asset, type Notification, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

type View = 'overview' | 'tickets' | 'systems' | 'calibration' | 'docs';
const nav: { id: View; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'fi-rr-apps' },
  { id: 'tickets', label: 'Service Tickets', icon: 'fi-rr-headset' },
  { id: 'systems', label: 'System Pulse', icon: 'fi-rr-heart-rate' },
  { id: 'calibration', label: 'Calibration', icon: 'fi-rr-chart-line-up' },
  { id: 'docs', label: 'Documentation', icon: 'fi-rr-book-alt' },
];

/** Biomedical Engineer Service Portal: sidebar rail + workspace, backed by the persisted portal store. */
export function PortalShell({ user }: { user: { name: string; email: string } }) {
  const { contact } = useSite();
  const me = user.name;
  const initials = me.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const a11y = useAccessibility();
  const { state, dispatch: rawDispatch, ready } = useEngineerStore(me);
  const [view, setView] = useState<View>('overview');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [fault, setFault] = useState<{ open: boolean; assetId?: string }>({ open: false });
  const [resolving, setResolving] = useState<Ticket | null>(null);
  const [calibrating, setCalibrating] = useState<Asset | null>(null);
  const [palette, setPalette] = useState(false);

  /** Every action confirms itself with a toast. */
  const dispatch = useCallback(
    (a: Action) => {
      rawDispatch(a);
      const msg: Partial<Record<Action['type'], string>> = {
        assign: 'Assigned to you',
        travel: 'You’re en route. The facility has been notified.',
        arrive: 'Marked on site',
        note: 'Note added',
        part: 'Part recorded',
      };
      if ('id' in a && msg[a.type]) toast.success(msg[a.type]!, { description: a.id });
    },
    [rawDispatch],
  );

  const openTicket = useCallback((id: string) => {
    setSheetId(null);
    setTicketId(id);
    setView('tickets');
  }, []);
  const openAsset = useCallback((id: string) => setSheetId(id), []);
  const sheet = state.assets.find((a) => a.id === sheetId) ?? null;

  // ⌘K / Ctrl+K, or "/" when not typing, opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? '');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const counts = {
    tickets: state.tickets.filter((t) => isOpen(t) && (t.status === 'new' || t.engineer === me)).length,
    calibration: state.assets.filter((a) => daysUntil(a.nextCalibration) < 0).length,
  };

  const actions: Command[] = useMemo(
    () => [
      { id: 'a-fault', label: 'Log new equipment fault', icon: 'fi-rr-plus', group: 'Actions', run: () => setFault({ open: true }) },
      ...nav.map((n) => ({ id: `a-${n.id}`, label: `Go to ${n.label}`, icon: n.icon, group: 'Actions' as const, run: () => setView(n.id) })),
    ],
    [],
  );

  const onNotification = (n: Notification) => {
    if (n.ticketId) openTicket(n.ticketId);
    else if (n.assetId) openAsset(n.assetId);
  };

  return (
    <div className="flex min-h-svh bg-midnight text-white">
      {/* Sidebar Rail */}
      <aside className="sticky top-0 hidden h-svh w-[260px] shrink-0 flex-col border-r border-white/10 p-5 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-lg font-semibold tracking-[-0.02em]">Flokefama</span>
          <span className="ml-auto rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[0.875rem] uppercase tracking-widest text-white/60">Service</span>
        </Link>

        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-600 font-semibold">{initials}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{me}</span>
            <span className="block truncate text-xs text-white/65">Biomedical engineer</span>
          </span>
        </div>

        <nav aria-label="Portal" className="mt-8">
          <p className="font-mono text-[0.9375rem] uppercase tracking-widest text-white/60">Workspace</p>
          <ul className="mt-3 space-y-1">
            {nav.map((n) => {
              const badge = n.id === 'tickets' ? counts.tickets : n.id === 'calibration' ? counts.calibration : 0;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => setView(n.id)}
                    aria-current={view === n.id ? 'page' : undefined}
                    className={cn('relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', view === n.id ? 'text-white' : 'text-white/75 hover:bg-white/[0.04] hover:text-white')}
                  >
                    {view === n.id && <motion.span layoutId="rail-active" className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-white/10" />}
                    {view === n.id && <motion.span layoutId="rail-bar" className="absolute -left-5 top-2 h-6 w-[3px] rounded-r bg-brand-500" />}
                    <Icon name={n.icon} className={cn('relative', view === n.id && 'text-brand-400')} />
                    <span className="relative flex-1 text-left">{n.label}</span>
                    {badge > 0 && <span className={cn('relative rounded-full px-1.5 font-mono text-[0.875rem]', n.id === 'calibration' ? 'bg-signal/20 text-white' : 'bg-white/10 text-white/80')}>{badge}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <button onClick={() => setFault({ open: true })} className="mt-6 rounded-2xl border border-dashed border-brand-400/50 px-4 py-4 font-mono text-xs text-brand-300 transition hover:border-brand-400 hover:bg-brand-700/10">
          [ <span className="text-white">+ Log equipment fault</span> ]
        </button>

        <div className="mt-auto space-y-3">
          <button onClick={a11y.open} className="flex items-center gap-2 text-xs text-white/75 hover:text-white"><Icon name="fi-rr-universal-access" className="text-brand-300" /> Accessibility</button>
          <a href={contact.phoneHref} className="flex items-center gap-2 font-mono text-xs text-white/75 hover:text-white">
            <Icon name="fi-rr-phone-call" className="text-brand-400" /> {contact.phone}
          </a>
          <Link href="/" className="flex items-center gap-2 text-xs text-white/75 hover:text-white">
            <Icon name="fi-rr-arrow-small-left" /> Back to flokefama site
          </Link>
          <form action={logout}>
            <button type="submit" className="flex items-center gap-2 text-xs text-white/75 hover:text-white">
              <Icon name="fi-rr-sign-out-alt" /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Workspace */}
      <main id="main" className="min-w-0 flex-1 p-4 md:p-8 xl:p-10">
        {/* Mobile top bar + nav */}
        <div className="mb-5 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2"><LogoMark /><span className="font-semibold">Service Portal</span></Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setFault({ open: true })} className="grid size-10 place-items-center rounded-xl bg-brand-600" aria-label="Log equipment fault"><Icon name="fi-rr-plus" /></button>
            <button onClick={a11y.open} className="grid size-10 place-items-center rounded-xl border border-white/10" aria-label="Accessibility options"><Icon name="fi-rr-universal-access" /></button>
            <form action={logout}>
              <button type="submit" className="grid size-10 place-items-center rounded-xl border border-white/10" aria-label="Sign out"><Icon name="fi-rr-sign-out-alt" /></button>
            </form>
          </div>
        </div>
        <div className="-mx-1 mb-6 flex gap-1 overflow-x-auto px-1 lg:hidden">
          {nav.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined} className={cn('shrink-0 rounded-xl px-3 py-2 text-sm', view === n.id ? 'bg-white/10 text-white' : 'text-white/75')}>
              {n.label}
            </button>
          ))}
        </div>

        <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-mono text-[0.9375rem] uppercase tracking-widest text-white/60">{nav.find((n) => n.id === view)?.label}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">Biomedical Engineer Service Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPalette(true)} className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-left text-sm text-white/60 transition hover:border-white/20 xl:w-72 xl:flex-none">
              <Icon name="fi-rr-search" />
              <span className="flex-1">Search systems, tickets…</span>
              <kbd className="hidden rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[0.875rem] sm:inline">⌘K</kbd>
            </button>
            <Notifications items={state.notifications.filter((n) => n.audience === 'engineer')} onRead={(id) => rawDispatch({ type: 'read', id })} onReadAll={() => rawDispatch({ type: 'readAll', audience: 'engineer' })} onOpen={onNotification} />
          </div>
        </header>

        {!ready ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-36 animate-pulse rounded-[20px] bg-white/[0.04]" />)}
          </div>
        ) : (
          <>
            {view === 'overview' && <Overview state={state} me={me} onOpenTicket={openTicket} onOpenAsset={openAsset} onGo={setView} />}
            {view === 'tickets' && (
              <TicketsView
                state={state}
                me={me}
                selectedId={ticketId}
                onSelect={setTicketId}
                dispatch={dispatch}
                onResolve={setResolving}
                onOpenAsset={openAsset}
                onLogFault={() => setFault({ open: true })}
              />
            )}
            {view === 'systems' && <SystemsView state={state} onOpenAsset={openAsset} />}
            {view === 'calibration' && <CalibrationView state={state} onRecord={setCalibrating} onOpenAsset={openAsset} />}
            {view === 'docs' && (
              <div className="mt-8">
                <Inventory assets={state.assets} tickets={state.tickets} onSelect={(a) => openAsset(a.id)} />
              </div>
            )}
          </>
        )}
      </main>

      <AssetSheet
        asset={sheet}
        tickets={state.tickets}
        onClose={() => setSheetId(null)}
        onLogFault={(assetId) => {
          setSheetId(null);
          setFault({ open: true, assetId });
        }}
        onRecord={(a) => {
          setSheetId(null);
          setCalibrating(a);
        }}
        onOpenTicket={openTicket}
      />
      <LogFaultDialog
        open={fault.open}
        onOpenChange={(open) => setFault((f) => ({ ...f, open }))}
        assets={state.assets}
        defaultAssetId={fault.assetId}
        onSubmit={(v) => {
          const id = nextTicketId(state);
          rawDispatch({ type: 'create', ticket: { assetId: v.assetId, description: v.description, priority: v.priority }, assignToMe: v.assignToMe });
          toast.success(`${id} logged`, { description: v.assignToMe ? 'Assigned to you and added to your queue.' : 'Added to the unassigned queue.' });
          setTicketId(id);
          setView('tickets');
        }}
      />
      <ResolveDialog
        ticket={resolving}
        onOpenChange={(v) => !v && setResolving(null)}
        onSubmit={({ summary, calibrated }) => {
          if (!resolving) return;
          rawDispatch({ type: 'resolve', id: resolving.id, summary, calibrated });
          toast.success(`${resolving.id} resolved`, { description: calibrated ? 'Service report sent and calibration certificate issued.' : 'Service report sent to the facility.' });
          setResolving(null);
        }}
      />
      <CalibrationDialog
        asset={calibrating}
        onOpenChange={(v) => !v && setCalibrating(null)}
        onSubmit={({ result, notes }) => {
          if (!calibrating) return;
          rawDispatch({ type: 'calibrate', assetId: calibrating.id, result, notes });
          toast.success('Certificate issued', { description: `${calibrating.name} · next due in ${calibrating.intervalMonths} months` });
          setCalibrating(null);
        }}
      />
      <CommandPalette open={palette} onOpenChange={setPalette} state={state} actions={actions} onOpenTicket={openTicket} onOpenAsset={openAsset} />
    </div>
  );
}
