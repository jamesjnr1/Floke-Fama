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

/** Asks the server who is signed in (this also renews the session), and schedules the automatic sign-out. */
export async function refreshSession() {
  try {
    const res = await fetch('/api/session', { cache: 'no-store', credentials: 'same-origin' });
    const json = (await res.json()) as { user: ClientUser | null; exp?: number };
    const wasIn = state.status === 'in';
    set(json.user ? { status: 'in', user: json.user, exp: json.exp ?? 0 } : { status: 'out', user: null, exp: 0 });
    clearTimeout(timer);
    if (json.user && json.exp) {
      // When the hour without activity runs out, show the visitor as signed out straight away.
      timer = setTimeout(() => {
        set({ status: 'out', user: null, exp: 0 });
        toast('You’ve been signed out', { description: 'For your security, we sign you out after an hour without activity.' });
      }, Math.max(0, json.exp * 1000 - Date.now()));
    } else if (wasIn && !json.user) {
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
