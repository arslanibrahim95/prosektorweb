'use client'

import { useActionState } from 'react'
import { AlertCircle, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Link } from '@/i18n/routing'
import { resetPassword } from '@/features/auth/actions/password-reset'
import { ActionResponse } from '@/shared/lib'

interface ResetPasswordFormProps {
    token: string
}

const initialState: ActionResponse<void> = {
    success: false,
    error: '',
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const t = useTranslations('Login')
    const [state, formAction, isPending] = useActionState(resetPassword, initialState)

    return (
        <div className="space-y-6">
            {state.success ? (
                <div className="space-y-6 text-center">
                    <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 flex flex-col items-center gap-3 animate-in zoom-in-95">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                        <p className="font-semibold">{t('reset_success_desc')}</p>
                    </div>
                    <Link
                        href="/login"
                        className="inline-flex items-center btn bg-brand-600 text-white px-6 py-3 rounded-xl gap-2 hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
                    >
                        {t('signin')}
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            ) : (
                <form action={formAction} className="space-y-5">
                    <input type="hidden" name="token" value={token} />

                    <div className="space-y-2">
                        <Label htmlFor="password">{t('password_label')}</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            placeholder={t('placeholder_password')}
                            required
                            leadingIcon={<Lock className="w-5 h-5" />}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('password_confirm')}</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            name="confirmPassword"
                            placeholder={t('placeholder_password')}
                            required
                            leadingIcon={<Lock className="w-5 h-5" />}
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
                        {t('submit_reset')}
                        {!isPending && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                </form>
            )}
        </div>
    )
}
