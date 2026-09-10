// Service Worker for Runtz AI PWA
//
// Bump CACHE_VERSION on any change to the caching strategy - the activate
// handler deletes every cache that does not match, which is what unsticks
// browsers holding an older service worker.
const CACHE_VERSION = 'v2';
const CACHE_NAME = `runtz-ai-${CACHE_VERSION}`;

// Never precache '/' or any HTML. A cached app shell keeps pointing at
// content-hashed bundles that no longer exist after a rebuild, which renders
// as a blank page.
const PRECACHE_URLS = [
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // HTML and API responses always come from the network, so a deploy takes
  // effect immediately and auth state is never served stale.
  if (request.mode === 'navigate' || url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Build assets carry a content hash in their filename, so a cache hit can
  // never be stale - a new build produces a new URL.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok && url.pathname.startsWith('/assets/')) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
