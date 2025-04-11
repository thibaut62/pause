// Nom du cache
const CACHE_NAME = 'pause-timer-cache-v1';

// Fichiers à mettre en cache
const filesToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c518b68e5d.mp3?filename=notification-sound-7062.mp3',
  'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c2b4d95a.mp3?filename=phone-ringing-153844.mp3',
  'https://cdn.pixabay.com/download/audio/2022/11/17/audio_78bb4011fa.mp3?filename=interface-124464.mp3',
  'https://cdn-icons-png.flaticon.com/512/3589/3589024.png'
];

// Installation du service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mise en cache des fichiers');
        return cache.addAll(filesToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retourne la réponse mise en cache si elle existe
        if (response) {
          return response;
        }
        
        // Sinon, récupère depuis le réseau
        return fetch(event.request)
          .then(response => {
            // Ne pas mettre en cache si ce n'est pas une requête GET valide
            if (!response || response.status !== 200 || response.type !== 'basic' || event.request.method !== 'GET') {
              return response;
            }
            
            // Clone la réponse
            const responseToCache = response.clone();
            
            // Ajoute la réponse au cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Si la requête concerne une page HTML, affiche la page hors-ligne
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});