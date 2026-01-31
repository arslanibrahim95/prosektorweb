'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import * as motion from "motion/react-client"
import { Container } from '@/shared/components/ui'

export function FAQ() {
    const t = useTranslations('FAQ')
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const faqs = [
        { q: t('q1'), a: t('a1') },
        { q: t('q2'), a: t('a2') },
        { q: t('q3'), a: t('a3') },
        { q: t('q4'), a: t('a4') },
        { q: t('q5'), a: t('a5') },
    ]

    return (
        <section id="faq" className="py-24 relative overflow-hidden">
            <Container>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-neutral-900 tracking-tighter mb-4">
                            {t('title')}
                        </h2>
                        <div className="w-20 h-1 bg-brand-600 mx-auto rounded-full" />
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="group bg-white rounded-3xl border border-neutral-200 overflow-hidden transition-all hover:border-brand-200 hover:shadow-xl hover:shadow-neutral-200/40"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full p-6 text-left flex items-center justify-between gap-4"
                                >
                                    <span className="font-bold text-neutral-800 text-lg group-hover:text-brand-600 transition-colors">
                                        {faq.q}
                                    </span>
                                    <div className={`p-2 rounded-xl transition-all ${openIndex === index ? 'bg-brand-600 text-white rotate-180' : 'bg-neutral-50 text-neutral-400 group-hover:bg-brand-50 group-hover:text-brand-600'}`}>
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </button>

                                <motion.div
                                    initial={false}
                                    animate={{
                                        height: openIndex === index ? 'auto' : 0,
                                        opacity: openIndex === index ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-6 pt-0 text-neutral-500 font-medium leading-relaxed">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}
