/**
 * @file src/shared/lib/headers.ts
 * @description Next.js App Router için type-safe header utility modülü.
 * Server-side header manipülasyonu için async/await pattern'leri ve edge runtime uyumluluğu sağlar.
 *
 * @example
 * ```typescript
 * // Temel kullanım
 * const userAgent = await getHeader('user-agent');
 * const ip = await getClientIp();
 * const origin = await getOrigin();
 *
 * // Güvenli header erişimi
 * const safeHeader = await getHeaderOrDefault('x-custom-header', 'default-value');
 * ```
 */

import { headers as nextHeaders, cookies as nextCookies } from 'next/headers'
import { logger } from './logger'

// =============================================================================
// TYPES
// =============================================================================

/**
 * HTTP Header'ları için type-safe tanımlamalar
 */
export type KnownHeader =
    // Standard HTTP Headers
    | 'accept'
    | 'accept-encoding'
    | 'accept-language'
    | 'authorization'
    | 'cache-control'
    | 'connection'
    | 'content-length'
    | 'content-type'
    | 'cookie'
    | 'host'
    | 'origin'
    | 'referer'
    | 'user-agent'
    // Proxy/CDN Headers
    | 'x-forwarded-for'
    | 'x-forwarded-host'
    | 'x-forwarded-proto'
    | 'x-real-ip'
    | 'x-vercel-forwarded-for'
    | 'x-vercel-id'
    // Security Headers
    | 'x-request-id'
    | 'x-csrf-token'
    | 'x-idempotency-key'
    // Custom Headers
    | `x-${string}`

/**
 * Cookie işlemleri için seçenekler
 */
export interface CookieOptions {
    path?: string
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    maxAge?: number
    expires?: Date
    domain?: string
}

/**
 * Header okuma sonucu
 */
export interface HeaderResult<T> {
    value: T | null
    exists: boolean
    error?: string
}

// =============================================================================
// ERRORS
// =============================================================================

/**
 * Header işlemleri için özel hata sınıfı
 */
