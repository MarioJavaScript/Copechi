// Service worker: guarda el juego para que funcione sin internet tras la primera carga.
const CACHE = 'copechi-v3';
const ARCHIVOS = ['./', 'index.html', 'style.css', 'arte.js', 'mapa.js', 'game.js', 'data/scenes.json', 'data/maps.json', 'guia-docente.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
