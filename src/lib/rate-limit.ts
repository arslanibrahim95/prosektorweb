import { redis } from '@/lib/redis'
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
}

// Memory cache for extreme performance (optional, good for high-traffic)
const cache = new Map()

/**
 * Check rate limit using Redis (Sliding Window)
 */
export async function checkRateLimit(
    identifier: string,
    options: RateLimitOptions = {}
): Promise<{ success: boolean; reset?: Date }> {
    const {
        limit = 10,
        windowSeconds = 60
    } = options

    try {
        if (!process.env.UPSTASH_REDIS_REST_URL) {
            console.warn('Redis not configured, bypassing rate limit')
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
        const { success, reset } = await ratelimit.limit(identifier)

        return {
            success,
            reset: new Date(reset)
        }

    } catch (error) {
        console.error('Rate limit error:', error)
        // Fail open: Allow traffic if Redis is down
        return { success: true }
    }
}
