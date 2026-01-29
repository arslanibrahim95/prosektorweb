/**
 * @file src/shared/lib/cache.ts
 * @description Core caching infrastructure implementing Cache-Aside pattern.
 * @invariants L2 Redis is the source of truth for shared state. L1 Memory is ephermal optimization.
 * @dependencies redis.ts, logger.ts
 */
import { redis } from './redis'
import { logger } from './logger'

type CacheOptions = {
    ttl?: number // Seconds
    tags?: string[]
    forceRefresh?: boolean
}

// In-memory L1 cache (simple fallback / extremely hot keys)
const memoryCache = new Map<string, { value: any, expiry: number }>();
const MAX_MEMORY_ITEMS = 1000;

// Singleflight map to deduplicate concurrent fetch requests
const singleflightMap = new Map<string, Promise<any>>();

/**
 * Get item from cache or set it using the loader function.
 * Implements Cache-Aside pattern with Singleflight protection.
 */
export async function getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    const { ttl = 300, forceRefresh = false } = options;

    // 0. Force Refresh: Skip read, go straight to loader
    if (!forceRefresh) {
        // 1. Check Memory (L1)
        const memItem = memoryCache.get(key);
        if (memItem && memItem.expiry > Date.now()) {
            logger.debug({ key, layer: 'L1' }, 'Cache Hit');
            return memItem.value as T;
        }

        // 2. Check Redis (L2)
        try {
            const cached = await redis.get<T>(key);
            if (cached) {
                // Populate L1 for next time (short TTL for L1 relative to L2)
                setMemory(key, cached, Math.min(ttl, 60));
                logger.debug({ key, layer: 'L2' }, 'Cache Hit');
                return cached;
            }
        } catch (error) {
            // Redis failure shouldn't crash app, just log and continue to loader
            logger.warn({ key, error }, 'Redis cache read failed');
        }
    }

    // 3. Singleflight: If a request for this key is already in flight, reuse it
    if (singleflightMap.has(key)) {
        return singleflightMap.get(key);
    }

    // 4. Source Loader (Miss)
    const promise = loader()
        .then(async (value) => {
            // 5. Set Cache (Async)
            try {
                // Set L2 (Redis)
                if (value !== undefined && value !== null) {
                    await redis.set(key, value, { ex: ttl });
                    // Set L1 (Memory)
                    setMemory(key, value, ttl);
                }
            } catch (error) {
                logger.error({ key, error }, 'Redis cache write failed');
            }
            return value;
        })
        .finally(() => {
            // Cleanup singleflight
            singleflightMap.delete(key);
        });

    // Log Miss & Loader logic
    promise.then(() => {
        logger.info({ key, event: 'cache_miss' }, 'Cache Miss - Loader Executed');
    });

    singleflightMap.set(key, promise);
    return promise;
}

/**
 * Explicitly invalidate a cache key
 */
export async function invalidateCache(keyPattern: string) {
    try {
        // Clear matching memory keys (naive string match for this simple impl)
        // In prod with glob patterns, this needs more logic, but for direct keys it works
        if (keyPattern.includes('*')) {
            memoryCache.clear(); // Safe bet for memory on pattern clear
            const keys = await redis.keys(keyPattern);
            if (keys.length > 0) await redis.del(...keys);
        } else {
            memoryCache.delete(keyPattern);
            await redis.del(keyPattern);
        }
        logger.info({ keyPattern }, 'Cache invalidated');
    } catch (error) {
        logger.error({ keyPattern, error }, 'Cache invalidadtion failed');
    }
}

function setMemory(key: string, value: any, ttlSeconds: number) {
    if (memoryCache.size >= MAX_MEMORY_ITEMS) {
        const firstKey = memoryCache.keys().next().value;
        // eslint-disable-next-line
        if (firstKey) memoryCache.delete(firstKey);
    }
    memoryCache.set(key, {
        value,
        expiry: Date.now() + (ttlSeconds * 1000)
    });
}
