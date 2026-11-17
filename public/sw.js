// Service worker de encode: la app funciona sin conexión tras la primera visita.
// Estrategia: red primero para la navegación (siempre la última versión), caché primero para el resto.
const CACHE = 'encode-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  const put = (res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
    return res
  }
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(put).catch(() => caches.match(req).then((r) => r ?? caches.match('./'))))
    return
  }
  e.respondWith(caches.match(req).then((hit) => hit ?? fetch(req).then(put)))
})
