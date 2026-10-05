/* Flokefama service worker: offline resilience for spotty connectivity.
 * - Precaches the offline page (with emergency support contacts) and the brand shell.
 * - Pages: network-first, falling back to the cached copy, then /offline.
 * - Hashed build files (/_next/static): cache-first, they never go stale.
 * - Images: served from the cache for speed, refreshed in the background, so a replaced photo shows on the next visit.
 * Bump VERSION to invalidate old caches on deploy.
 */
const VERSION = 'v3';
// Signed-in areas are never cached: private data must not survive sign-out on shared hospital machines.
const PRIVATE = ['/portal', '/engineer', '/login'];
const PAGE_CACHE = `pages-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const PRECACHE = ['/offline', '/products', '/images/logo.png', '/images/favicon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGE_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  if (PRIVATE.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          if (res.ok) caches.open(PAGE_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match('/offline'))),
    );
    return;
  }

  const save = (res) => {
    if (res.ok) {
      const copy = res.clone();
      caches.open(ASSET_CACHE).then((c) => c.put(request, copy));
    }
    return res;
  };

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(caches.match(request).then((hit) => hit || fetch(request).then(save)));
    return;
  }

  if (url.pathname.startsWith('/_next/image') || url.pathname.startsWith('/images/')) {
    const fresh = fetch(request).then(save);
    event.waitUntil(fresh.catch(() => {}));
    event.respondWith(caches.match(request).then((hit) => hit || fresh));
  }
});
