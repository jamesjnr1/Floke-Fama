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
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { useAccessibility } from '@/components/layout/accessibility';
import { Icon } from '@/components/ui/icon';
import { useSite } from '@/components/site-provider';
import { logout } from '@/lib/auth/actions';
import { daysUntil, isOpen, nextTicketId, useEngineerStore, type Action, type Asset, type Notification, type Ticket } from '@/lib/service/store';
import { cn } from '@/lib/utils';

type View = 'overview' | 'tickets' | 'systems' | 'calibration' | 'docs';
const nav: { id: View; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'fi-rr-apps' },
  { id: 'tickets', label: 'Service requests', icon: 'fi-rr-clipboard-list' },
  { id: 'systems', label: 'Equipment', icon: 'fi-rr-microscope' },
  { id: 'calibration', label: 'Calibration', icon: 'fi-rr-badge-check' },
  { id: 'docs', label: 'Documents', icon: 'fi-rr-book-alt' },
];

type Theme = 'light' | 'dark';
const THEME_KEY = 'ff-eng-theme';

/**
 * Light (default) or dark mode for the engineer portal, remembered in this browser. The choice is set on
 * <html> (data-eng-theme), so dialogs, which render outside the portal, follow it too. The engineer layout
 * applies a saved dark choice before the page paints.
 */
function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');
  useEffect(() => {
    try {
      if (localStorage.getItem(THEME_KEY) === 'dark') setTheme('dark');
    } catch {
      /* storage blocked: stay light */
    }
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.dataset.engTheme = 'dark';
    else delete root.dataset.engTheme;
    return () => {
      delete root.dataset.engTheme;
    };
  }, [theme]);
  const toggle = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* not remembered */
      }
      return next;
    });
  return { theme, toggle };
}

