// Notatnik Syntez – tryb offline (bez połączeń z innymi serwerami)
const V = 'notatnik-syntez-v9';
const SHELL = ['./', './index.html', './privacy.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './smiles-drawer.min.js',
  './fonts/jetbrains-mono-latin-400-normal.woff2',
  './fonts/jetbrains-mono-latin-500-normal.woff2',
  './fonts/jetbrains-mono-latin-600-normal.woff2',
  './fonts/jetbrains-mono-latin-700-normal.woff2',
  './fonts/jetbrains-mono-latin-ext-400-normal.woff2',
  './fonts/jetbrains-mono-latin-ext-500-normal.woff2',
  './fonts/jetbrains-mono-latin-ext-600-normal.woff2',
  './fonts/jetbrains-mono-latin-ext-700-normal.woff2',
  './fonts/space-grotesk-latin-400-normal.woff2',
  './fonts/space-grotesk-latin-500-normal.woff2',
  './fonts/space-grotesk-latin-600-normal.woff2',
  './fonts/space-grotesk-latin-700-normal.woff2',
  './fonts/space-grotesk-latin-ext-400-normal.woff2',
  './fonts/space-grotesk-latin-ext-500-normal.woff2',
  './fonts/space-grotesk-latin-ext-600-normal.woff2',
  './fonts/space-grotesk-latin-ext-700-normal.woff2',
];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('.html');
  if (isPage) {
    // strona: najpierw z sieci (najnowsza wersja), bez sieci – z pamięci
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(V).then(c => c.put(req, cp)); } return r; })
      .catch(() => caches.open(V).then(c => c.match(req, {ignoreSearch: true}).then(h => h || c.match('./index.html')))));
    return;
  }
  e.respondWith(caches.open(V).then(c => c.match(req, {ignoreSearch: true}).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  })));
});
