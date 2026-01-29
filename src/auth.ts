import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "./auth.config"
import { prisma } from '@/server/db'
import bcrypt from "bcryptjs"
import { verifyRootPassword } from '@/features/auth/lib/root-admin'

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } })
        return user
    } catch (error) {
        console.error('[AUTH] Database connection error')
        throw new Error('Veritabanı bağlantı hatası.')
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (!parsedCredentials.success) {
                    return null
                }

                const { email, password } = parsedCredentials.data
                const normalizedEmail = email.toLowerCase()

                // 1. Check SystemUser (Admins/Staff)
                const systemUser = await prisma.systemUser.findUnique({ where: { email: normalizedEmail } })
                if (systemUser) {
                    if (!systemUser.isActive) throw new Error('INACTIVE_ACCOUNT')
                    const passwordsMatch = await bcrypt.compare(password, systemUser.password)
                    if (passwordsMatch) {
                        return {
                            id: systemUser.id,
                            name: systemUser.name || systemUser.firstName, // Fallback
                            email: systemUser.email,
                            role: systemUser.role, // "ADMIN", "DOCTOR", etc.
                            companyId: null, // System users don't have companyId
                            isSystemUser: true,
                            sessionVersion: systemUser.sessionVersion.toString()
                        }
                    }
                }

                // 2. Check Client User (Customers)
                const user = await getUser(normalizedEmail)
                if (user) {
                    if (user.deletedAt) throw new Error('INACTIVE_ACCOUNT')
                    const passwordsMatch = await bcrypt.compare(password, user.password)

                    if (passwordsMatch) {
                        // Only allow CLIENT role here effectively
                        // (After migration, ADMINs shouldn't be here, but for safety we use existing role)
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role, // Should effectively be "CLIENT" mostly
                            companyId: user.companyId,
                            isSystemUser: false,
                            sessionVersion: user.sessionVersion.toString()
                        }
                    }
                }

                // 2. Fallback to Env Admin (Root User) - HASHED
                const adminEmail = process.env.ADMIN_EMAIL
                const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH

                if (adminEmail && adminPasswordHash && normalizedEmail === adminEmail.toLowerCase()) {
                    const isValid = await verifyRootPassword(password, adminPasswordHash)
                    if (isValid) {
                        return {
                            id: "root-admin",
                            name: "Root Admin",
                            email: adminEmail,
                            role: "ADMIN",
                            companyId: null
                        }
                    }
                }

                return null
            },
        }),
    ],
})
