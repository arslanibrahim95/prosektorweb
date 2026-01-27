import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrSet, invalidateCache } from './cache'
import { redis } from './redis'

// Mock Redis
vi.mock('./redis', () => ({
    redis: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        keys: vi.fn(),
    }
}))

// Mock Logger
vi.mock('./logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    }
}))

describe('getOrSet Cache Utility', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Clear memory cache hack (expose it or just use unique keys)
        invalidateCache('*')
    })

    it('should call loader on cache miss', async () => {
        const key = 'test:miss'
        const loader = vi.fn().mockResolvedValue('fresh-data')

        // Mock Redis Miss
        vi.mocked(redis.get).mockResolvedValue(null)

        const result = await getOrSet(key, loader)

        expect(result).toBe('fresh-data')
        expect(loader).toHaveBeenCalledTimes(1)
        expect(redis.set).toHaveBeenCalledWith(key, 'fresh-data', expect.any(Object))
    })

    it('should return cached value on hit (L2)', async () => {
        const key = 'test:hit'
        const loader = vi.fn().mockResolvedValue('fresh-data')

        // Mock Redis Hit
        vi.mocked(redis.get).mockResolvedValue('cached-data')

        const result = await getOrSet(key, loader)

        expect(result).toBe('cached-data')
        expect(loader).not.toHaveBeenCalled()
    })

    it('should deduplicate concurrent requests (Singleflight)', async () => {
        const key = 'test:concurrent'

        // Slow loader
        const loader = vi.fn().mockImplementation(async () => {
            await new Promise(r => setTimeout(r, 10))
            return 'data'
        })

        vi.mocked(redis.get).mockResolvedValue(null)

        // Fire 3 requests at once
        const p1 = getOrSet(key, loader);
        const p2 = getOrSet(key, loader);
        const p3 = getOrSet(key, loader);

        const results = await Promise.all([p1, p2, p3])

        expect(results).toEqual(['data', 'data', 'data'])
        expect(loader).toHaveBeenCalledTimes(1) // Only called once!
    })
})
