'use server'

import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { generateResetToken, hashToken } from '@/lib/auth/password-reset'
import { sendPasswordResetEmail } from '@/lib/email'
import { revalidatePath } from 'next/cache'

const ResetSchema = z.object({
    email: z.string().email('Geçerli bir e-posta adresi girin.'),
})

const PasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler uyuşmuyor.",
    path: ["confirmPassword"],
})

export type AuthActionResult = {
    success: boolean
    error?: string
    message?: string
}

export async function requestPasswordReset(prevState: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
    try {
        const email = formData.get('email') as string
        const validated = ResetSchema.parse({ email })

        // Check if user exists (User or SystemUser)
        const user = await prisma.user.findUnique({ where: { email: validated.email } })
        const systemUser = await prisma.systemUser.findUnique({ where: { email: validated.email } })

        if (!user && !systemUser) {
            // Return success anyway to prevent email enumeration
            return { success: true, message: 'Şifre sıfırlama linki e-posta adresinize gönderildi.' }
        }

        // Generate token
        const { token, hash } = generateResetToken()
        const expiresAt = new Date(Date.now() + 3600000) // 1 hour

        // Store token
        await prisma.passwordResetToken.create({
            data: {
                email: validated.email,
                token: hash,
                expiresAt,
            },
        })

        // Send email
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password/${token}`
        await sendPasswordResetEmail({ to: validated.email, resetUrl })

        return { success: true, message: 'Şifre sıfırlama linki e-posta adresinize gönderildi.' }
    } catch (e) {
        if (e instanceof z.ZodError) {
            return { success: false, error: (e as any).errors[0].message }
        }
        return { success: false, error: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' }
    }
}

export async function resetPassword(prevState: AuthActionResult, formData: FormData): Promise<AuthActionResult> {
    try {
        const token = formData.get('token') as string
        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        const validated = PasswordSchema.parse({ token, password, confirmPassword })
        const hashedToken = hashToken(validated.token)

        // Find valid token
        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                token: hashedToken,
                expiresAt: { gt: new Date() },
            },
        })

        if (!resetToken) {
            return { success: false, error: 'Geçersiz veya süresi dolmuş link.' }
        }

        const hashedPassword = await bcrypt.hash(validated.password, 10)

        // Update user password
        const user = await prisma.user.findUnique({ where: { email: resetToken.email } })
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    sessionVersion: { increment: 1 } // Invalidate existing sessions
                },
            })
        } else {
            const systemUser = await prisma.systemUser.findUnique({ where: { email: resetToken.email } })
            if (systemUser) {
                await prisma.systemUser.update({
                    where: { id: systemUser.id },
                    data: {
                        password: hashedPassword,
                        sessionVersion: { increment: 1 }
                    },
                })
            }
        }

        // Delete used token
        await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })

        return { success: true, message: 'Şifreniz başarıyla güncellendi.' }
    } catch (e) {
        if (e instanceof z.ZodError) {
            return { success: false, error: (e as any).errors[0].message }
        }
        return { success: false, error: 'Bir hata oluştu.' }
    }
}
