// Performance Configuration
// This file contains settings for optimizing website performance

const performanceConfig = {
    // Critical CSS settings
    criticalCSS: {
        width: 1200,
        height: 900,
        penthouse: {
            timeout: 30000,
            pageLoadSkipTimeout: 5000
        }
    },

    // Image optimization settings
    imageOptimization: {
        quality: 85,
        progressive: true,
        svgo: {
            plugins: [
                { removeViewBox: false },
                { removeDimensions: true },
                { cleanupIDs: true }
            ]
        }
    },

    // Bundle size limits
    bundleSizeLimits: {
        'styles/main.css': '10kb',
        'js/main.js': '15kb',
        'assets/favicon.svg': '2kb'
    },

    // Lighthouse performance budgets
    performanceBudgets: {
        'first-contentful-paint': 1500,
        'largest-contentful-paint': 2500,
        'first-input-delay': 100,
        'cumulative-layout-shift': 0.1,
        'speed-index': 2000
    },

    // Service Worker settings
    serviceWorker: {
        cacheVersion: 'v1',
        precacheResources: [
            '/',
            '/index.html',
            '/styles/main.css',
            '/js/main.js'
        ],
        runtimeCaching: [
            {
                urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'images',
                    expiration: {
                        maxEntries: 50,
                        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
                    }
                }
            }
        ]
    },

    // Web Vitals thresholds
    webVitals: {
        LCP: { good: 2500, needsImprovement: 4000 },
        FID: { good: 100, needsImprovement: 300 },
        CLS: { good: 0.1, needsImprovement: 0.25 },
        FCP: { good: 1800, needsImprovement: 3000 },
        TTFB: { good: 800, needsImprovement: 1800 }
    }
};

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = performanceConfig;
}

// Global variable for browser environments
if (typeof window !== 'undefined') {
    window.performanceConfig = performanceConfig;
}