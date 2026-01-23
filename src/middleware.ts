import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import '@/types/next-auth'

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

    return null
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
