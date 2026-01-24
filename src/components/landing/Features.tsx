import { Briefcase, Eye, Clock, Target } from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { Container } from '@/components/ui/Container'
import { useTranslations } from 'next-intl'

export function Features() {
    const t = useTranslations('Features')

    const whyUsItems = [
        { icon: Briefcase, title: t('item1_title'), text: t('item1_desc') },
        { icon: Eye, title: t('item2_title'), text: t('item2_desc') },
        { icon: Clock, title: t('item3_title'), text: t('item3_desc') },
        { icon: Target, title: t('item4_title'), text: t('item4_desc') },
    ]

    const steps = [
        { num: "01", title: t('step1_title'), desc: t('step1_desc') },
        { num: "02", title: t('step2_title'), desc: t('step2_desc') },
        { num: "03", title: t('step3_title'), desc: t('step3_desc') },
        { num: "04", title: t('step4_title'), desc: t('step4_desc') },
    ]

    return (
        <>
            {/* Why Us Glass Cards */}
            <section id="neden-biz" className="py-24 relative">
                <Container>
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold font-serif mb-4 text-neutral-900">{t('why_title')}</h2>
                        <p className="text-lg text-neutral-500 max-w-2xl mx-auto">{t('why_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {whyUsItems.map((item, i) => (
                            <SpotlightCard key={i} className="group border-white/50 bg-white/40 backdrop-blur-xl hover:shadow-xl hover:bg-white/60 transition-all duration-300" spotlightColor="rgba(220, 38, 38, 0.1)">
                                <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold font-serif mb-3 text-neutral-900">{item.title}</h3>
                                <p className="text-neutral-600 leading-relaxed">
                                    {item.text}
                                </p>
                            </SpotlightCard>
                        ))}
                    </div>
                </Container>
            </section>

            {/* How We Work (Nasıl Çalışırız?) */}
            <section id="nasil-calisiriz" className="py-24 relative z-0">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-3 text-neutral-900">{t('how_title')}</h2>
                        <p className="text-lg text-neutral-500">{t('how_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, i) => (
                            <div key={i} className="bg-neutral-50 p-8 rounded-2xl border border-neutral-200 hover:-translate-y-2 transition-transform duration-300 shadow-fluent-card hover:shadow-fluent-hover">
                                <div className="text-5xl font-black text-brand-100 mb-4 font-mono">{step.num}</div>
                                <h3 className="text-xl font-bold mb-3 text-neutral-900">{step.title}</h3>
                                <p className="text-neutral-600 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>
        </>
    )
}
