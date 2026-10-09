'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createSeed, reducer, VERSION, type Action, type Actor, type ServiceState } from '@/lib/service/desk';

export * from '@/lib/service/desk';

/**
 * Service-desk state for the two portals.
 * - With Appwrite configured (see /api/service): the server keeps the desk, applies every action with the
 *   signed-in account as the actor, and returns what that account may see, so a request a hospital sends
 *   on one device reaches the engineers on theirs. The portal shows each change at once, then takes the
 *   server's answer, and checks for news every 15 seconds and whenever the tab comes back into view.
 * - Without it: kept in this browser (localStorage) and synced between tabs, as before.
 * `ready` is false until the first state has loaded (avoids a hydration mismatch); `remote` says which mode.
 */
const KEY = 'ff-service-desk';
const POLL_MS = 15_000;

type Remote = { enabled: false } | { enabled: true; state: ServiceState };

async function fetchDesk(): Promise<Remote> {
  try {
    const r = await fetch('/api/service', { cache: 'no-store' });
    if (!r.ok) return r.status === 503 ? { enabled: false } : Promise.reject(new Error(String(r.status)));
    return (await r.json()) as Remote;
  } catch {
    return { enabled: false };
  }
}

export function useServiceStore(actor: Actor) {
  const [state, dispatchLocal] = useReducer(reducer(actor), undefined, () => createSeed());
  const [ready, setReady] = useState(false);
  const [remote, setRemote] = useState(false);
  const pending = useRef(0);

  // First load: ask the server; fall back to this browser when Appwrite isn't set up.
  useEffect(() => {
    let live = true;
    const readLocal = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as ServiceState | null;
        dispatchLocal({ type: 'load', state: saved?.version === VERSION ? saved : createSeed() });
      } catch {
        /* storage unavailable: start empty */
      }
    };
    fetchDesk().then((r) => {
      if (!live) return;
      if (r.enabled) {
        setRemote(true);
        dispatchLocal({ type: 'load', state: r.state });
      } else readLocal();
      setReady(true);
    });
    const onStorage = (e: StorageEvent) => e.key === KEY && !remote && readLocal();
    window.addEventListener('storage', onStorage);
    return () => {
      live = false;
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mode is decided once, on the first load
  }, []);

  // Browser mode: save every change.
  useEffect(() => {
    if (!ready || remote) return;
    try {
      if (localStorage.getItem(KEY) !== JSON.stringify(state)) localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready, remote]);

  // Server mode: pick up other people's changes (not while one of ours is on its way).
  const refresh = useCallback(async () => {
    const r = await fetchDesk();
    if (r.enabled && pending.current === 0) dispatchLocal({ type: 'load', state: r.state });
  }, []);
  useEffect(() => {
    if (!remote) return;
    const tick = () => document.visibilityState === 'visible' && refresh();
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('focus', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('focus', tick);
    };
  }, [remote, refresh]);

  const dispatch = useCallback(
    (action: Action) => {
      dispatchLocal(action); // show it straight away
      if (!remote || action.type === 'load') return;
      pending.current += 1;
      fetch('/api/service', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
        .then(async (r) => {
          const out = (await r.json().catch(() => ({}))) as { state?: ServiceState; error?: string };
          if (!r.ok || !out.state) throw new Error(out.error ?? 'That change could not be saved. Please try again.');
          if (pending.current === 1) dispatchLocal({ type: 'load', state: out.state });
        })
        .catch((e: Error) => {
          toast.error('Not saved', { description: e.message });
          refresh();
        })
        .finally(() => {
          pending.current -= 1;
        });
    },
    [remote, refresh],
  );

  const reset = useCallback(() => dispatchLocal({ type: 'load', state: createSeed() }), []);
  return { state, dispatch, ready, remote, reset };
}

/** Engineer portal entry point. */
export const useEngineerStore = (me: string) => useServiceStore({ name: me, role: 'engineer' });
