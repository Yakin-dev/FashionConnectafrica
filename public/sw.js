const CACHE_VERSION = 'v1';
const STATIC_CACHE = `fashionconnect-static-${CACHE_VERSION}`;
const PAGE_CACHE = `fashionconnect-pages-${CACHE_VERSION}`;
const IMAGE_CACHE = `fashionconnect-images-${CACHE_VERSION}`;
const FONT_CACHE = `fashionconnect-fonts-${CACHE_VERSION}`;

// ─── Install: Pre-cache core static assets ──────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/logo.jpeg',
        '/manifest.webmanifest',
      ]).catch(() => {
        // Non-critical — proceed even if pre-cache fails
        console.warn('[SW] Pre-cache failed for some assets');
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate: Clean old caches ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const expectedCaches = [STATIC_CACHE, PAGE_CACHE, IMAGE_CACHE, FONT_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !expectedCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// ─── Fetch: Caching strategies ──────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and non-http(s) requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // ── CacheFirst: Static assets (JS, CSS, fonts, images) ──────────
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|webp|svg|ico|gif|avif)$/i) ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── NetworkFirst: API calls ─────────────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // ── StaleWhileRevalidate: HTML pages and navigation ────────────
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // ── Default: Network-first fallback ─────────────────────────────
  event.respondWith(networkFirst(request));
});

// ─── Helper: CacheFirst ─────────────────────────────────────────────────
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(
        request.destination === 'image' ? IMAGE_CACHE :
        request.destination === 'font' ? FONT_CACHE :
        STATIC_CACHE
      );
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return cached fallback even for failed fresh fetches
    const fallback = await caches.match(request);
    if (fallback) return fallback;
    // For images, return a transparent placeholder
    if (request.destination === 'image') {
      return new Response('', { status: 204 });
    }
    throw error;
  }
}

// ─── Helper: StaleWhileRevalidate ────────────────────────────────────────
async function staleWhileRevalidate(request) {
  const cache = await caches.open(PAGE_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok && response.type === 'basic') {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// ─── Helper: NetworkFirst ───────────────────────────────────────────────
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

// ─── Push notifications (existing) ──────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || "/icons/icon-192x192.png",
      badge: data.badge || "/icons/badge-72x72.png",
      data: data.data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
