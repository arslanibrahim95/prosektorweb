/**
 * Core Web Vitals Optimization
 * 
 * LCP < 2.5s, FID < 100ms, CLS < 0.1
 * Image optimization, font loading, code splitting
 */

// Metric tipi
interface Metric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    entries: PerformanceEntry[];
    id: string;
    navigationType: string;
}

// Web Vitals thresholds
export const WEB_VITALS_THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 }, // ms
    FID: { good: 100, poor: 300 }, // ms
    CLS: { good: 0.1, poor: 0.25 }, // unitless
    FCP: { good: 1800, poor: 3000 }, // ms
    TTFB: { good: 800, poor: 1800 }, // ms
};

// Metric isimleri
type WebVitalName = 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB';

/**
 * Web Vitals ölçümünü başlat
 */
export function initWebVitalsTracking(
    onReport: (metric: Metric) => void
): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    observeLCP(onReport);

    // First Input Delay
    observeFID(onReport);

    // Cumulative Layout Shift
    observeCLS(onReport);

    // First Contentful Paint
    observeFCP(onReport);

    // Time to First Byte
    observeTTFB(onReport);
}

/**
 * LCP gözlemle
 */
function observeLCP(onReport: (metric: Metric) => void): void {
    if (!('PerformanceObserver' in window)) return;

    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];

            onReport({
                name: 'LCP',
                value: lastEntry.startTime,
                rating: getRating('LCP', lastEntry.startTime),
                delta: 0,
                entries,
                id: 'lcp',
                navigationType: 'navigate',
            });
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] as const });
    } catch (e) {
        // LCP not supported
    }
}

/**
 * FID gözlemle
 */
function observeFID(onReport: (metric: Metric) => void): void {
    if (!('PerformanceObserver' in window)) return;

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const fidEntry = entry as PerformanceEventTiming;
                onReport({
                    name: 'FID',
                    value: fidEntry.processingStart - fidEntry.startTime,
                    rating: getRating('FID', fidEntry.processingStart - fidEntry.startTime),
                    delta: 0,
                    entries: [entry],
                    id: 'fid',
                    navigationType: 'navigate',
                });
            }
        });

        observer.observe({ entryTypes: ['first-input'] as const });
    } catch (e) {
        // FID not supported
    }
}

/**
 * CLS gözlemle
 */
function observeCLS(onReport: (metric: Metric) => void): void {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Layout shift entry
                const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
                if (!layoutShift.hadRecentInput && layoutShift.value) {
                    clsValue += layoutShift.value;
                }
            }

            onReport({
                name: 'CLS',
                value: clsValue,
                rating: getRating('CLS', clsValue),
                delta: 0,
                entries: list.getEntries(),
                id: 'cls',
                navigationType: 'navigate',
            });
        });

        observer.observe({ entryTypes: ['layout-shift'] as const });
    } catch (e) {
        // CLS not supported
    }
}

/**
 * FCP gözlemle
 */
function observeFCP(onReport: (metric: Metric) => void): void {
    if (!('PerformanceObserver' in window)) return;

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    onReport({
                        name: 'FCP',
                        value: entry.startTime,
                        rating: getRating('FCP', entry.startTime),
                        delta: 0,
                        entries: [entry],
                        id: 'fcp',
                        navigationType: 'navigate',
                    });
                }
            }
        });

        observer.observe({ entryTypes: ['paint'] as const });
    } catch (e) {
        // FCP not supported
    }
}

/**
 * TTFB gözlemle
 */
function observeTTFB(onReport: (metric: Metric) => void): void {
    if (typeof window === 'undefined') return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
        const ttfb = navigation.responseStart - navigation.startTime;
        onReport({
            name: 'TTFB',
            value: ttfb,
            rating: getRating('TTFB', ttfb),
            delta: 0,
            entries: [navigation],
            id: 'ttfb',
            navigationType: 'navigate',
        });
    }
}

/**
 * Metric değerini rating'e çevir
 */