/** Biomedical Engineer Service Portal: the same layout as the hospital dashboard, backed by the shared service desk. */
export function PortalShell({ user }: { user: { name: string; email: string } }) {
  const { contact } = useSite();
  const me = user.name;
  const initials = me.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const a11y = useAccessibility();
  const { theme, toggle } = useTheme();
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
  const logFault = useCallback(() => {
    if (state.assets.length === 0) toast('No equipment yet', { description: 'Faults are logged against installed equipment. Systems appear here once hospitals buy them.' });
    else setFault({ open: true });
  }, [state.assets.length]);

  // Ctrl+K / ⌘K, or "/" when not typing, opens search
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

  const counts: Partial<Record<View, number>> = {
    tickets: state.tickets.filter((t) => isOpen(t) && (t.status === 'new' || t.engineer === me)).length,
    calibration: state.assets.filter((a) => !a.installation && daysUntil(a.nextCalibration) < 0).length,
  };

  const actions: Command[] = useMemo(
    () => [
      { id: 'a-fault', label: 'Log equipment fault', icon: 'fi-rr-plus', group: 'Actions', run: logFault },
      ...nav.map((n) => ({ id: `a-${n.id}`, label: `Go to ${n.label}`, icon: n.icon, group: 'Actions' as const, run: () => setView(n.id) })),
    ],
    [logFault],
  );

  const onNotification = (n: Notification) => {
    if (n.ticketId) openTicket(n.ticketId);
    else if (n.assetId) openAsset(n.assetId);
  };

  const themeButton = (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-paper text-ink transition hover:border-ink/30"
    >
      <Icon name={theme === 'dark' ? 'fi-rr-sun' : 'fi-rr-moon'} />
    </button>
  );

  return (
    <div className="eng-page flex min-h-svh text-ink">
      {/* Sidebar */}
      <aside className="eng-rail sticky top-0 hidden h-svh w-[264px] shrink-0 flex-col text-white lg:flex">
        <Link href="/" aria-label="Flokefama home" className="flex h-[76px] items-center gap-1.5 border-b border-white/15 px-6">
          <LogoMark />
          <LogoWordmark className="h-[17px] text-white" />
          <span className="ml-auto text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-white/80">Service</span>
        </Link>
        <div className="flex items-center gap-3 px-6 py-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-sm font-semibold text-[#006b42]">{initials}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{me}</span>
            <span className="block truncate text-xs text-white/75">Biomedical engineer</span>
          </span>
        </div>
        <nav aria-label="Engineer portal" className="px-3">
          <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/60">Menu</p>
          <ul className="space-y-0.5">
            {nav.map((n) => {
              const on = view === n.id;
              const count = counts[n.id] ?? 0;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => setView(n.id)}
                    aria-current={on ? 'page' : undefined}
                    className={cn('relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition', on ? 'bg-white/[0.16] font-semibold text-white' : 'text-white/80 hover:bg-white/[0.08] hover:text-white')}
                  >
                    {on && <motion.span layoutId="eng-rail" className="absolute inset-y-2 left-0 w-[3px] rounded-r-[2px] bg-white" />}
                    <Icon name={n.icon} className={on ? 'text-white' : 'text-white/70'} />
                    <span className="flex-1 text-left">{n.label}</span>
                    {count > 0 && <span className="font-mono text-xs tabular-nums text-white/75">{count}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="px-6 pt-6">
          <button onClick={logFault} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-[#006b42] shadow-[0_10px_24px_-14px_rgb(0_0_0/0.5)] transition hover:bg-[#eefaf3]">
            <Icon name="fi-rr-plus" /> Log equipment fault
          </button>
        </div>
        <div className="mt-auto border-t border-white/15 px-6 py-5 text-[0.8125rem]">
          <div className="space-y-2.5">
            <a href={contact.phoneHref} className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-phone-call" /> {contact.phone}</a>
            <button onClick={a11y.open} className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-universal-access" /> Accessibility</button>
            <Link href="/" className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-arrow-small-left" /> Flokefama website</Link>
            <form action={logout}>
              <button type="submit" className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-sign-out-alt" /> Sign out</button>
            </form>
          </div>
        </div>
      </aside>

      <main id="main" className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-3 border-b border-line bg-paper px-4 md:px-10">
          <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Flokefama home"><LogoMark /></Link>
          <div className="min-w-0 flex-1">
            <p className="hidden truncate text-xs text-ink-3 sm:block">Flokefama Service <span className="text-ink-3/50">/</span> Engineer portal</p>
            <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-ink">{nav.find((n) => n.id === view)?.label}</h1>
          </div>
          <button onClick={() => setPalette(true)} className="hidden h-10 w-56 items-center gap-2 rounded-md border border-line bg-paper px-3 text-left text-sm text-ink-3 transition hover:border-ink/30 xl:flex">
            <Icon name="fi-rr-search" />
            <span className="flex-1 truncate whitespace-nowrap">Search…</span>
            <kbd className="rounded-[4px] border border-line px-1.5 font-mono text-xs">Ctrl K</kbd>
          </button>
          <button onClick={() => setPalette(true)} aria-label="Search" className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-paper text-ink xl:hidden"><Icon name="fi-rr-search" /></button>
          {themeButton}
          <Notifications tone="light" items={state.notifications.filter((n) => n.audience === 'engineer')} onRead={(id) => rawDispatch({ type: 'read', id })} onReadAll={() => rawDispatch({ type: 'readAll', audience: 'engineer' })} onOpen={onNotification} />
          <span className="hidden items-center gap-3 border-l border-line pl-4 md:flex">
            <span className="grid size-9 place-items-center rounded-md bg-brand-600 text-xs font-semibold text-white">{initials}</span>
            <span className="leading-tight">
              <span className="block text-sm font-medium text-ink">{me}</span>
              <span className="block text-xs text-ink-3">{user.email}</span>
            </span>
          </span>
          <form action={logout} className="lg:hidden">
            <button type="submit" aria-label="Sign out" className="grid size-10 place-items-center rounded-md border border-line bg-paper text-ink"><Icon name="fi-rr-sign-out-alt" /></button>
          </form>
        </header>

        {/* Mobile nav */}
        <nav aria-label="Engineer portal sections" className="flex gap-5 overflow-x-auto border-b border-line bg-paper px-4 lg:hidden">
          {nav.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} aria-current={view === n.id ? 'page' : undefined} className={cn('-mb-px shrink-0 border-b-2 py-3 text-sm', view === n.id ? 'border-ink font-semibold text-ink' : 'border-transparent text-ink-3')}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="mx-auto max-w-[1360px] p-4 md:p-10">
          {!ready ? (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-mist" />)}</div>
          ) : (
            <>
              {view === 'overview' && <Overview state={state} me={me} onOpenTicket={openTicket} onOpenAsset={openAsset} onGo={setView} onLogFault={logFault} />}
              {view === 'tickets' && (
                <TicketsView state={state} me={me} selectedId={ticketId} onSelect={setTicketId} dispatch={dispatch} onResolve={setResolving} onOpenAsset={openAsset} onLogFault={logFault} />
              )}
              {view === 'systems' && <SystemsView state={state} onOpenAsset={openAsset} />}
              {view === 'calibration' && <CalibrationView state={state} onRecord={setCalibrating} onOpenAsset={openAsset} />}
              {view === 'docs' && <Inventory assets={state.assets} tickets={state.tickets} onSelect={(a) => openAsset(a.id)} />}
            </>
          )}
        </div>
        {/* Mobile: floating log-fault button */}
        <button onClick={logFault} className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-md bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(11_21_16/0.35)] sm:hidden">
          <Icon name="fi-rr-plus" /> Log fault
        </button>
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
