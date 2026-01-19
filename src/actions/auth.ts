'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

// ==========================================
// ACTIONS
// ==========================================

export async function authenticate(prevState: string | undefined, formData: FormData) {
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
