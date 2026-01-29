/**
 * Edge Caching Configuration
 * 
 * Cloudflare/Vercel Edge caching with surrogate key-based purging
 * Regional cache variations for localized content
 */

// Cache header'ları
export const CACHE_HEADERS = {
    // Vercel Edge Cache
    VERCEL_CACHE_CONTROL: 'Vercel-CDN-Cache-Control',

    // Cloudflare Cache
    CLOUDFLARE_CACHE_CONTROL: 'Cloudflare-CDN-Cache-Control',

    // Surrogate Keys (cache invalidation için)
    SURROGATE_KEY: 'Surrogate-Key',
    SURROGATE_CONTROL: 'Surrogate-Control',

    // Cache Tags (Vercel)
    CACHE_TAG: 'Cache-Tag',
};

// Cache süreleri (saniye)
export const EDGE_CACHE_TTL = {
    // Static assets
    STATIC: 60 * 60 * 24 * 365, // 1 yıl

    // Generated pages
    PAGE: 60 * 60 * 24, // 24 saat

    // API responses
    API: 60 * 5, // 5 dakika

    // Sitemap
    SITEMAP: 60 * 60, // 1 saat
};

interface EdgeCacheConfig {
    maxAge: number;
    staleWhileRevalidate?: number;
    tags?: string[];
    bypassCache?: boolean;
}

/**
 * Edge cache header'ları oluştur
 */
export function generateEdgeCacheHeaders(config: EdgeCacheConfig): Record<string, string> {
    const headers: Record<string, string> = {};

    // Vercel Edge Cache Control
    let cacheControl = `public, max-age=${config.maxAge}`;

    if (config.staleWhileRevalidate) {
        cacheControl += `, stale-while-revalidate=${config.staleWhileRevalidate}`;
    }

    headers['Cache-Control'] = cacheControl;
    headers[CACHE_HEADERS.VERCEL_CACHE_CONTROL] = cacheControl;

    // Cloudflare Cache Control
    headers[CACHE_HEADERS.CLOUDFLARE_CACHE_CONTROL] = cacheControl;

    // Surrogate Control (Fastly/Varnish)
    headers[CACHE_HEADERS.SURROGATE_CONTROL] = `max-age=${config.maxAge}`;

    // Cache Tags (invalidation için)
    if (config.tags && config.tags.length > 0) {
        headers[CACHE_HEADERS.CACHE_TAG] = config.tags.join(',');
        headers[CACHE_HEADERS.SURROGATE_KEY] = config.tags.join(' ');
    }

    return headers;
}

/**
 * Local SEO sayfaları için cache header'ları
 */
export function getLocalSeoCacheHeaders(
    province: string,
    service: string,
    district?: string
): Record<string, string> {
    const tags = [
        'local-seo',
        `province:${province}`,
        `service:${service}`,
        ...(district ? [`district:${district}`] : []),
    ];

    return generateEdgeCacheHeaders({
        maxAge: EDGE_CACHE_TTL.PAGE,
        staleWhileRevalidate: 3600, // 1 saat stale
        tags,
    });
}

/**
 * Sitemap için cache header'ları
 */
export function getSitemapCacheHeaders(): Record<string, string> {
    return generateEdgeCacheHeaders({
        maxAge: EDGE_CACHE_TTL.SITEMAP,
        staleWhileRevalidate: 300, // 5 dakika stale
        tags: ['sitemap'],
    });
}

/**
 * Static assets için cache header'ları
 */
export function getStaticAssetCacheHeaders(): Record<string, string> {
    return generateEdgeCacheHeaders({
        maxAge: EDGE_CACHE_TTL.STATIC,
        tags: ['static'],
    });
}

/**
 * Cache bypass header'ları (admin, login vb. için)
 */
export function getNoCacheHeaders(): Record<string, string> {
    return {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        [CACHE_HEADERS.VERCEL_CACHE_CONTROL]: 'no-cache',
        [CACHE_HEADERS.CLOUDFLARE_CACHE_CONTROL]: 'no-cache',
    };
}

/**
 * Cache purge API çağrısı (Vercel)
 */
export async function purgeVercelCache(tags: string[]): Promise<boolean> {
    try {
        const response = await fetch('https://api.vercel.com/v1/integrations/deploy/prj_<PROJECT_ID>/<DEPLOY_TOKEN>', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tags,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Vercel cache purge error:', error);
        return false;
    }
}

/**
 * Cache purge API çağrısı (Cloudflare)
 */
export async function purgeCloudflareCache(tags: string[]): Promise<boolean> {
    const zoneId = process.env.CLOUDFLARE_ZONE_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!zoneId || !apiToken) {
        console.warn('Cloudflare credentials not configured');
        return false;
    }

    try {
        const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tags,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error('Cloudflare cache purge error:', error);
        return false;
    }
}

/**
 * Bölgesel cache varyasyonları için coğrafi header'lar
 */
export function getRegionalCacheHeaders(region: string): Record<string, string> {
    return {
        'Vary': 'Accept-Language, Cookie',
        'Cloudflare-Cache-By-Device-Type': 'true',
        'Cache-Tag': `region:${region}`,
    };
}

// Export types
export type { EdgeCacheConfig };
