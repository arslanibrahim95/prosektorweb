'use server'

import { signOut } from '@/auth'

/**
 * Handle user logout securely via Server Action
 */
export async function logoutAction() {
    await signOut({ redirectTo: '/login' })
}
