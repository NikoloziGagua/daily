const CACHE_VERSION = "v7";
const PRECACHE = "daily-compass-precache-" + CACHE_VERSION;
const RUNTIME = "daily-compass-runtime-" + CACHE_VERSION;
const KEEP_CACHES = [PRECACHE, RUNTIME];
const OFFLINE_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!KEEP_CACHES.includes(key)) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  // Only manage same-origin traffic. Cross-origin requests (e.g. web fonts)
  // are left to the browser so they never accumulate in our caches.
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isDocumentRequest = event.request.mode === "navigate";

  if (isDocumentRequest) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PRECACHE).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
