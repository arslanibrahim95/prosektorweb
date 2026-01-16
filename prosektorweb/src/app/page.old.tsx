import Link from 'next/link'
import {
  Shield,
  FileCheck,
  Users,
  BookOpen,
  ChevronRight,
  Phone,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">ProSektorWeb</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/blog" className="text-white/60 hover:text-white transition">Blog</Link>
            <Link href="#hizmetler" className="text-white/60 hover:text-white transition">Hizmetler</Link>
            <Link href="#iletisim" className="text-white/60 hover:text-white transition">İletişim</Link>
          </div>

          <Link
            href="/blog"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-sm font-semibold hover:opacity-90 transition"
          >
            Blog&apos;a Git
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              İş Sağlığı ve Güvenliği Bilgi Platformu
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
              İSG Bilgisi{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Tek Tıkla
              </span>
            </h1>

            <p className="text-xl text-white/60 max-w-2xl mb-10">
              Türkiye&apos;nin en kapsamlı iş güvenliği blog platformu. 400&apos;den fazla makale,
              güncel mevzuat bilgileri ve sektörel analizler.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/blog"
                className="group flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-semibold hover:bg-white/90 transition"
              >
                Makaleleri Keşfet
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#iletisim"
                className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-semibold hover:bg-white/10 transition"
              >
                <Phone className="w-5 h-5" />
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '417+', label: 'Makale' },
            { value: '5', label: 'Kategori' },
            { value: '6331', label: 'Sayılı Kanun' },
            { value: '2026', label: 'Güncel Bilgi' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-white/50 text-sm uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="hizmetler" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Blog Kategorileri</h2>
            <p className="text-white/50">İhtiyacınıza göre içerik bulun</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'İş Güvenliği', desc: 'Risk analizi, acil durum planları, tehlike sınıfları', color: 'from-blue-500 to-blue-600' },
              { icon: FileCheck, title: 'Mevzuat', desc: '6331 sayılı kanun, yönetmelikler, idari yaptırımlar', color: 'from-purple-500 to-purple-600' },
              { icon: Users, title: 'Sağlık', desc: 'İşyeri hekimliği, periyodik muayeneler, meslek hastalıkları', color: 'from-green-500 to-green-600' },
              { icon: BookOpen, title: 'Dijital Dönüşüm', desc: 'İSG yazılımları, otomasyon, dijital arşiv', color: 'from-orange-500 to-orange-600' },
              { icon: Shield, title: 'Risk Yönetimi', desc: 'Fine-Kinney, L tipi matris, risk değerlendirme', color: 'from-red-500 to-red-600' },
              { icon: Sparkles, title: 'Tüm Makaleler', desc: '417+ makale ile tam arşiv', color: 'from-pink-500 to-purple-600' },
            ].map((cat, i) => (
              <Link
                key={i}
                href="/blog"
                className="group relative bg-white/5 rounded-3xl p-8 border border-white/10 hover:border-white/20 transition overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className={`w-14 h-14 bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <cat.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{cat.title}</h3>
                  <p className="text-white/50 text-sm mb-4">{cat.desc}</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
                    Makaleleri Gör <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[3rem] p-12 md:p-16 border border-white/10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              İSG Bilgisine Hemen Ulaşın
            </h2>
            <p className="text-xl text-white/60 mb-8">
              417&apos;den fazla makale ile Türkiye&apos;nin en kapsamlı İSG kaynağı
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black rounded-2xl text-lg font-bold hover:bg-white/90 transition"
            >
              Blog&apos;a Git
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="iletisim" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">İletişime Geçin</h2>
              <p className="text-white/60 mb-8">
                İş sağlığı ve güvenliği konusunda sorularınız için bize ulaşın.
              </p>

              <div className="space-y-4">
                <a href="tel:+905517038599" className="flex items-center gap-4 text-lg hover:text-blue-400 transition">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  +90 551 703 8599
                </a>
                <a href="mailto:hello@prosektorweb.com" className="flex items-center gap-4 text-lg hover:text-blue-400 transition">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  hello@prosektorweb.com
                </a>
              </div>
            </div>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-6">Hızlı Mesaj</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Adınız"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition"
                />
                <input
                  type="email"
                  placeholder="E-posta"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition"
                />
                <textarea
                  rows={4}
                  placeholder="Mesajınız"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Gönder
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-bold">ProSektorWeb</span>
          </div>

          <div className="text-white/40 text-sm">
            © 2026 ProSektorWeb. Tüm hakları saklıdır.
          </div>

          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/gizlilik" className="hover:text-white transition">Gizlilik</Link>
            <Link href="/kvkk" className="hover:text-white transition">KVKK</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
