'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/components/ui'
import { Input } from '@/shared/components/ui'
import { Label } from '@/shared/components/ui'
import { Link } from '@/i18n/routing'

export function LoginForm() {
    const t = useTranslations('Login')
    const [error, setError] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setIsPending(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // Validate
        if (!email || !email.includes('@')) {
            setError(t('error_email'))
            setIsPending(false)
            return
        }

        if (!password || password.length < 6) {
            setError(t('error_password_length'))
            setIsPending(false)
            return
        }

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            if (result.error === 'CredentialsSignin') {
                setError(t('error_invalid'))
            } else {
                setError(t('error_system'))
            }
            setIsPending(false)
        } else {
            window.location.href = '/'
        }
    }

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email">{t('email_label')}</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="örnek@firma.com"
                        required
                        leadingIcon={<Mail className="w-5 h-5" />}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">{t('password_label')}</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        required
                        leadingIcon={<Lock className="w-5 h-5" />}
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="flex justify-end">
                    <Link
                        href="/forgot-password"
                        className="text-sm text-brand-600 font-semibold hover:underline"
                    >
                        {t('forgot_password_link')}
                    </Link>
                </div>

                <Button
                    type="submit"
                    className="w-full py-7"
                    variant="gradient"
                    loading={isPending}
                >
                    {t('submit')}
                    {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
            </form>

            <div className="pt-6 border-t border-neutral-100 text-center space-y-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                    ← {t('back_home')}
                </Link>
            </div>
        </div>
    )
}
