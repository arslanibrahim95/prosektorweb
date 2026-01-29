
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { RATE_LIMIT_TIERS } from '@/shared/lib/rate-limit'

// Mock dependencies BEFORE importing middleware
const mockCheckRateLimit = vi.fn()
vi.mock('@/shared/lib/rate-limit', () => ({
    checkRateLimit: (...args: any[]) => mockCheckRateLimit(...args),
    RATE_LIMIT_TIERS: {
        API: { limit: 100, window: 60 },
        AUTH: { limit: 10, window: 60 },
        BOT: { limit: 5, window: 60 },
        AUTHENTICATED: { limit: 1000, window: 60 },
        ADMIN: { limit: 5000, window: 60 }
    }
}))

// Mock Prisma to prevent DB connection
vi.mock('@/server/db', () => ({
    prisma: {}
}))

// Mock auth.config to prevent it from importing stuff
vi.mock('./auth.config', () => ({
    authConfig: {
        providers: [],
        callbacks: {}
    }
}))

vi.mock('@/shared/lib/logger', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}))

// Mock next-intl
vi.mock('next-intl/middleware', () => ({
    default: () => () => new NextResponse('Intl Response')
}))
vi.mock('@/i18n/routing', () => ({
    routing: {}
}))

// Mock NextAuth
// We need to verify how middleware uses it: export default auth(async (req) => { ... })
// We will mock it to just return the handler.
vi.mock('next-auth', () => ({
    default: () => ({
        auth: (handler: any) => handler
    })
}))

// Import the middleware (which will use the mocks)
import middleware from './middleware'

describe('Middleware Traffic Segmentation', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        mockCheckRateLimit.mockResolvedValue({ success: true })
    })

    const createReq = (path: string, headers: Record<string, string> = {}, auth: any = null) => {
        const req = new NextRequest(new URL(`http://localhost${path}`))
        Object.entries(headers).forEach(([k, v]) => req.headers.set(k, v))
        // Monkey-patch auth
        Object.assign(req, { auth })
        return req
    }

    it('should block bad bots (User-Agent)', async () => {
        const req = createReq('/', { 'user-agent': 'GPTBot' })
        const res = await (middleware as any)(req)

        expect(res?.status).toBe(403)
        // Should not even call rate limit for blocked bots (optimization)
        expect(mockCheckRateLimit).not.toHaveBeenCalled()
        // Wait, logic says: 0. Bot protection is AFTER 0. Rate Limits?
        // Let's check the code order in middleware.ts
        // Line 51: Bot protection.
        // Line 39: Rate Limiting (Security) -> Auth check.
        // Line 69: API limits. 
        // Ah, Auth check (line 43) is FIRST. Bot check is SECOND.
        // If path is / (not api/auth), Auth check skipped.
        // Then Bot check.
    })

    it('should parse correct IP from x-forwarded-for list', async () => {
        const req = createReq('/api/test', {
            'user-agent': 'User',
            'x-forwarded-for': '1.2.3.4, 5.6.7.8' // Validation of fix
        })
        const res = await (middleware as any)(req)

        // This implicitly checks if it didn't crash and passed to next step
        // To verify the actual IP used, we'd need to spy on checkRateLimit
        expect(mockCheckRateLimit).toHaveBeenCalledWith(
            expect.stringContaining('api:1.2.3.4'), // Should use first IP
            expect.anything()
        )
    })

    it('should allow good bots/users', async () => {
        const req = createReq('/', { 'user-agent': 'Mozilla/5.0' })
        const res = await (middleware as any)(req)
        // Should return the Intl response (mocked)
        expect(res?.status).toBe(200)
    })

    describe('Auth Rate Limiting', () => {
        it('should NOT strictly rate limit GET /api/auth requests (CSRF/Session)', async () => {
            // GET request to /api/auth/csrf
            const req = createReq('/api/auth/csrf', { 'user-agent': 'User', 'x-forwarded-for': '1.2.3.4' })
            // Set method explicitly if needed by createReq, but NextRequest defaults to GET
            Object.defineProperty(req, 'method', { value: 'GET' });

            await (middleware as any)(req)

            // Should NOT call checkRateLimit with auth: prefix
            // It might fall through to API limit (api:1.2.3.4)
            expect(mockCheckRateLimit).not.toHaveBeenCalledWith(
                'auth:1.2.3.4',
                expect.anything()
            )
        })

        it('should strictly rate limit POST /api/auth requests (Login)', async () => {
            const req = createReq('/api/auth/callback/credentials', { 'user-agent': 'User', 'x-forwarded-for': '1.2.3.4' })
            Object.defineProperty(req, 'method', { value: 'POST' });

            await (middleware as any)(req)

            expect(mockCheckRateLimit).toHaveBeenCalledWith(
                'auth:1.2.3.4',
                expect.objectContaining({ limit: RATE_LIMIT_TIERS.AUTH.limit })
            )
        })
    })

    describe('API Rate Limiting', () => {
        it('should use anonymous IP-based limit for unauthenticated users', async () => {
            const req = createReq('/api/example', { 'user-agent': 'User', 'x-forwarded-for': '1.2.3.4' })
            await (middleware as any)(req)

            expect(mockCheckRateLimit).toHaveBeenCalledWith(
                'api:1.2.3.4',
                expect.objectContaining({ limit: RATE_LIMIT_TIERS.API.limit })
            )
        })

        it('should use User-ID based limit for authenticated users', async () => {
            const auth = { user: { id: 'user-123', role: 'CLIENT' } }
            const req = createReq('/api/example', { 'user-agent': 'User', 'x-forwarded-for': '1.2.3.4' }, auth)
            await (middleware as any)(req)

            // Should verify it used user:user-123 instead of api:1.2.3.4
            expect(mockCheckRateLimit).toHaveBeenCalledWith(
                'user:user-123',
                expect.objectContaining({ limit: RATE_LIMIT_TIERS.AUTHENTICATED.limit })
            )
        })

        it('should use Admin limit configuration for Admin users', async () => {
            const auth = { user: { id: 'admin-999', role: 'ADMIN' } }
            const req = createReq('/api/example', { 'user-agent': 'User' }, auth)
            await (middleware as any)(req)

            expect(mockCheckRateLimit).toHaveBeenCalledWith(
                'user:admin-999',
                expect.objectContaining({ limit: RATE_LIMIT_TIERS.ADMIN.limit })
            )
        })

        it('should block when rate limit is exceeded', async () => {
            mockCheckRateLimit.mockResolvedValue({ success: false })
            const req = createReq('/api/example', { 'user-agent': 'User' })
            const res = await (middleware as any)(req)

            expect(res?.status).toBe(429)
        })
    })
})
