var CACHE_NAME = "FinaleContacts-v1";
var CACHED_URLS = [
  "index.html",
  "FContacts.js",
  "FCTDisplay.html",
  "FCTMainform.html",
  "finale-icon-64.png",
  "finale-icon-192.png",
  "finale-icon-256.png",
  "finale-icon-512.png"
];

self.addEventListener('install', function(event) {
  console.log('Finale Contacts Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Caching app shell');
      return cache.addAll(CACHED_URLS);
    }).catch(function(error) {
      console.error('Cache installation failed:', error);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Finale Contacts Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Delete old caches
          if (cacheName !== CACHE_NAME && cacheName.startsWith('FinaleContacts-')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // Ensure the new service worker takes control immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Try network first, then cache
    fetch(event.request)
      .then(function(response) {
        // If we get a valid response, clone it and update the cache
        if (response && response.status === 200 && response.type === 'basic') {
          var responseToCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(function() {
        // Network failed, try cache
        return caches.match(event.request).then(function(response) {
          if (response) {
            return response;
          } else if (event.request.headers.get("accept") && 
                     event.request.headers.get("accept").includes("text/html")) {
            // For HTML requests that aren't cached, return the main page
            return caches.match("index.html");
          }
          // For other requests, return a basic response or let it fail
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Handle service worker updates
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});