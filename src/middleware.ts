import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    // [TODO-OBS-002] Middleware Request ID & Logging
    const requestId = crypto.randomUUID()
    const requestStart = Date.now()

    // Structured log context (will be used or logged)
    const logContext = {
        requestId,
        method: req.method,
        url: req.nextUrl.pathname,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent'),
    }

    // Since middleware runs on Edge/Node depending on config, but NextAuth forces Node or Edge compat
    // We will do a simple console.log JSON string which Pino can pick up in stdout or a dedicated transport if we attach one.
    // However, in Vercel/Next middleware, using 'pino' directly might be heavy. 
    // Best practice for Next.js Middleware observability is often just console.log JSON for ingestion or OpenTelemetry.
    // For this P0 remediation, we stick to JSON console output which our infra should capture.
    console.log(JSON.stringify({
        ...logContext,
        level: 'info',
        msg: 'Request started',
        time: new Date().toISOString()
    }))

    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role

    const isOnLogin = req.nextUrl.pathname.startsWith('/login')
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isOnPortal = req.nextUrl.pathname.startsWith('/portal')

    // Response helper to inject headers
    const next = () => {
        // Calculate duration for exit log (approximate since we return Response object)
        // In real middleware chain we would tap into response.
        const duration = Date.now() - requestStart
        console.log(JSON.stringify({
            ...logContext,
            level: 'info',
            msg: 'Request processed',
            duration,
            time: new Date().toISOString()
        }))
    }

    // Public login page - redirect logged-in users
    if (isOnLogin && isLoggedIn) {
        if (userRole === 'CLIENT') {
            next()
            return Response.redirect(new URL('/portal', req.nextUrl))
        }
        if (userRole === 'ADMIN') {
            next()
            return Response.redirect(new URL('/admin', req.nextUrl))
        }
    }

    // Admin protection
    if (isOnAdmin) {
        if (!isLoggedIn || userRole !== 'ADMIN') {
            next()
            return Response.redirect(new URL('/login', req.nextUrl))
        }
    }

    // Portal protection
    if (isOnPortal) {
        if (!isLoggedIn || userRole !== 'CLIENT') {
            next()
            return Response.redirect(new URL('/login', req.nextUrl))
        }
    }

    // API protection
    if (req.nextUrl.pathname.startsWith('/api')) {
        // Allow public API routes
        if (
            req.nextUrl.pathname.startsWith('/api/auth') ||
            req.nextUrl.pathname.startsWith('/api/contact') ||
            req.nextUrl.pathname.startsWith('/api/webhooks')
        ) {
            // Check CSP / Sentry permissions here if needed
            next()
            return null
        }

        // Require auth for all other API routes
        if (!isLoggedIn) {
            next()
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin-only API routes
        if (req.nextUrl.pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
            next()
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    next()
    return null
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
