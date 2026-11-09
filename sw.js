// 오프라인 대비: 항상 인터넷에서 먼저 받고, 안 되면 저장본을 보여준다
const VERSION = "unjob-v10";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("unjob-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request.url, { cache: "no-cache" })          // 브라우저 10분 저장본 말고 항상 새 버전 확인
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
