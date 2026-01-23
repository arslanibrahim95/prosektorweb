import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import '@/types/next-auth'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const userRole = req.auth?.user?.role

    const isOnLogin = req.nextUrl.pathname.startsWith('/login')
    const isOnSecretAdmin = req.nextUrl.pathname === '/yonetim-girisi'

    // Public login page - redirect logged-in users
    if (isOnLogin && isLoggedIn) {
        if (userRole === 'CLIENT') {
            return Response.redirect(new URL('/portal', req.nextUrl))
        }
        if (userRole === 'ADMIN') {
            return Response.redirect(new URL('/admin', req.nextUrl))
        }
    }

    // Secret admin login - redirect logged-in admins
    if (isOnSecretAdmin && isLoggedIn && userRole === 'ADMIN') {
        return Response.redirect(new URL('/admin', req.nextUrl))
    }

    return null
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)'],
}
