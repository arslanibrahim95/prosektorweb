import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
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
