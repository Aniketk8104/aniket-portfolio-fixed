const CACHE_NAME = 'aniket-portfolio-v1';
const urlsToCache = ['/', '/index.html', '/manifest.json', '/favicon.ico'];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return Promise.allSettled(
          urlsToCache.map(url =>
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('Cache populated successfully');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('Cache population failed:', error);
      })
  );
});

// Fetch event with better filtering
self.addEventListener('fetch', event => {
  // Skip caching for:
  // - Chrome extensions
  // - Non-HTTP(S) requests
  // - POST requests
  if (
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.startsWith('moz-extension://') ||
    event.request.url.startsWith('safari-extension://') ||
    !event.request.url.startsWith('http') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Only cache same-origin requests
        if (new URL(event.request.url).origin !== location.origin) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache).catch(err => {
            // Silently ignore cache errors for non-critical requests
            if (process.env.NODE_ENV === 'development') {
              console.warn('Failed to cache response:', err);
            }
          });
        });

        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }

          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return new Response(
              `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Offline - Aniket Kushwaha</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      text-align: center; 
                      padding: 50px;
                      background: #0a0a0f;
                      color: #ffffff;
                      margin: 0;
                    }
                    .container {
                      max-width: 400px;
                      margin: 0 auto;
                    }
                    h1 {
                      color: #667eea;
                      margin-bottom: 20px;
                    }
                    p {
                      line-height: 1.6;
                      opacity: 0.8;
                    }
                    .retry-btn {
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      border: none;
                      padding: 12px 24px;
                      border-radius: 8px;
                      cursor: pointer;
                      margin-top: 20px;
                      font-size: 16px;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>You're Offline</h1>
                    <p>Please check your internet connection and try again.</p>
                    <button class="retry-btn" onclick="window.location.reload()">
                      Try Again
                    </button>
                  </div>
                </body>
              </html>
            `,
              {
                headers: { 'Content-Type': 'text/html' },
              }
            );
          }

          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});
