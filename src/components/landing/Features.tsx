import { Briefcase, Eye, Clock, Target } from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'

import { Container } from '@/components/ui/Container'

export function Features() {
    return (
        <>
            {/* Why Us Glass Cards */}
            <section id="neden-biz" className="py-24 relative">
                <Container>
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold font-serif mb-4 text-neutral-900">Neden Biz?</h2>
                        <p className="text-lg text-neutral-500 max-w-2xl mx-auto">Sektörün dinamiklerini biliyoruz, size hız ve kalite vadediyoruz.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { icon: Briefcase, title: "Sektörü Tanıyoruz", text: "OSGB mevzuatını, yetki belgelerini ve jargonunu biliyoruz." },
                            { icon: Eye, title: "Önce Görürsünüz", text: "Sürpriz yok. Satın almadan önce sitenizi birebir incelersiniz." },
                            { icon: Clock, title: "Hızlı Sonuç", text: "Uzun toplantılarla vakit kaybetmezsiniz. Süreç net ve hızlıdır." },
                            { icon: Target, title: "Sadece OSGB", text: "Tüm odağımız iş sağlığı ve güvenliği sektörü." },
                        ].map((item, i) => (
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
                        <h2 className="text-3xl font-bold mb-3 text-neutral-900">Nasıl Çalışırız?</h2>
                        <p className="text-lg text-neutral-500">Karmaşık süreçler yok. Net ve hızlı bir yol izleriz.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { num: "01", title: "Analiz", desc: "OSGB’nizin faaliyet alanını, hizmet verdiği şehirleri ve İSG’ye özel ihtiyaçları analiz ederiz." },
                            { num: "02", title: "Tasarım", desc: "OSGB’nize özel iki farklı web sitesi hazırlarız: biri sade ve hızlı, diğeri kurumsal ve detaylı." },
                            { num: "03", title: "Önizleme Kodu", desc: "Hazırlanan web sitelerini inceleyebilmeniz için önizleme erişim kodu oluştururuz." },
                            { num: "04", title: "Yayına Alma", desc: "Web sitenizi 7 gün ücretsiz incelersiniz. Karar verdiğinizde yayına alırız." },
                        ].map((step, i) => (
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
