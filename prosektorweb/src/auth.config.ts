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
                if (isLoggedIn && userRole === 'ADMIN') return true; // Admins can see portal too? Or maybe not. Let's allow for now or redirect.
                return false;
            }

            // Redirect logged-in users away from login page
            if (isLoggedIn) {
                if (nextUrl.pathname === '/login') {
                    if (userRole === 'ADMIN') return Response.redirect(new URL('/admin', nextUrl));
                    if (userRole === 'CLIENT') return Response.redirect(new URL('/portal', nextUrl));
                }
            }

            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
