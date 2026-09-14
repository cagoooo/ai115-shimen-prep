// AI115 海洋實驗室 Service Worker
// BUILD_VERSION 必須隨每次部署改變，否則瀏覽器不會偵測到新版。
const BUILD_VERSION = "2026.09.14-4";
const CACHE_PREFIX = "ai115-shimen-";
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_VERSION}`;
const PRECACHE_ASSETS = [
  "./assets/favicon.svg",
  "./assets/favicon.ico",
  "./assets/favicon-32.png",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-192.png",
  "./assets/icon-maskable-512.png",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  // 保留 waiting 狀態，讓使用者看到更新提示後自行決定何時套用。
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(PRECACHE_ASSETS.map((asset) => cache.add(asset).catch(() => undefined)))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: "SW_ACTIVATED", version: BUILD_VERSION }));
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

async function cacheNetworkResponse(request) {
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try { url = new URL(request.url); } catch { return; }
  if (url.origin !== self.location.origin) return;

  // version.json 不進快取，讓前端的備援輪詢能知道伺服器端是否有新版。
  if (url.pathname.endsWith("/version.json")) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // HTML 採 network-first，避免舊 HTML 指向不存在的舊版資源。
  const acceptsHtml = (request.headers.get("accept") || "").includes("text/html");
  if (request.mode === "navigate" || acceptsHtml) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  // 同源圖示、CSS 與 JS 採 cache-first；帶 ?v= 的新網址會自然形成新快取鍵。
  event.respondWith((async () => {
    const cached = await caches.match(request) || await caches.match(request, { ignoreSearch: true });
    if (cached) {
      event.waitUntil(cacheNetworkResponse(request).catch(() => undefined));
      return cached;
    }
    return cacheNetworkResponse(request).catch(() => caches.match(request, { ignoreSearch: true }));
  })());
});
