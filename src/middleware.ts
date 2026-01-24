import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role

    const isOnLogin = req.nextUrl.pathname.startsWith('/login')
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isOnPortal = req.nextUrl.pathname.startsWith('/portal')

    // Public login page - redirect logged-in users
    if (isOnLogin && isLoggedIn) {
        if (userRole === 'CLIENT') {
            return Response.redirect(new URL('/portal', req.nextUrl))
        }
        if (userRole === 'ADMIN') {
            return Response.redirect(new URL('/admin', req.nextUrl))
        }
    }

    // Admin protection
    if (isOnAdmin) {
        if (!isLoggedIn || userRole !== 'ADMIN') {
            return Response.redirect(new URL('/login', req.nextUrl))
        }
    }

    // Portal protection
    if (isOnPortal) {
        if (!isLoggedIn || userRole !== 'CLIENT') {
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
            return null
        }

        // Require auth for all other API routes
        if (!isLoggedIn) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Admin-only API routes
        if (req.nextUrl.pathname.startsWith('/api/admin') && userRole !== 'ADMIN') {
            return Response.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    return null
})

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
