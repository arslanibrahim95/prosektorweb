/**
 * Analytics Tracking Module
 * 
 * Google Analytics 4 ve Plausible entegrasyonu
 * Server-side tracking için privacy compliance
 */

// Analytics provider tipi
type AnalyticsProvider = 'ga4' | 'plausible' | 'both';

// Event tipleri
export type AnalyticsEvent =
    | 'page_view'
    | 'cta_click'
    | 'phone_click'
    | 'form_start'
    | 'form_submit'
    | 'service_view'
    | 'location_view'
    | 'neighbor_click'
    | 'related_page_click'
    | 'web_vitals';

// Event parametreleri
interface EventParams {
    province?: string;
    district?: string;
    service?: string;
    service_slug?: string;
    location?: string;
    url?: string;
    [key: string]: string | number | boolean | undefined;
}

// GA4 Measurement ID
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID;

// Plausible domain
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_API_HOST = process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io';

/**
 * Client-side event tracking
 */
export function trackEvent(
    eventName: AnalyticsEvent,
    params: EventParams = {}
): void {
    // GA4 tracking
    if (typeof window !== 'undefined' && window.gtag && GA4_MEASUREMENT_ID) {
        window.gtag('event', eventName, {
            ...params,
            custom_parameter_1: params.province,
            custom_parameter_2: params.service,
            page_location: window.location.href,
            page_title: document.title,
        });
    }

    // Plausible tracking
    if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(eventName, { props: params });
    }
}

/**
 * Server-side page view tracking
 * Privacy-compliant, IP anonymization
 */
export async function trackServerSidePageView(
    path: string,
    params: EventParams = {}
): Promise<void> {
    // Dynamically import headers only when running on server
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';

    // GA4 server-side tracking
    if (GA4_MEASUREMENT_ID && process.env.GA4_API_SECRET) {
        await trackGA4ServerSide({
            client_id: await generateClientId(headersList),
            events: [{
                name: 'page_view',
                params: {
                    page_location: `https://prosektorweb.com${path}`,
                    page_referrer: referer,
                    engagement_time_msec: '100',
                    ...params,
                },
            }],
        });
    }

    // Plausible server-side tracking
    if (PLAUSIBLE_DOMAIN) {
        await trackPlausibleServerSide({
            name: 'pageview',
            url: `https://prosektorweb.com${path}`,
            domain: PLAUSIBLE_DOMAIN,
            referrer: referer,
            user_agent: userAgent,
        });
    }
}

/**
 * GA4 server-side tracking
 */
async function trackGA4ServerSide(payload: {
    client_id: string;
    events: Array<{ name: string; params: Record<string, string> }>;
}): Promise<void> {
    try {
        const response = await fetch(
            `https://www.google-analytics.com/mp/collect?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${process.env.GA4_API_SECRET}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            console.error('GA4 tracking failed:', response.statusText);
        }
    } catch (error) {
        console.error('GA4 tracking error:', error);
    }
}

/**
 * Plausible server-side tracking
 */
async function trackPlausibleServerSide(payload: {
    name: string;
    url: string;
    domain: string;
    referrer: string;
    user_agent: string;
}): Promise<void> {
    try {
        const response = await fetch(`${PLAUSIBLE_API_HOST}/api/event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': payload.user_agent,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Plausible tracking failed:', response.statusText);
        }
    } catch (error) {
        console.error('Plausible tracking error:', error);
    }
}

/**
 * Client ID oluştur (privacy-compliant)
 */
async function generateClientId(headersList: { get: (name: string) => string | null }): Promise<string> {
    // Hash-based client ID (IP + User-Agent) - anonymized
    const data = `${headersList.get('x-forwarded-for') || ''}${headersList.get('user-agent') || ''}`;

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    return `server_${Math.abs(hash).toString(16)}`;
}

/**
 * CTA tıklama tracking'i
 */
export function trackCTAClick(
    ctaType: 'phone' | 'form' | 'whatsapp' | 'email',
    params: EventParams
): void {
    trackEvent('cta_click', {
        cta_type: ctaType,
        ...params,
    });
}

/**
 * Komşu il tıklama tracking'i
 */
export function trackNeighborClick(
    neighborProvince: string,
    currentProvince: string,
    service: string
): void {
    trackEvent('neighbor_click', {
        neighbor_province: neighborProvince,
        current_province: currentProvince,
        service,
    });
}

/**
 * Hizmet görüntüleme tracking'i
 */
export function trackServiceView(
    service: string,
    province: string,
    district?: string
): void {
    trackEvent('service_view', {
        service,
        province,
        district: district || 'none',
        location: district ? `${district}, ${province}` : province,
    });
}

/**
 * Web Vitals tracking
 */
export function trackWebVitals(params: {
    metricName: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    pageType?: string;
    city?: string;
    service?: string;
}): void {
    trackEvent('web_vitals', {
        metric_name: params.metricName,
        metric_value: params.value.toString(),
        metric_rating: params.rating,
        page_type: params.pageType,
        city: params.city,
        service: params.service,
    });

    // Also send to GA4 as custom event
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: params.metricName,
            value: Math.round(params.value),
            custom_parameter_1: params.rating,
            custom_parameter_2: params.pageType,
            custom_parameter_3: params.city,
        });
    }
}

// Global type declarations
declare global {
    interface Window {
        gtag: (...args: unknown[]) => void;
        plausible: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
        dataLayer: unknown[];
    }
}
