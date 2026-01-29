import { ChevronDown } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import { useTranslations } from 'next-intl'

export function FAQ() {
    const t = useTranslations('FAQ')
    return (
        <section id="sss" className="py-24 relative z-0">
            <Container size="narrow">
                <h2 className="text-3xl font-bold mb-10 text-center text-neutral-900">{t('title')}</h2>
                <div className="space-y-4">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <details key={i} className="group bg-neutral-50 rounded-lg border border-neutral-200 open:border-brand-200 transition-colors">
                                <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-neutral-800 group-hover:text-brand-700">
                                    {t(`q${i}`)}
                                    <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-5 pb-5 text-neutral-600 leading-relaxed">
                                    {t(`a${i}`)}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}
