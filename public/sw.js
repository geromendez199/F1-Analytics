/* eslint-disable no-restricted-globals */
importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js");

if (self.workbox) {
  self.workbox.setConfig({ debug: false });

  const precacheManifest = self.__WB_MANIFEST || [];
  self.workbox.precaching.precacheAndRoute(precacheManifest);

  const { registerRoute } = self.workbox.routing;
  const { NetworkFirst, StaleWhileRevalidate, CacheFirst } = self.workbox.strategies;
  const { CacheableResponsePlugin } = self.workbox.cacheableResponse;
  const { ExpirationPlugin } = self.workbox.expiration;

  registerRoute(
    ({ request }) => request.mode === "navigate" || request.destination === "document",
    new NetworkFirst({
      cacheName: "pages",
      networkTimeoutSeconds: 5,
      plugins: [new CacheableResponsePlugin({ statuses: [200] })]
    })
  );

  registerRoute(
    ({ request }) => request.destination === "style" || request.destination === "script",
    new StaleWhileRevalidate({
      cacheName: "assets",
      plugins: [new CacheableResponsePlugin({ statuses: [200] })]
    })
  );

  registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
      cacheName: "images",
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })
      ]
    })
  );

  registerRoute(
    ({ url }) => url.pathname.startsWith("/api/"),
    new NetworkFirst({
      cacheName: "api",
      networkTimeoutSeconds: 5,
      plugins: [new CacheableResponsePlugin({ statuses: [200] })]
    })
  );
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
