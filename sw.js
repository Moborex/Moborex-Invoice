const CACHE = 'moborex-invoice-v22';
const ASSETS = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
const OPTIONAL_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(async c=>{
      await c.addAll(ASSETS); // core app must succeed for install to proceed
      await Promise.all(OPTIONAL_ASSETS.map(url=>
        fetch(url,{mode:'cors'}).then(r=>{ if(r.ok) return c.put(url,r); }).catch(()=>{})
      )); // PDF libraries cached best-effort; app still installs fine if offline
    })
  );
  // Intentionally NOT calling skipWaiting() here. A newly-installed worker
  // stays in "waiting" state until the page tells it to take over (see the
  // SKIP_WAITING message below), so the update prompt / forced-update cover
  // in index.html controls exactly when the switch happens.
});
self.addEventListener('message', e=>{
  if(e.data && e.data.type==='SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(
    caches.match(e.request).then(cached=>{
      const fetchPromise = fetch(e.request).then(res=>{
        if(res && res.status===200) caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
        return res;
      }).catch(()=>cached);
      return cached || fetchPromise;
    })
  );
});
