'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Check, Menu, X, ArrowRight, Play, Star, Shield, Users, BarChart3, Clock, Zap, Target, Layout, Briefcase, Eye } from 'lucide-react'
import { ModalSystem, type ModalState } from '@/components/landing/ModalSystem'
import { ContactForm } from '@/components/landing/ContactForm'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import BlurText from '@/components/ui/BlurText'
import SpotlightCard from '@/components/ui/SpotlightCard'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalInitialState, setModalInitialState] = useState<ModalState>('A1')

  const openModal = (state: ModalState = 'A1') => {
    setModalInitialState(state)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-transparent text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-900 relative overflow-hidden">

      {/* Fluent "Aurora" Background Effect - Enhanced */}
      <div className="fixed top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-200/60 blur-[150px] rounded-full -z-20 pointer-events-none mix-blend-multiply" />
      <div className="fixed bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-100/60 blur-[150px] rounded-full -z-20 pointer-events-none mix-blend-multiply" />

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
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 -z-10 pointer-events-none brightness-100 contrast-150" />

      {/* Navigation */}
      <Navbar variant="landing" onOpenLogin={() => openModal('A2')} />

      {/* Hero Section */}
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
            <button
              onClick={() => openModal('A1')}
              className="group relative px-10 py-5 bg-brand-600 text-white rounded-full text-lg font-bold shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              Web Sitemi İncele
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-500">
              <Clock className="w-4 h-4" />
              <span>7 Gün Ücretsiz • Tek Fiyat</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Glass Cards */}
      <section id="neden-biz" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
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
        </div>
      </section>

      {/* How We Work (Nasıl Çalışırız?) */}
      <section id="nasil-calisiriz" className="py-24 px-6 relative z-0">
        <div className="max-w-7xl mx-auto">
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
        </div>
      </section>

      {/* Pricing (Glassmorphism) */}
      <section id="fiyatlandirma" className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
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
                  "7 Gün Ücretsiz Deneme"
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
              </div>
            </div>

            {/* VİZYON */}
            <div className="relative p-10 rounded-3xl border border-brand-200 bg-white/60 backdrop-blur-2xl shadow-2xl shadow-brand-900/10 flex flex-col overflow-hidden transform md:-translate-y-6">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-600 shadow-[0_0_20px_rgba(200,30,30,0.5)]" />
              <div className="absolute top-4 right-4 px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full">EDİTÖRÜN SEÇİMİ</div>

              <h3 className="text-4xl font-serif font-bold mb-2 text-neutral-900">Vizyon</h3>
              <p className="text-brand-600 font-medium mb-8">Kurumsal ve geniş kapsamlı.</p>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  "Çok Sayfalı Kurumsal Yapı",
                  "Gelişmiş Hizmet Sayfaları",
                  "Blog & Haber Modülü",
                  "Detaylı SEO & Analytics",
                  "7 Gün Ücretsiz Deneme"
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
              </div>
            </div>
          </div>

          <div className="text-center mt-12 max-w-3xl mx-auto">
            <p className="text-neutral-500 mb-6 bg-brand-50 p-4 rounded-lg text-sm border border-brand-100">
              <strong>Neden iki paket, tek fiyat?</strong><br />
              Biz karmaşık fiyat tablolarına inanmıyoruz. Çünkü biz emeği değil, sonucu fiyatlandırıyoruz. Hangi paketi seçerseniz seçin, kalite ve süreç değişmez.
            </p>
            <button
              onClick={() => openModal('A1')}
              className="px-8 py-3 bg-brand-600 text-white rounded-full font-bold shadow-md hover:bg-brand-700 transition-colors"
            >
              Web Sitemi İncele
            </button>
          </div>
        </div>
      </section>

      {/* FAQ (SSS) */}
      <section id="sss" className="py-24 px-6 relative z-0">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-10 text-center text-neutral-900">Sık Sorulan Sorular</h2>
          <div className="space-y-4">
            {[
              { q: "Bu web sitesini gerçekten ücretsiz mi görebiliyorum?", a: "Evet, OSGB’nize özel hazırladığımız çalışmayı 7 gün boyunca hiçbir ücret ödemeden inceleyebilirsiniz. Karar verdiğinizde ödeme aşamasına geçilir." },
              { q: "Web sitesi hazır mı, yoksa taslak mı gösteriyorsunuz?", a: "Size gönderdiğimiz önizleme kodu ile göreceğiniz site, logonuz ve temel bilgilerinizle giydirilmiş, yayına %90 hazır bir çalışmadır." },
              { q: "İnceleme sürecinde düzenleme (revize) isteyebilir miyim?", a: "7 gün boyunca toplam 3 revize hakkınız vardır. Kapsam: metin düzenlemeleri, küçük görsel değişiklikleri, içerik hizalamaları." },
              { q: "Satın alma sonrasında revize yapılabilir mi?", a: "Evet, ancak yayın sonrası yapılacak yeni sayfa ekleme veya yapısal değişiklik talepleri ek hizmet olarak ücretlendirilir." },
              { q: "Ödeme nasıl yapılıyor?", a: "Kredi kartı ile güvenli ödeme altyapımız üzerinden veya banka havalesi seçeneği ile ödemenizi gerçekleştirebilirsiniz." }
            ].map((faq, i) => (
              <details key={i} className="group bg-neutral-50 rounded-lg border border-neutral-200 open:border-brand-200 transition-colors">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-bold text-neutral-800 group-hover:text-brand-700">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-neutral-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="iletisim" className="py-24 px-6 bg-transparent relative z-0">
        <div className="max-w-xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-neutral-900">Bize Yazın</h2>
          <p className="text-neutral-500">Soru, öneri ve talepleriniz için mesaj bırakın.<br />En geç 1 iş günü içinde dönüş yaparız.</p>
        </div>

        <ContactForm />
      </section>

      {/* Footer */}
      <Footer variant="landing" />

      <ModalSystem
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialState={modalInitialState}
      />
    </div>
  )
}
