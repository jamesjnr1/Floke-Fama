'use client';

import Link from 'next/link';
import { LayoutGroup, motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LogoMark } from '@/components/layout/logo';
import { AssetStatusList } from '@/components/portal/AssetStatusList';
import { AssetSheet, Inventory } from '@/components/portal/inventory';
import { LogFaultButton, RadialUptime } from '@/components/portal/QuickActions';
import { Sparkline } from '@/components/portal/Sparkline';
import { statusMeta } from '@/components/portal/status';
import { TimelineTracker } from '@/components/portal/TimelineTracker';
import { Icon } from '@/components/ui/icon';
import { assets, demoFacility, demoUptime, tickets as seedTickets, type Asset, type Ticket } from '@/data/portal-demo';
import { contact } from '@/data/seed';
import { cn } from '@/lib/utils';

type View = 'tracker' | 'pulse' | 'docs';
const nav: { id: View; label: string; icon: string }[] = [
  { id: 'tracker', label: 'Service Tracker', icon: 'fi-rr-headset' },
  { id: 'pulse', label: 'System Pulse', icon: 'fi-rr-heart-rate' },
  { id: 'docs', label: 'Documentation', icon: 'fi-rr-book-alt' },
];

function announceDispatch(t: Ticket) {
  if (!t.engineer) return;
  toast(`Biomedical Engineer ${t.engineer.name} has departed ${t.engineer.hub} for your facility.`, {
    description: `${t.id} · ${t.title}${t.engineer.eta ? ` · ETA ${t.engineer.eta}` : ''}`,
    icon: <Icon name="fi-rr-truck-side" className="text-neon-600" />,
    duration: 7000,
  });
}

