/* PPF CORE Cache Manager v2 */
importScripts("./app-version.js");

const VERSION = self.PPF_APP_VERSION || "unknown";
const CACHE_NAME = `ppf-pro-${VERSION}`;
const CACHE_PREFIXES = ["pm-online-", "ppf-pro-"];
const OFFLINE_PAGE = "./index.html";

const APP_SHELL = [
  "./",
  "./index.html",
  "./admin.html",
  "./cliente.html",
  "./style.css",
  "./ppf-unified-feedback.css",
  "./ppf-motion.css",
  "./ppf-smart-states.css",
  "./ppf-athlete-intelligence.css",
  "./ppf-client-hero.css",
  "./ppf-client-home.css",
  "./ppf-client-layout.css",
  "./ppf-client-health.css",
  "./app-version.js",
  "./ppf-cache-manager.js",
  "./app.js",
  "./admin.js",
  "./ppf-athlete-intelligence.js",
  "./ppf-health-bridge.js",
  "./ppf-kpi-feedback.js",
  "./ppf-unified-feedback.js",
  "./ppf-motion.js",
  "./ppf-smart-states.js",
  "./ppf-client-hero.js",
  "./ppf-client-access.js",
  "./cliente.js",
  "./ppf-core.js",
  "./session-truth.js",
  "./notifications.js",
  "./pwa-register.js",
  "./supabase-config.js",
  "./supabase-sync.js",
  "./presence.js",
  "./manifest.webmanifest",
  "./favicon.ico",
  "./favicon-32.png",
  "./favicon-16.png",
  "./apple-touch-icon.png",
  "./brand/pm-primary.png",
  "./brand/pm-simplified.png",
  "./brand/pm-favicon-mark.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const results = await Promise.allSettled(
      APP_SHELL.map((url) => cache.add(new Request(url, { cache: "reload" })))
    );
    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length) console.warn("PPF cache install: algunos recursos no se precargaron", failed.length);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => CACHE_PREFIXES.some((prefix) => key.startsWith(prefix)) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: "PPF_VERSION", version: VERSION }));
  })());
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request, { cache: "no-store" });
    if (response?.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    return (await cache.match(request)) || (fallbackUrl ? await cache.match(fallbackUrl) : null) || Response.error();
  }
}

async function cacheFirstWithRefresh(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const refresh = fetch(request, { cache: "no-cache" })
    .then((response) => {
      if (response?.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || refresh || Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(networkFirst(request, OFFLINE_PAGE));
    return;
  }

  if (
    ["script", "style", "manifest", "worker"].includes(request.destination) ||
    /\.(?:js|css|webmanifest)$/i.test(url.pathname)
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirstWithRefresh(request));
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "PPF_SKIP_WAITING") self.skipWaiting();
  if (data.type === "PPF_GET_VERSION") {
    event.source?.postMessage({ type: "PPF_VERSION", version: VERSION });
  }
  if (data.type === "PPF_CLEAR_CACHES") {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => CACHE_PREFIXES.some((prefix) => key.startsWith(prefix))).map((key) => caches.delete(key))
      );
    })());
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || "./cliente.html", self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => client.url.includes("cliente.html"));
    if (existing) {
      await existing.focus();
      existing.postMessage({ type: "PPF_OPEN_SESSION", section: "proxima" });
      return;
    }
    await self.clients.openWindow(targetUrl);
  })());
});
