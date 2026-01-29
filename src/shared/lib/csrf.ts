import { headers as nextHeaders } from 'next/headers'

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

        // Origin yoksa (server-to-server)
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
        return {
            valid: false,
            origin: null,
            host: null,
            reason: 'INVALID_FORMAT'
        }
    }
}
