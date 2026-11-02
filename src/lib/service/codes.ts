'use client';

import { useSyncExternalStore } from 'react';
import { facilityKey } from '@/lib/service/desk';

/**
 * The hospital codes (FLK-H001 …) the server sends with the service desk: every hospital's for engineers, a
 * hospital its own. Kept here so any part of a portal (and the printed service report) can show a code by a name.
 */
let codes: Record<string, string> = {};
const listeners = new Set<() => void>();

export function setFacilityCodes(next: Record<string, string> | undefined) {
  const byKey = Object.fromEntries(Object.entries(next ?? {}).map(([name, code]) => [facilityKey(name), code]));
  if (JSON.stringify(byKey) === JSON.stringify(codes)) return;
  codes = byKey;
  listeners.forEach((l) => l());
}

/** A hospital's code, or undefined when it has none yet (or in practice mode). */
export const facilityCodeOf = (name: string | undefined) => (name ? codes[facilityKey(name)] : undefined);

export function useFacilityCode(name: string | undefined) {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => facilityCodeOf(name),
    () => undefined,
  );
}
