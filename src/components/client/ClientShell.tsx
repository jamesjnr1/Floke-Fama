'use client';

import { HospitalCode } from '@/components/service/hospital-code';
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
import { TextsSwitch } from '@/components/client/texts-switch';
import { Hint } from '@/components/ui/hint';
import { Notifications } from '@/components/service/Notifications';
import { EngineerPhotosProvider } from '@/components/service/engineer-photos';
import { LiveStatus } from '@/components/service/live-status';
import { Icon } from '@/components/ui/icon';
import { useTour, type TourStep } from '@/components/service/tour';
import { restartDemo } from '@/lib/demo';
import { DemoGuide } from '@/components/demo-guide';
import { LogoChanger } from '@/components/client/logo-changer';
import { useSite } from '@/components/site-provider';
import { logout } from '@/lib/auth/actions';
import { needsInstallation } from '@/lib/installation';
import { useOrders } from '@/lib/orders';
import { isOpen, nextTicketId, useServiceStore, type Action, type Notification } from '@/lib/service/store';
import { cn } from '@/lib/utils';
import { CONSUMABLES } from '@/lib/categories';

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
export function ClientShell({ user, products, demo = false }: { user: { name: string; email: string; facility?: string; phone?: string }; products: CatalogueItem[]; /** The demo (lib/demo.ts): the sample desk in this browser. */ demo?: boolean }) {
  const { contact } = useSite();
  const facility = user.facility ?? user.name;
  const orders = useOrders(user.email);
  const actor = useMemo(() => ({ name: user.name, role: 'client' as const, facility }), [user.name, facility]);
  const { state, dispatch: rawDispatch, ready, remote, syncedAt, queued, failing } = useServiceStore(actor, { demo });
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
  // First visit: a guided tour of the buttons (again from “Take the tour”)
  const tourSteps = useMemo<TourStep[]>(() => [
    { title: `Welcome to ${facility}’s dashboard`, text: 'This short tour shows the buttons you will use. It takes about a minute, and you can take it again any time from “Take the tour”.', before: () => setView('overview') },
    { target: 'request', title: 'Request service', text: 'Something not working? Press here, choose the machine, describe the problem and say how urgent it is. An engineer is assigned, and you get a text with their name and phone number.' },
    { target: 'nav', title: 'The menu', text: 'Overview, your Service requests, your Equipment, Certificates (calibration) and your Orders.' },
    { target: 'stats', title: 'At a glance', text: 'Open requests, your equipment and what needs attention, services due and orders. Tap a box to see more.', before: () => setView('overview') },
    { target: 'view-requests', title: 'Follow each request live', text: 'Every request shows where it stands: Logged → Engineer assigned → On the way → On site → Fixed. You can send the engineer a message, and rate the visit when it’s fixed.', before: () => setView('requests') },
    { target: 'view-equipment', title: 'Your equipment', text: 'Every machine with its status and next service date. Tap one for its history, documents and to request service for it.', before: () => setView('equipment') },
    { target: 'view-certificates', title: 'Certificates', text: 'Calibration certificates for each machine, ready to download and print for inspections.', before: () => setView('certificates') },
    { target: 'bell', title: 'Alerts', text: 'Engineer assigned, on the way, fixed, services due. A red number means something new.', before: () => setView('overview') },
    { title: 'You’re ready', text: demo ? 'Try it: press Request service on a machine, then open the engineer portal in another tab and see the request arrive.' : `Need help? Call us on ${contact.phone}. You can take this tour again from “Take the tour”.`, before: () => setView('overview') },
  ], [facility, demo, contact.phone]);
  const tour = useTour(demo ? 'hospital-demo' : 'hospital', tourSteps, { ready });

  const request = (assetId?: string) => {
    if (installed.length === 0)
      toast(assets.length ? 'Your equipment is being installed' : 'No equipment yet', {
        description: assets.length
          ? 'You can request service once our engineers have installed and commissioned it.'
          : 'Equipment you buy from Flokefama appears here automatically. Something not working now? Report it on the Support page, for any machine.',
        // No machine on record yet: the Support page's form takes a fault on any machine, so the hospital is never stuck
        ...(assets.length ? {} : { action: { label: 'Report a fault', onClick: () => location.assign('/support#request') }, duration: 10000 }),
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
        return p && p.category !== CONSUMABLES ? [{ slug: p.slug, name: tidyName(p.name), brand: p.brand, image: p.image, qty: x.qty, install: needsInstallation(p) }] : [];
      });
      rawDispatch({ type: 'purchase', order: o.reference, facility, items });
    }
  }, [ready, remote, orders, state.purchases, products, facility, rawDispatch]);

  return (
    <EngineerPhotosProvider>
    <div className="flex min-h-svh bg-[#f5f6f4] pt-10 text-ink">
      {/* Sidebar */}
      <aside className="sticky top-10 hidden h-[calc(100svh-2.5rem)] w-[264px] shrink-0 flex-col bg-[linear-gradient(180deg,#00804f_0%,#006b42_55%,#005a38_100%)] text-white lg:flex">
        <Link href="/" aria-label="Flokefama home" className="flex h-[76px] items-center gap-1.5 border-b border-white/15 px-6">
          <LogoMark />
          <LogoWordmark className="h-[17px] text-white" />
          <span className="ml-auto text-[0.8125rem] font-semibold uppercase tracking-[0.18em] text-white/80">Care</span>
        </Link>
        <div className="flex items-center gap-3 px-6 py-6">
          {demo ? (
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">{facility}</p>
              <p className="truncate text-xs text-white/75">{user.name}</p>
            </div>
          ) : (
            <LogoChanger facility={facility} className="size-10 rounded-full" fallbackClassName="bg-white text-lg text-[#006b42]">
              <p className="text-sm font-semibold leading-snug">{facility}</p>
              <p className="truncate text-xs text-white/75">{user.name}</p>
              {/* The hospital's own code (FLK-H001), to quote when calling Flokefama */}
              <HospitalCode name={facility} className="mt-1 bg-white/15 text-white" />
            </LogoChanger>
          )}
        </div>
        <nav aria-label="Client portal" data-tour="nav" className="px-3">
          <p className="px-3 pb-2 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-white/60">Menu</p>
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
          <button data-tour="request" onClick={() => request()} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-white text-sm font-semibold text-[#006b42] shadow-[0_10px_24px_-14px_rgb(0_0_0/0.5)] transition hover:bg-[#eefaf3]">
            <Icon name="fi-rr-wrench-simple" /> Request service
          </button>
        </div>
        <div className="mt-auto border-t border-white/15 px-6 py-5 text-[0.8125rem]">
          <div className="space-y-2.5">
            <a href={contact.phoneHref} className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-phone-call" /> {contact.phone}</a>
            {!demo && <AlertsSwitch className="text-white/80 hover:text-white" />}
            {!demo && (
              <span className="flex items-center gap-2">
                <TextsSwitch className="text-white/80 hover:text-white" />
                <Hint onDark>
                  Our check-ins after a repair, calibration reminders and a few greetings a year. Texts about your own service requests (engineer assigned, fixed) always come, to the number you give with each request.
                </Hint>
              </span>
            )}
            <button type="button" onClick={tour.start} className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-map-marker" /> Take the tour</button>
            <Link href="/" className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-arrow-small-left" /> Flokefama website</Link>
            {!demo && <Link href="/portal/password" className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-lock" /> Change password</Link>}
            <form action={logout}>
              <button type="submit" className="flex items-center gap-2.5 text-white/80 hover:text-white"><Icon name="fi-rr-sign-out-alt" /> Sign out</button>
            </form>
          </div>
        </div>
      </aside>

      <main id="main" className="min-w-0 flex-1">
        {/* The demo: always visible, so the samples are never mistaken for real requests */}
        {demo && (
          <div role="status" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-[#7c4a00] px-4 py-2 text-center text-sm text-white">
            <span><b className="font-semibold">Demo.</b> A made-up hospital, kept in this browser only: nothing is saved to the real system and no one is texted.</span>
            <button type="button" onClick={restartDemo} className="rounded-md bg-white/15 px-3 py-1 font-semibold hover:bg-white/25">Start again</button>
          </div>
        )}
        {/* Header */}
        <header className="sticky top-10 z-30 flex h-[76px] items-center gap-3 border-b border-line bg-paper px-4 md:px-10">
          <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Flokefama home"><LogoMark /></Link>
          <div className="min-w-0 flex-1">
            <p className="hidden truncate text-xs text-ink-3 sm:block">{facility} <span className="text-ink-3/50">/</span> Dashboard</p>
            <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-ink">{nav.find((n) => n.id === view)?.label}</h1>
          </div>
          <button data-tour="request" onClick={() => request()} className="hidden h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-[#006b42] sm:inline-flex lg:hidden">
            <Icon name="fi-rr-wrench-simple" /> Request service
          </button>
          {queued > 0 || failing ? <LiveStatus at={syncedAt} queued={queued} failing={failing && !queued} /> : <LiveStatus at={syncedAt} className="hidden md:inline-flex" />}
          <button type="button" onClick={tour.start} aria-label="Take the tour" title="Take the tour" className="grid size-10 shrink-0 place-items-center rounded-md text-lg text-ink transition hover:bg-mist lg:hidden"><Icon name="fi-rr-interrogation" /></button>
          <span data-tour="bell" className="inline-flex"><Notifications tone="light" items={notifications} onRead={(id) => rawDispatch({ type: 'read', id })} onReadAll={() => rawDispatch({ type: 'readAll', audience: 'client' })} onOpen={onNotification} /></span>
          <span className="hidden items-center gap-3 border-l border-line pl-4 md:flex">
            {!demo && <LogoChanger facility={facility} className="size-9 rounded-full" fallbackClassName="bg-brand-50 text-base text-[#006b42]" />}
            <span className="leading-tight">
              <span className="block text-sm font-medium text-ink">{user.name}</span>
              <span className="block text-xs text-ink-3">{user.email}</span>
            </span>
          </span>
          <form action={logout} className="lg:hidden">
            <button type="submit" aria-label="Sign out" className="grid size-10 shrink-0 place-items-center rounded-md text-lg text-ink transition hover:bg-mist"><Icon name="fi-rr-sign-out-alt" /></button>
          </form>
        </header>

        {/* Mobile nav */}
        <nav aria-label="Client portal sections" data-tour="nav" className="flex gap-5 overflow-x-auto border-b border-line bg-paper px-4 lg:hidden">
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
              {view === 'overview' && !demo && <AlertsBanner what="your engineer’s visits and updates" />}
              {view === 'overview' && <Overview name={user.name} facility={facility} orders={orders.length} assets={assets} tickets={tickets} onOpenTicket={openTicket} onOpenAsset={openAsset} onRequest={() => request()} onGo={setView} />}
              {view === 'requests' && <div data-tour="view-requests"><RequestsView assets={assets} tickets={tickets} selectedId={ticketId} onSelect={setTicketId} onRequest={() => request()} dispatch={dispatch} /></div>}
              {view === 'equipment' && <div data-tour="view-equipment"><EquipmentView assets={assets} tickets={tickets} onOpenAsset={openAsset} /></div>}
              {view === 'certificates' && <div data-tour="view-certificates"><CertificatesView assets={assets} onOpenAsset={openAsset} /></div>}
              {view === 'orders' && <OrdersView orders={orders} />}
            </>
          )}
        </div>
        {/* Mobile: floating request button */}
        <button data-tour="request" onClick={() => request()} className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-md bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(11_21_16/0.35)] sm:hidden">
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
        defaultPhone={user.phone}
        onSubmit={(v) => {
          const id = nextTicketId(state);
          rawDispatch({ type: 'request', ticket: v });
          toast.success(`Request ${id} submitted`, { description: `We’re assigning the nearest engineer. Follow every step here; we’ll also text ${v.contactPhone}.` });
          setTicketId(id);
          setView('requests');
        }}
      />
    </div>
      {demo && <DemoGuide area="client" />}
      {tour.node}
    </EngineerPhotosProvider>
  );
}
