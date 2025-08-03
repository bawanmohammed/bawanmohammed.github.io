// Performance-optimized JavaScript with modern best practices

// Immediately Invoked Function Expression to avoid global namespace pollution
(function() {
    'use strict';

    // Performance monitoring
    const perfObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
                console.log('Navigation timing:', entry);
            }
        }
    });
    
    if ('observe' in perfObserver) {
        perfObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
    }

    // Web Vitals tracking
    function trackWebVitals() {
        if ('web-vitals' in window) {
            // This would typically be loaded from a CDN
            import('https://unpkg.com/web-vitals@3/dist/web-vitals.js').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
                onCLS(console.log);
                onFID(console.log);
                onFCP(console.log);
                onLCP(console.log);
                onTTFB(console.log);
            }).catch(() => {
                console.log('Web Vitals library failed to load');
            });
        }
    }

    // Debounce function for performance optimization
    function debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }

    // Intersection Observer for lazy loading and animations
    const observerOptions = {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Lazy load images
                if (target.dataset.src) {
                    target.src = target.dataset.src;
                    target.removeAttribute('data-src');
                }
                
                // Add animation class
                if (target.classList.contains('animate-on-scroll')) {
                    target.classList.add('animate');
                }
                
                observer.unobserve(target);
            }
        });
    }, observerOptions);

    // Smooth scrolling with performance optimization
    function smoothScroll(target) {
        const targetElement = document.querySelector(target);
        if (targetElement) {
            // Use native smooth scrolling if supported
            if ('scrollBehavior' in document.documentElement.style) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                // Fallback for older browsers
                const targetPosition = targetElement.offsetTop;
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 1000;
                let start = null;

                function step(timestamp) {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const progressPercentage = Math.min(progress / duration, 1);
                    
                    // Easing function
                    const ease = progressPercentage * (2 - progressPercentage);
                    
                    window.scrollTo(0, startPosition + distance * ease);
                    
                    if (progress < duration) {
                        requestAnimationFrame(step);
                    }
                }
                
                requestAnimationFrame(step);
            }
        }
    }

    // Efficient DOM manipulation
    function createElement(tag, className, textContent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    // Project data with lazy loading
    const projects = [
        {
            title: 'Portfolio Website',
            description: 'A performance-optimized portfolio website built with modern web standards.',
            image: 'assets/project1.svg',
            demo: '#',
            code: '#'
        },
        {
            title: 'Web Application',
            description: 'A responsive web application with advanced functionality.',
            image: 'assets/project2.svg',
            demo: '#',
            code: '#'
        },
        {
            title: 'Mobile App',
            description: 'A cross-platform mobile application.',
            image: 'assets/project3.svg',
            demo: '#',
            code: '#'
        }
    ];

    // Render projects with performance optimization
    function renderProjects() {
        const projectsGrid = document.querySelector('.projects-grid');
        if (!projectsGrid) return;

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        projects.forEach(project => {
            const projectCard = createElement('div', 'project-card animate-on-scroll');
            
            projectCard.innerHTML = `
                <img data-src="${project.image}" alt="${project.title}" loading="lazy">
                <div class="project-card-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-links">
                        <a href="${project.demo}" class="project-link" target="_blank" rel="noopener">
                            <span>Live Demo</span>
                        </a>
                        <a href="${project.code}" class="project-link" target="_blank" rel="noopener">
                            <span>Source Code</span>
                        </a>
                    </div>
                </div>
            `;

            fragment.appendChild(projectCard);
        });

        projectsGrid.appendChild(fragment);

        // Observe images for lazy loading
        projectsGrid.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });

        // Observe cards for animations
        projectsGrid.querySelectorAll('.animate-on-scroll').forEach(card => {
            observer.observe(card);
        });
    }

    // Handle smooth scrolling for navigation links
    function handleNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[href^="#"]')) {
                e.preventDefault();
                const target = e.target.getAttribute('href');
                smoothScroll(target);
            }
        });
    }

    // Optimize scroll events with debouncing
    const handleScroll = debounce(() => {
        // Add any scroll-based functionality here
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for hero section (if needed)
        const hero = document.querySelector('.hero');
        if (hero && scrolled < hero.offsetHeight) {
            hero.style.transform = `translateY(${rate}px)`;
        }
    }, 16); // ~60fps

    // Preload critical resources
    function preloadCriticalResources() {
        const criticalImages = [
            'assets/project1.svg',
            'assets/project2.svg',
            'assets/project3.svg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }

    // Initialize application
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize components
        renderProjects();
        handleNavigation();
        
        // Add scroll listener with debouncing
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Preload resources
        requestIdleCallback(() => {
            preloadCriticalResources();
            trackWebVitals();
        });

        // Add loading complete class for animations
        document.body.classList.add('loaded');
    }

    // Start the application
    init();

    // Error handling for better user experience
    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
        // Could send to analytics service
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
        e.preventDefault();
    });

})();