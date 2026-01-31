'use client'

import { ReactNode } from 'react'
import { ResponsiveParticles } from './ResponsiveParticles'
import { Link } from '@/i18n/routing'
import { Mail, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AuthLayoutProps {
    children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const t = useTranslations('Login')

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4 overflow-hidden">
            {/* Aurora Background */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Particles */}
            <div className="absolute inset-0">
                <ResponsiveParticles />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/30">
                            <span className="text-white font-bold text-sm">psw</span>
                        </div>
                        <span className="text-xl font-bold text-white font-serif">ProSektorWeb</span>
                    </Link>
                </div>

                {children}

                {/* Trust Badges */}
                <div className="mt-6 flex items-center justify-center gap-6 text-neutral-500">
                    <div className="flex items-center gap-2 text-xs">
                        <Lock className="w-3.5 h-3.5" />
                        <span>{t('ssl')}</span>
                    </div>
                    <div className="w-px h-4 bg-neutral-700" />
                    <div className="flex items-center gap-2 text-xs">
                        <span>{t('kvkk')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
