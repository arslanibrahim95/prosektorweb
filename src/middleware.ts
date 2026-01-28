import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger"

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing);

import { checkRateLimit, RATE_LIMIT_TIERS } from "@/lib/rate-limit"

export default auth(async (req) => {
    // [TODO-OBS-002] Middleware Request ID & Logging
    const requestId = crypto.randomUUID()
    const requestStart = Date.now()

    // Helper for structured responses with headers
    const createErrorResponse = (message: string | object, status: number) => {
        const body = typeof message === 'string' ? message : JSON.stringify(message)
        const res = new NextResponse(body, { status })
        res.headers.set('X-Request-Id', requestId)
        return res
    }

    // Structured log context
    const logContext = {
        requestId,
        method: req.method,
        url: req.nextUrl.pathname,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent'),
    }

    logger.info({ ...logContext }, 'Request started')

    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role

    // Helper for logging exit
    const logExit = () => {
        const duration = Date.now() - requestStart
        logger.info({ ...logContext, duration }, 'Request processed')
    }

    // 0. Rate Limiting (Security)
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1'

    // Strict limit for Auth (Brute Force Protection)
    // Only limit POST requests to /api/auth (Login, Register, etc.)
    // Allow GET requests (CSRF, Session, Page Loads) to pass to standard limits
    if (req.nextUrl.pathname.startsWith('/api/auth') && req.method === 'POST') {
        const { success } = await checkRateLimit(`auth:${ip}`, { limit: 10, windowSeconds: 60 })
        if (!success) {
            logExit()
            logExit()
            return createErrorResponse('Too Many Requests', 429)
        }
    }

    // 0. Bot & Abuse Protection
    const userAgent = req.headers.get('user-agent') || ''

    // 0.1 Block Empty User-Agent (Common in simple scripts)
    if (!userAgent) {
        logExit()
        logExit()
        return createErrorResponse('Bad Request: User-Agent required', 400)
    }

    // 0.2 Block Known Bad Bots
    const BAD_BOTS = ['GPTBot', 'AhrefsBot', 'SemrushBot', 'DotBot', 'MJ12bot', 'Bytespider', 'ClaudeBot', 'anthropic-ai']
    if (BAD_BOTS.some(bot => userAgent.includes(bot))) {
        logExit()
        return createErrorResponse('Forbidden: Bot access denied', 403)
    }


    // 0.4 Rate Limit: Specific API Limits
    if (req.nextUrl.pathname.startsWith('/api')) {
        let limitKey = `api:${ip}`
        let limitConfig: { limit: number; window: number } = RATE_LIMIT_TIERS.API

        // Use User ID for authenticated users to avoid IP collisions
        if (isLoggedIn && req.auth?.user?.id) {
            limitKey = `user:${req.auth.user.id}`
            if (userRole === 'ADMIN') {
                limitConfig = RATE_LIMIT_TIERS.ADMIN
            } else {
                limitConfig = RATE_LIMIT_TIERS.AUTHENTICATED
            }
        }

        const { limit, window } = limitConfig
        const { success } = await checkRateLimit(limitKey, { limit, windowSeconds: window })
        if (!success) {
            logExit()
            if (!success) {
                logExit()
                return createErrorResponse({ error: 'Too Many Requests' }, 429)
            }
        }
    }

    // 1. API Protection (Skip Intl)
    if (req.nextUrl.pathname.startsWith('/api')) {
        // Public API routes
        if (
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname.startsWith('/api/contact') ||
            req.nextUrl.pathname.startsWith('/api/webhooks')
        ) {
            logExit()
            return null
        }

        // Require auth for all other API routes
        if (!isLoggedIn) {
            logExit()
            if (!isLoggedIn) {
                logExit()
                return createErrorResponse({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401)
            }
        }

        // Admin-only API routes
        if (req.nextUrl.pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
            logExit()
            if (req.nextUrl.pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
                logExit()
                return createErrorResponse({ success: false, error: 'Forbidden', code: 'FORBIDDEN' }, 403)
            }
        }

        logExit()
        return null
    }

    // 2. Intl Middleware (For Pages)
    // We run this first to handle redirects (e.g. / -> /tr)
    // If it returns a redirect, we follow it immediately.
    const intlResponse = intlMiddleware(req);
    if (intlResponse.headers.get('location')) {
        logExit()
        return intlResponse;
    }

    // 3. Auth Protection for Pages
    // Determine the actual path (ignoring locale prefix for checks)
    // E.g. /tr/admin -> /admin
    const pathname = req.nextUrl.pathname;
    const localeMatch = pathname.match(/^\/(tr|en)(\/|$)/);
    const pathWithoutLocale = localeMatch
        ? pathname.replace(/^\/(tr|en)/, '') || '/'
        : pathname;

    const isOnLogin = pathWithoutLocale.startsWith('/login')
    const isOnAdmin = pathWithoutLocale.startsWith('/admin')
    const isOnPortal = pathWithoutLocale.startsWith('/portal')

    // Public login page - redirect logged-in users
    if (isOnLogin && isLoggedIn) {
        if (userRole === 'CLIENT') {
            logExit()
            return Response.redirect(new URL('/portal', req.nextUrl)) // Auth middleware will handle keeping locale if we use relative? No, next-intl handles generic redirects better but here we force it.
            // Ideally: return Response.redirect(new URL(`/${req.locale}/portal`, req.url))
            // But req.locale is not available here easily (it's in intlResponse).
            // We can assume default or extract from URL.
            // For now, redirecting to /portal will trigger intlMiddleware again on next request to add locale.
        }
        if (userRole === 'ADMIN') {
            logExit()
            return Response.redirect(new URL('/admin', req.nextUrl))
        }
    }

    // Admin protection
    if (isOnAdmin) {
        if (!isLoggedIn || userRole !== 'ADMIN') {
            logExit()
            // Redirect to login
            return Response.redirect(new URL('/login', req.nextUrl))
        }
    }

    // Portal protection
    if (isOnPortal) {
        if (!isLoggedIn || userRole !== 'CLIENT') {
            logExit()
            return Response.redirect(new URL('/login', req.nextUrl))
        }
    }

    logExit()
    // Return the response created by intl middleware (which contains rewrites/headers)
    const response = intlResponse;
    response.headers.set('X-Request-Id', requestId);
    return response;
})

export const config = {
    // Matcher excluding statics
    matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
