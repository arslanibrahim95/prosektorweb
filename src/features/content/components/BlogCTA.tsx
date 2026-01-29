'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export function BlogCTA() {
    const t = useTranslations('Pricing')
    return (
        <div className="my-24 bg-brand-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-500 blur-[80px] rounded-full opacity-30" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500 blur-[80px] rounded-full opacity-30" />

            <div className="relative z-10 max-w-2xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold font-serif mb-4">
                    OSGB’nize özel önizleme ister misiniz?
                </h3>
                <p className="text-brand-100 mb-8 text-lg">
                    Sektörünüze özel hazırlanmış web sitesi tasarımlarını hemen inceleyin.
                </p>
                <a
                    href="/#fiyatlandirma"
                    className="inline-block px-8 py-4 bg-white text-brand-900 font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-lg shadow-black/20"
                >
                    {t('cta_button')}
                </a>
            </div>
        </div>
    )
}