function getRating(name: WebVitalName, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = WEB_VITALS_THRESHOLDS[name];
    if (!threshold) return 'needs-improvement';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

/**
 * LCP optimizasyonu için öneriler
 */
export function getLCPOptimizations(): string[] {
    return [
        'Hero görselini preload et',
        'Görselleri WebP formatında kullan',
        'Critical CSS inline et',
        'Font display: swap kullan',
        'Server response time optimize et',
    ];
}

/**
 * CLS optimizasyonu için öneriler
 */
export function getCLSOptimizations(): string[] {
    return [
        'Görsellere width ve height attribute ekle',
        'Font swap period için fallback font tanımla',
        'Dinamik içerik için reserved space kullan',
        'Third-party embedler için placeholder kullan',
        'Animation ve transform kullan (layout değil)',
    ];
}

/**
 * FID optimizasyonu için öneriler
 */
export function getFIDOptimizations(): string[] {
    return [
        'Long tasks böl (yield to main thread)',
        'Third-party scriptleri async/defer yükle',
        'JavaScript bundle boyutunu azalt',
        'Code splitting kullan',
        'Web Workers kullan (heavy computation için)',
    ];
}

/**
 * Image optimization config
 */
export const IMAGE_OPTIMIZATION = {
    // Next.js Image component için
    sizes: {
        hero: { width: 1200, height: 630 },
        thumbnail: { width: 400, height: 300 },
        icon: { width: 64, height: 64 },
    },
    formats: ['image/webp', 'image/avif'],
    quality: 85,
    placeholder: 'blur' as const,
    loading: 'eager' as const, // Hero images için
};

/**
 * Font loading stratejisi
 */
export const FONT_LOADING_STRATEGY = {
    // Google Fonts için
    display: 'swap' as const,
    preload: true,
    // Critical fonts
    criticalFonts: ['Inter', 'Roboto'],
    // Font subset
    subsets: ['latin', 'latin-ext'],
};

/**
 * Code splitting stratejisi
 */
export const CODE_SPLITTING = {
    // Route bazlı splitting
    routes: [
        '/admin',
        '/portal',
        '/blog',
    ],
    // Component bazlı splitting
    components: [
        'LocalSeoPage',
        'AnalyticsCharts',
        'PDFGenerator',
    ],
    // Library bazlı splitting
    libraries: {
        chart: 'recharts',
        pdf: 'jspdf',
        map: 'leaflet',
    },
};

/**
 * Resource loading optimizasyonu
 */
export function optimizeResourceLoading(): void {
    if (typeof window === 'undefined') return;

    // Preconnect to critical origins
    const preconnectUrls = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
    ];

    preconnectUrls.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = url;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });

    // DNS prefetch for analytics
    const dnsPrefetchUrls = [
        'https://plausible.io',
    ];

    dnsPrefetchUrls.forEach((url) => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = url;
        document.head.appendChild(link);
    });
}

/**
 * Lazy loading threshold
 */
export const LAZY_LOADING_CONFIG = {
    rootMargin: '200px', // 200px before viewport
    threshold: 0.01,
};

/**
 * Critical CSS extract (build time)
 */
export const CRITICAL_CSS = {
    // Above-the-fold CSS
    aboveFold: [
        'body{font-family:Inter,sans-serif}',
        '.hero{min-height:60vh}',
        '.navbar{position:fixed;top:0}',
    ],
    // Inline critical CSS max size
    maxSize: 14 * 1024, // 14KB (gzip single round-trip)
};

/**
 * Performance budget
 */
export const PERFORMANCE_BUDGET = {
    javascript: {
        initial: 200 * 1024, // 200KB
        total: 800 * 1024, // 800KB
    },
    css: {
        initial: 50 * 1024, // 50KB
        total: 150 * 1024, // 150KB
    },
    images: {
        initial: 250 * 1024, // 250KB
        total: 2000 * 1024, // 2MB
    },
    fonts: {
        initial: 100 * 1024, // 100KB
        total: 300 * 1024, // 300KB
    },
};

// No additional type declarations needed - using inline type assertions

// Export types
export type { WebVitalName, Metric };
