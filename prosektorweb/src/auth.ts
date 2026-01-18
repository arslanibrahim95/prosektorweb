import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function getUser(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } })
        return user
    } catch (error) {
        console.error('Failed to fetch user:', error)
        throw new Error('Failed to fetch user.')
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

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data

                    // 1. Check Database User
                    const user = await getUser(email)
                    if (user) {
                        const passwordsMatch = await bcrypt.compare(password, user.password)
                        if (passwordsMatch) {
                            return {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role, // Custom field
                                companyId: user.companyId
                            }
                        }
                    }

                    // 2. Fallback to Env Admin (Root User) - Only if DB user not found/nomatch
                    // This creates a virtual admin session if no DB user exists or if credentials match env
                    const adminEmail = process.env.ADMIN_EMAIL || "admin@prosektorweb.com";
                    // For security, only allow env fallback if NO DB user matched (already handled above)
                    // But we simply check if credentials match env vars separately.

                    // Hardcoded fallback for "bootstrap" access
                    // Note: Ideally you should seed an Admin user to DB and remove this.
                    if (email === adminEmail) {
                        const adminPassword = process.env.ADMIN_PASSWORD || "6509d6d5a0e97a0c8d79c76e";
                        if (password === adminPassword) {
                            return {
                                id: "root-admin",
                                name: "Root Admin",
                                email: adminEmail,
                                role: "ADMIN",
                                companyId: null
                            }
                        }
                    }
                }

                console.log('Invalid credentials')
                return null
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.companyId = (user as any).companyId
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                (session.user as any).role = token.role;
                (session.user as any).companyId = token.companyId;
            }
            return session
        },
    },
})
