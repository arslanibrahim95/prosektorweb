'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface NavbarProps {
    variant?: 'landing' | 'inner'
    onOpenLogin?: () => void
}

export function Navbar({ variant = 'landing', onOpenLogin }: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Helper to determine link href based on variant
    const getLink = (hash: string) => {
        return variant === 'landing' ? hash : `/${hash}`
    }

    // Handle Login Click
    const handleLoginClick = () => {
        if (onOpenLogin) {
            setMobileMenuOpen(false)
            onOpenLogin()
        }
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl font-bold tracking-tighter text-neutral-900 group-hover:text-brand-600 transition-colors">
                        psw
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-neutral-600">
                    <Link href={getLink('#neden-biz')} className="hover:text-brand-600 transition-colors">Neden Biz?</Link>
                    <Link href={getLink('#nasil-calisiriz')} className="hover:text-brand-600 transition-colors">Nasıl Çalışırız?</Link>
                    <Link href={getLink('#fiyatlandirma')} className="hover:text-brand-600 transition-colors">Fiyatlandırma</Link>
                    <Link href={getLink('#sss')} className="hover:text-brand-600 transition-colors">SSS</Link>
                    <Link href="/blog" className="text-brand-600 font-semibold transition-colors">Blog</Link>
                    <Link href={getLink('#iletisim')} className="hover:text-brand-600 transition-colors">İletişim</Link>
                </div>

                {/* Direct Login Link */}
                <Link
                    href="/login"
                    className="hidden md:block px-5 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold shadow-sm hover:bg-brand-700 transition-all hover:shadow-md active:bg-brand-800"
                >
                    Giriş Yap
                </Link>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-neutral-600"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-menu"
                >
                    {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div
                    id="mobile-menu"
                    className="md:hidden bg-white border-b border-neutral-200 px-6 py-4 space-y-4"
                >
                    <Link href={getLink('#neden-biz')} className="block text-neutral-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Neden Biz?</Link>
                    <Link href={getLink('#nasil-calisiriz')} className="block text-neutral-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Nasıl Çalışırız?</Link>
                    <Link href={getLink('#fiyatlandirma')} className="block text-neutral-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Fiyatlandırma</Link>
                    <Link href={getLink('#sss')} className="block text-neutral-600 font-medium" onClick={() => setMobileMenuOpen(false)}>SSS</Link>
                    <Link href="/blog" className="block text-brand-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                    <Link href={getLink('#iletisim')} className="block text-neutral-600 font-medium" onClick={() => setMobileMenuOpen(false)}>İletişim</Link>
                    {/* Direct Login Link */}
                    <Link
                        href="/login"
                        className="w-full text-center px-5 py-3 bg-brand-600 text-white rounded-md text-sm font-semibold shadow-sm block"
                    >
                        Giriş Yap
                    </Link>
                </div>
            )}
        </nav>
    )
}
