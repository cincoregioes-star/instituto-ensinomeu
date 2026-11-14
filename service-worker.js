/* Instituto EnsinoMeu: app instalável, com fallback offline leve.
   Não faz download de aulas, apostilas, provas ou dados de estudantes. */
const PREFIX = 'ensinomeu-app-';
const VERSION = '2026-11-14-v1';
const SHELL = PREFIX + 'shell-' + VERSION;
const PAGES = PREFIX + 'pages-' + VERSION;
const ASSETS = PREFIX + 'assets-' + VERSION;
const SCOPE = new URL(self.registration.scope);
const localURL = (path) => new URL(path, SCOPE).href;
const OFFLINE = localURL('offline.html');
const HOME = localURL('./');
const PRECACHE = [HOME, localURL('index.html'), OFFLINE, localURL('assets/app-icon-192.png'), localURL('assets/app-icon-512.png')];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith(PREFIX) && ![SHELL, PAGES, ASSETS].includes(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

function publicPage(path) {
  return !/(?:^|\/)(?:admin|painel|dashboard-aluno|painel-controle|login|cadastro|prova|apostilas|trilha)\.html$/i.test(path);
}

async function saveWithLimit(cacheName, request, response, maxEntries) {
  if (!response.ok || response.type !== 'basic' || request.headers.has('Authorization')) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
  const keys = await cache.keys();
  if (keys.length > maxEntries) await cache.delete(keys[0]);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(req);
        if (url.search === '' && publicPage(url.pathname)) {
          event.waitUntil(saveWithLimit(PAGES, req, response, 24).catch(() => {}));
        }
        return response;
      } catch (_) {
        const cached = await caches.match(req, { ignoreSearch: true });
        if (cached && publicPage(url.pathname)) return cached;
        if (url.pathname === SCOPE.pathname || url.pathname === SCOPE.pathname + 'index.html') {
          return (await caches.match(HOME)) || (await caches.match(OFFLINE));
        }
        return (await caches.match(OFFLINE)) || Response.error();
      }
    })());
    return;
  }

  // Apenas arquivos leves de interface. Vídeos, PDFs, ZIPs, áudios e requisições de API ficam fora do cache.
  const staticFile = /\.(?:css|js|png|svg|ico|webp)$/i.test(url.pathname);
  const safeSize = req.destination === 'style' || req.destination === 'script' ||
    (req.destination === 'image' && url.pathname.startsWith(SCOPE.pathname + 'assets/'));
  if (!staticFile || !safeSize || url.searchParams.has('token') || url.searchParams.has('key')) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(req);
      const size = Number(response.headers.get('content-length') || '0');
      if (size < 700000) event.waitUntil(saveWithLimit(ASSETS, req, response, 45).catch(() => {}));
      return response;
    } catch (_) {
      return (await caches.match(req)) || Response.error();
    }
  })());
});
