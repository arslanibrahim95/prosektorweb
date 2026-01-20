'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Validate inputs
    if (!email || !email.includes('@')) {
        return 'Lütfen geçerli bir e-posta adresi girin.'
    }

    if (!password || password.length < 6) {
        return 'Şifre en az 6 karakter olmalıdır.'
    }

    try {
        console.log(`[AUTH] Login attempt for: ${email}`)

        await signIn('credentials', {
            email,
            password,
            redirectTo: '/portal', // Let NextAuth handle the redirect
        })

    } catch (error: any) {
        console.log(`[AUTH] Error:`, error?.message || error)

        // If it's a redirect, let it through
        if (error?.digest?.includes('NEXT_REDIRECT')) {
            throw error
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'E-posta veya şifre hatalı.'
                default:
                    return 'Giriş yapılırken bir hata oluştu.'
            }
        }

        throw error
    }
}
