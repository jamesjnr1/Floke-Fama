'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { toast } from 'sonner';
import type { Role } from '@/lib/auth/session';

export interface ClientUser { name: string; email: string; role: Role; facility?: string; phone?: string }
type State = { status: 'loading' | 'in' | 'out'; user: ClientUser | null; exp: number };

let state: State = { status: 'loading', user: null, exp: 0 };
const listeners = new Set<() => void>();
const set = (next: State) => {
  state = next;
  listeners.forEach((l) => l());
};
let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * When the hour without activity seems to have run out, asks the server first (without counting as activity): the
 * portal's own updates may have kept the session alive meanwhile. Only a session that really ended is announced.
 */
function schedule(exp: number) {
  clearTimeout(timer);
  timer = setTimeout(async () => {
    try {
      const res = await fetch('/api/session?peek=1', { cache: 'no-store', credentials: 'same-origin' });
      const json = (await res.json()) as { user: ClientUser | null; exp?: number };
      if (json.user && json.exp && json.exp * 1000 > Date.now()) return schedule(json.exp);
    } catch {
      return; // can't tell (offline): say nothing rather than something wrong
    }
    if (state.status !== 'in') return;
    set({ status: 'out', user: null, exp: 0 });
    toast('You’ve been signed out', { description: 'For your security, we sign you out after an hour without activity.' });
  }, Math.max(1000, exp * 1000 - Date.now() + 1000));
}

/** Asks the server who is signed in (this also renews the session), and schedules the automatic sign-out. */
export async function refreshSession() {
  try {
    const res = await fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
    const json = (await res.json()) as { user: ClientUser | null; exp?: number };
    const wasIn = state.status === 'in';
    set(json.user ? { status: 'in', user: json.user, exp: json.exp ?? 0 } : { status: 'out', user: null, exp: 0 });
    clearTimeout(timer);
    if (json.user && json.exp) schedule(json.exp);
    else if (wasIn && !json.user) {
      toast('You’ve been signed out');
    }
  } catch {
    if (state.status === 'loading') set({ status: 'out', user: null, exp: 0 });
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const SERVER: State = { status: 'loading', user: null, exp: 0 };

/** The signed-in user on public pages. Re-checked on every page change, which also keeps the session alive. */
export function useSession() {
  const pathname = usePathname();
  useEffect(() => {
    void refreshSession();
  }, [pathname]);
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}
