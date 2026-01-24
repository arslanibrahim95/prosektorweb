import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger"

const { auth } = NextAuth(authConfig)
const intlMiddleware = createMiddleware(routing);

import { checkRateLimit } from "@/lib/rate-limit"

export default auth(async (req) => {
    // [TODO-OBS-002] Middleware Request ID & Logging
    const requestId = crypto.randomUUID()
    const requestStart = Date.now()

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
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'

    // Strict limit for Auth/Login
    if (req.nextUrl.pathname.startsWith('/api/auth') || req.nextUrl.pathname === '/login') {
        const { success } = await checkRateLimit(`auth:${ip}`, { limit: 10, windowSeconds: 60 })
        if (!success) {
            logExit()
            return new NextResponse('Too Many Requests', { status: 429 })
        }
    }

    // General API limit
    if (req.nextUrl.pathname.startsWith('/api')) {
        const { success } = await checkRateLimit(`api:${ip}`, { limit: 100, windowSeconds: 60 })
        if (!success) {
            logExit()
            return Response.json({ error: 'Too Many Requests' }, { status: 429 })
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
            return Response.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        // Admin-only API routes
        if (req.nextUrl.pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
            logExit()
            return Response.json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
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
    matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
