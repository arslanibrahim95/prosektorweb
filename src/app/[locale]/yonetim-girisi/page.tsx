'use client'

import { useActionState } from 'react'
import { authenticate } from '@/actions/auth'
import { AlertCircle, Loader2, Shield } from 'lucide-react'

export default function AdminLoginPage() {
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)

    return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-neutral-800 rounded-2xl border border-neutral-700 overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="p-6 text-center border-b border-neutral-700">
                        <div className="w-10 h-10 bg-neutral-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-5 h-5 text-neutral-400" />
                        </div>
                        <h1 className="text-lg font-semibold text-neutral-200">Sistem Yönetimi</h1>
                        <p className="text-xs text-neutral-500 mt-1">Yalnızca ProSektorWeb ekibi</p>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        <form action={formAction} className="space-y-4">
                            <div>
                                <input
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 outline-none transition-all text-sm"
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="E-posta"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 outline-none transition-all text-sm"
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="Şifre"
                                    required
                                />
                            </div>

                            {errorMessage && (
                                <div className="p-3 bg-red-900/30 text-red-400 text-sm rounded-lg flex items-center gap-2 border border-red-800/50">
                                    <AlertCircle className="w-4 h-4" />
                                    <p>{errorMessage}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 bg-neutral-700 text-neutral-200 rounded-lg font-medium hover:bg-neutral-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Giriş...
                                    </>
                                ) : (
                                    'Yönetim Paneline Giriş'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
