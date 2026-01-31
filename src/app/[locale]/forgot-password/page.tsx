'use client'

import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import { KeyRound } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
    const t = useTranslations('Login')

    return (
        <AuthLayout>
            <AuthCard
                title={t('forgot_password_title')}
                description={t('forgot_password_desc')}
                icon={<KeyRound className="w-8 h-8 text-white" />}
            >
                <ForgotPasswordForm />
            </AuthCard>
        </AuthLayout>
    )
}
