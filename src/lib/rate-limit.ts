/**
 * @file src/lib/rate-limit.ts
 * @description Sliding Window rate limiter using Redis.
 * @invariants Falls open (allows traffic) if Redis is down, unless configured otherwise.
 */
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { Ratelimit } from '@upstash/ratelimit'
import { headers } from 'next/headers'

/**
 * Get client IP respecting Vercel/Cloudflare headers
 */
export async function getClientIp() {
    const h = await headers()

    // Vercel / Cloudflare
    const vercelForwarded = h.get('x-vercel-forwarded-for')
    if (vercelForwarded) return vercelForwarded

    const realIp = h.get('x-real-ip')
    if (realIp) return realIp

    const forwardedFor = h.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }

    return '127.0.0.1'
}

export interface RateLimitOptions {
    /** Max requests allowed in the window */
    limit?: number
    /** Window duration in seconds */
    windowSeconds?: number
    /**
     * If true, returns { success: false } when Redis errors occur.
     * Use for security-critical endpoints like authentication.
     * Default: false (fail open - allows requests on error)
     */
    failClosed?: boolean
}


export const RATE_LIMIT_TIERS = {
    GLOBAL: { limit: 500, window: 60 },     // Absolute flood ceiling
    PAGE: { limit: 50, window: 10 },        // Burst protection for HTML pages
    API: { limit: 100, window: 60 },         // Standard API usage
    AUTH: { limit: 10, window: 60 },         // Strict login/auth protection
    BOT: { limit: 5, window: 60 },           // Very strict for suspicious IPs
    AUTHENTICATED: { limit: 1000, window: 60 }, // High limit for logged-in users
    ADMIN: { limit: 5000, window: 60 }       // Very high limit for admins
} as const

// Memory cache for extreme performance (optional, good for high-traffic)
const cache = new Map()

/**
 * Check rate limit using Redis (Sliding Window)
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
            // For security-critical endpoints, don't bypass - fail closed
            if (failClosed) {
                return { success: false, reset: new Date(Date.now() + 60000) }
            }
            return { success: true }
        }

        // Create a new ratelimit instance 
        // Best practice: Create one instance per distinct limit/window configuration
        const ratelimit = new Ratelimit({
            redis: redis,
            limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
            analytics: true,
            prefix: '@upstash/ratelimit',
            ephemeralCache: cache,
        })

        // Execute rate limit check
        const { success, limit: limitUsed, remaining, reset } = await ratelimit.limit(finalIdentifier)

        return {
            success,
            limit: limitUsed,
            remaining,
            reset: new Date(reset)
        }

    } catch (error) {
        logger.error({ error, identifier: finalIdentifier }, 'Rate limit error')

        // Fail Closed: Block request on error (security-critical endpoints like auth)
        // Fail Open: Allow request on error (availability over security)
        if (failClosed) {
            return { success: false, reset: new Date(Date.now() + 60000) } // Retry after 1 min
        }

        return { success: true }
    }
}
