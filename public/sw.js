/**
 * Service worker: permite instalar la web como app y abrirla sin conexión.
 * Estrategia "primero la red": siempre muestra lo más nuevo y, si no hay
 * internet, usa la última copia guardada. Las fotos se sirven de la copia
 * guardada y se actualizan en segundo plano.
 */
const CACHE = 'casanovaco-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;

  const esFoto = request.destination === 'image';

  if (esFoto) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const guardada = await cache.match(request);
        const deRed = fetch(request)
          .then((r) => { if (r.ok) cache.put(request, r.clone()); return r; })
          .catch(() => guardada);
        return guardada || deRed;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((r) => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(request, copia)); }
        return r;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match('/')))
  );
});
