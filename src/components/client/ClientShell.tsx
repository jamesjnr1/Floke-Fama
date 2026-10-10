'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CertificatesView } from '@/components/client/CertificatesView';
import { EquipmentSheet, RequestDialog, type CatalogueItem } from '@/components/client/dialogs';
import { EquipmentView } from '@/components/client/EquipmentView';
import { OrdersView } from '@/components/client/OrdersView';
import { Overview } from '@/components/client/Overview';
import { RequestsView } from '@/components/client/RequestsView';
import { LogoMark, LogoWordmark } from '@/components/layout/logo';
import { AlertsBanner, AlertsSwitch, useNotificationPopups } from '@/components/service/alerts';
import { Notifications } from '@/components/service/Notifications';
import { useAccessibility } from '@/components/layout/accessibility';
import { Icon } from '@/components/ui/icon';
import { LogoChanger } from '@/components/client/logo-changer';
import { useSite } from '@/components/site-provider';
import { logout } from '@/lib/auth/actions';
import { needsInstallation } from '@/lib/installation';
import { useOrders } from '@/lib/orders';
import { isOpen, nextTicketId, useServiceStore, type Action, type Notification } from '@/lib/service/store';
import { cn } from '@/lib/utils';

/** "AUTO HEAMATOLOGY ANALYZER BC5150" → "Auto Heamatology Analyzer BC5150" (model codes stay upper case). */
const tidyName = (n: string) => n.split(/(\s+|[()])/).map((w) => (/\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('');

type View = 'overview' | 'requests' | 'equipment' | 'certificates' | 'orders';
const nav: { id: View; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'fi-rr-apps' },
  { id: 'requests', label: 'Service requests', icon: 'fi-rr-clipboard-list' },
  { id: 'equipment', label: 'Equipment', icon: 'fi-rr-microscope' },
  { id: 'certificates', label: 'Certificates', icon: 'fi-rr-badge-check' },
  { id: 'orders', label: 'Orders', icon: 'fi-rr-box-open' },
];

/** Hospital dashboard (Flokefama Care): the facility's service desk, equipment, certificates and orders. */
export function ClientShell({ user, products }: { user: { name: string; email: string; facility?: string }; products: CatalogueItem[] }) {
  const { contact } = useSite();
  const facility = user.facility ?? user.name;
  const orders = useOrders(user.email);
  const actor = useMemo(() => ({ name: user.name, role: 'client' as const, facility }), [user.name, facility]);
  const a11y = useAccessibility();
  const { state, dispatch: rawDispatch, ready, remote } = useServiceStore(actor);
  const [view, setView] = useState<View>('overview');
  // Deep links such as /portal?view=orders (from checkout)
  useEffect(() => {
    const v = new URLSearchParams(location.search).get('view');
    if (v && nav.some((n) => n.id === v)) setView(v as View);
  }, []);
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
  const onNotification = useCallback((n: Notification) => (n.ticketId ? openTicket(n.ticketId) : n.assetId ? openAsset(n.assetId) : undefined), [openTicket, openAsset]);
  useNotificationPopups(notifications, ready, onNotification);

  // Opened from an alert: /portal?ticket=TK-1043 or ?asset=AS-…
  useEffect(() => {
    if (!ready) return;
    const q = new URLSearchParams(location.search);
    const t = q.get('ticket');
    const a = q.get('asset');
    if (t) openTicket(t);
    else if (a) openAsset(a);
    if (t || a) history.replaceState(null, '', '/portal');
  }, [ready, openTicket, openAsset]);
  const openCount = tickets.filter(isOpen).length;
  const installed = useMemo(() => assets.filter((a) => !a.installation), [assets]);
  const request = (assetId?: string) => {
    if (installed.length === 0)
      toast(assets.length ? 'Your equipment is being installed' : 'No equipment yet', {
        description: assets.length
          ? 'You can request service once our engineers have installed and commissioned it.'
          : 'Equipment you buy from Flokefama appears here automatically. Already own Flokefama equipment? Call us to add it.',
      });
    else setRequesting({ open: true, assetId });
  };

  // Behind the scenes: every order placed at checkout becomes this facility's equipment (done by the server when
  // it keeps the service desk; here only when the desk lives in this browser). Systems that need an
  // engineer (analysers, ultrasound, monitors…) await installation; the rest is ready to use on delivery.
  // Consumables are skipped. Each order is registered once.
  useEffect(() => {
    if (!ready || remote) return;
    for (const o of orders) {
      if (state.purchases?.includes(o.reference)) continue;
      const items = o.items.flatMap((x) => {
        const p = products.find((c) => c.slug === x.slug);
        return p && p.category !== 'consumables' ? [{ slug: p.slug, name: tidyName(p.name), brand: p.brand, image: p.image, qty: x.qty, install: needsInstallation(p) }] : [];
      });
      rawDispatch({ type: 'purchase', order: o.reference, facility, items });
    }
  }, [ready, remote, orders, state.purchases, products, facility, rawDispatch]);

  return (
    <div className="flex min-h-svh bg-[#f5f6f4] text-ink">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-svh w-[264px] shrink-0 flex-col bg-[linear-gradient(180deg,#00804f_0%,#006b42_55%,#005a38_100%)] text-white lg:flex">
        <Link href="/" aria-label="Flokefama home" className="flex h-[76px] items-center gap-1.5 border-b border-white/15 px-6">
          <LogoMark />
          <LogoWordmark className="h-[17px] text-white" />
          <span className="ml-auto text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-white/80">Care</span>
        </Link>
        <div className="flex items-center gap-3 px-6 py-6">
          <LogoChanger facility={facility} className="size-10 rounded-md" fallbackClassName="bg-white text-sm text-[#006b42]">
            <p className="text-sm font-semibold leading-snug">{facility}</p>
            <p className="truncate text-xs text-white/75">{user.name}</p>
          </LogoChanger>
        </div>
        <nav aria-label="Client portal" className="px-3">
          <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/60">Menu</p>
          <ul className="space-y-0.5">
            {nav.map((n) => {
              const on = view === n.id;
              const count = n.id === 'orders' ? orders.length : n.id === 'requests' ? openCount : 0;
              return (
                <li key={n.id}>
                  <button
                    onClick={() => setView(n.id)}
                    aria-current={on ? 'page' : undefined}
                    className={cn('relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition', on ? 'bg-white/[0.16] font-semibold text-white' : 'text-white/80 hover:bg-white/[0.08] hover:text-white')}
                  >
                    {on && <motion.span layoutId="client-rail" className="absolute inset-y-2 left-0 w-[3px] rounded-r-[2px] bg-white" />}
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
          <button onClick={() => request()} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-[#006b42] shadow-[0_10px_24px_-14px_rgb(0_0_0/0.5)] transition hover:bg-[#eefaf3]">
            <Icon name="fi-rr-wrench-simple" /> Request service
          </button>
        </div>
        <div className="mt-auto border-t border-white/15 px-6 py-5 text-[0.8125rem]">
          <div className="space-y-2.5">
            <a href={contact.phoneHref} className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-phone-call" /> {contact.phone}</a>
            <AlertsSwitch className="text-white/80 hover:text-white" />
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
            <p className="hidden truncate text-xs text-ink-3 sm:block">{facility} <span className="text-ink-3/50">/</span> Dashboard</p>
            <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-ink">{nav.find((n) => n.id === view)?.label}</h1>
          </div>
          <button onClick={() => request()} className="hidden h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-[#006b42] sm:inline-flex lg:hidden">
            <Icon name="fi-rr-wrench-simple" /> Request service
          </button>
          <Notifications tone="light" items={notifications} onRead={(id) => rawDispatch({ type: 'read', id })} onReadAll={() => rawDispatch({ type: 'readAll', audience: 'client' })} onOpen={onNotification} />
          <span className="hidden items-center gap-3 border-l border-line pl-4 md:flex">
            <LogoChanger facility={facility} className="size-9 rounded-md" fallbackClassName="bg-white text-xs text-[#006b42] ring-1 ring-inset ring-line" />
            <span className="leading-tight">
              <span className="block text-sm font-medium text-ink">{user.name}</span>
              <span className="block text-xs text-ink-3">{user.email}</span>
            </span>
          </span>
          <button onClick={a11y.open} aria-label="Accessibility options" className="grid size-10 place-items-center rounded-md border border-line bg-paper text-ink lg:hidden"><Icon name="fi-rr-universal-access" /></button>
          <form action={logout} className="lg:hidden">
            <button type="submit" aria-label="Sign out" className="grid size-10 place-items-center rounded-md border border-line bg-paper text-ink"><Icon name="fi-rr-sign-out-alt" /></button>
          </form>
        </header>

        {/* Mobile nav */}
        <nav aria-label="Client portal sections" className="flex gap-5 overflow-x-auto border-b border-line bg-paper px-4 lg:hidden">
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
              {view === 'overview' && <AlertsBanner what="your engineer’s visits and updates" />}
              {view === 'overview' && <Overview name={user.name} facility={facility} orders={orders.length} assets={assets} tickets={tickets} onOpenTicket={openTicket} onOpenAsset={openAsset} onRequest={() => request()} onGo={setView} />}
              {view === 'requests' && <RequestsView assets={assets} tickets={tickets} selectedId={ticketId} onSelect={setTicketId} onRequest={() => request()} dispatch={dispatch} />}
              {view === 'equipment' && <EquipmentView assets={assets} tickets={tickets} onOpenAsset={openAsset} />}
              {view === 'certificates' && <CertificatesView assets={assets} onOpenAsset={openAsset} />}
              {view === 'orders' && <OrdersView orders={orders} />}
            </>
          )}
        </div>
        {/* Mobile: floating request button */}
        <button onClick={() => request()} className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-md bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(11_21_16/0.35)] sm:hidden">
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
        assets={installed}
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
