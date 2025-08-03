#!/usr/bin/env node

/**
 * Performance Testing Script
 * Validates that all optimization targets are met
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MAX_SIZES = {
    'styles/main.css': 10 * 1024, // 10KB
    'js/main.js': 15 * 1024,      // 15KB
    'assets/favicon.svg': 2 * 1024, // 2KB
    'index.html': 50 * 1024       // 50KB
};

const REQUIRED_FILES = [
    'index.html',
    'styles/main.css',
    'js/main.js',
    'sw.js',
    'manifest.json',
    'assets/favicon.svg',
    'assets/project1.svg',
    'assets/project2.svg',
    'assets/project3.svg'
];

// Performance tests
function checkFileSize(filePath, maxSize) {
    if (!fs.existsSync(filePath)) {
        return { passed: false, message: `File ${filePath} does not exist` };
    }
    
    const stats = fs.statSync(filePath);
    const size = stats.size;
    
    if (size > maxSize) {
        return {
            passed: false,
            message: `File ${filePath} is ${size} bytes, exceeds limit of ${maxSize} bytes`
        };
    }
    
    return {
        passed: true,
        message: `File ${filePath} size OK: ${size} bytes (limit: ${maxSize})`
    };
}

function checkCriticalCSS() {
    const indexContent = fs.readFileSync('index.html', 'utf8');
    
    // Check for inlined critical CSS
    const hasCriticalCSS = indexContent.includes('<style>') && 
                          indexContent.includes('Critical above-the-fold styles');
    
    // Check for async CSS loading
    const hasAsyncCSS = indexContent.includes('rel="preload"') && 
                       indexContent.includes('onload="this.onload=null;this.rel=\'stylesheet\'"');
    
    return {
        passed: hasCriticalCSS && hasAsyncCSS,
        message: `Critical CSS inlined: ${hasCriticalCSS}, Async CSS loading: ${hasAsyncCSS}`
    };
}

function checkServiceWorker() {
    if (!fs.existsSync('sw.js')) {
        return { passed: false, message: 'Service Worker file missing' };
    }
    
    const swContent = fs.readFileSync('sw.js', 'utf8');
    const hasInstallEvent = swContent.includes('addEventListener(\'install\'');
    const hasFetchEvent = swContent.includes('addEventListener(\'fetch\'');
    const hasCaching = swContent.includes('caches.open');
    
    return {
        passed: hasInstallEvent && hasFetchEvent && hasCaching,
        message: `SW events: install(${hasInstallEvent}), fetch(${hasFetchEvent}), caching(${hasCaching})`
    };
}

function checkPWAManifest() {
    if (!fs.existsSync('manifest.json')) {
        return { passed: false, message: 'Web App Manifest missing' };
    }
    
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    return {
        passed: missingFields.length === 0,
        message: missingFields.length === 0 ? 'Manifest complete' : `Missing fields: ${missingFields.join(', ')}`
    };
}

function checkLazyLoading() {
    const jsContent = fs.readFileSync('js/main.js', 'utf8');
    const hasIntersectionObserver = jsContent.includes('IntersectionObserver');
    const hasDataSrc = jsContent.includes('dataset.src');
    
    return {
        passed: hasIntersectionObserver && hasDataSrc,
        message: `Intersection Observer: ${hasIntersectionObserver}, Data-src loading: ${hasDataSrc}`
    };
}

function checkPerformanceMonitoring() {
    const jsContent = fs.readFileSync('js/main.js', 'utf8');
    const hasPerformanceObserver = jsContent.includes('PerformanceObserver');
    const hasWebVitals = jsContent.includes('web-vitals');
    
    return {
        passed: hasPerformanceObserver || hasWebVitals,
        message: `Performance Observer: ${hasPerformanceObserver}, Web Vitals: ${hasWebVitals}`
    };
}

// Run all tests
function runPerformanceTests() {
    console.log('🚀 Running Performance Tests...\n');
    
    const tests = [
        { name: 'File Existence', test: () => {
            const missing = REQUIRED_FILES.filter(file => !fs.existsSync(file));
            return {
                passed: missing.length === 0,
                message: missing.length === 0 ? 'All required files exist' : `Missing: ${missing.join(', ')}`
            };
        }},
        { name: 'Bundle Sizes', test: () => {
            const failures = [];
            for (const [file, maxSize] of Object.entries(MAX_SIZES)) {
                const result = checkFileSize(file, maxSize);
                if (!result.passed) failures.push(result.message);
            }
            return {
                passed: failures.length === 0,
                message: failures.length === 0 ? 'All bundle sizes within limits' : failures.join('\n')
            };
        }},
        { name: 'Critical CSS', test: checkCriticalCSS },
        { name: 'Service Worker', test: checkServiceWorker },
        { name: 'PWA Manifest', test: checkPWAManifest },
        { name: 'Lazy Loading', test: checkLazyLoading },
        { name: 'Performance Monitoring', test: checkPerformanceMonitoring }
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(({ name, test }) => {
        try {
            const result = test();
            if (result.passed) {
                console.log(`✅ ${name}: ${result.message}`);
                passed++;
            } else {
                console.log(`❌ ${name}: ${result.message}`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${name}: Error - ${error.message}`);
            failed++;
        }
    });
    
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed === 0) {
        console.log('🎉 All performance tests passed!');
        process.exit(0);
    } else {
        console.log('⚠️  Some performance tests failed. Please review and fix issues.');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runPerformanceTests();
}

module.exports = { runPerformanceTests, checkFileSize, checkCriticalCSS };