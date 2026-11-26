/* ФинТвин service worker: оболочка приложения, статика, офлайн-фолбэк.
   Данные API не кэшируем: реестр FinCoin и матчинг должны быть серверными. */
const VERSION = 'fintwin-v2';
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const SHELL_URLS = [
  '/',
  '/login/',
  '/offline/',
  '/manifest.webmanifest',
  '/static/web/landing.css',
  '/static/web/brand/icon-192.png',
  '/static/web/brand/logo-ru-480.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API и админку не кэшируем вовсе
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin/')) return;

  // Навигация: сеть, при сбое — офлайн-страница
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        return cached || caches.match('/offline/') || caches.match('/');
      }),
    );
    return;
  }

  // Собранные ассеты и статика: stale-while-revalidate
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
