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
                token.role = user.role
                token.companyId = user.companyId
                token.id = user.id!
                token.isSystemUser = (user as any).isSystemUser || false
            }
            return token
        },
        // Session callback - exposes token data to client
        session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string
                session.user.companyId = token.companyId as string | null
                session.user.id = token.id as string
                // @ts-ignore
                session.user.isSystemUser = token.isSystemUser as boolean
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
