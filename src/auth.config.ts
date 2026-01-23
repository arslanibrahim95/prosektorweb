import type { NextAuthConfig } from 'next-auth';
import '@/types/next-auth'; // Type extensions

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        // JWT callback - runs on every request
        jwt({ token, user }) {
            // On first sign in, user object is available
            if (user) {
                token.role = user.role
                token.companyId = user.companyId
                token.id = user.id!
            }
            return token
        },
        // Session callback - exposes token data to client
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role
                session.user.companyId = token.companyId
                session.user.id = token.id
            }
            return session
        },
        // Authorization check for protected routes
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = auth?.user?.role;

            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnPortal = nextUrl.pathname.startsWith('/portal');

            if (isOnAdmin) {
                if (isLoggedIn && userRole === 'ADMIN') return true;
                // Redirect to secret admin login if not admin
                return Response.redirect(new URL('/yonetim-girisi', nextUrl));
            }

            if (isOnPortal) {
                if (isLoggedIn && (userRole === 'CLIENT' || userRole === 'ADMIN')) return true;
                return Response.redirect(new URL('/login', nextUrl));
            }

            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
