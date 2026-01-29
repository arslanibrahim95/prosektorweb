'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

export function SystemHealthWidget() {
    const t = useTranslations('SystemHealth')
    const [status, setStatus] = useState<'online' | 'offline' | 'loading'>('loading')

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch('/api/health')
                if (res.ok) {
                    setStatus('online')
                } else {
                    setStatus('offline')
                }
            } catch (error) {
                setStatus('offline')
            }
        }

        checkHealth()
        // Poll every 5 minutes
        const interval = setInterval(checkHealth, 300000)
        return () => clearInterval(interval)
    }, [])

    if (status === 'offline') return null

    return (
        <div className="p-4 mx-4 mb-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{t('title')}</span>
                <div className="flex gap-1">
                    <div className={`w-1 h-1 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className={`w-1 h-1 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div className={`w-1 h-1 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">{t('api_gateway')}</span>
                    <span className={`${status === 'online' ? 'text-green-400' : 'text-red-400'} font-mono`}>
                        {status === 'online' ? t('status_online') : t('status_offline')}
                    </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">{t('ai_engine')}</span>
                    <span className={`${status === 'online' ? 'text-green-400' : 'text-yellow-400'} font-mono`}>
                        {status === 'online' ? t('status_ready') : t('status_init')}
                    </span>
                </div>
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-2">
                    <div className={`bg-brand-500 h-full transition-all duration-1000 ${status === 'loading' ? 'w-0' : 'w-[98%]'}`} />
                </div>
            </div>
        </div>
    )
}