/** Portal Shell: fixed sidebar rail + dashboard workspace on the midnight canvas. */
export function PortalShell() {
  const [view, setView] = useState<View>('tracker');
  const [tickets, setTickets] = useState(seedTickets);
  const [selectedId, setSelectedId] = useState(seedTickets[0].id);
  const [query, setQuery] = useState('');
  const [sheet, setSheet] = useState<Asset | null>(null);
  const [unread, setUnread] = useState(true);

  // Demo: the coordinator dispatches an engineer shortly after sign-in.
  useEffect(() => {
    const id = setTimeout(() => announceDispatch(seedTickets[1]), 2200);
    return () => clearTimeout(id);
  }, []);

  const q = query.trim().toLowerCase();
  const visibleAssets = useMemo(() => assets.filter((a) => !q || `${a.name} ${a.location} ${a.brand}`.toLowerCase().includes(q)), [q]);
  const visibleTickets = tickets.filter((t) => !q || `${t.id} ${t.title}`.toLowerCase().includes(q));
  const selected = tickets.find((t) => t.id === selectedId) ?? tickets[0];

  /** Coordinator demo: complete the active step. Completing "Engineer assigned" dispatches someone. */
  const advance = (t: Ticket) => {
    if (t.current >= t.steps.length) return;
    const next: Ticket = { ...t, current: t.current + 1 };
    if (t.current === 1) {
      const engineer = t.engineer ?? { name: 'Ama K.', hub: 'Korle-Bu branch', eta: '30 mins' };
      next.engineer = engineer;
      next.steps = t.steps.map((s, i) => (i === 1 ? { ...s, detail: `${engineer.name} · ${engineer.hub}` } : s));
      announceDispatch(next);
    } else if (next.current >= t.steps.length) {
      next.engineer = t.engineer && { ...t.engineer, eta: undefined };
      toast.success(`${t.id} resolved`, { description: 'Service report and calibration record added to Documentation.' });
    } else if (next.engineer) {
      next.engineer = { ...next.engineer, eta: 'On site' };
    }
    setTickets((all) => all.map((x) => (x.id === t.id ? next : x)));
  };

  const create = (t: Ticket) => {
    setTickets((all) => [t, ...all]);
    setSelectedId(t.id);
    toast.success(`${t.id} logged`, { description: 'A coordinator will assign the nearest engineer.' });
  };

  return (
    <div className="flex min-h-svh bg-midnight text-white">
      {/* Sidebar Rail (260px) */}
      <aside className="sticky top-0 hidden h-svh w-[260px] shrink-0 flex-col border-r border-white/10 p-5 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark />
          <span className="text-lg font-semibold tracking-[-0.02em]">Flokefama</span>
          <span className="ml-auto rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white/40">Care</span>
        </Link>

        {/* Profile Block */}
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
          <span className="grid size-10 place-items-center rounded-xl bg-neon-600 font-semibold">{demoFacility.initials}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{demoFacility.name}</span>
            <span className="block truncate text-xs text-white/45">{demoFacility.user}</span>
          </span>
        </div>

        {/* Nav Stack */}
        <nav aria-label="Portal" className="mt-8">
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/35">Workspace</p>
          <ul className="mt-3 space-y-1">
            {nav.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => setView(n.id)}
                  aria-current={view === n.id ? 'page' : undefined}
                  className={cn('relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', view === n.id ? 'text-white' : 'text-white/55 hover:bg-white/[0.04] hover:text-white')}
                >
                  {view === n.id && <motion.span layoutId="rail-active" className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-white/10" />}
                  {view === n.id && <motion.span layoutId="rail-bar" className="absolute -left-5 top-2 h-6 w-[3px] rounded-r bg-neon-500" />}
                  <Icon name={n.icon} className={cn('relative', view === n.id && 'text-neon-400')} />
                  <span className="relative">{n.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto space-y-3">
          <p className="rounded-xl bg-amber-400/10 px-3 py-2 text-xs text-amber-200 ring-1 ring-amber-300/20">Demo data: fictional facility and engineers.</p>
          <a href={contact.phoneHref} className="flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white">
            <Icon name="fi-rr-phone-call" className="text-neon-400" /> {contact.phone}
          </a>
          <Link href="/" className="flex items-center gap-2 text-xs text-white/50 hover:text-white">
            <Icon name="fi-rr-arrow-small-left" /> Back to flokefama site
          </Link>
        </div>
      </aside>

      {/* Dashboard Workspace */}
      <main id="main" className="min-w-0 flex-1 p-4 md:p-8 xl:p-10">
        {/* Mobile top bar + nav */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2"><LogoMark /><span className="font-semibold">Flokefama Care</span></Link>
          <span className="rounded-md bg-amber-400/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-200">Demo</span>
        </div>
        <div className="-mx-1 mb-6 flex gap-1 overflow-x-auto px-1 lg:hidden">
          {nav.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)} className={cn('shrink-0 rounded-xl px-3 py-2 text-sm', view === n.id ? 'bg-white/10 text-white' : 'text-white/55')}>
              {n.label}
            </button>
          ))}
        </div>

        {/* Portal Header */}
        <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">{nav.find((n) => n.id === view)?.label}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">Biomedical Engineer Service Portal</h1>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 focus-within:border-neon-500 xl:w-72 xl:flex-none">
              <Icon name="fi-rr-search" className="text-white/40" />
              <span className="sr-only">Search systems and tickets</span>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search systems, tickets…" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
            </label>
            <button
              aria-label={unread ? 'Notifications (1 unread)' : 'Notifications'}
              onClick={() => {
                setUnread(false);
                announceDispatch(tickets.find((t) => t.engineer?.eta && t.engineer.eta !== 'On site') ?? seedTickets[1]);
              }}
              className="relative grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/10"
            >
              <Icon name="fi-rr-bell" />
              {unread && <span className="status-dot absolute right-2.5 top-2.5 !bg-neon-400" aria-hidden />}
            </button>
          </div>
        </header>

        {view === 'tracker' && (
          <LayoutGroup>
            {/* 3-Column Command Matrix */}
            <div className="mt-8 grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
              <section aria-labelledby="status-h" className="min-w-0 xl:max-h-[calc(100svh-170px)] xl:overflow-y-auto">
                <h2 id="status-h" className="mb-4 font-mono text-[11px] uppercase tracking-widest text-white/40">System status</h2>
                <AssetStatusList assets={visibleAssets} onSelect={setSheet} />
              </section>

              <section aria-labelledby="tickets-h" className="min-w-0">
                <h2 id="tickets-h" className="mb-4 font-mono text-[11px] uppercase tracking-widest text-white/40">Active service tickets</h2>
                <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1">
                  {visibleTickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={cn('relative shrink-0 rounded-xl px-3.5 py-2 text-left text-xs transition', selected?.id === t.id ? 'text-white' : 'text-white/50 hover:text-white')}
                    >
                      {selected?.id === t.id && <motion.span layoutId="ticket-pill" className="absolute inset-0 rounded-xl bg-white/[0.08] ring-1 ring-white/15" />}
                      <span className="relative font-mono">{t.id}</span>
                      <span className="relative ml-2 hidden sm:inline">{t.title.split(':')[0]}</span>
                    </button>
                  ))}
                </div>
                {selected && <TimelineTracker ticket={selected} asset={assets.find((a) => a.id === selected.assetId)} onAdvance={() => advance(selected)} />}
              </section>

              <section aria-label="Quick actions" className="min-w-0 space-y-4">
                <h2 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-white/40">Quick actions</h2>
                <LogFaultButton assets={assets} onCreate={create} />
                <RadialUptime value={demoUptime} label="Installed fleet · last 30 days (demo)" />
              </section>
            </div>
          </LayoutGroup>
        )}

        {view === 'pulse' && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleAssets.map((a) => {
              const s = statusMeta[a.status];
              return (
                <button key={a.id} onClick={() => setSheet(a)} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-left transition hover:border-white/15">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-white/45"><span className={s.dot} /> {s.label}</span>
                    <span className="font-mono text-[11px] text-white/35">{a.id}</span>
                  </div>
                  <p className="mt-4 text-lg font-semibold">{a.name}</p>
                  <p className="text-sm text-white/45">{a.location}</p>
                  <Sparkline values={a.readings} tone={s.tone} className="mt-5 h-16 w-full" />
                  <p className="mt-3 text-xs text-white/40">Next calibration {a.nextCalibration}</p>
                </button>
              );
            })}
          </div>
        )}

        {view === 'docs' && (
          <div className="mt-8">
            <Inventory assets={visibleAssets} onSelect={setSheet} />
          </div>
        )}
      </main>

      <AssetSheet asset={sheet} onClose={() => setSheet(null)} />
    </div>
  );
}
