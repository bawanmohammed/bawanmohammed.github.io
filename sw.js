// Service Worker for Performance Optimization
// Version 1.0.0

const CACHE_NAME = 'portfolio-v1';
const RUNTIME_CACHE = 'portfolio-runtime-v1';

// Resources to cache immediately on install
const PRECACHE_RESOURCES = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/js/main.js',
    '/assets/favicon.svg',
    '/assets/project1.svg',
    '/assets/project2.svg',
    '/assets/project3.svg'
];

// Install event - precache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Precaching resources');
                return cache.addAll(PRECACHE_RESOURCES);
            })
            .then(() => {
                // Force activation of new service worker
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete old caches
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                // Take control of all pages immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only handle HTTP/HTTPS requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Different strategies for different types of requests
    if (request.destination === 'document') {
        // HTML documents - Network First with fallback
        event.respondWith(networkFirstStrategy(request));
    } else if (request.destination === 'style' || request.destination === 'script') {
        // CSS and JS - Cache First
        event.respondWith(cacheFirstStrategy(request));
    } else if (request.destination === 'image') {
        // Images - Cache First with network fallback
        event.respondWith(cacheFirstStrategy(request));
    } else {
        // Everything else - Stale While Revalidate
        event.respondWith(staleWhileRevalidateStrategy(request));
    }
});

// Network First Strategy - For HTML documents
async function networkFirstStrategy(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // If successful, cache and return
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        // If network fails, try cache
        throw new Error('Network response not ok');
    } catch (error) {
        // Fall back to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If no cache, return offline page or error
        if (request.destination === 'document') {
            return caches.match('/index.html');
        }
        
        throw error;
    }
}

// Cache First Strategy - For static assets
async function cacheFirstStrategy(request) {
    try {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If not in cache, fetch from network
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('Cache First strategy failed:', error);
        throw error;
    }
}

// Stale While Revalidate Strategy - For API calls and other resources
async function staleWhileRevalidateStrategy(request) {
    try {
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        
        // Fetch from network in background
        const networkResponsePromise = fetch(request).then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
            }
            return response;
        });
        
        // Return cached version immediately if available
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Otherwise wait for network
        return await networkResponsePromise;
    } catch (error) {
        console.error('Stale While Revalidate strategy failed:', error);
        throw error;
    }
}

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Implement background sync logic here
    console.log('Background sync triggered');
}

// Push notification support
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/favicon.svg',
            badge: '/assets/favicon.svg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Explore',
                    icon: '/assets/favicon.svg'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/assets/favicon.svg'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Performance monitoring
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PERFORMANCE_MEASURE') {
        console.log('Performance measure:', event.data.measure);
    }
});

// Prefetch important resources on idle
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PREFETCH_RESOURCES') {
        event.waitUntil(prefetchResources(event.data.urls));
    }
});

async function prefetchResources(urls) {
    const cache = await caches.open(RUNTIME_CACHE);
    
    for (const url of urls) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                await cache.put(url, response);
            }
        } catch (error) {
            console.warn('Failed to prefetch:', url, error);
        }
    }
}