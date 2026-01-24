import { Check } from 'lucide-react'
import { OpenModalButton } from './OpenModalButton'
import { ModalStep } from './ModalSystem'
import { Container } from '@/components/ui/Container'

export function Pricing() {
    return (
        <section id="fiyatlandirma" className="py-32 relative">
            <Container>
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-bold font-serif mb-4 text-neutral-900">Tek Fiyat, Üstün Kalite</h2>
                    <p className="text-lg text-neutral-500">Karmaşık paketler yok. İhtiyacınıza uygun olanı seçin.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* AKSİYON */}
                    <div className="relative p-10 rounded-3xl border border-white/60 bg-white/30 backdrop-blur-xl shadow-xl flex flex-col overflow-hidden hover:bg-white/50 transition-all duration-300">
                        <div className="absolute top-0 inset-x-0 h-1 bg-neutral-200" />
                        <h3 className="text-4xl font-serif font-bold mb-2 text-neutral-900">Aksiyon</h3>
                        <p className="text-neutral-500 font-medium mb-8">Hızlı bir başlangıç için.</p>
                        <ul className="space-y-4 mb-8 flex-1">
                            {[
                                "Tek Sayfa (One-Page) Tasarım",
                                "Hızlı & Mobil Uyumlu",
                                "Temel SEO Kurulumu",
                                "İletişim & Harita",
                                "7 Gün Ücretsiz Önizleme"
                            ].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-neutral-700">
                                    <div className="p-1 rounded-full bg-neutral-100 text-neutral-600">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-8 border-t border-neutral-200/50">
                            <div className="text-3xl font-bold text-neutral-900 font-serif">7.000 TL <span className="text-sm font-sans font-normal text-neutral-500">+ KDV</span></div>
                            <p className="text-xs text-neutral-500 mt-2">Tek fiyat: kalite ve süreç aynı, sadece kapsam farkı.</p>
                        </div>
                    </div>

                    {/* VİZYON */}
                    <div className="relative p-10 rounded-3xl border border-brand-200 bg-white/60 backdrop-blur-2xl shadow-2xl shadow-brand-900/10 flex flex-col overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-brand-600 shadow-[0_0_20px_rgba(200,30,30,0.5)]" />
                        <div className="absolute top-4 right-4 px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">EDİTÖRÜN SEÇİMİ</div>

                        <h3 className="text-4xl font-serif font-bold mb-2 text-neutral-900">Vizyon</h3>
                        <p className="text-brand-600 font-medium mb-8">Kurumsal ve geniş kapsamlı.</p>
                        <ul className="space-y-4 mb-8 flex-1">
                            {[
                                "Çok Sayfalı Kurumsal Yapı",
                                "Gelişmiş Hizmet Sayfaları",
                                "Blog & Haber Modülü",
                                "Detaylı SEO & Analytics",
                                "7 Gün Ücretsiz Önizleme"
                            ].map((feat, i) => (
                                <li key={i} className="flex items-center gap-3 text-neutral-800 font-medium">
                                    <div className="p-1 rounded-full bg-brand-100 text-brand-600">
                                        <Check className="w-3 h-3" />
                                    </div>
                                    <span>{feat}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="pt-8 border-t border-brand-100">
                            <div className="text-3xl font-bold text-brand-700 font-serif">7.000 TL <span className="text-sm font-sans font-normal text-neutral-500">+ KDV</span></div>
                            <p className="text-xs text-brand-600/80 mt-2">Tek fiyat: kalite ve süreç aynı, sadece kapsam farkı.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12 max-w-3xl mx-auto">
                    <p className="text-neutral-500 mb-6 bg-brand-50 p-4 rounded-lg text-sm border border-brand-100">
                        <strong>Hızlı bir başlangıç mı istiyorsunuz, yoksa detaylı bir kurumsal yapı mı?</strong><br />
                        Karar sizin, fiyat sabit. İhtiyacınıza en uygun modeli seçin.
                    </p>
                    <OpenModalButton
                        step={ModalStep.INITIAL_CHOICE}
                        className="px-8 py-3 bg-brand-600 text-white rounded-full font-bold shadow-md hover:bg-brand-700 transition-colors"
                    >
                        Ücretsiz Önizleme Al (7 gün)
                    </OpenModalButton>
                </div>
            </Container>
        </section>
    )
}
