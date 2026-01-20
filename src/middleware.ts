import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const userRole = (req.auth?.user as any)?.role

    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isOnPortal = req.nextUrl.pathname.startsWith('/portal')
    const isOnLogin = req.nextUrl.pathname.startsWith('/login')
    const isOnSecretAdmin = req.nextUrl.pathname === '/yonetim-girisi'

    // Admin panel - only for ADMIN role
    if (isOnAdmin) {
        if (isLoggedIn && userRole === 'ADMIN') return null
        return Response.redirect(new URL('/yonetim-girisi', req.nextUrl))
    }

    // Client portal - only for CLIENT or ADMIN role
    if (isOnPortal) {
        if (isLoggedIn && (userRole === 'CLIENT' || userRole === 'ADMIN')) return null
        return Response.redirect(new URL('/login', req.nextUrl))
    }

    // Public login page - redirect logged-in clients to portal
    if (isOnLogin && isLoggedIn) {
        if (userRole === 'CLIENT') {
            return Response.redirect(new URL('/portal', req.nextUrl))
        }
        if (userRole === 'ADMIN') {
            return Response.redirect(new URL('/admin', req.nextUrl))
        }
    }

    // Secret admin login - redirect logged-in admins to admin
    if (isOnSecretAdmin && isLoggedIn && userRole === 'ADMIN') {
        return Response.redirect(new URL('/admin', req.nextUrl))
    }

    return null
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
