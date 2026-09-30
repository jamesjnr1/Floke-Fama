'use client';

import { useEffect } from 'react';

/** Registers the offline service worker (production only, so dev caching never bites). */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('[sw] registration failed', err));
  }, []);
  return null;
}
