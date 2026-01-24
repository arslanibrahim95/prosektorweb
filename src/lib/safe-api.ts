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
    rateLimit?: {
        limit: number
        windowSeconds: number
    }
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

            // 2. Rate Limiting (P1)
            if (options.rateLimit) {
                const limitKey = `api_limit:${ip}:${req.nextUrl.pathname}`
                const limit = await checkRateLimit(limitKey, {
                    limit: options.rateLimit.limit,
                    windowSeconds: options.rateLimit.windowSeconds,
                    failClosed: true
                })

                if (!limit.success) {
                    return NextResponse.json({
                        success: false,
                        error: 'Çok fazla istek yapıldı. Lütfen biraz bekleyin.',
                        code: 'RATE_LIMIT_EXCEEDED',
                        meta: { requestId }
                    }, { status: 429 })
                }
            }

            // 3. Execute Handler
            const result = await handler(req, { requestId, params: resolvedParams })

            // Handle both raw results and { data, pagination } objects
            const responseData = (result && typeof result === 'object' && 'data' in result) ? (result as any).data : result
            const pagination = (result && typeof result === 'object' && 'pagination' in result) ? (result as any).pagination : undefined

            const duration = Date.now() - start
            logger.info({ requestId, path: req.nextUrl.pathname, duration }, 'API Request Success')

            return NextResponse.json({
                success: true,
                data: responseData,
                pagination,
                meta: { requestId }
            })

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

            return NextResponse.json({
                success: false,
                error: errorMessage,
                code: errorCode,
                meta: { requestId }
            }, { status })
        }
    }
}
