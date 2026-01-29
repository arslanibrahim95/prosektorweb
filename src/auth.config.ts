import type { NextAuthConfig } from 'next-auth';
import { prisma } from '@/server/db';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        // JWT callback - runs on every request
        async jwt({ token, user, trigger, session }) {
            // On first sign in, user object is available
            if (user) {
                token.role = user.role
                token.id = user.id!
                token.companyId = user.companyId
                // @ts-ignore
                token.isSystemUser = user.isSystemUser || false
                // @ts-ignore
                token.sessionVersion = user.sessionVersion
            }

            // Database check for session version (Enforce invalidation)
            if (token.id && token.id !== 'root-admin') {
                const dbUser = token.isSystemUser
                    ? await prisma.systemUser.findUnique({ where: { id: token.id as string }, select: { sessionVersion: true, isActive: true } })
                    : await prisma.user.findUnique({ where: { id: token.id as string }, select: { sessionVersion: true, isActive: true } })

                if (!dbUser || !dbUser.isActive || dbUser.sessionVersion.toString() !== token.sessionVersion) {
                    return null // Force logout
                }
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
                // @ts-ignore
                session.user.sessionVersion = token.sessionVersion as string
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
