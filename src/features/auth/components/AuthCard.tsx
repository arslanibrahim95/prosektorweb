'use client'

import { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'

interface AuthCardProps {
    title: string
    description: string
    icon: ReactNode
    children: ReactNode
}

export function AuthCard({ title, description, icon, children }: AuthCardProps) {
    return (
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative p-8 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-700" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="relative">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                        {icon}
                    </div>
                    <h1 className="text-2xl font-bold text-white font-serif mb-2">{title}</h1>
                    <p className="text-white/80 text-sm flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {description}
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8 bg-white">
                {children}
            </div>
        </div>
    )
}
