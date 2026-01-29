/**
 * Redis Cache Layer
 * 
 * Generated pages için caching with TTL-based invalidation
 * Stale-while-revalidate pattern
 * Cache warming for high-priority combinations
 */

// Redis client singleton
let redisClient: RedisClientType | null = null;

// Redis client tipi (basitleştirilmiş)
interface RedisClientType {
    get(key: string): Promise<string | null>;
    setex(key: string, seconds: number, value: string): Promise<string>;
    del(...keys: string[]): Promise<number>;
    ttl(key: string): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    sadd(key: string, ...members: string[]): Promise<number>;
    smembers(key: string): Promise<string[]>;
    info(section?: string): Promise<string>;
    expire(key: string, seconds: number): Promise<number>;
}

// Basit Redis client implementation (gerçek implementasyonda ioredis kullanılacak)
class SimpleRedisClient implements RedisClientType {
    private store = new Map<string, { value: string; expiry: number }>();
    private sets = new Map<string, Set<string>>();

    async get(key: string): Promise<string | null> {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiry) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    async setex(key: string, seconds: number, value: string): Promise<string> {
        this.store.set(key, { value, expiry: Date.now() + seconds * 1000 });
        return 'OK';
    }

    async del(...keys: string[]): Promise<number> {
        let count = 0;
        for (const key of keys) {
            if (this.store.delete(key)) count++;
        }
        return count;
    }

    async ttl(key: string): Promise<number> {
        const item = this.store.get(key);
        if (!item) return -2;
        const remaining = Math.floor((item.expiry - Date.now()) / 1000);
        return remaining > 0 ? remaining : -1;
    }

    async keys(pattern: string): Promise<string[]> {
        const regex = new RegExp(pattern.replace('*', '.*'));
        return Array.from(this.store.keys()).filter((k) => regex.test(k));
    }

    async sadd(key: string, ...members: string[]): Promise<number> {
        let set = this.sets.get(key);
        if (!set) {
            set = new Set();
            this.sets.set(key, set);
        }
        let added = 0;
        for (const member of members) {
            if (!set.has(member)) {
                set.add(member);
                added++;
            }
        }
        return added;
    }

    async smembers(key: string): Promise<string[]> {
        const set = this.sets.get(key);
        return set ? Array.from(set) : [];
    }

    async info(): Promise<string> {
        return 'used_memory_human:0M\r\nkeyspace_hits:0\r\nkeyspace_misses:0';
    }

    async expire(key: string, seconds: number): Promise<number> {
        const item = this.store.get(key);
        if (!item) return 0;
        item.expiry = Date.now() + seconds * 1000;
        return 1;
    }
}

export function getRedisClient(): RedisClientType {
    if (!redisClient) {
        // Production'da gerçek Redis kullanılacak
        // Şimdilik in-memory implementation
        redisClient = new SimpleRedisClient();
    }
    return redisClient;
}

// Cache key prefix
const CACHE_PREFIX = 'osgb:seo:';
const CACHE_VERSION = process.env.CACHE_VERSION || 'v1';

// TTL değerleri (saniye)
const TTL = {
    PAGE: 24 * 60 * 60, // 24 saat
    SITEMAP: 60 * 60, // 1 saat
    PROVINCE_DATA: 7 * 24 * 60 * 60, // 7 gün
    SERVICE_DATA: 7 * 24 * 60 * 60, // 7 gün
};

interface CacheOptions {
    ttl?: number;
    staleWhileRevalidate?: boolean;
    tags?: string[];
}

/**
 * Cache key oluştur
 */
function createCacheKey(type: string, identifier: string): string {
    return `${CACHE_PREFIX}${CACHE_VERSION}:${type}:${identifier}`;
}

/**
 * Cache'den veri al
 */
export async function getFromCache<T>(
    type: string,
    identifier: string
): Promise<{ data: T; stale: boolean } | null> {
    try {
        const client = getRedisClient();
        const key = createCacheKey(type, identifier);

        // Ana veriyi al
        const data = await client.get(key);
        if (!data) return null;

        // TTL kontrolü (stale-while-revalidate)
        const ttl = await client.ttl(key);
        const isStale = ttl < 300; // 5 dakikadan az kaldıysa stale

        return {
            data: JSON.parse(data) as T,
            stale: isStale,
        };
    } catch (error) {
        console.error('Cache get error:', error);
        return null;
    }
}

