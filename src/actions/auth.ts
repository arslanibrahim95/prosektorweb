'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'

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

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        console.log(`[AUTH] SignIn result:`, result)

    } catch (error) {
        console.log(`[AUTH] Error caught:`, error)

        // NEXT_REDIRECT error is expected for successful login
        if (error && typeof error === 'object' && 'digest' in error) {
            const digest = (error as any).digest
            if (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT')) {
                throw error
            }
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.'
                case 'AccessDenied':
                    return 'Bu hesaba erişim izniniz yok.'
                case 'Configuration':
                    return 'Sunucu yapılandırma hatası. Lütfen yöneticiyle iletişime geçin.'
                default:
                    return `Giriş hatası: ${error.type || 'Bilinmeyen hata'}`
            }
        }

        return 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    }

    // Step 3: Manual redirect after successful login
    // Middleware will handle role-based routing
    redirect('/portal')
}
