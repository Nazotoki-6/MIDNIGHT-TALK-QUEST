const CACHE_NAME = 'midnight-talk-quest-v46-v42-home-645-20261105';
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/tsuyoshi.png",
  "./assets/midnight-bgm.mp3",
  "./assets/take.png",
  "./assets/taro.png",
  "./assets/kazu.png",
  "./assets/pixel-night-banner.png"
];
self.addEventListener('install', event => {
 event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
 event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('midnight-talk-quest-') && key!==CACHE_NAME).map(key=>caches.delete(key)))),self.clients.claim()]));
});
self.addEventListener('fetch', event => {
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin) return;
 const pathname=new URL(request.url).pathname;
 const codeFile=/\/(?:index\.html|script\.js|style\.css|manifest\.webmanifest)$/.test(pathname);
 if(request.mode==='navigate' || codeFile) {
  // Online-first for app pages and code; offline falls back to the installed shell.
  event.respondWith(fetch(request).then(response=>{
    if(response.ok) {
      const copy=response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));
    }
    return response;
  }).catch(async()=>{
    return (await caches.match(request)) || (await caches.match('./index.html')) || Response.error();
  }));
 } else {
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(request,copy)));}
    return response;
  })));
 }
});

self.addEventListener('message', event => {
 if(event.data && event.data.type==='SKIP_WAITING') self.skipWaiting();
});
