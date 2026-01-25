'use server'

import { signOut, signIn } from '@/auth'
import { AuthError } from 'next-auth'

/**
 * Handle user logout securely via Server Action
 */
export async function logoutAction() {
    await signOut({ redirectTo: '/login' })
}

/**
 * Handle user login via Server Action
 */
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Hatalı e-posta veya şifre.'
                default:
                    return 'Giriş yapılırken bir hata oluştu.'
            }
        }
        throw error
    }
}
