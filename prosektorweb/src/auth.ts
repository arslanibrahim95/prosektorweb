import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { authConfig } from "./auth.config"

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
                    // CONSTANT: Simple Admin Credentials for V1
                    // In a real production app, fetch this from the database and hash passwords

                    const adminEmail = process.env.ADMIN_EMAIL || "admin@prosektorweb.com";
                    const adminPassword = process.env.ADMIN_PASSWORD || "6509d6d5a0e97a0c8d79c76e"; // Fallback to a generated secure string if env is missing

                    if (email === adminEmail && password === adminPassword) {
                        return {
                            id: "1",
                            name: "Admin User",
                            email: adminEmail,
                        }
                    }
                }
                return null
            },
        }),
    ],
})
