const PM_CACHE = "pm-online-v1.4.3-cliente-valoraciones-admin-engine";
const PM_ASSETS = [
  "./", "./index.html", "./admin.html", "./cliente.html", "./style.css",
  "./app.js", "./admin.js", "./cliente.js", "./supabase-config.js", "./supabase-sync.js",
  "./manifest.webmanifest", "./favicon.ico", "./favicon.svg", "./apple-touch-icon.png",
  "./icons/icon-192.png", "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(PM_CACHE).then(cache => cache.addAll(PM_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== PM_CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(PM_CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
  );
});
