import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function getUser(email: string) {
    try {
        console.log(`[AUTH] Looking up user: ${email}`)
        const user = await prisma.user.findUnique({ where: { email } })
        console.log(`[AUTH] User found: ${user ? 'Yes' : 'No'}`)
        return user
    } catch (error) {
        console.error('[AUTH] Database error:', error)
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
                console.log('[AUTH] Authorize called with:', credentials?.email)

                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials)

                if (!parsedCredentials.success) {
                    console.log('[AUTH] Validation failed:', parsedCredentials.error.errors)
                    return null
                }

                const { email, password } = parsedCredentials.data

                // 1. Check Database User
                const user = await getUser(email)
                if (user) {
                    console.log(`[AUTH] Checking password for DB user: ${email}`)
                    const passwordsMatch = await bcrypt.compare(password, user.password)
                    console.log(`[AUTH] Password match: ${passwordsMatch}`)

                    if (passwordsMatch) {
                        console.log(`[AUTH] SUCCESS - DB user authenticated: ${email}, role: ${user.role}`)
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            companyId: user.companyId
                        }
                    }
                }

                // 2. Fallback to Env Admin (Root User)
                const adminEmail = process.env.ADMIN_EMAIL || "admin@prosektorweb.com"
                const adminPassword = process.env.ADMIN_PASSWORD || "6509d6d5a0e97a0c8d79c76e"

                if (email === adminEmail && password === adminPassword) {
                    console.log(`[AUTH] SUCCESS - Root admin authenticated: ${email}`)
                    return {
                        id: "root-admin",
                        name: "Root Admin",
                        email: adminEmail,
                        role: "ADMIN",
                        companyId: null
                    }
                }

                console.log(`[AUTH] FAILED - Invalid credentials for: ${email}`)
                return null
            },
        }),
    ],
})
