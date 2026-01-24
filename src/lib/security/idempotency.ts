
import { redis } from '@/lib/redis'

/**
 * Verifies if a request is unique based on a key.
 * Uses atomic Redis operations to ensure thread safety.
 * 
 * @param key Unique identifier for the request (e.g. UUID)
 * @param ttl Time to live in seconds (default: 10s)
 * @returns true if request is new (lock acquired), false if it's a duplicate
 */
export async function verifyIdempotency(key: string, ttl: number = 10): Promise<boolean> {
    if (!key) return true // If no key provided, skip check (or fail safe depending on policy)

    try {
        // SET NX: Set if Not Exists
        // EX: Expire time
        const result = await redis.set(`idempotency:${key}`, '1', {
            nx: true,
            ex: ttl
        })

        // If result is 'OK', we acquired the lock (it's new)
        // If result is null/nil, the key already exists (it's a duplicate)
        return result === 'OK'
    } catch (error) {
        console.error('Idempotency check failed:', error)
        // Fail open: Allow request if Redis is down to avoid blocking users
        return true
    }
}
