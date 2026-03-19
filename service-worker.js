var CACHE_NAME = 'revelation-memory-v1';
var ASSETS = [
  '/',
  '/index.html',
  '/revelation.json',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// 설치: 필요한 파일을 캐시에 저장
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화: 오래된 캐시 삭제
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// 요청 가로채기: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      if (cached) return cached;
      return fetch(event.request).then(function(response) {
        // 유효한 응답이면 캐시에 저장
        if (response && response.status === 200 && response.type === 'basic') {
          var toCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, toCache);
          });
        }
        return response;
      }).catch(function() {
        // 오프라인 + 캐시 없는 경우 index.html 반환
        return caches.match('/index.html');
      });
    })
  );
});
