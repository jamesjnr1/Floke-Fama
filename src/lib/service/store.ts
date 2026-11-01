'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { toast } from 'sonner';
import { createSeed, reducer, VERSION, type Action, type Actor, type ServiceState } from '@/lib/service/desk';
import { PRACTICE_KEY, practiceDesk } from '@/lib/service/practice';

export * from '@/lib/service/desk';

/**
 * Service-desk state for the two portals.
 * - With Appwrite configured (see /api/service): the server keeps the desk, applies every action with the
 *   signed-in account as the actor, and returns what that account may see, so a request a hospital sends
 *   on one device reaches the engineers on theirs. The portal shows each change at once, then takes the
 *   server's answer, and checks for news every 15 seconds and whenever the tab comes back into view.
 * - Without it: kept in this browser (localStorage) and synced between tabs, as before.
 * - Offline (no signal on a site visit): each change still shows at once and is kept on this device (an "outbox"),
 *   then sent in order as soon as the connection is back. `queued` says how many are waiting.
 * `ready` is false until the first state has loaded (avoids a hydration mismatch); `remote` says which mode.
 */
const KEY = 'ff-service-desk';
const OUTBOX = 'ff-service-outbox';
const readOutbox = (): Action[] => {
  try {
    return JSON.parse(localStorage.getItem(OUTBOX) ?? '[]') as Action[];
  } catch {
    return [];
  }
};
const writeOutbox = (list: Action[]) => {
  try {
    if (list.length) localStorage.setItem(OUTBOX, JSON.stringify(list));
    else localStorage.removeItem(OUTBOX);
  } catch {
    /* storage unavailable */
  }
};
/** No connection at all (as opposed to the server refusing the change). */
class Offline extends Error {}
const POLL_MS = 15_000;

/** `error`: the server is set up but couldn't answer just now (no connection, or the database didn't respond). */
/** The team as the head of engineering sees it, to give jobs to engineers. */
export type TeamEntry = { name: string; region: string | null; open: number };
type Remote = { enabled: false; error?: boolean } | { enabled: true; state: ServiceState; team?: TeamEntry[] | null };

async function fetchDesk(): Promise<Remote> {
  try {
    const r = await fetch('/api/service', { cache: 'no-store' });
    // Signed out (the session ran out): back to this portal's sign-in, then straight back here
    if (r.status === 401) {
      const area = location.pathname.startsWith('/engineer') ? '/engineer/login' : '/login';
      location.assign(`${area}?next=${encodeURIComponent(location.pathname + location.search)}`);
      return new Promise<Remote>(() => {});
    }
    if (!r.ok) return r.status === 503 ? { enabled: false } : { enabled: false, error: true };
    return (await r.json()) as Remote;
  } catch {
    return { enabled: false, error: true };
  }
}

