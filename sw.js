const CACHE_NAME = 'oopisos-cache-v2.2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './terminal.css',
  './oopisos2_2.js',
  './editor2_2.js',
  './lexpar2_2.js',
  './commexec2_2.js',
  './adventure2_2.js',
  './marked.min.js',
  'https://fonts.googleapis.com/css2?family=VT323&display=swap',
  // You might also need to cache the font files the above CSS requests
  // For example: 'https://fonts.gstatic.com/s/vt323/v17/...(font file)...'
];

// Install event: cache all the core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve assets from cache first
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
  );
});