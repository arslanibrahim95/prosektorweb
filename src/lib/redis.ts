import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

/**
 * Perform an atomic lock to prevent race conditions
 * @param key Lock key
 * @param ttl Duration in seconds
 * @returns true if lock acquired
 */
export async function acquireLock(key: string, ttl: number = 10): Promise<boolean> {
    try {
        const result = await redis.set(`lock:${key}`, 'locked', { nx: true, ex: ttl })
        return result === 'OK'
    } catch (error) {
        logger.error({ error, key }, 'Redis Lock Error')
        return false // Fail safe
    }
}

/**
 * Release a previously acquired lock
 */
export async function releaseLock(key: string): Promise<void> {
    try {
        await redis.del(`lock:${key}`)
    } catch (error) {
        logger.error({ error, key }, 'Redis Unlock Error')
    }
}
