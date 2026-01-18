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
                    if (email === "admin@prosektorweb.com" && password === "admin123") {
                        return {
                            id: "1",
                            name: "Admin User",
                            email: "admin@prosektorweb.com",
                        }
                    }
                }
                return null
            },
        }),
    ],
})
