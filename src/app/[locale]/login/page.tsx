'use client'

import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { User } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
    const t = useTranslations('Login')

    return (
        <AuthLayout>
            <AuthCard
                title={t('title')}
                description={t('description')}
                icon={<User className="w-8 h-8 text-white" />}
            >
                <LoginForm />
            </AuthCard>
        </AuthLayout>
    )
}
