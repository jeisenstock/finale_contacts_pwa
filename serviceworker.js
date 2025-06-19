var CACHE_NAME = "FContacts";
var CACHED_URLS = [
  "index.html",
  "FContacts.js",
  "FCTDisplay.html",
  "FCTMainform.html",
  "IconResHigh.png",
  "IconResLow.png",
  "IconResMid.png"
  ];

self.addEventListener('install', function(event) {
                event.waitUntil(
                                caches.open(CACHE_NAME).then(function(cache) {
                                return cache.addAll(CACHED_URLS);
                })
                                );
});


self.addEventListener('fetch',function(event) {
   event.respondWith(
     fetch(event.request).catch(function() {
                   return caches.match(event.request).then(function(response) {
       if (response) {
                                   return response;
       } else if (event.request.headers.get("accept").includes("text/html")) {
                                   return caches.match("index.html");
                   }
                   });
   })
                   );
});