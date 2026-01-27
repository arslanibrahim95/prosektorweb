'use client'

import { useActionState, useState } from 'react'
import { AlertCircle, ArrowRight, Mail, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Link } from '@/i18n/routing'
import { requestPasswordReset, AuthActionResult } from '@/actions/auth-actions'

const initialState: AuthActionResult = {
    success: false,
}

export function ForgotPasswordForm() {
    const t = useTranslations('Login')
    const [state, formAction, isPending] = useActionState(requestPasswordReset, initialState)

    return (
        <div className="space-y-6">
            {state.success ? (
                <div className="space-y-6 text-center">
                    <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex flex-col items-center gap-3 animate-in zoom-in-95">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <p className="font-semibold">{state.message}</p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:underline"
                    >
                        <ArrowRight className="w-5 h-5 rotate-180" />
                        {t('back_home')}
                    </Link>
                </div>
            ) : (
                <form action={formAction} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="email">{t('email_label')}</Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="ornek@firma.com"
                            required
                            leadingIcon={<Mail className="w-5 h-5" />}
                        />
                    </div>

                    {state.error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-3 border border-red-100">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{state.error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full py-7"
                        variant="gradient"
                        loading={isPending}
                    >
                        {t('submit_forgot')}
                        {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </Button>

                    <div className="text-center pt-4">
                        <Link
                            href="/login"
                            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
                        >
                            ← Giriş sayfasına dön
                        </Link>
                    </div>
                </form>
            )}
        </div>
    )
}
