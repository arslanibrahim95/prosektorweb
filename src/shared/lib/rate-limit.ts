/**
 * @file src/shared/lib/rate-limit.ts
 * @description Sliding Window rate limiter using Redis.
 * @invariants Falls open (allows traffic) if Redis is down, unless configured otherwise.
 */
import { redis } from './redis'
import { logger } from './logger'
import { Ratelimit } from '@upstash/ratelimit'
import { headers as nextHeaders } from 'next/headers'

/**
 * İstemci IP adresini alır.
 * Vercel ve Cloudflare header'larını destekler.
 *
 * @returns İstemci IP adresi
 *
 * @example
 * ```typescript
 * const ip = await getClientIp();
 * // '192.168.1.1' veya '127.0.0.1'
 * ```
 */
export async function getClientIp(): Promise<string> {
    try {
        const h = await nextHeaders()

        // Vercel / Cloudflare (en güvenilir)
        const vercelForwarded = h.get('x-vercel-forwarded-for')
        if (vercelForwarded) {
            const ip = vercelForwarded.split(',')[0]?.trim()
            if (ip && isValidIp(ip)) return ip
        }

        // X-Real-IP (Nginx, Apache)
        const realIp = h.get('x-real-ip')
        if (realIp && isValidIp(realIp)) return realIp

        // X-Forwarded-For (standart proxy header)
        const forwardedFor = h.get('x-forwarded-for')
        if (forwardedFor) {
            const ip = forwardedFor.split(',')[0]?.trim()
            if (ip && isValidIp(ip)) return ip
        }

        return '127.0.0.1'
    } catch (error) {
        logger.warn({ error }, 'Failed to get client IP, using fallback')
        return '127.0.0.1'
    }
}

/**
 * IP adresi formatını doğrular
 *
 * @param ip - IP adresi string
 * @returns true eğer geçerli IP ise
 */
function isValidIp(ip: string): boolean {
    // IPv4 regex
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    // IPv6 regex (basit)
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}$|^(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}$|^(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}$|^:(?::[0-9a-fA-F]{1,4}){1,7}$|^::$/

    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
}

/**
 * Rate limit kontrolü için seçenekler.
 */
export interface RateLimitOptions {
    /** Pencere içinde izin verilen maksimum istek sayısı */
    limit?: number
    /** Pencere süresi (saniye cinsinden) */
    windowSeconds?: number
    /**
     * Eğer true ise, Redis hatalarında { success: false } döndürür.
     * Kimlik doğrulama gibi güvenlik kritik endpoint'ler için kullanın.
     * Varsayılan: false (fail open - hata durumunda isteklere izin verir)
     */
    failClosed?: boolean
}


/**
 * Önceden tanımlı rate limit seviyeleri.
 * Farklı kullanım senaryoları için optimize edilmiş limitler.
 */
export const RATE_LIMIT_TIERS = {
    /** Mutlak üst limit - tüm istekler için */
    GLOBAL: { limit: 500, window: 60 },
    /** HTML sayfaları için burst koruması */
    PAGE: { limit: 50, window: 10 },
    /** Standart API kullanımı */
    API: { limit: 100, window: 60 },
    /** Sıkı login/kimlik doğrulama koruması */
    AUTH: { limit: 10, window: 60 },
    /** Şüpheli IP'ler için çok sıkı limit */
    BOT: { limit: 5, window: 60 },
    /** Giriş yapmış kullanıcılar için yüksek limit */
    AUTHENTICATED: { limit: 1000, window: 60 },
    /** Admin kullanıcılar için çok yüksek limit */
    ADMIN: { limit: 5000, window: 60 }
} as const

// Yüksek trafik için bellek cache'i (opsiyonel)
const cache = new Map()

/**
 * Rate limit kontrolü yapar (Sliding Window algoritması).
 * Redis kullanarak dağıtık rate limiting sağlar.
 *
 * @param identifier - Rate limit uygulanacak tanımlayıcı (opsiyonel, varsayılan: IP adresi)
 * @param options - Rate limit seçenekleri
 * @returns Rate limit durumu ve metadata
 *
 * @example
 * ```typescript
 * // Temel kullanım
 * const result = await checkRateLimit();
 * if (!result.success) {
 *   return new Response('Too Many Requests', { status: 429 });
 * }
 *
 * // Özel limit ile
 * const result = await checkRateLimit(userId, {
 *   limit: 100,
 *   windowSeconds: 60,
 *   failClosed: true // Redis hatasında bloke et
 * });
 *
 * // Tier kullanımı
 * const result = await checkRateLimit(ip, RATE_LIMIT_TIERS.AUTH);
 * ```
 */
export async function checkRateLimit(
    identifier?: string,
    options: RateLimitOptions = {}
): Promise<{ success: boolean; reset?: Date; limit?: number; remaining?: number }> {
    const {
        limit = 10,
        windowSeconds = 60,
        failClosed = false
    } = options

    const finalIdentifier = identifier || await getClientIp()

    try {
        if (!process.env.UPSTASH_REDIS_REST_URL) {
            logger.warn({ identifier: finalIdentifier }, 'Redis not configured, bypassing rate limit')
            // Güvenlik kritik endpoint'ler için bypass etme - fail closed
            if (failClosed) {
                return { success: false, reset: new Date(Date.now() + 60000) }
            }
            return { success: true }
        }

        // Her farklı limit/window konfigürasyonu için yeni instance oluştur
        const ratelimit = new Ratelimit({
            redis: redis,
            limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
            analytics: true,
            prefix: '@upstash/ratelimit',
            ephemeralCache: cache,
        })

        // Rate limit kontrolü yap
        const { success, limit: limitUsed, remaining, reset } = await ratelimit.limit(finalIdentifier)

        return {
            success,
            limit: limitUsed,
            remaining,
            reset: new Date(reset)
        }

    } catch (error) {
        logger.error({ error, identifier: finalIdentifier }, 'Rate limit error')

        // Fail Closed: Hata durumunda isteği engelle (auth gibi güvenlik kritik endpoint'ler için)
        // Fail Open: Hata durumunda isteğe izin ver (erişilebilirlik öncelikli)
        if (failClosed) {
            return { success: false, reset: new Date(Date.now() + 60000) } // 1 dk sonra tekrar dene
        }

        return { success: true }
    }
}
