'use client'

import { useActionState, useRef, useEffect, useState } from 'react'
import { submitContact, ContactState } from '../actions/contact'
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

const initialState: ContactState = {
    success: false,
    message: '',
}

export function ContactForm() {
    const t = useTranslations('Contact')
    const [state, formAction, isPending] = useActionState(submitContact, initialState)
    const formRef = useRef<HTMLFormElement>(null)

    const [idempotencyKey, setIdempotencyKey] = useState('')

    // Generate new key on mount and after successful submission
    useEffect(() => {
        setIdempotencyKey(crypto.randomUUID())
    }, [state.success])

    // Reset form fields when submission is successful or component mounts
    useEffect(() => {
        if (state.success && formRef.current) {
            formRef.current.reset()
        }
    }, [state.success])

    return (
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-neutral-200 shadow-lg">
            {state.success ? (
                <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">{t('success_title')}</h3>
                    <p className="text-neutral-600 mb-6">{state.message}</p>
                    <button
                        onClick={() => {
                            window.location.reload()
                        }}
                        className="text-sm text-brand-600 font-semibold hover:text-brand-700 flex items-center justify-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" /> {t('new_message')}
                    </button>
                </div>
            ) : (
                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-1">{t('name_label')}</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            aria-invalid={!!state.errors?.name}
                            aria-describedby={state.errors?.name ? "name-error" : undefined}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                            placeholder={t('name_placeholder')}
                        />
                        <div className="min-h-[20px] mt-1">
                            {state.errors?.name && (
                                <p id="name-error" role="alert" className="text-sm text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <AlertCircle className="w-3 h-3" /> {state.errors.name[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">{t('phone_label')}</label>
                        <input
                            name="phone"
                            type="tel"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                            placeholder={t('phone_placeholder')}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-1">{t('email_label')}</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            aria-invalid={!!state.errors?.email}
                            aria-describedby={state.errors?.email ? "email-error" : undefined}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                            placeholder={t('email_placeholder')}
                        />
                        <div className="min-h-[20px] mt-1">
                            {state.errors?.email && (
                                <p id="email-error" role="alert" className="text-sm text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <AlertCircle className="w-3 h-3" /> {state.errors.email[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-1">{t('message_label')}</label>
                        <textarea
                            name="message"
                            rows={4}
                            required
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
                            placeholder={t('message_placeholder')}
                        ></textarea>
                        {state.errors?.message && (
                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {state.errors.message[0]}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-start gap-3">
                            <input
                                name="kvkk"
                                type="checkbox"
                                id="kvkk"
                                required
                                className="mt-1 w-4 h-4 text-brand-600 rounded border-neutral-300 focus:ring-brand-500"
                            />
                            <label htmlFor="kvkk" className="text-sm text-neutral-500 cursor-pointer select-none">
                                {t('kvkk_text')}
                                <span className="block text-xs text-neutral-400 mt-0.5">{t('kvkk_subtext')}</span>
                            </label>
                        </div>
                        <div className="min-h-[20px]">
                            {state.errors?.kvkk && (
                                <p className="text-sm text-red-600 flex items-center gap-1 pl-7 animate-in fade-in slide-in-from-top-1 duration-200">
                                    <AlertCircle className="w-3 h-3" /> {state.errors.kvkk[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    {state.message && !state.success && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {state.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-3.5 bg-gradient-to-r from-brand-700 to-brand-600 text-white rounded-lg font-bold shadow-md hover:from-brand-800 hover:to-brand-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('submitting')}
                            </>
                        ) : (
                            t('submit')
                        )}
                    </button>
                </form>
            )}
        </div>
    )
}
