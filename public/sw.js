const CACHE_NAME = 'pricecalc-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/calculator',
        '/calculator.html',
        '/index.html',
        '/manifest.json',
        '/upcalc (1).png',
        '/upcalc (2).png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available, otherwise try network
      return response || fetch(event.request);
    }).catch(() => {
      // Fallback for HTML requests when offline
      if (event.request.destination === 'document') {
        return caches.match('/calculator.html');
      }
    })
  );
});
