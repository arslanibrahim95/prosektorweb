import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'
import * as Sentry from '@sentry/nextjs'
import { getErrorMessage, getZodErrorMessage, isPrismaUniqueConstraintError } from './action-types'
import { z } from 'zod'
import { checkOrigin } from './csrf'
import { checkRateLimit, getClientIp } from './rate-limit'

export type ApiResponse<T = any> = {
    success: boolean
    data?: T
    error?: string
    code?: string
    details?: any
    pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
    meta: {
        requestId: string
    }
}

interface SafeApiOptions {
    requireAuth?: boolean
    checkCsrf?: boolean
    requireIdempotency?: boolean
    rateLimit?: {
        limit: number
        windowSeconds: number
    }
    /**
     * HTTP Cache-Control header value.
     * Example: 'public, max-age=3600, stale-while-revalidate=60'
     */
    cacheControl?: string
}

/**
 * Creates a standardized API handler with security, observability and consistent responses.
 */
export function safeApi<TResult, TParams = any>(
    handler: (req: NextRequest, context: { requestId: string; userId?: string; params: TParams }) => Promise<TResult | { data: TResult; pagination?: ApiResponse['pagination'] }>,
    options: SafeApiOptions = {}
) {
    return async (req: NextRequest, { params }: { params: Promise<TParams> }): Promise<NextResponse> => {
        const start = Date.now()
        const requestId = req.headers.get('X-Request-Id') || crypto.randomUUID()
        const idempotencyKey = req.headers.get('Idempotency-Key')
        const ip = await getClientIp()

        try {
            const resolvedParams = params ? await params : ({} as TParams)

            // 1. CSRF Check (P0)
            if (options.checkCsrf && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
                const isOriginSafe = await checkOrigin()
                if (!isOriginSafe) {
                    return NextResponse.json({
                        success: false,
                        error: 'Güvenlik doğrulaması başarısız (Invalid Origin).',
                        code: 'INVALID_ORIGIN',
                        meta: { requestId }
                    }, { status: 403 })
                }
            }

            // 2. Idempotency Check (P0)
            if (options.requireIdempotency && !idempotencyKey) {
                return NextResponse.json({
                    success: false,
                    error: 'Idempotency-Key header is required for this request.',
                    code: 'IDEMPOTENCY_KEY_REQUIRED',
                    meta: { requestId }
                }, { status: 400 })
            }

            if (idempotencyKey && process.env.UPSTASH_REDIS_REST_URL) {
                try {
                    const { redis } = await import('./redis')
                    const cached = await redis.get(`idempotency:api:${idempotencyKey}`)
                    if (cached) {
                        logger.info({ requestId, idempotencyKey }, 'Idempotency hit for API')
                        return NextResponse.json(cached)
                    }
                } catch (err) {
                    logger.warn({ requestId, err }, 'Idempotency check failed (Redis error)')
                }
            }

            // 3. Rate Limiting (P1)
            let limitInfo: { limit?: number; remaining?: number; reset?: Date } = {}
            if (options.rateLimit) {
                const limitKey = `api_limit:${ip}:${req.nextUrl.pathname}`
                const limitResult = await checkRateLimit(limitKey, {
                    limit: options.rateLimit.limit,
                    windowSeconds: options.rateLimit.windowSeconds,
                    failClosed: true
                })

                limitInfo = {
                    limit: limitResult.limit,
                    remaining: limitResult.remaining,
                    reset: limitResult.reset
                }

                if (!limitResult.success) {
                    const errorResponse = NextResponse.json({
                        success: false,
                        error: 'Çok fazla istek yapıldı. Lütfen biraz bekleyin.',
                        code: 'RATE_LIMIT_EXCEEDED',
                        meta: { requestId }
                    }, { status: 429 })

                    if (limitInfo.limit) errorResponse.headers.set('X-RateLimit-Limit', limitInfo.limit.toString())
                    if (limitInfo.remaining !== undefined) errorResponse.headers.set('X-RateLimit-Remaining', limitInfo.remaining.toString())
                    if (limitInfo.reset) errorResponse.headers.set('X-RateLimit-Reset', Math.floor(limitInfo.reset.getTime() / 1000).toString())

                    return errorResponse
                }
            }

            // 4. Execute Handler
            const result = await handler(req, { requestId, params: resolvedParams })

            // Handle both raw results and { data, pagination } objects
            const responseData = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result
            const pagination = (result && typeof result === 'object' && 'pagination' in result) ? (result as any).pagination : undefined

            const finalResponse = {
                success: true,
                data: responseData,
                pagination,
                meta: { requestId }
            }

            // Cache result for idempotency
            if (idempotencyKey && process.env.UPSTASH_REDIS_REST_URL) {
                try {
                    const { redis } = await import('./redis')
                    await redis.set(`idempotency:api:${idempotencyKey}`, finalResponse, { ex: 86400 }) // 24h
                } catch (err) {
                    logger.warn({ requestId, err }, 'Failed to cache idempotency result')
                }
            }

            const duration = Date.now() - start
            logger.info({ requestId, path: req.nextUrl.pathname, duration }, 'API Request Success')


            const response = NextResponse.json(finalResponse)

            // Add Cache-Control Header
            if (options.cacheControl) {
                response.headers.set('Cache-Control', options.cacheControl)
            }

            // Add Rate Limit Headers
            if (limitInfo.limit) response.headers.set('X-RateLimit-Limit', limitInfo.limit.toString())
            if (limitInfo.remaining !== undefined) response.headers.set('X-RateLimit-Remaining', limitInfo.remaining.toString())
            if (limitInfo.reset) response.headers.set('X-RateLimit-Reset', Math.floor(limitInfo.reset.getTime() / 1000).toString())

            return response

        } catch (error) {
            const duration = Date.now() - start
            let errorMessage = getErrorMessage(error)
            let errorCode = 'INTERNAL_ERROR'
            let status = 500

            // Handle specific error types
            if (error instanceof z.ZodError) {
                errorMessage = getZodErrorMessage(error)
                errorCode = 'VALIDATION_ERROR'
                status = 400
            } else if (isPrismaUniqueConstraintError(error)) {
                errorMessage = 'Bu kayıt zaten mevcut.'
                errorCode = 'DUPLICATE_RECORD'
                status = 409
            } else {
                // Log unhandled errors
                logger.error({
                    requestId,
                    path: req.nextUrl.pathname,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined
                }, 'API Request Failed')

                Sentry.withScope((scope) => {
                    scope.setTag('requestId', requestId);
                    scope.setTag('path', req.nextUrl.pathname);
                    Sentry.captureException(error);
                });

                if (process.env.NODE_ENV === 'production') {
                    errorMessage = 'Sunucu tarafında bir hata oluştu.'
                }
            }

            const errorResponse = NextResponse.json({
                success: false,
                error: errorMessage,
                code: errorCode,
                meta: { requestId }
            }, { status })

            return errorResponse
        }

    }
}
