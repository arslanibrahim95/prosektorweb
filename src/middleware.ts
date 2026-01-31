import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from "next/server";
import { logger } from '@/shared/lib'
import { RATE_LIMIT_TIERS, checkRateLimit } from '@/shared/lib/rate-limit'
// Note: Middleware'de next/headers kullanılamaz, NextRequest.headers kullanılır
// checkRateLimit ve getClientIp içe aktarılmaz, bunun yerine doğrudan IP middleware'den alınır

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing);

export default auth(async (req) => {
    // [TODO-OBS-002] Middleware Request ID & Logging
    const requestId = crypto.randomUUID()
    const requestStart = Date.now()
    const nonce = (() => {
        const bytes = crypto.getRandomValues(new Uint8Array(16))
        let binary = ''
        for (const b of bytes) binary += String.fromCharCode(b)
        return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    })()

    const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://plausible.io`,
        `style-src 'self' 'nonce-${nonce}'`,
        "img-src 'self' data: https://images.unsplash.com https://grainy-gradients.vercel.app blob:",
        "font-src 'self' data:",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'self'",
        "form-action 'self'",
        "connect-src 'self' https://vitals.vercel-insights.com https://www.google-analytics.com https://plausible.io",
    ].join('; ')

    // Structured log context
    const logContext = {
        requestId,
        method: req.method,
        url: req.nextUrl.pathname,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent'),
    }

    logger.info({ ...logContext }, 'Request started')

    const applySecurityHeaders = (res: NextResponse) => {
        res.headers.set('Content-Security-Policy', csp)
        res.headers.set('X-Request-Id', requestId)
        return res
    }

    // Helper for structured responses with headers
    const createErrorResponse = (message: string | object, status: number) => {
        const body = typeof message === 'string' ? message : JSON.stringify(message)
        const res = new NextResponse(body, { status })
        return applySecurityHeaders(res)
    }

    try {
        const isLoggedIn = !!req.auth
        const userRole = req.auth?.user?.role

        // 0. Rate Limiting (Security)
        const forwardedFor = req.headers.get('x-forwarded-for')
        const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'

        // 0.1 Bot & Abuse Protection
        const userAgent = req.headers.get('user-agent') || ''

        if (!userAgent) {
            return createErrorResponse('Bad Request: User-Agent required', 400)
        }

        const BAD_BOTS = ['GPTBot', 'AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot', 'Bytespider', 'ClaudeBot', 'anthropic-ai']
        if (BAD_BOTS.some(bot => userAgent.includes(bot))) {
            return createErrorResponse('Forbidden: Bot access denied', 403)
        }

        // 0.2 Rate Limits (Exclusive checks)
        // If it's an Auth request, check Auth Limit only
        if (req.nextUrl.pathname.startsWith('/api/auth') && req.method === 'POST') {
            const { success } = await checkRateLimit(`auth:${ip}`, { limit: 10, windowSeconds: 60 })
            if (!success) return createErrorResponse('Too Many Requests', 429)
        }
        // If it's a general API request (and NOT auth POST), check API Limit
        else if (req.nextUrl.pathname.startsWith('/api')) {
            let limitKey = `api:${ip}`
            let limitConfig = RATE_LIMIT_TIERS.API

            if (isLoggedIn && req.auth?.user?.id) {
                limitKey = `user:${req.auth.user.id}`
                limitConfig = userRole === 'ADMIN' ? RATE_LIMIT_TIERS.ADMIN : RATE_LIMIT_TIERS.AUTHENTICATED
            }

            const { success } = await checkRateLimit(limitKey, { limit: limitConfig.limit, windowSeconds: limitConfig.window })
            if (!success) {
                return createErrorResponse({ error: 'Too Many Requests' }, 429)
            }
        }

        // 1. API Protection (Auth & Roles) - Direct Response (Skip Intl)
        if (req.nextUrl.pathname.startsWith('/api')) {
            // Unprotected APIs logic...
            const isUnprotectedApi =
                req.nextUrl.pathname.startsWith('/api/auth') ||
                req.nextUrl.pathname.startsWith('/api/contact') ||
                req.nextUrl.pathname.startsWith('/api/webhooks');

            if (isUnprotectedApi) {
                const requestHeaders = new Headers(req.headers)
                requestHeaders.set('x-nonce', nonce)
                const response = NextResponse.next({ request: { headers: requestHeaders } })
                return applySecurityHeaders(response)
            }

            // Protected APIs
            if (!isLoggedIn) {
                return createErrorResponse({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
            }

            if (req.nextUrl.pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
                return createErrorResponse({ success: false, error: 'Forbidden', code: 'FORBIDDEN' }, 403)
            }

            const requestHeaders = new Headers(req.headers)
            requestHeaders.set('x-nonce', nonce)
            const response = NextResponse.next({ request: { headers: requestHeaders } })
            return applySecurityHeaders(response)
        }

        // 2. Page Access Protection (Before Intl)
        const pathname = req.nextUrl.pathname;
        const localeMatch = pathname.match(/^\/(tr|en)(\/|$)/);
        const pathWithoutLocale = localeMatch
            ? pathname.replace(/^\/(tr|en)/, '') || '/'
            : pathname;

        const isOnLogin = pathWithoutLocale.startsWith('/login')
        const isOnAdmin = pathWithoutLocale.startsWith('/admin')
        const isOnPortal = pathWithoutLocale.startsWith('/portal')

        // Redirect Logic
        if (isOnLogin && isLoggedIn) {
            const target = userRole === 'ADMIN' ? '/admin' : '/portal'
            return applySecurityHeaders(NextResponse.redirect(new URL(target, req.nextUrl)))
        }

        if (isOnAdmin && (!isLoggedIn || userRole !== 'ADMIN')) {
            return applySecurityHeaders(NextResponse.redirect(new URL('/login', req.nextUrl)))
        }

        if (isOnPortal && (!isLoggedIn || userRole !== 'CLIENT')) {
            return applySecurityHeaders(NextResponse.redirect(new URL('/login', req.nextUrl)))
        }

        // 3. Intl Middleware (The Final Step for Pages)
        // We MUST pass the x-nonce header to the intlMiddleware so it persists in the rewrite/render

        // Clone headers and add nonce
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('x-nonce', nonce)

        // Construct a new request with modified headers. 
        // We must pass the body for POST requests (Server Actions), otherwise they will fail.
        const reqWithNonce = new NextRequest(req.url, {
            headers: requestHeaders,
            method: req.method,
            body: req.body
        })

        const intlResponse = intlMiddleware(reqWithNonce);

        // Apply CSP and Security Headers to the Intl Response (Rewrite/Next/Redirect)
        return applySecurityHeaders(intlResponse);

    } finally {
        const duration = Date.now() - requestStart
        logger.info({ ...logContext, duration }, 'Request processed')
    }
})

export const config = {
    // Matcher excluding statics
    matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
