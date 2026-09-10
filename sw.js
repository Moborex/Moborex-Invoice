const CACHE = 'moborex-invoice-v61';

/* All three entry points are cached, not just index.html. order.html (customers) and
   rider.html (riders) were previously never cached at all, so a rider with no signal had
   no app to open — the very people most likely to be offline were the least covered. */
const ASSETS = [
  './index.html',
  './order.html',
  './rider.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

const OPTIONAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

// Anything from the API is live data and must never be answered from cache first.
const API_HOST = 'moborex-ledger-vault-api.ravoseh.workers.dev';
function isApiRequest(url) {
  return url.hostname === API_HOST || url.pathname.startsWith('/api/');
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async c => {
      await c.addAll(ASSETS); // core app must succeed for install to proceed
      await Promise.all(OPTIONAL_ASSETS.map(url =>
        fetch(url, { mode: 'cors' }).then(r => { if (r.ok) return c.put(url, r); }).catch(() => {})
      )); // PDF/Excel libraries cached best-effort; app still installs fine if offline
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return; // POST/PUT are never cacheable — let them through untouched
  const url = new URL(e.request.url);

  /* NETWORK-FIRST for data.
     The previous handler had no URL check at all, so an API GET was cached on first call
     and then returned from cache on every later call while revalidating in the background.
     That meant billing status, sync pulls and admin figures could be served stale
     indefinitely — the app showing yesterday's answer while the server had today's.
     API responses are also never written to the cache here: a response carrying one
     account's data must not sit in a shared cache where a later request could read it. */
  if (isApiRequest(url)) {
    e.respondWith(
      fetch(e.request).catch(() => new Response(
        JSON.stringify({ error: 'You appear to be offline. This will work again once you reconnect.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      ))
    );
    return;
  }

  /* CACHE-FIRST for the app shell and static assets, revalidating in the background.
     These are versioned by the CACHE name, so a deploy bumps the version and the old
     cache is dropped in activate — which is what makes serving them from cache safe. */
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
