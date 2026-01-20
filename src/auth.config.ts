import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        // JWT callback - runs on every request
        jwt({ token, user }) {
            // On first sign in, user object is available
            if (user) {
                token.role = (user as any).role
                token.companyId = (user as any).companyId
                token.id = user.id
            }
            return token
        },
        // Session callback - exposes token data to client
        session({ session, token }) {
            if (token && session.user) {
                (session.user as any).role = token.role;
                (session.user as any).companyId = token.companyId;
                (session.user as any).id = token.id;
            }
            return session
        },
        // Authorization check for protected routes
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = (auth?.user as any)?.role;

            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnPortal = nextUrl.pathname.startsWith('/portal');

            if (isOnAdmin) {
                if (isLoggedIn && userRole === 'ADMIN') return true;
                return false;
            }

            if (isOnPortal) {
                if (isLoggedIn && (userRole === 'CLIENT' || userRole === 'ADMIN')) return true;
                return false;
            }

            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
