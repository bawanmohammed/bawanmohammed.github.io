module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:8000'],
      startServerCommand: 'npm run serve',
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless',
        output: ['html', 'json'],
        outputPath: './lighthouse-reports/',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa']
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['error', { minScore: 0.8 }],
        
        // Performance metrics
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'speed-index': ['error', { maxNumericValue: 2000 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        
        // Resource optimization
        'unused-css-rules': ['error', { maxNumericValue: 5000 }],
        'unused-javascript': ['error', { maxNumericValue: 10000 }],
        'render-blocking-resources': ['error', { maxNumericValue: 0 }],
        'unminified-css': ['error', { maxNumericValue: 0 }],
        'unminified-javascript': ['error', { maxNumericValue: 0 }],
        
        // Image optimization
        'modern-image-formats': ['error', { maxNumericValue: 0 }],
        'uses-optimized-images': ['error', { maxNumericValue: 0 }],
        'uses-responsive-images': ['error', { maxNumericValue: 0 }],
        
        // Caching
        'uses-long-cache-ttl': ['error', { maxNumericValue: 0 }],
        'efficient-animated-content': ['error', { maxNumericValue: 0 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};