/* 客先管理アプリ PWA v2026.11.09.2 */
const CACHE_NAME='niouroshi-static-v20261109-2';
const STATIC_FILES=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const SCOPE=new URL(self.registration.scope);
self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(async cache=>{
    await Promise.all(STATIC_FILES.map(async path=>{
      try{const request=new Request(new URL(path,SCOPE),{cache:'reload'});const response=await fetch(request);if(response.ok)await cache.put(request,response);}catch(e){console.warn('PWA pre-cache skipped',path,e);}
    }));
  }));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names.filter(name=>name.startsWith('niouroshi-static-')&&name!==CACHE_NAME).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==SCOPE.origin||!url.pathname.startsWith(SCOPE.pathname))return;
  const path=url.pathname.slice(SCOPE.pathname.length);
  const allowed=new Set(['','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png']);
  if(!allowed.has(path))return;
  const canonical=new URL(path||'./',SCOPE).href;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE_NAME);
    try{
      const response=await fetch(req,{cache:'no-store'});
      if(response.ok)await cache.put(canonical,response.clone());
      return response;
    }catch(error){
      const cached=await cache.match(canonical)||((req.mode==='navigate')?await cache.match(new URL('./index.html',SCOPE).href):null);
      if(cached)return cached;
      throw error;
    }
  })());
});
