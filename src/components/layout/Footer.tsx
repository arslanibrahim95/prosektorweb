'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react'

interface FooterProps {
    variant?: 'landing' | 'inner'
}

export function Footer({ variant = 'landing' }: FooterProps) {
    // Helper to determine link href based on variant
    const getLink = (hash: string) => {
        return variant === 'landing' ? hash : `/${hash}`
    }

    return (
        <footer className="relative">
            {/* Wave SVG Transition */}
            <div className="absolute -top-1 left-0 right-0 overflow-hidden leading-none">
                <svg
                    className="relative block w-full h-16 md:h-24"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                        className="fill-neutral-50"
                        opacity="0.25"
                    />
                    <path
                        d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                        className="fill-neutral-50"
                        opacity="0.5"
                    />
                    <path
                        d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                        className="fill-[#1a0a0a]"
                    />
                </svg>
            </div>

            {/* Main Footer Content */}
            <div className="bg-gradient-to-b from-[#1a0a0a] via-[#1f0d0d] to-[#0f0505] pt-20 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Top Section with Logo and CTA */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/30">
                                    <span className="text-white font-bold text-lg">psw</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white font-serif tracking-tight">ProSektorWeb</span>
                                    <p className="text-xs text-neutral-500">OSGB Dijital Çözümleri</p>
                                </div>
                            </div>
                            <p className="text-neutral-400 max-w-sm leading-relaxed text-sm">
                                OSGB'lere özel profesyonel web çözümleri. Dijital kimliğinizi sektörün diline uygun tasarlıyoruz.
                            </p>
                        </div>

                        <Link
                            href="#iletisim"
                            className="group flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                            <span className="text-white font-medium">Hemen Başlayın</span>
                            <ArrowUpRight className="w-4 h-4 text-brand-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </Link>
                    </div>

                    {/* Main Grid */}
                    <div className="grid md:grid-cols-4 gap-12 py-12">
                        {/* Legal Links */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Yasal</h4>
                            <div className="flex flex-col gap-3">
                                <Link href="/mesafeli-satis-sozlesmesi" className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Mesafeli Satış Sözleşmesi
                                </Link>
                                <Link href="/mesafeli-satis-sozlesmesi" className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    İptal ve İade Koşulları
                                </Link>
                                <Link href="/gizlilik-ve-kvkk" className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    Gizlilik Politikası
                                </Link>
                                <Link href="/gizlilik-ve-kvkk" className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                                    <span className="w-1 h-1 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    KVKK Aydınlatma
                                </Link>
                            </div>
                        </div>

                        {/* Hizmetler */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Hizmetler</h4>
                            <div className="flex flex-col gap-3">
                                <span className="text-neutral-400 text-sm">Web Sitesi Tasarımı</span>
                                <span className="text-neutral-400 text-sm">SEO Optimizasyonu</span>
                                <span className="text-neutral-400 text-sm">Domain & Hosting</span>
                                <span className="text-neutral-400 text-sm">Kurumsal Kimlik</span>
                            </div>
                        </div>

                        {/* İletişim */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">İletişim</h4>
                            <div className="space-y-3">
                                <a href="mailto:hello@prosektorweb.com" className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors text-sm group">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-600/20 transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    hello@prosektorweb.com
                                </a>
                                <a href="tel:+905517038599" className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors text-sm group">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-600/20 transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    +90 551 703 85 99
                                </a>
                            </div>
                        </div>

                        {/* Güvenli Ödeme */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Güvenli Ödeme</h4>
                            <div className="flex items-center gap-3">
                                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-white font-bold text-xs tracking-wider">VISA</span>
                                </div>
                                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-white font-bold text-xs tracking-wider">MC</span>
                                </div>
                                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                                    <span className="text-white font-bold text-xs tracking-wider">TROY</span>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500">256-bit SSL ile korunan güvenli ödeme altyapısı</p>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
                        <p className="text-xs text-neutral-500">
                            © 2026 ProSektorWeb. Tüm hakları saklıdır.
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="text-xs text-neutral-600">Türkiye'de 💖 ile yapıldı</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
