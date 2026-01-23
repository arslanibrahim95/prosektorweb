import Link from 'next/link'

export default async function InstantDemoPage({ params }: { params: { slug: string } }) {
    const slug = params.slug
    const companyName = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    // Dummy Content Generation based on Slug (Deterministic)
    const services = [
        'İş Sağlığı ve Güvenliği',
        'Risk Analizi ve Değerlendirme',
        'Acil Durum Eylem Planı',
        'Yangın Eğitimi ve Tatbikatı',
        'Periyodik Kontroller',
        'Mobil Sağlık Hizmetleri'
    ]

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar - Demo Context */}
            <div className="bg-slate-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-xs px-2 py-1 rounded font-bold">CANLI DEMO</span>
                    <span className="text-sm text-slate-300">Bu bir önizlemedir.</span>
                </div>
                <Link href="/contact" className="bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded text-sm font-medium transition-colors">
                    Sitemi Satın Al 🚀
                </Link>
            </div>

            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">{companyName}</h1>
                    <nav className="hidden md:flex gap-6 text-sm text-slate-600">
                        <a href="#" className="hover:text-blue-600">Kurumsal</a>
                        <a href="#" className="hover:text-blue-600">Hizmetlerimiz</a>
                        <a href="#" className="hover:text-blue-600">Belgeler</a>
                        <a href="#" className="hover:text-blue-600">İletişim</a>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative bg-slate-50 py-20 lg:py-32">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6">
                        {companyName} ile <br />
                        <span className="text-blue-600">Güvenli Yarınlar</span>
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
                        İş yerinizde sağlık ve güvenliği en üst seviyeye taşıyoruz.
                        Profesyonel OSGB hizmetleri ile yasal uyumluluk ve sıfır iş kazası hedefi.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
                            Teklif Alın
                        </button>
                        <button className="bg-white border border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
                            Hizmetlerimiz
                        </button>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-bold text-center mb-12">Hizmetlerimiz</h3>
                    <div className="grid md:grid-cols-3 gap-8">
                        {services.map((service, i) => (
                            <div key={i} className="p-6 border rounded-xl hover:shadow-lg transition-shadow group">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h4 className="text-xl font-bold mb-2">{service}</h4>
                                <p className="text-slate-500 text-sm">
                                    {companyName} olarak {service.toLowerCase()} konusunda uzman kadromuzla hizmetinizdeyiz.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} {companyName}. Tüm hakları saklıdır.</p>
                    <p className="text-xs mt-4 text-slate-600">ProSektorWeb Altyapısı ile Hazırlanmıştır.</p>
                </div>
            </footer>
        </div>
    )
}
