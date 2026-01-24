import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkRateLimit } from '../../lib/rate-limit'
import { Ratelimit } from '@upstash/ratelimit'

// Mock dependencies
vi.mock('@/lib/redis', () => ({
    redis: {}
}))

const mockLimit = vi.fn()

vi.mock('@upstash/ratelimit', () => {
    return {
        Ratelimit: class {
            limit = mockLimit
            static slidingWindow = vi.fn()
        }
    }
})

describe('Rate Limit Utility', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.UPSTASH_REDIS_REST_URL = 'https://fake-redis.upstash.io'
    })

    it('should allow request if within limit', async () => {
        mockLimit.mockResolvedValue({
            success: true,
            reset: Date.now() + 1000
        })

        const result = await checkRateLimit('test-ip', { limit: 5 })
        expect(result.success).toBe(true)
        expect(mockLimit).toHaveBeenCalledWith('test-ip')
    })

    it('should block request if limit exceeded', async () => {
        mockLimit.mockResolvedValue({
            success: false,
            reset: Date.now() + 1000
        })

        const result = await checkRateLimit('blocked-ip', { limit: 5 })
        expect(result.success).toBe(false)
        expect(mockLimit).toHaveBeenCalledWith('blocked-ip')
    })

    it('should fail open by default on Redis error', async () => {
        mockLimit.mockRejectedValue(new Error('Redis Down'))

        const result = await checkRateLimit('error-ip')
        expect(result.success).toBe(true) // Fail open
    })

    it('should fail closed if requested on Redis error', async () => {
        mockLimit.mockRejectedValue(new Error('Redis Down'))

        const result = await checkRateLimit('secure-ip', { failClosed: true })
        expect(result.success).toBe(false) // Fail closed
    })

    it('should bypass if Redis URL is missing (not configured)', async () => {
        const originalUrl = process.env.UPSTASH_REDIS_REST_URL
        delete process.env.UPSTASH_REDIS_REST_URL

        const result = await checkRateLimit('no-redis-ip')
        expect(result.success).toBe(true)

        process.env.UPSTASH_REDIS_REST_URL = originalUrl
    })
})
