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
        // Authorization check for protected routes - moved to middleware
        authorized() {
            return true;
        },
    },
    providers: [],
} satisfies NextAuthConfig;
