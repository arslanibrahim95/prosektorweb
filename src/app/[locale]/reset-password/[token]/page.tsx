'use client'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { ShieldCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { use } from 'react'

interface PageProps {
    params: Promise<{ token: string }>
}

export default function ResetPasswordPage({ params }: PageProps) {
    const { token } = use(params)
    const t = useTranslations('Login')

    return (
        <AuthLayout>
            <AuthCard
                title={t('reset_password_title')}
                description={t('reset_password_desc')}
                icon={<ShieldCheck className="w-8 h-8 text-white" />}
            >
                <ResetPasswordForm token={token} />
            </AuthCard>
        </AuthLayout>
    )
}