/**
 * Cache'e veri kaydet
 */
export async function setCache<T>(
    type: string,
    identifier: string,
    data: T,
    options: CacheOptions = {}
): Promise<void> {
    try {
        const client = getRedisClient();
        const key = createCacheKey(type, identifier);
        const ttl = options.ttl || TTL.PAGE;

        // Veriyi kaydet
        await client.setex(key, ttl, JSON.stringify(data));

        // Tag'leri kaydet (surrogate key için)
        if (options.tags && options.tags.length > 0) {
            const tagPromises = options.tags.map((tag) =>
                client.sadd(`${CACHE_PREFIX}tag:${tag}`, key)
            );
            await Promise.all(tagPromises);
        }

        // Stale-while-revalidate için extended TTL
        if (options.staleWhileRevalidate) {
            // Ana TTL'den sonra 1 saat daha stale olarak tut
            await client.expire(key, ttl + 3600);
        }
    } catch (error) {
        console.error('Cache set error:', error);
    }
}

/**
 * Cache'i invalidate et
 */
export async function invalidateCache(
    type: string,
    identifier?: string
): Promise<void> {
    try {
        const client = getRedisClient();

        if (identifier) {
            // Belirli bir key'i sil
            const key = createCacheKey(type, identifier);
            await client.del(key);
        } else {
            // Pattern ile sil
            const pattern = `${CACHE_PREFIX}${CACHE_VERSION}:${type}:*`;
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(...keys);
            }
        }
    } catch (error) {
        console.error('Cache invalidate error:', error);
    }
}

/**
 * Tag bazlı cache invalidation
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
    try {
        const client = getRedisClient();
        const tagKey = `${CACHE_PREFIX}tag:${tag}`;
        const keys = await client.smembers(tagKey);

        if (keys.length > 0) {
            await client.del(...keys);
            await client.del(tagKey);
        }
    } catch (error) {
        console.error('Cache tag invalidate error:', error);
    }
}

/**
 * Cache warming - yüksek öncelikli sayfaları önceden cache'le
 */
export async function warmCache<T>(
    items: Array<{ type: string; identifier: string; data: T }>,
    options: CacheOptions = {}
): Promise<void> {
    try {
        const promises = items.map((item) =>
            setCache(item.type, item.identifier, item.data, options)
        );
        await Promise.all(promises);
        console.log(`Cache warmed: ${items.length} items`);
    } catch (error) {
        console.error('Cache warming error:', error);
    }
}

/**
 * Cache istatistikleri
 */
export async function getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
}> {
    try {
        const client = getRedisClient();
        const info = await client.info('stats');
        const keys = await client.keys(`${CACHE_PREFIX}*`);

        // Basit parsing
        const keyspaceHits = parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0');
        const keyspaceMisses = parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0');
        const total = keyspaceHits + keyspaceMisses;

        return {
            totalKeys: keys.length,
            memoryUsage: info.match(/used_memory_human:(.+)/)?.[1] || 'unknown',
            hitRate: total > 0 ? (keyspaceHits / total) * 100 : 0,
        };
    } catch (error) {
        console.error('Cache stats error:', error);
        return { totalKeys: 0, memoryUsage: 'unknown', hitRate: 0 };
    }
}

/**
 * Cache versiyonunu güncelle (deployment sonrası)
 */
export async function bumpCacheVersion(): Promise<void> {
    try {
        const client = getRedisClient();
        const oldPattern = `${CACHE_PREFIX}${CACHE_VERSION}:*`;
        const keys = await client.keys(oldPattern);

        if (keys.length > 0) {
            await client.del(...keys);
            console.log(`Cleared ${keys.length} cache keys for version ${CACHE_VERSION}`);
        }
    } catch (error) {
        console.error('Cache version bump error:', error);
    }
}

// Export constants
export { TTL, CACHE_PREFIX, CACHE_VERSION };
