'use client'

import React from 'react'
import Link from 'next/link'

interface FooterProps {
    variant?: 'landing' | 'inner'
}

export function Footer({ variant = 'landing' }: FooterProps) {
    // Helper to determine link href based on variant
    const getLink = (hash: string) => {
        return variant === 'landing' ? hash : `/${hash}`
    }

    return (
        <footer className="py-12 px-6 bg-[#2a0a0a] text-neutral-400 border-t border-[#451a1a]">
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-sm">
                <div>
                    <span className="text-2xl font-bold text-white block mb-4">psw</span>
                    <p className="leading-relaxed opacity-80">
                        OSGB’lere özel profesyonel web çözümleri. Dijital kimliğinizi sektörün diline uygun tasarlıyoruz.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white transition-colors">Mesafeli Satış Sözleşmesi</Link>
                    <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white transition-colors">İptal ve İade Koşulları</Link>
                    <Link href="/gizlilik-ve-kvkk" className="hover:text-white transition-colors">Gizlilik ve Çerez Politikası</Link>
                    <Link href="/gizlilik-ve-kvkk" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</Link>
                </div>

                <div>
                    <p className="font-bold text-white mb-2">Güvenli Ödeme Altyapısı</p>
                    <p className="text-xs opacity-60 mb-4 tracking-widest">VISA • MASTERCARD • TROY</p>
                    <p className="text-white">hello@prosektorweb.com</p>
                    <p className="text-white">+90 551 703 85 99</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-800 text-center text-xs opacity-50">
                © 2026 Prosektorweb. Tüm hakları saklıdır.
            </div>
        </footer>
    )
}
