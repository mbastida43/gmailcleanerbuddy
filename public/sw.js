/**
 * Service worker do Gmail Cleaner Buddy.
 *
 * Escopo deliberadamente estreito: só o "shell" estático (HTML, CSS, JS,
 * ícones) entra no cache. Nada de /api ou /auth — essas respostas carregam
 * perfil do usuário, contagens e estado de sessão, e já são servidas com
 * Cache-Control: no-store pelo servidor. Guardá-las no CacheStorage deixaria
 * dados do Gmail em disco no aparelho depois do logout.
 *
 * Suba CACHE_VERSION sempre que app.js/style.css/index.html mudarem — é o que
 * faz o aparelho descartar o shell antigo no próximo deploy.
 */
const CACHE_VERSION = 'gcb-shell-v1';

const SHELL = [
  '/',
  '/style.css',
  '/app.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // addAll é all-or-nothing: um recurso fora do ar abortaria a instalação
      // inteira e o app ficaria sem cache nenhum. Cada item falha sozinho.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/auth')) return;

  // Network-first: o app precisa da versão mais recente do shell; o cache é
  // apenas o plano B para quando o aparelho está sem rede.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
  );
});
