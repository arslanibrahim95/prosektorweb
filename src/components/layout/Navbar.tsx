'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

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
        } else {
            // Default fallback - use locale-aware path
            // English disabled as per user request (OSGB sector is TR only)
            window.location.href = `/tr/portal`
        }
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border shadow-sm supports-[backdrop-filter]:bg-background/60" aria-label="Ana navigasyon">
            <Container className="h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group leading-none" aria-label="ProSektorWeb Ana Sayfa">
                    <span className="text-xl font-bold tracking-tighter text-foreground group-hover:text-brand-600 transition-colors">
                        ProSektorWeb
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-[15px] font-medium text-muted-foreground leading-none">
                    <Link href={getLink('#neden-biz')} className="hover:text-brand-600 transition-colors">Neden Biz?</Link>
                    <Link href={getLink('#nasil-calisiriz')} className="hover:text-brand-600 transition-colors">Nasıl Çalışırız?</Link>
                    <Link href={getLink('#fiyatlandirma')} className="hover:text-brand-600 transition-colors">Fiyatlandırma</Link>
                    <Link href={getLink('#sss')} className="hover:text-brand-600 transition-colors">SSS</Link>
                    <Link href="/blog" className="text-brand-600 font-semibold transition-colors">Blog</Link>
                    <Link href={getLink('#iletisim')} className="hover:text-brand-600 transition-colors">İletişim</Link>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    {/* Direct Login Link */}
                    <button
                        onClick={handleLoginClick}
                        className="flex items-center justify-center px-5 py-2 bg-brand-600 text-white rounded-md text-sm font-semibold shadow-sm hover:bg-brand-700 transition-all hover:shadow-md active:bg-brand-800 leading-none"
                    >
                        Giriş Yap
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <button
                        className="p-2 text-muted-foreground flex items-center justify-center leading-none"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"}
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-background border-b border-border px-6 py-4 space-y-4">
                    <Link href={getLink('#neden-biz')} className="block text-muted-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>Neden Biz?</Link>
                    <Link href={getLink('#nasil-calisiriz')} className="block text-muted-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>Nasıl Çalışırız?</Link>
                    <Link href={getLink('#fiyatlandirma')} className="block text-muted-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>Fiyatlandırma</Link>
                    <Link href={getLink('#sss')} className="block text-muted-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>SSS</Link>
                    <Link href="/blog" className="block text-brand-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
                    <Link href={getLink('#iletisim')} className="block text-muted-foreground font-medium" onClick={() => setMobileMenuOpen(false)}>İletişim</Link>
                    {/* Direct Login Link */}
                    <button
                        onClick={handleLoginClick}
                        className="w-full text-center px-5 py-3 bg-brand-600 text-white rounded-md text-sm font-semibold shadow-sm block"
                    >
                        Giriş Yap
                    </button>
                </div>
            )}
        </nav>
    )
}
