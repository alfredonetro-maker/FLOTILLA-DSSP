// firebase-messaging-sw.js
// Service Worker para notificaciones push en segundo plano (Firebase Cloud Messaging)

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

// Manejar mensajes en segundo plano (cuando la app está cerrada o minimizada)
messaging.onBackgroundMessage(payload => {
    console.log('[firebase-messaging-sw.js] Background message:', payload);

    const notificationTitle = payload.notification?.title || '💬 FlotaControl Chat';
    const notificationOptions = {
        body:    payload.notification?.body || 'Tienes un nuevo mensaje de la flota',
        icon:    '/icon-192.png',
        badge:   '/icon-192.png',
        vibrate: [200, 100, 200],
        tag:     'flotacontrol-chat',
        renotify: true,
        data: {
            url: payload.data?.url || '/'
        },
        actions: [
            { action: 'open_chat', title: '💬 Abrir Chat' }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Abrir la app al hacer clic en la notificación
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Si ya hay una ventana abierta, enfocarla
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no hay ventana, abrir una nueva
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
