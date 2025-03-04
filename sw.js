self.addEventListener("install", (event) => {
    console.log("Service Worker installing.");
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker activated.");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cache => caches.delete(cache)));
        })
    );
    self.clients.claim();
});
