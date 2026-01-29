/**
 * @file src/shared/lib/redis.ts
 * @description Upstash Redis client singleton and distributed lock utilities.
 * @invariants Uses REST API (stateless). Retry logic handled by SDK.
 */
import { Redis } from '@upstash/redis'
import { logger } from './logger'

/**
 * Upstash Redis client singleton.
 * REST API kullanarak stateless bağlantı sağlar.
 * Retry mantığı SDK tarafından yönetilir.
 */
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    retry: {
        retries: 1, // Minimize retries for latency sensitivity
        backoff: (retryCount) => Math.exp(retryCount) * 50,
    }
})

/**
 * Dağıtık kilit (distributed lock) alır.
 * Race condition'ları önlemek için kullanılır.
 *
 * @param key - Kilit anahtarı
 * @param ttl - Kilit süresi (saniye cinsinden, varsayılan: 10)
 * @returns Kilit alındıysa true, aksi halde false
 *
 * @example
 * ```typescript
 * const hasLock = await acquireLock('invoice:123', 30);
 * if (hasLock) {
 *   try {
 *     // Kritik işlem
 *   } finally {
 *     await releaseLock('invoice:123');
 *   }
 * }
 * ```
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
 * Daha önce alınmış dağıtık kilidi serbest bırakır.
 *
 * @param key - Serbest bırakılacak kilit anahtarı
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await releaseLock('invoice:123');
 * ```
 */
export async function releaseLock(key: string): Promise<void> {
    try {
        await redis.del(`lock:${key}`)
    } catch (error) {
        logger.error({ error, key }, 'Redis Unlock Error')
    }
}
