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
                return false; // Redirect unauthenticated or non-admins
            }

            if (isOnPortal) {
                if (isLoggedIn && userRole === 'CLIENT') return true;
                if (isLoggedIn && userRole === 'ADMIN') return true;
                return false;
            }

            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
