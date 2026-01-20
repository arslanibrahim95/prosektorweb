import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnAdmin = req.nextUrl.pathname.startsWith('/admin')
    const isOnLogin = req.nextUrl.pathname.startsWith('/login')

    if (isOnAdmin) {
        if (isLoggedIn) return null
        return Response.redirect(new URL('/login', req.nextUrl))
    }

    if (isOnLogin) {
        if (isLoggedIn) {
            return Response.redirect(new URL('/admin', req.nextUrl))
        }
        return null
    }

    return null
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|login|.*\\.png$|.*\\.ico$).*)'],
}
