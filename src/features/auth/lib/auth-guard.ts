import { auth } from '@/auth'

// ==========================================
// TYPES
// ==========================================

export type UserRole = 'ADMIN' | 'CLIENT'

export interface AuthenticatedUser {
    id: string
    name?: string | null
    email?: string | null
    role: UserRole
    companyId?: string | null
}

// ==========================================
// AUTH GUARD
// ==========================================

/**
 * Require authentication for server actions.
 * Throws an error if user is not authenticated or lacks required role.
 * 
 * @param allowedRoles - Roles allowed to perform the action (default: ['ADMIN'])
 * @returns The authenticated session
 * @throws Error if not authenticated or unauthorized
 * 
 * @example
 * // Admin only action
 * export async function deleteCompany(id: string) {
 *   await requireAuth() // Defaults to ADMIN only
 *   // ... rest of the function
 * }
 * 
 * @example
 * // Action for both ADMIN and CLIENT
 * export async function getMyTickets() {
 *   const session = await requireAuth(['ADMIN', 'CLIENT'])
 *   // Use session.user.companyId for filtering
 * }
 */
export async function requireAuth(allowedRoles: UserRole[] = ['ADMIN']) {
    const session = await auth()

    const user = session?.user as AuthenticatedUser

    if (!user || !user.role || !allowedRoles.includes(user.role)) {
        throw new Error('Unauthorized')
    }

    return { ...session, user }
}

/**
 * Get current user session without throwing.
 * Useful for read operations where auth is optional.
 * 
 * @returns Session or null
 */
export async function getSession() {
    const session = await auth()
    if (!session?.user) return null
    return { ...session, user: session.user as AuthenticatedUser }
}
