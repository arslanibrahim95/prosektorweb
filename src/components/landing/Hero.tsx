import { Clock } from 'lucide-react'
import BlurText from '@/components/ui/BlurText'
import { OpenModalButton } from './OpenModalButton'
import { ModalStep } from './ModalSystem'

export function Hero() {
    return (
        <section className="pt-32 pb-24 px-6 relative flex flex-col items-center text-center">
            <div className="max-w-4xl mx-auto z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50/50 backdrop-blur-md border border-brand-100/50 rounded-full text-brand-700 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                    </span>
                    2026 Vizyonu İçin Hazır
                </div>

                <BlurText
                    text="Merhaba, OSGB’nizin Dijital Kimliği Artık Bir Soru İşareti Değil."
                    delay={50}
                    animateBy="words"
                    direction="top"
                    className="text-5xl md:text-7xl font-bold font-serif leading-[1.1] mb-8 text-neutral-900 tracking-tight drop-shadow-sm text-center justify-center"
                />

                <p className="text-xl md:text-2xl text-neutral-600 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                    İSG sektörünü tanıyor, OSGB’lere özel web sitelerini önceden hazırlıyor ve doğru kurumlarla buluşturuyoruz.
                </p>
                <div className="flex flex-col items-center gap-4">
                    <OpenModalButton
                        step={ModalStep.INITIAL_CHOICE}
                        className="group relative px-10 py-5 bg-brand-600 text-white rounded-full text-lg font-bold shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        Web Sitemi İncele
                    </OpenModalButton>
                    <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
                        <Clock className="w-4 h-4" />
                        <span>7 Gün Ücretsiz • Tek Fiyat</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
