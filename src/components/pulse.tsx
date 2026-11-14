'use client';

import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';
import type { PulseItem } from '@/lib/pulse/types';

/**
 * The site monitor's script: tells /api/pulse which pages a visitor opens, how long they stay, what they do (quote
 * requests, calls, searches, downloads, links out) and how fast the pages felt, so the owner's dashboard (/owner)
 * can show the site live. A visitor is a random code kept in their browser: no name, no email, no cookies.
 * Reports are sent a few at a time, one request after another, and never hold a page up or break it.
 */
const IDLE_MS = 3 * 60_000; // no movement for this long: stop counting time (they walked away)
const VISIT_GAP_MS = 30 * 60_000; // back after this long: a new visit
const PING_MS = 25_000;

const rand = () => Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
const store = (s: 'local' | 'session') => {
  try {
    return s === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

const queue: PulseItem[] = [];
let sending = false;
let first = true;
let visibleSince = 0;
let lastMove = 0;
let depth = 0;
let lastSearch = '';
let errors = 0;
const recent = new Map<string, number>();

function ids() {
  const local = store('local');
  const session = store('session');
  let vid = local?.getItem('ff_vid') ?? '';
  const isNew = !vid;
  if (!vid) {
    vid = rand();
    local?.setItem('ff_vid', vid);
  }
  const now = Date.now();
  const [sid, seen] = (session?.getItem('ff_sid') ?? '').split('.');
  const fresh = !sid || now - Number(seen) > VISIT_GAP_MS;
  const id = fresh ? rand() : sid;
  session?.setItem('ff_sid', `${id}.${now}`);
  return { id, vid, isNew, fresh };
}

/** The seconds the page has been in front of the visitor since the last report. */
function spent() {
  const now = performance.now();
  if (!visibleSince) return;
  const until = Math.min(now, lastMove + IDLE_MS);
  const s = Math.round((until - visibleSince) / 1000);
  visibleSince = document.visibilityState === 'visible' ? now : 0;
  if (s > 0 || depth > 0) queue.push({ k: 'time', s: Math.max(0, s), d: depth || undefined });
}

function search() {
  if (location.pathname !== '/products') return;
  const q = (new URLSearchParams(location.search).get('q') ?? '').trim().toLowerCase();
  if (q.length >= 2 && q !== lastSearch) {
    lastSearch = q;
    queue.push({ k: 'event', n: 'search', v: q });
  }
}

function send(leaving = false) {
  spent();
  search();
  if (leaving) queue.push({ k: 'leave' });
  if (!queue.length || (sending && !leaving)) return;
  const { id, vid, isNew, fresh } = ids();
  const meta = first || fresh;
  let ref = '';
  try {
    const host = document.referrer ? new URL(document.referrer).hostname : '';
    if (host && host !== location.hostname) ref = host;
  } catch {
    /* no referrer */
  }
  const sp = new URLSearchParams(location.search);
  const body = JSON.stringify({
    id, vid, p: location.pathname, items: queue.splice(0, 60),
    ...(meta ? { isNew, ref, campaign: sp.get('utm_campaign') || sp.get('utm_source') || undefined, lang: navigator.language, screen: `${screen.width}x${screen.height}` } : {}),
  });
  first = false;
  if (leaving && navigator.sendBeacon?.('/api/pulse', new Blob([body], { type: 'text/plain' }))) return;
  sending = true;
  fetch('/api/pulse', { method: 'POST', body, headers: { 'Content-Type': 'text/plain' }, keepalive: true, credentials: 'same-origin' })
    .catch(() => {})
    .finally(() => {
      sending = false;
    });
}

/** Records an action (also called by lib/analytics.ts for the site's conversion events). */
export function pulseEvent(n: string, v?: string) {
  if (typeof window === 'undefined' || !(window as { ffPulse?: boolean }).ffPulse) return;
  const key = `${n}|${v ?? ''}`;
  const now = Date.now();
  if (now - (recent.get(key) ?? 0) < 1500) return; // the same action reported twice (two listeners): once
  recent.set(key, now);
  queue.push({ k: 'event', n, ...(v ? { v: v.slice(0, 140) } : {}) });
  setTimeout(send, 300);
}

export function Pulse() {
  const pathname = usePathname();
  const off = pathname.startsWith('/owner');

  useReportWebVitals((m) => {
    if (off || !['LCP', 'INP', 'CLS', 'TTFB', 'FCP'].includes(m.name)) return;
    queue.push({ k: 'vital', n: m.name, v: Math.round(m.value * 1000) / 1000 });
  });

  // Listeners, once
  useEffect(() => {
    if (off) return;
    (window as { ffPulse?: boolean }).ffPulse = true;
    visibleSince = document.visibilityState === 'visible' ? performance.now() : 0;
    lastMove = performance.now();
    const moved = () => {
      lastMove = performance.now();
      if (!visibleSince && document.visibilityState === 'visible') visibleSince = lastMove;
    };
    const scrolled = () => {
      moved();
      const h = document.documentElement.scrollHeight - innerHeight;
      depth = Math.max(depth, h > 40 ? Math.min(100, Math.round((scrollY / h) * 100)) : 100);
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') send(true);
      else {
        lastMove = performance.now();
        visibleSince = lastMove;
      }
    };
    const clicked = (e: MouseEvent) => {
      moved();
      const a = (e.target as Element | null)?.closest?.('a');
      const href = a?.getAttribute('href') ?? '';
      if (!a || !href) return;
      if (href.startsWith('tel:')) pulseEvent('call_click');
      else if (href.startsWith('mailto:')) pulseEvent('email_click');
      else if (/wa\.me|api\.whatsapp\.com/.test(href)) pulseEvent('whatsapp_click');
      else if (a.hasAttribute('download') || /\.(pdf|docx?|xlsx?|zip)(\?|$)/i.test(href)) pulseEvent('download', href.split('/').pop()?.split('?')[0]);
      else if (/^https?:/.test(href)) {
        try {
          const host = new URL(href).hostname;
          if (host !== location.hostname) pulseEvent('outbound', host.replace(/^www\./, ''));
        } catch {
          /* not an address */
        }
      }
    };
    const failed = (e: ErrorEvent | PromiseRejectionEvent) => {
      if (errors++ >= 3) return;
      const message = 'message' in e ? e.message : String((e.reason as Error | undefined)?.message ?? e.reason ?? '');
      if (message && !/ResizeObserver|Script error/i.test(message)) pulseEvent('js_error', message);
    };
    const timer = setInterval(() => {
      // Still here and not walked away: say so (this is what keeps them in "on the site now")
      if (document.visibilityState === 'visible' && performance.now() - lastMove < IDLE_MS) {
        if (!queue.length) queue.push({ k: 'time', s: 0 });
        send();
      }
    }, PING_MS);
    const opts = { passive: true, capture: true } as const;
    addEventListener('scroll', scrolled, opts);
    addEventListener('pointerdown', moved, opts);
    addEventListener('pointermove', moved, opts);
    addEventListener('keydown', moved, opts);
    addEventListener('click', clicked, true);
    const gone = () => send(true);
    addEventListener('pagehide', gone);
    document.addEventListener('visibilitychange', visibility);
    addEventListener('error', failed);
    addEventListener('unhandledrejection', failed);
    return () => {
      clearInterval(timer);
      removeEventListener('scroll', scrolled, opts);
      removeEventListener('pointerdown', moved, opts);
      removeEventListener('pointermove', moved, opts);
      removeEventListener('keydown', moved, opts);
      removeEventListener('click', clicked, true);
      removeEventListener('pagehide', gone);
      document.removeEventListener('visibilitychange', visibility);
      removeEventListener('error', failed);
      removeEventListener('unhandledrejection', failed);
    };
  }, [off]);

  // Each page opened: the time on the page before goes first, then this page (its title once it has settled)
  useEffect(() => {
    if (off) return;
    spent();
    depth = 0;
    const path = pathname;
    queue.push({ k: 'view', p: path });
    const t = setTimeout(() => {
      if (location.pathname !== path) return;
      const nf = document.querySelector('h1')?.textContent?.trim() === 'Page not found.';
      queue.push({ k: 'view', p: path, t: nf ? 'Page not found' : document.title.replace(/\s*\|\s*Flokefama\s*$/, '').slice(0, 120), ...(nf ? { nf: true } : {}) });
      send();
    }, 700);
    return () => clearTimeout(t);
  }, [pathname, off]);

  return null;
}
