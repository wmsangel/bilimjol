// Минимальный service worker: network-first, кэш только как офлайн-запас.
// Так контент всегда свежий онлайн (сайт часто деплоится), а офлайн — не пустой.
const CACHE = "bilimjol-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) {
          const copy = res.clone();
          const cache = await caches.open(CACHE);
          cache.put(req, copy).catch(() => {});
        }
        return res;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const home = await caches.match("/ru");
          if (home) return home;
        }
        throw new Error("offline");
      }
    })(),
  );
});
