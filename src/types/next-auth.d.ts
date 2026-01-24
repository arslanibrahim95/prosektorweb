import { DefaultSession } from "next-auth"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user: {
            /** The user's role. */
            role: string
            /** The user's company ID (if client). */
            companyId: string | null
            /** The user's database ID. */
            id: string
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        companyId: string | null
        id?: string
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        /** The user's role. */
        role: string
        /** The user's company ID. */
        companyId: string | null
        /** The user's database ID. */
        id: string
    }
}
