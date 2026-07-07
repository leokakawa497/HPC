const CACHE_VERSION = 'hpc-cache-v91';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/real-data.js?v=hpc-cache-v74',
  './assets/supabase-config.js',
  './assets/supabase.js',
  './assets/health-parser.js?v=hpc-cache-v86',
  './assets/hpc-logo.png',
  './assets/hpc-wordmark.svg',
  './assets/hpc-wordmark.png',
  './assets/featured-workout.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then(cached => cached || caches.match('./')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
