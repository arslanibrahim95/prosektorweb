import { Check } from 'lucide-react'
import { OpenModalButton } from './OpenModalButton'
import { ModalStep } from './ModalSystem'
import { Container } from '@/components/ui/Container'
import { useTranslations } from 'next-intl'

export function Pricing() {
    const t = useTranslations('Pricing')

    return (
        <section id="fiyatlandirma" className="py-32 relative">
            <Container>
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold font-serif mb-4 text-neutral-900">{t('title')}</h2>
                    <p className="text-lg text-neutral-500">{t('subtitle')}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* AKSİYON */}
                    <div className="relative p-10 rounded-3xl border border-white/60 bg-white/30 backdrop-blur-xl shadow-xl flex flex-col overflow-hidden hover:bg-white/50 transition-all duration-300">
                        <div className="absolute top-0 inset-x-0 h-1 bg-neutral-200" />
                        <h3 className="text-4xl font-serif font-bold mb-2 text-neutral-900">{t('action_plan')}</h3>
                        <p className="text-neutral-500 font-medium mb-8">{t('action_desc')}</p>
                        <ul className="space-y-4 mb-8 flex-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <li key={i} className="flex items-center gap-3 text-neutral-700">
                                    <div className="p-1 rounded-full bg-neutral-100 text-neutral-600">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span>{t(`features_action.${i}`)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-8 border-t border-neutral-200/50">
                            <div className="text-3xl font-bold text-neutral-900 font-serif">{t('price')} <span className="text-sm font-sans font-normal text-neutral-500">{t('vat')}</span></div>
                            <p className="text-xs text-neutral-500 mt-2">{t('price_note')}</p>
                        </div>
                    </div>

                    {/* VİZYON */}
                    <div className="relative p-10 rounded-3xl border border-brand-200 bg-white/60 backdrop-blur-2xl shadow-2xl shadow-brand-900/10 flex flex-col overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-brand-600 shadow-[0_0_20px_rgba(200,30,30,0.5)]" />
                        <div className="absolute top-4 right-4 px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-xl">{t('editor_choice')}</div>

                        <h3 className="text-4xl font-serif font-bold mb-2 text-neutral-900">{t('vision_plan')}</h3>
                        <p className="text-brand-600 font-medium mb-8">{t('vision_desc')}</p>
                        <ul className="space-y-4 mb-8 flex-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <li key={i} className="flex items-center gap-3 text-neutral-800 font-medium">
                                    <div className="p-1 rounded-full bg-brand-100 text-brand-600">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span>{t(`features_vision.${i}`)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-8 border-t border-brand-100">
                            <div className="text-3xl font-bold text-brand-700 font-serif">{t('price')} <span className="text-sm font-sans font-normal text-neutral-500">{t('vat')}</span></div>
                            <p className="text-xs text-brand-600/80 mt-2">{t('price_note')}</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12 max-w-3xl mx-auto">
                    <p className="text-neutral-500 mb-6 bg-brand-50 dark:bg-brand-900/10 p-4 rounded-xl border border-brand-100 dark:border-brand-900/20 text-sm">
                        <strong>{t('cta_box_title')}</strong><br />
                        {t('cta_box_desc')}
                    </p>
                    <OpenModalButton
                        step={ModalStep.INITIAL_CHOICE}
                        className="px-8 py-3 bg-brand-600 text-white rounded-2xl font-bold shadow-md hover:bg-brand-700 transition-colors"
                    >
                        {t('cta_button')}
                    </OpenModalButton>
                </div>
            </Container>
        </section>
    )
}
