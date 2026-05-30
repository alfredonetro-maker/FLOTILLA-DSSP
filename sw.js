importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBpndJT2kwY2ixrPxLjmzmVjbTo4gw60o8",
    authDomain: "flotilla-c18a3.firebaseapp.com",
    projectId: "flotilla-c18a3",
    storageBucket: "flotilla-c18a3.firebasestorage.app",
    messagingSenderId: "819346593147",
    appId: "1:819346593147:web:6781408a7a37bd60e519de",
    measurementId: "G-HY32S0HD1H"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
    console.log('[sw.js] Background message:', payload);
    const notificationTitle = payload.notification?.title || '💬 FlotaControl Chat';
    const notificationOptions = {
        body:    payload.notification?.body || 'Tienes un nuevo mensaje de la flota',
        icon:    '/icon-192.png',
        badge:   '/icon-192.png',
        vibrate: [200, 100, 200],
        tag:     'flotacontrol-chat',
        renotify: true,
        data: { url: payload.data?.url || '/' },
        actions: [{ action: 'open_chat', title: '💬 Abrir Chat' }]
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});

const CACHE_NAME = 'flotacontrol-v13';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'toyota_hilux_white.png',
  'urgente_bg.png'
];

// Instalar y forzar la activación inmediata
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Limpiar cachés antiguas y reclamar el control de los clientes
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('PWA: Limpiando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First con fallback a Caché para peticiones GET
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Guardar copia en el caché si la respuesta es válida
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, resClone);
          });
        }
        return res;
      })
      .catch(() => {
        // Si no hay red, servir desde el caché
        return caches.match(e.request);
      })
  );
});
