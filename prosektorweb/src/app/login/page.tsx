'use client'

import { useActionState, useEffect } from 'react'
import { authenticate } from '@/actions/auth'
import { AlertCircle, Loader2, Lock } from 'lucide-react'

export default function LoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="bg-brand-600 p-8 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white font-serif">Yönetici Girişi</h1>
                    <p className="text-brand-100 text-sm mt-2">Lütfen devam etmek için giriş yapın</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form action={formAction} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">E-posta</label>
                            <input
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                                id="email"
                                type="email"
                                name="email"
                                placeholder="admin@prosektorweb.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-1">Şifre</label>
                            <input
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                                id="password"
                                type="password"
                                name="password"
                                required
                            />
                        </div>

                        {errorMessage && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-3.5 bg-brand-600 text-white rounded-lg font-bold shadow-md hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            aria-disabled={isPending}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Giriş Yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400">
                        ProSektorWeb &copy; 2026
                    </div>
                </div>
            </div>
        </div>
    )
}
