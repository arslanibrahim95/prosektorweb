import React from 'react'
import { Metadata } from 'next'
import { NavbarWrapper } from '@/components/landing/NavbarWrapper'
import { Footer } from '@/components/layout/Footer'
import { ContactForm } from '@/features/support/components/ContactForm'
import { LandingProvider } from '@/components/landing/LandingContext'
import { GlobalModal } from '@/components/landing/GlobalModal'
import { Container } from '@/components/ui/Container'

// Extracted Server Components
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { FAQ } from '@/components/landing/FAQ'
import { JsonLd } from '@/components/seo/JsonLd'

import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Home' })
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function HomePage() {
  const t = await getTranslations('Home')
  return (
    <LandingProvider>
      <div className="min-h-screen bg-transparent text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-900 relative overflow-hidden">
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "ProSektorWeb",
          "url": "https://prosektorweb.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://prosektorweb.com/blog?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }} />

        {/* Fluent "Aurora" Background Effect - Enhanced */}
        {/* Optimized Static Gradient (Performance Fix) */}
        <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-100/40 blur-3xl opacity-50 mix-blend-multiply" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-100/40 blur-3xl opacity-50 mix-blend-multiply" />
        </div>

        {/* Technical Grid Pattern */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10 pointer-events-none" />

        {/* Grid Objects (Decorative) */}
        <svg className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40" aria-hidden="true">
          <defs>
            <pattern id="grid-pattern" width="96" height="96" patternUnits="userSpaceOnUse">
              <path d="M48 0v96M0 48h96" stroke="rgba(0,0,0,0.03)" strokeWidth="2" />
            </pattern>
          </defs>
          <rect x="15%" y="15%" width="24" height="24" fill="rgba(200, 30, 30, 0.05)" className="animate-pulse" />
          <rect x="85%" y="10%" width="48" height="48" fill="rgba(0, 120, 212, 0.03)" />
          <circle cx="50%" cy="55%" r="400" fill="url(#grid-pattern)" opacity="0.4" />
          <path d="M 50 200 L 70 200 M 60 190 L 60 210" stroke="#cbd5e1" strokeWidth="2" />
          <path d="M 1100 300 L 1120 300 M 1110 290 L 1110 310" stroke="#cbd5e1" strokeWidth="2" />
        </svg>

        {/* Noise Texture */}
        {/* Moved to local asset or remove if critical for performance, currently keeping as requested but checking source */}
        <div className="fixed inset-0 bg-[url('/assets/noise.svg')] opacity-10 -z-10 pointer-events-none brightness-100 contrast-150" />

        {/* Navigation - Client Component wrapper handled inside or via props */}
        <NavbarWrapper />

        {/* Server Rendered Sections */}
        <Hero />
        <Features />
        <Pricing />
        <FAQ />

        {/* Contact Form */}
        <section id="iletisim" className="py-24 relative z-0">
          <Container>
            <div className="max-w-xl mx-auto text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 text-neutral-900">{t('contact_section_title')}</h2>
              <p className="text-neutral-500">{t('contact_section_desc')}</p>
            </div>
            <ContactForm />
          </Container>
        </section>

        {/* Footer */}
        <Footer variant="landing" />

        {/* Global Modal System (Client) */}
        <GlobalModal />

      </div>
    </LandingProvider>
  )
}
