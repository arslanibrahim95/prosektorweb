'use client'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { AuthCard } from '@/components/auth/AuthCard'
import { LoginForm } from '@/components/auth/LoginForm'
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
