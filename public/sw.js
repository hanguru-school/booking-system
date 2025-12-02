const CACHE_NAME = "malmoi-v3";
const urlsToCache = [
  "/",
  "/auth/login",
  "/manifest.json",
  "/icon-192x192.svg",
  "/icon-512x512.svg",
  "/static/css/main.css",
  "/static/js/main.js",
];

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker 설치 중...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("캐시가 열렸습니다");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("모든 리소스가 캐시되었습니다");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker 설치 중 오류:", error);
      }),
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // 캐시된 버전 반환 또는 네트워크에서 가져오기
        return response || fetch(event.request);
      })
      .catch(() => {
        // 네트워크 오류 시 오프라인 페이지 반환
        if (event.request.destination === "document") {
          return caches.match("/");
        }
      }),
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker 활성화 중...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("이전 캐시 삭제:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("새 Service Worker가 활성화되었습니다");
        return self.clients.claim();
      }),
  );
});

// Push event (알림 지원)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icon-192x192.svg",
      badge: "/icon-192x192.svg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});

// PWA 설치 이벤트 감지
self.addEventListener("beforeinstallprompt", (event) => {
  console.log("Service Worker에서 beforeinstallprompt 감지됨");
  // 이벤트를 클라이언트로 전달
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "beforeinstallprompt",
        event: event,
      });
    });
  });
});

// 메시지 이벤트 처리
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
