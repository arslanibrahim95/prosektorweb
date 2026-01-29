/**
 * Web Vitals Tracker Component
 * 
 * Tracks Core Web Vitals and reports to analytics
 */

'use client';

import { useEffect, useRef } from 'react';
import { initWebVitalsTracking, type Metric } from '../lib/web-vitals';
import { trackWebVitals } from '@/features/analytics/lib/tracking';

interface WebVitalsTrackerProps {
    pageType?: string;
    city?: string;
    service?: string;
}

export function WebVitalsTracker({ pageType, city, service }: WebVitalsTrackerProps) {
    const reportedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;

        const handleMetric = (metric: Metric) => {
            // Prevent duplicate reports
            const key = `${metric.name}-${metric.id}`;
            if (reportedRef.current.has(key)) return;
            reportedRef.current.add(key);

            // Track to analytics
            trackWebVitals({
                metricName: metric.name,
                value: metric.value,
                rating: metric.rating,
                pageType,
                city,
                service,
            });

            // Log in development
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Web Vitals] ${metric.name}:`, {
                    value: metric.value,
                    rating: metric.rating,
                    pageType,
                    city,
                    service,
                });
            }
        };

        // Initialize tracking
        initWebVitalsTracking(handleMetric);

        // Cleanup not needed - observers run until page unload
    }, [pageType, city, service]);

    // This component doesn't render anything
    return null;
}

/**
 * Preconnect component for resource hints
 */
export function ResourceHints() {
    return (
        <>
            {/* Preconnect to critical origins */}
            <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />

            {/* DNS prefetch */}
            <link rel="dns-prefetch" href="https://plausible.io" />
        </>
    );
}

/**
 * Critical CSS inline component
 */
export function CriticalCSS() {
    const criticalStyles = `
    /* Critical above-fold styles */
    *,*::before,*::after{box-sizing:border-box}
    html{-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4}
    body{margin:0;font-family:system-ui,-apple-system,sans-serif;line-height:1.5}
    img{max-width:100%;height:auto;display:block}
    .hero{min-height:60vh;display:flex;align-items:center;justify-content:center}
    .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  `;

    return (
        <style
            dangerouslySetInnerHTML={{ __html: criticalStyles }}
            data-critical="true"
        />
    );
}