export function useServiceStore(actor: Actor, { practice = false }: { practice?: boolean } = {}) {
  const [state, dispatchLocal] = useReducer(reducer(actor), undefined, () => createSeed());
  const [ready, setReady] = useState(false);
  const [remote, setRemote] = useState(false);
  /** When the desk was last read from the server (shown as "Live · updated …"). */
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  /** The last tries to read the desk failed: what's on screen may be out of date. */
  const [failing, setFailing] = useState(false);
  /** Only for the head of engineering: the engineers they can give jobs to. */
  const [team, setTeam] = useState<TeamEntry[] | null>(null);
  const pending = useRef(0);
  const [queued, setQueued] = useState(0);
  const flushing = useRef(false);

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
    // Practice mode: the sample desk, kept in this browser only (nothing goes to the server)
    if (practice) {
      try {
        const saved = JSON.parse(localStorage.getItem(PRACTICE_KEY) ?? 'null') as ServiceState | null;
        dispatchLocal({ type: 'load', state: saved?.version === VERSION ? saved : practiceDesk(actor.name) });
      } catch {
        dispatchLocal({ type: 'load', state: practiceDesk(actor.name) });
      }
      setReady(true);
      return () => {
        live = false;
      };
    }
    fetchDesk().then((r) => {
      if (!live) return;
      if (r.enabled) {
        setRemote(true);
        setSyncedAt(new Date());
        setTeam(r.team ?? null);
        dispatchLocal({ type: 'load', state: r.state });
        // Changes made offline last time, not sent yet: shown again, and sent below
        const waiting = readOutbox();
        waiting.forEach((a) => dispatchLocal(a));
        setQueued(waiting.length);
      } else if (r.error) {
        // The server's desk couldn't be read: say so and keep trying (never fall back to this browser's own copy)
        setRemote(true);
        setFailing(true);
        const waiting = readOutbox();
        waiting.forEach((a) => dispatchLocal(a));
        setQueued(waiting.length);
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

  // Browser mode (and practice mode, under its own key): save every change.
  useEffect(() => {
    if (!ready || remote) return;
    const key = practice ? PRACTICE_KEY : KEY;
    try {
      if (localStorage.getItem(key) !== JSON.stringify(state)) localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready, remote, practice]);

  // Server mode: pick up other people's changes (not while one of ours is on its way).
  const refresh = useCallback(async () => {
    const r = await fetchDesk();
    setFailing(!r.enabled && !!r.error);
    if (!r.enabled) return;
    setSyncedAt(new Date());
    setTeam(r.team ?? null);
    if (pending.current === 0 && readOutbox().length === 0) dispatchLocal({ type: 'load', state: r.state });
  }, []);

  /** Sends one change to the server; returns its answer. */
  const send = useCallback(async (action: Action) => {
    let r: Response;
    try {
      r = await fetch('/api/service', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    } catch {
      throw new Offline('No connection');
    }
    const out = (await r.json().catch(() => ({}))) as { state?: ServiceState; error?: string };
    if (r.status >= 500 && r.status !== 503) throw new Offline(out.error ?? 'Server unavailable');
    if (!r.ok || !out.state) throw new Error(out.error ?? 'That change could not be saved. Please try again.');
    return out.state;
  }, []);

  /** Sends what was kept offline, oldest first; stops at the first one that still can't get through. */
  const flush = useCallback(async () => {
    if (flushing.current || !navigator.onLine) return;
    flushing.current = true;
    let last: ServiceState | undefined;
    let sent = 0;
    try {
      for (;;) {
        const [next, ...rest] = readOutbox();
        if (!next) break;
        try {
          last = await send(next);
          sent += 1;
        } catch (e) {
          if (e instanceof Offline) break;
          toast.error('A change made offline was not saved', { description: (e as Error).message });
        }
        writeOutbox(rest);
        setQueued(rest.length);
      }
    } finally {
      flushing.current = false;
    }
    if (sent) toast.success(`${sent} change${sent === 1 ? '' : 's'} made offline ${sent === 1 ? 'was' : 'were'} sent`);
    if (last && readOutbox().length === 0 && pending.current === 0) dispatchLocal({ type: 'load', state: last });
  }, [send]);

  useEffect(() => {
    if (!remote) return;
    flush();
    const onOnline = () => flush();
    window.addEventListener('online', onOnline);
    const id = window.setInterval(() => readOutbox().length && flush(), 20_000);
    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(id);
    };
  }, [remote, flush]);
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
      // Offline, or older offline changes still waiting: keep it in order behind them
      const keep = () => {
        const list = [...readOutbox(), action];
        writeOutbox(list);
        setQueued(list.length);
        toast('Saved on this device', { description: 'No connection. It will be sent as soon as you are back online.' });
      };
      if (!navigator.onLine || readOutbox().length) return keep();
      pending.current += 1;
      send(action)
        .then((next) => {
          if (pending.current === 1 && readOutbox().length === 0) dispatchLocal({ type: 'load', state: next });
        })
        .catch((e: Error) => {
          if (e instanceof Offline) return keep();
          toast.error('Not saved', { description: e.message });
          refresh();
        })
        .finally(() => {
          pending.current -= 1;
        });
    },
    [remote, refresh, send],
  );

  const reset = useCallback(() => dispatchLocal({ type: 'load', state: practice ? practiceDesk(actor.name) : createSeed() }), [practice, actor.name]);
  return { state, dispatch, ready, remote, reset, syncedAt, queued, failing, team };
}

/** Engineer portal entry point. */
export const useEngineerStore = (me: string, practice = false) => useServiceStore({ name: me, role: 'engineer' }, { practice });
