const CACHE = 'zajil-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

// Install - cache assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', e => {
  // API calls: network only
  if (e.request.url.includes('firebase') || 
      e.request.url.includes('er-api') || 
      e.request.url.includes('exchangerate')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache fresh response
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Listen for skip-waiting message
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
