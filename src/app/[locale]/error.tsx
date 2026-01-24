'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to Sentry
        Sentry.captureException(error)

        // Also log to console for development visibility
        console.error('Global Application Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-neutral-100">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8" />
                </div>

                <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                    Beklenmedik Bir Hata Oluştu
                </h1>

                <p className="text-neutral-500 mb-8">
                    Uygulama çalışırken teknik bir sorunla karşılaştı. Mühendislerimiz bilgilendirildi.
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-8 p-4 bg-neutral-900 text-red-400 text-left text-xs font-mono rounded-lg overflow-auto max-h-40">
                        {error.message}
                        {error.stack && <pre className="mt-2 text-[10px] opacity-70">{error.stack}</pre>}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
                    >
                        <RefreshCw className="w-4 h-4" /> Yeniden Dene
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white text-neutral-600 border border-neutral-200 rounded-xl font-bold hover:bg-neutral-50 transition-colors"
                    >
                        <Home className="w-4 h-4" /> Ana Sayfaya Dön
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-100 text-[10px] text-neutral-400 uppercase tracking-widest">
                    Hata Kodu: {error.digest || 'UNKNOWN_ERROR'}
                </div>
            </div>
        </div>
    )
}
