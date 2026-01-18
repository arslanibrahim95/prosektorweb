'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CallbackRouteError':
                case 'CredentialsSignin':
                    return 'E-posta veya şifre hatalı.'
                default:
                    return 'Giriş yapılırken bir hata oluştu.'
            }
        }
        throw error
    }
}