export class HeaderError extends Error {
    constructor(
        message: string,
        public readonly headerName?: string,
        public readonly code: 'MISSING_HEADER' | 'INVALID_VALUE' | 'RUNTIME_ERROR' = 'RUNTIME_ERROR'
    ) {
        super(message)
        this.name = 'HeaderError'
    }
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Next.js headers() wrapper'ı - Promise<ReadonlyHeaders> döner
 * Edge runtime ve Node.js runtime'da çalışır
 *
 * @returns Promise<Headers> - Next.js header store
 * @throws HeaderError - Eğer headers() çağrılamazsa
 *
 * @example
 * ```typescript
 * const headerStore = await getHeaders();
 * const value = headerStore.get('user-agent');
 * ```
 */
export async function getHeaders(): Promise<Headers> {
    try {
        const h = await nextHeaders()
        return h as unknown as Headers
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.error({ error: message }, 'Failed to get headers')
        throw new HeaderError(
            `Headers could not be retrieved: ${message}`,
            undefined,
            'RUNTIME_ERROR'
        )
    }
}

/**
 * Next.js cookies() wrapper'ı - Promise<ReadonlyRequestCookies> döner
 * Edge runtime ve Node.js runtime'da çalışır
 *
 * @returns Promise<CookieStore> - Next.js cookie store
 * @throws HeaderError - Eğer cookies() çağrılamazsa
 */
export async function getCookies() {
    try {
        return await nextCookies()
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.error({ error: message }, 'Failed to get cookies')
        throw new HeaderError(
            `Cookies could not be retrieved: ${message}`,
            undefined,
            'RUNTIME_ERROR'
        )
    }
}

/**
 * Belirli bir header değerini alır
 *
 * @param name - Header adı
 * @returns Header değeri veya null
 *
 * @example
 * ```typescript
 * const userAgent = await getHeader('user-agent');
 * // 'Mozilla/5.0...' veya null
 * ```
 */
export async function getHeader(name: KnownHeader | string): Promise<string | null> {
    try {
        const h = await nextHeaders()
        return h.get(name) ?? null
    } catch (error) {
        logger.warn({ error, header: name }, 'Failed to get header')
        return null
    }
}

/**
 * Header değerini alır, yoksa default değer döner
 *
 * @param name - Header adı
 * @param defaultValue - Varsayılan değer
 * @returns Header değeri veya default
 *
 * @example
 * ```typescript
 * const requestId = await getHeaderOrDefault('x-request-id', crypto.randomUUID());
 * ```
 */
export async function getHeaderOrDefault(
    name: KnownHeader | string,
    defaultValue: string
): Promise<string> {
    const value = await getHeader(name)
    return value ?? defaultValue
}

/**
 * Header'ın var olup olmadığını kontrol eder
 *
 * @param name - Header adı
 * @returns true eğer header varsa
 */
export async function hasHeader(name: KnownHeader | string): Promise<boolean> {
    const value = await getHeader(name)
    return value !== null
}

/**
 * Tüm header'ları alır (debug/logging için)
 *
 * @returns Record<string, string> - Header key-value objesi
 */
export async function getAllHeaders(): Promise<Record<string, string>> {
    try {
        const h = await nextHeaders()
        const entries: Record<string, string> = {}

        h.forEach((value, key) => {
            entries[key] = value
        })

        return entries
    } catch (error) {
        logger.error({ error }, 'Failed to get all headers')
        return {}
    }
}

// =============================================================================
// IP & NETWORK
// =============================================================================

/**
 * İstemci IP adresini alır.
 * Vercel, Cloudflare ve standart proxy header'larını destekler.
 *
 * @returns İstemci IP adresi (bulunamazsa '127.0.0.1')
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

// =============================================================================
// SECURITY HEADERS
// =============================================================================

/**
 * Origin header'ını alır ve doğrular
 *
 * @returns Origin değeri veya null
 */
export async function getOrigin(): Promise<string | null> {
    return getHeader('origin')
}

/**
 * Host header'ını alır
 *
 * @returns Host değeri veya null
 */
export async function getHost(): Promise<string | null> {
    return getHeader('host')
}

/**
 * Referer header'ını alır
 *
 * @returns Referer değeri veya null
 */
export async function getReferer(): Promise<string | null> {
    return getHeader('referer')
}

/**
 * User-Agent header'ını alır
 *
 * @returns User-Agent değeri veya null
 */
export async function getUserAgent(): Promise<string | null> {
    return getHeader('user-agent')
}

/**
 * Authorization header'ını alır
 *
 * @returns Authorization değeri veya null
 */
export async function getAuthorization(): Promise<string | null> {
    return getHeader('authorization')
}

/**
 * Request ID'yi alır, yoksa yeni oluşturur
 *
 * @returns Request ID
 */
export async function getRequestId(): Promise<string> {
    const existing = await getHeader('x-request-id')
    if (existing) return existing

    // Crypto API kullanarak yeni ID oluştur (Edge runtime uyumlu)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }

    // Fallback
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * CSRF token'ını header'dan alır
 *
 * @returns CSRF token veya null
 */
export async function getCsrfToken(): Promise<string | null> {
    return getHeader('x-csrf-token')
}

/**
 * Idempotency key'i alır
 *
 * @returns Idempotency key veya null
 */
export async function getIdempotencyKey(): Promise<string | null> {
    return getHeader('x-idempotency-key')
}

// =============================================================================
// ORIGIN VALIDATION
// =============================================================================

/**
 * Origin doğrulama sonucu
 */
export interface OriginCheckResult {
    valid: boolean
    origin: string | null
    host: string | null
    reason?: 'MISSING_ORIGIN' | 'MISMATCH' | 'INVALID_FORMAT' | 'ALLOWED'
}

/**
 * Origin header'ını host ile karşılaştırarak doğrular
 * CSRF koruması için kullanılır
 *
 * @param allowedOrigins - İzin verilen ek origin'ler (opsiyonel)
 * @returns OriginCheckResult - Doğrulama sonucu
 *
 * @example
 * ```typescript
 * const result = await checkOrigin(['https://app.example.com']);
 * if (!result.valid) {
 *   return new Response('Invalid origin', { status: 403 });
 * }
 * ```
 */
export async function checkOrigin(allowedOrigins: string[] = []): Promise<OriginCheckResult> {
    try {
        const headerStore = await nextHeaders()
        const origin = headerStore.get('origin')
        const host = headerStore.get('host')

        // Origin yoksa (server-to-server veya same-origin GET)
        if (!origin) {
            return { valid: true, origin: null, host, reason: 'MISSING_ORIGIN' }
        }

        // Origin formatını temizle
        const cleanOrigin = origin.replace(/^https?:\/\//, '').toLowerCase()
        const cleanHost = host?.toLowerCase()

        // Host ile eşleşiyor mu?
        if (cleanHost && cleanOrigin === cleanHost) {
            return { valid: true, origin, host, reason: 'ALLOWED' }
        }

        // Ek izin verilen origin'lerde var mı?
        const normalizedAllowed = allowedOrigins.map(o =>
            o.replace(/^https?:\/\//, '').toLowerCase()
        )

        if (normalizedAllowed.includes(cleanOrigin)) {
            return { valid: true, origin, host, reason: 'ALLOWED' }
        }

        return {
            valid: false,
            origin,
            host,
            reason: 'MISMATCH'
        }
    } catch (error) {
        logger.error({ error }, 'Origin check failed')
        return {
            valid: false,
            origin: null,
            host: null,
            reason: 'INVALID_FORMAT'
        }
    }
}

// =============================================================================
// COOKIE HELPERS
// =============================================================================

/**
 * Cookie değerini alır
 *
 * @param name - Cookie adı
 * @returns Cookie değeri veya undefined
 */
export async function getCookie(name: string): Promise<string | undefined> {
    try {
        const cookieStore = await nextCookies()
        return cookieStore.get(name)?.value
    } catch (error) {
        logger.warn({ error, cookie: name }, 'Failed to get cookie')
        return undefined
    }
}

/**
 * Cookie set eder
 *
 * @param name - Cookie adı
 * @param value - Cookie değeri
 * @param options - Cookie seçenekleri
 */
export async function setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
): Promise<void> {
    try {
        const cookieStore = await nextCookies()
        cookieStore.set(name, value, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            ...options
        })
    } catch (error) {
        logger.error({ error, cookie: name }, 'Failed to set cookie')
        throw new HeaderError(
            `Failed to set cookie "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
            name,
            'RUNTIME_ERROR'
        )
    }
}

/**
 * Cookie siler
 *
 * @param name - Cookie adı
 */
export async function deleteCookie(name: string): Promise<void> {
    try {
        const cookieStore = await nextCookies()
        cookieStore.delete(name)
    } catch (error) {
        logger.error({ error, cookie: name }, 'Failed to delete cookie')
        throw new HeaderError(
            `Failed to delete cookie "${name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
            name,
            'RUNTIME_ERROR'
        )
    }
}

// =============================================================================
// CONTENT NEGOTIATION
// =============================================================================

/**
 * Accept-Language header'ını parse eder
 *
 * @returns Dil tercihleri array'i
 */
export async function getAcceptedLanguages(): Promise<string[]> {
    const acceptLang = await getHeader('accept-language')
    if (!acceptLang) return []

    // Parse Accept-Language: tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7
    return acceptLang
        .split(',')
        .map(lang => {
            const [code] = lang.split(';')
            return code.trim()
        })
        .filter(Boolean)
}

/**
 * İlk tercih edilen dili alır
 *
 * @returns Dil kodu veya null
 */
export async function getPreferredLanguage(): Promise<string | null> {
    const languages = await getAcceptedLanguages()
    return languages[0] ?? null
}

// =============================================================================
// DEBUG & LOGGING
// =============================================================================

/**
 * Header bilgilerini loglar (debug için)
 * Hassas header'ları (authorization, cookie) maskele
 */
export async function logHeaders(requestId?: string): Promise<void> {
    try {
        const h = await nextHeaders()
        const safeHeaders: Record<string, string> = {}

        const sensitiveHeaders = ['authorization', 'cookie', 'x-csrf-token']

        h.forEach((value, key) => {
            const lowerKey = key.toLowerCase()
            if (sensitiveHeaders.includes(lowerKey)) {
                safeHeaders[key] = '[REDACTED]'
            } else {
                safeHeaders[key] = value
            }
        })

        logger.debug({
            requestId: requestId || (await getRequestId()),
            headers: safeHeaders,
            ip: await getClientIp()
        }, 'Request headers')
    } catch (error) {
        logger.error({ error }, 'Failed to log headers')
    }
}
