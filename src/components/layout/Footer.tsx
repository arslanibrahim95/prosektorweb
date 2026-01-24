'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, Phone, ArrowUpRight } from 'lucide-react'

interface FooterProps {
    variant?: 'landing' | 'inner'
}

export function Footer({ }: FooterProps) {
    return (
        <footer className="relative mt-20">
            {/* Animated Wave SVG */}
            <div className="absolute -top-20 left-0 right-0 overflow-hidden">
                <svg
                    className="w-full h-24 md:h-32"
                    viewBox="0 0 1440 120"
                    preserveAspectRatio="none"
                >
                    {/* Wave 1 - Slowest, background */}
                    <path
                        className="animate-wave-slow fill-brand-900/20"
                        d="M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 C1350,120 1440,60 1440,60 L1440,120 L0,120 Z"
                    />
                    {/* Wave 2 - Medium speed */}
                    <path
                        className="animate-wave-medium fill-brand-800/40"
                        d="M0,80 C200,40 400,100 600,80 C800,60 1000,100 1200,80 C1400,60 1440,80 1440,80 L1440,120 L0,120 Z"
                    />
                    {/* Wave 3 - Fastest, foreground */}
                    <path
                        className="animate-wave-fast fill-[#1a0a0a]"
                        d="M0,95 C180,70 360,110 540,95 C720,80 900,110 1080,95 C1260,80 1440,95 1440,95 L1440,120 L0,120 Z"
                    />
                </svg>
            </div>

            {/* Main Footer Content */}
            <div className="bg-gradient-to-b from-[#1a0a0a] via-[#1f0d0d] to-[#0f0505] pt-16 pb-8 px-6 relative overflow-hidden">
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-2 h-2 bg-brand-500/30 rounded-full top-20 left-[10%] animate-float-slow" />
                    <div className="absolute w-1 h-1 bg-brand-400/40 rounded-full top-40 left-[25%] animate-float-medium" />
                    <div className="absolute w-1.5 h-1.5 bg-brand-500/20 rounded-full top-16 left-[60%] animate-float-fast" />
                    <div className="absolute w-1 h-1 bg-brand-400/30 rounded-full top-32 left-[80%] animate-float-slow" />
                    <div className="absolute w-2 h-2 bg-white/10 rounded-full top-48 left-[45%] animate-float-medium" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Top Section with Logo and CTA */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-brand-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-2xl" />
                                    <div className="relative w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/30">
                                        <span className="text-white font-bold text-lg">psw</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white font-serif tracking-tight">ProSektorWeb</span>
                                    <p className="text-xs text-neutral-500">OSGB Dijital Çözümleri</p>
                                </div>
                            </div>
                            <p className="text-neutral-400 max-w-sm leading-relaxed text-sm">
                                OSGB&apos;lere özel profesyonel web çözümleri. Dijital kimliğinizi sektörün diline uygun tasarlıyoruz.
                            </p>
                        </div>

                        <Link
                            href="#iletisim"
                            className="group relative flex items-center gap-3 px-6 py-3 overflow-hidden rounded-full"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full group-hover:border-brand-500/50 transition-colors" />
                            <span className="relative text-white font-medium">Hemen Başlayın</span>
                            <ArrowUpRight className="relative w-4 h-4 text-brand-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </Link>
                    </div>

                    {/* Main Grid */}
                    <div className="grid md:grid-cols-4 gap-12 py-12">
                        {/* Legal Links */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Yasal</h4>
                            <div className="flex flex-col gap-3">
                                {[
                                    { href: '/mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi' },
                                    { href: '/mesafeli-satis-sozlesmesi', label: 'İptal ve İade Koşulları' },
                                    { href: '/gizlilik-ve-kvkk', label: 'Gizlilik Politikası' },
                                    { href: '/gizlilik-ve-kvkk', label: 'KVKK Aydınlatma' },
                                ].map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className="text-neutral-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-0 group-hover:scale-100" />
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Hizmetler */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Hizmetler</h4>
                            <div className="flex flex-col gap-3">
                                {['Web Sitesi Tasarımı', 'SEO Optimizasyonu', 'Domain & Hosting', 'Kurumsal Kimlik'].map((service) => (
                                    <span key={service} className="text-neutral-400 text-sm hover:text-neutral-300 transition-colors cursor-default">
                                        {service}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* İletişim */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest">İletişim</h4>
                            <div className="space-y-3">
                                <a href="mailto:hello@prosektorweb.com" className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors text-sm group">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    hello@prosektorweb.com
                                </a>
                                <a href="tel:+905517038599" className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors text-sm group">
                                    <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    +90 551 703 85 99
                                </a>
                            </div>
                        </div>

                        {/* Güvenli Ödeme */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest">Güvenli Ödeme</h4>
                            <div className="flex items-center gap-2">
                                {['VISA', 'MC', 'TROY'].map((card) => (
                                    <div
                                        key={card}
                                        className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 hover:border-brand-500/30 hover:bg-white/10 transition-all cursor-default"
                                    >
                                        <span className="text-white font-bold text-xs tracking-wider">{card}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-neutral-500">256-bit SSL ile korunan güvenli ödeme altyapısı</p>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
                        <p className="text-xs text-neutral-500">
                            © 2026 ProSektorWeb. Tüm hakları saklıdır.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-600">Türkiye&apos;de</span>
                            <span className="animate-pulse">💖</span>
                            <span className="text-xs text-neutral-600">ile yapıldı</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes wave-slow {
                    0%, 100% { d: path("M0,60 C150,120 350,0 600,60 C850,120 1050,0 1200,60 C1350,120 1440,60 1440,60 L1440,120 L0,120 Z"); }
                    50% { d: path("M0,60 C150,0 350,120 600,60 C850,0 1050,120 1200,60 C1350,0 1440,60 1440,60 L1440,120 L0,120 Z"); }
                }
                @keyframes wave-medium {
                    0%, 100% { d: path("M0,80 C200,40 400,100 600,80 C800,60 1000,100 1200,80 C1400,60 1440,80 1440,80 L1440,120 L0,120 Z"); }
                    50% { d: path("M0,80 C200,100 400,40 600,80 C800,100 1000,60 1200,80 C1400,100 1440,80 1440,80 L1440,120 L0,120 Z"); }
                }
                @keyframes wave-fast {
                    0%, 100% { d: path("M0,95 C180,70 360,110 540,95 C720,80 900,110 1080,95 C1260,80 1440,95 1440,95 L1440,120 L0,120 Z"); }
                    50% { d: path("M0,95 C180,110 360,70 540,95 C720,110 900,70 1080,95 C1260,110 1440,95 1440,95 L1440,120 L0,120 Z"); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                    50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
                }
                @keyframes float-medium {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
                    50% { transform: translateY(-15px) translateX(-5px); opacity: 0.7; }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
                    50% { transform: translateY(-10px) translateX(5px); opacity: 0.5; }
                }
                .animate-wave-slow { animation: wave-slow 8s ease-in-out infinite; }
                .animate-wave-medium { animation: wave-medium 6s ease-in-out infinite; }
                .animate-wave-fast { animation: wave-fast 4s ease-in-out infinite; }
                .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
                .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
                .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
            `}</style>
        </footer>
    )
}
