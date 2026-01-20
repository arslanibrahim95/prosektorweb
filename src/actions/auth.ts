'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

export async function authenticate(prevState: string | undefined, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Step 1: Validate inputs
    if (!email || !email.includes('@')) {
        return 'Lütfen geçerli bir e-posta adresi girin.'
    }

    if (!password || password.length < 6) {
        return 'Şifre en az 6 karakter olmalıdır.'
    }

    try {
        // Step 2: Attempt sign in
        console.log(`[AUTH] Login attempt for: ${email}`)

        await signIn('credentials', {
            email,
            password,
            redirect: false, // Don't redirect, handle manually
        })

        // Step 3: Success - will be redirected by middleware
        console.log(`[AUTH] Login successful for: ${email}`)

    } catch (error) {
        console.log(`[AUTH] Login failed for: ${email}`, error)

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.'
                case 'AccessDenied':
                    return 'Bu hesaba erişim izniniz yok.'
                case 'Verification':
                    return 'E-posta doğrulaması gerekli.'
                case 'Configuration':
                    return 'Sunucu yapılandırma hatası. Lütfen yöneticiyle iletişime geçin.'
                default:
                    return `Giriş hatası: ${error.type || 'Bilinmeyen hata'}`
            }
        }

        // Re-throw NEXT_REDIRECT for proper redirect handling
        if (error && typeof error === 'object' && 'digest' in error) {
            const digest = (error as any).digest
            if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
                throw error
            }
        }

        return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    }
}
