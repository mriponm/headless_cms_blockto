// Cache version bumped — invalidates old cache that stored stale page HTML
const CACHE = "blockto-v2";

self.addEventListener("install", (e) => {
  // No pre-caching of any pages — dynamic pages must always come from network
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Let Next.js handle its own internal chunk/data requests
  if (url.pathname.startsWith("/_next/")) return;

  // Never cache API responses — always dynamic
  if (url.pathname.startsWith("/api/")) return;

  // Never cache navigation requests (full page loads / back-forward).
  // Dynamic pages like "/" must always be served fresh from the server
  // so posts and other server-rendered content are never stale.
  if (request.mode === "navigate") return;

  // For true static assets (images, icons, fonts, manifests) —
  // stale-while-revalidate: serve cache instantly, refresh in background.
  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
