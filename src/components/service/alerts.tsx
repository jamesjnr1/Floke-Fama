'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@/components/ui/icon';
import type { Notification } from '@/lib/service/desk';
import { cn } from '@/lib/utils';

/**
 * Alerts on this device (Web Push, see lib/push.ts): new service requests for engineers, updates for hospitals,
 * even when the portal is closed. On iPhone and iPad, alerts only work once the portal has been added to the
 * home screen (Share → Add to Home Screen), so that is what this suggests there.
 */
type State = 'checking' | 'unsupported' | 'install' | 'off' | 'on' | 'blocked' | 'unavailable';

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const fromB64 = (s: string) => Uint8Array.from(atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

function useAlerts() {
  const [state, setState] = useState<State>('checking');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      if (!supported) return live && setState(isIos() && !standalone() ? 'install' : 'unsupported');
      const on = await fetch('/api/push').then((r) => r.json()).then((j: { enabled?: boolean }) => Boolean(j.enabled)).catch(() => false);
      if (!on || !KEY) return live && setState('unavailable');
      if (Notification.permission === 'denied') return live && setState('blocked');
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) }).catch(() => {}); // keep this device on the list
      if (live) setState(sub ? 'on' : 'off');
    })();
    return () => {
      live = false;
    };
  }, []);

  const turnOn = useCallback(async () => {
    setBusy(true);
    try {
      if ((await Notification.requestPermission()) !== 'granted') return setState('blocked');
      const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'));
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: fromB64(KEY) }));
      const r = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub) });
      if (!r.ok) throw new Error();
      setState('on');
      toast.success('Alerts are on', { description: 'You’ll be alerted on this device, even when the portal is closed.' });
    } catch {
      toast.error('Alerts could not be turned on', { description: 'Please try again.' });
    } finally {
      setBusy(false);
    }
  }, []);

  const turnOff = useCallback(async () => {
    setBusy(true);
    try {
      const sub = await (await navigator.serviceWorker.getRegistration())?.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setState('off');
      toast('Alerts are off on this device');
    } finally {
      setBusy(false);
    }
  }, []);

  return { state, busy, turnOn, turnOff };
}

const DISMISS = 'ff-alerts-banner-dismissed';

/** A short card asking to turn alerts on (or explaining how on iPhone). Hidden once alerts are on or it is dismissed. */
export function AlertsBanner({ what }: { what: string }) {
  const { state, busy, turnOn } = useAlerts();
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);
  if (dismissed || (state !== 'off' && state !== 'install')) return null;
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS, '1');
    } catch {
      /* not remembered */
    }
  };
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-line bg-paper p-5 sm:flex-row sm:items-center">
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-700"><Icon name="fi-rr-bell" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">Get alerts on this device</p>
        <p className="text-sm text-ink-3">
          {state === 'install'
            ? `To be alerted about ${what} on iPhone or iPad, first add the portal to your home screen: tap Share, then “Add to Home Screen”, and open it from there.`
            : `Be alerted about ${what} straight away, even when the portal is closed.`}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={dismiss} className="h-10 rounded-lg px-3 text-sm font-medium text-ink-3 hover:text-ink">Not now</button>
        {state === 'off' && (
          <button onClick={turnOn} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-[#006b42] disabled:opacity-60">
            <Icon name="fi-rr-bell" /> Turn on alerts
          </button>
        )}
      </div>
    </div>
  );
}

/** A one-line switch for the sidebar: "Alerts: on / off". */
export function AlertsSwitch({ className }: { className?: string }) {
  const { state, busy, turnOn, turnOff } = useAlerts();
  if (state === 'checking' || state === 'unsupported' || state === 'unavailable') return null;
  const label = state === 'on' ? 'Alerts on' : state === 'blocked' ? 'Alerts blocked in browser settings' : state === 'install' ? 'Alerts: add to home screen first' : 'Turn on alerts';
  return (
    <button
      onClick={state === 'on' ? turnOff : state === 'off' ? turnOn : undefined}
      disabled={busy || state === 'blocked' || state === 'install'}
      title={state === 'on' ? 'Turn alerts off on this device' : undefined}
      className={cn('flex items-center gap-2.5 text-left disabled:cursor-default', className)}
    >
      <Icon name="fi-rr-bell" /> {label}
    </button>
  );
}

/**
 * While the portal is open: a pop-up for each new notification that arrives (the portal checks for news every
 * 15 seconds), with a button that opens what it is about.
 */
export function useNotificationPopups(items: Notification[], ready: boolean, onOpen: (n: Notification) => void) {
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (!seen.current) {
      seen.current = new Set(items.map((n) => n.id)); // what was there on arrival isn't news
      return;
    }
    for (const n of items) {
      if (seen.current.has(n.id)) continue;
      seen.current.add(n.id);
      if (!n.read) toast(n.text, { action: n.ticketId || n.assetId ? { label: 'Open', onClick: () => onOpen(n) } : undefined, duration: 8000 });
    }
  }, [items, ready, onOpen]);
}
