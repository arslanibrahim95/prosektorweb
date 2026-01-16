import Link from 'next/link'
import { Shield, ChevronLeft, Search, Calendar, Clock, ChevronRight, User } from 'lucide-react'

// Static demo data (will be replaced with DB queries when connected)
const demoCategories = [
    { slug: 'is-guvenligi', name: 'İş Güvenliği' },
    { slug: 'mevzuat', name: 'Mevzuat' },
    { slug: 'saglik', name: 'Sağlık' },
    { slug: 'dijital-donusum', name: 'Dijital Dönüşüm' },
    { slug: 'risk-yonetimi', name: 'Risk Yönetimi' },
]

const demoPosts = [
    {
        slug: 'is-guvenligi-uzmani-sorumluluk',
        title: 'İSG Uzmanı Günah Keçisi midir? İş Kazasında Uzmanın Sorumluluğu',
        excerpt: 'İş kazası olduğunda ilk suçlanan genellikle İSG uzmanı olur. Peki yasal olarak uzmanın sorumluluğu nedir?',
        coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
        category: { name: 'Mevzuat', slug: 'mevzuat' },
        publishedAt: '2026-01-14',
        readingTime: 7,
    },
    {
        slug: 'risk-degerlendirmesi-yontemleri',
        title: 'Risk Değerlendirmesi Yöntemleri: Fine-Kinney vs L Tipi Matris',
        excerpt: 'Hangi risk değerlendirme yöntemi sizin işyeriniz için daha uygun? Karşılaştırmalı analiz.',
        coverImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984',
        category: { name: 'Risk Yönetimi', slug: 'risk-yonetimi' },
        publishedAt: '2026-01-13',
        readingTime: 10,
    },
    {
        slug: 'isg-yazilimi-secimi',
        title: 'OSGB İçin Doğru İSG Yazılımı Nasıl Seçilir?',
        excerpt: '2026 yılında OSGB operasyonlarınızı dijitalleştirmek için nelere dikkat etmelisiniz?',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        category: { name: 'Dijital Dönüşüm', slug: 'dijital-donusum' },
        publishedAt: '2026-01-12',
        readingTime: 8,
    },
    {
        slug: 'isyeri-hekimi-gorevleri',
        title: 'İşyeri Hekimi Sadece İlaç mı Yazar? Hayati Yetkileri',
        excerpt: 'İşyeri hekiminin yasal görev ve yetkileri, çalışanı koruma sorumluluğu.',
        coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
        category: { name: 'Sağlık', slug: 'saglik' },
        publishedAt: '2026-01-11',
        readingTime: 6,
        author: 'Dr. Mehmet Öz'
    },
    {
        slug: 'risk-analizi-yontemleri',
        title: 'Hangi Risk Değerlendirme Yöntemi Sizin İçin Uygun?',
        excerpt: 'Fine-Kinney, Matris, L Tipi... İşyerinizin tehlike sınıfına göre en doğru risk analizi yöntemini seçin.',
        coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
        category: { name: 'İş Güvenliği', slug: 'is-guvenligi' },
        publishedAt: '2026-01-13',
        readingTime: 10,
        author: 'Müh. Ayşe Demir'
    },
    {
        slug: 'dijital-isg',
        title: '2026 Yılında OSGB Operasyonlarını Dijitalleştirmek',
        excerpt: 'Kağıt israfına son verin. Bulut tabanlı İSG yönetim sistemleri ile verimliliğinizi %40 artırın.',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        category: { name: 'Dijital Dönüşüm', slug: 'dijital-donusum' },
        publishedAt: '2026-01-12',
        readingTime: 8,
        author: 'Teknoloji Ekibi'
    },
    {
        slug: 'isyeri-hekimi-yetkileri',
        title: 'İşyeri Hekimi Sadece İlaç mı Yazar? Hayati Yetkileri',
        excerpt: 'İşyeri hekiminin yasal görev ve yetkileri, çalışanı koruma sorumluluğu ve reçete yazma dışındaki kritik rolleri.',
        coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
        category: { name: 'Sağlık', slug: 'saglik' },
        publishedAt: '2026-01-11',
        readingTime: 6,
        author: 'Dr. Mehmet Öz'
    },
    {
        slug: 'acil-durum-tatbikati',
        title: 'İşyerinde Acil Durum Tatbikatı Düzenleme Rehberi',
        excerpt: 'Yasal zorunluluk olan acil durum tatbikatlarını etkili şekilde planlama, uygulama ve raporlama adımları.',
        coverImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
        category: { name: 'İş Güvenliği', slug: 'is-guvenligi' },
        publishedAt: '2026-01-10',
        readingTime: 9,
        author: 'İSG Uzm. Canan Dağ'
    },
    {
        slug: 'isg-cezalari-2026',
        title: '2026 Yılı İSG Cezaları: Kurallara Uymamanın Bedeli',
        excerpt: 'Risk analizi, eğitim eksikliği ve hekim çalıştırmama cezaları güncel rakamlarla. İşverenler için kritik uyarılar.',
        coverImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
        category: { name: 'Mevzuat', slug: 'mevzuat' },
        publishedAt: '2026-01-09',
        readingTime: 7,
        author: 'Hukuk departmanı'
    }
]

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation - Matching Landing Page */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-[5%] py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900 no-underline">
                        psw
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-[0.95rem] font-medium text-gray-600">
                        <Link href="/#neden-biz" className="hover:text-[#8B1E1E] transition-colors">Neden Biz?</Link>
                        <Link href="/#fiyatlandirma" className="hover:text-[#8B1E1E] transition-colors">Fiyatlandırma</Link>
                        <Link href="/#sss" className="hover:text-[#8B1E1E] transition-colors">SSS</Link>
                        <span className="text-[#8B1E1E] font-semibold">Blog</span>
                        <Link href="/#iletisim" className="hover:text-[#8B1E1E] transition-colors">İletişim</Link>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-semibold transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Geri Dön
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <section className="pt-32 pb-16 px-[5%] bg-[#F7F7F9] border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto text-center">
                    <span className="inline-block px-4 py-1.5 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-full text-sm font-bold mb-6">
                        ProSektorWeb Blog
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 tracking-tight leading-[1.15]">
                        İSG Dünyasından Güncel Bilgiler
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        İş sağlığı ve güvenliği alanında uzman makaleler, mevzuat değişiklikleri ve sektörel rehberler.
                    </p>
                </div>
            </section>

            {/* Search & Filters */}
            <section className="px-[5%] -mt-8 mb-16 relative z-10">
                <div className="max-w-[1200px] mx-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                            <input
                                type="text"
                                placeholder="Makale ara..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#8B1E1E] focus:ring-4 focus:ring-[#8B1E1E]/10 outline-none transition"
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <button className="px-5 py-2.5 bg-[#8B1E1E] text-white rounded-full text-sm font-bold shadow-lg shadow-[#8B1E1E]/20 hover:scale-105 transition-transform">
                                Tümü
                            </button>
                            {demoCategories.map((cat) => (
                                <button
                                    key={cat.slug}
                                    className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-sm font-semibold text-gray-600 hover:text-[#8B1E1E] transition-colors"
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="px-[5%] pb-24">
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {demoPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Image */}
                                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur text-[#8B1E1E] text-xs font-bold rounded-lg shadow-sm">
                                            {post.category.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mb-4">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {post.publishedAt}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.readingTime} dk okuma
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold mb-3 text-gray-900 leading-snug group-hover:text-[#8B1E1E] transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                                        {post.excerpt}
                                    </p>

                                    <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[#8B1E1E]/10 flex items-center justify-center text-[#8B1E1E]">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">{post.author}</span>
                                        </div>
                                        <span className="text-sm font-bold text-[#8B1E1E] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                            Oku <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-3 mt-16">
                        <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-30 text-gray-600" disabled>
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 flex items-center justify-center bg-[#8B1E1E] text-white rounded-xl font-bold shadow-lg shadow-[#8B1E1E]/20">1</button>
                        <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-600">2</button>
                        <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-600">3</button>
                        <span className="w-12 text-center text-gray-400">...</span>
                        <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-600">42</button>
                        <button className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="text-center text-sm text-gray-400 mt-4 font-medium">
                        Toplam 417 makale • Sayfa 1/42
                    </div>
                </div>
            </section>

            {/* Footer - Matching Landing Page */}
            <footer className="bg-[#F7F7F9] pt-20 pb-12 border-t border-gray-200">
                <div className="max-w-[1200px] mx-auto px-[5%]">
                    <div className="grid md:grid-cols-3 gap-12 mb-16">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 mb-6">psw</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                OSGB’lere özel profesyonel web çözümleri. Dijital kimliğinizi sektörün diline uygun tasarlıyoruz.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Hızlı Erişim</h3>
                            <div className="flex flex-col gap-2">
                                <Link href="/" className="text-gray-500 hover:text-[#8B1E1E] text-sm transition-colors">Ana Sayfa</Link>
                                <Link href="/#neden-biz" className="text-gray-500 hover:text-[#8B1E1E] text-sm transition-colors">Neden Biz?</Link>
                                <Link href="/#fiyatlandirma" className="text-gray-500 hover:text-[#8B1E1E] text-sm transition-colors">Fiyatlandırma</Link>
                                <Link href="/#sss" className="text-gray-500 hover:text-[#8B1E1E] text-sm transition-colors">SSS</Link>
                                <Link href="/#iletisim" className="text-gray-500 hover:text-[#8B1E1E] text-sm transition-colors">İletişim</Link>
                            </div>
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 mb-2">Güvenli ödeme altyapısı</p>
                            <div className="text-xs text-gray-400 tracking-wider mb-6">VISA • MASTERCARD • TROY</div>
                            <p className="text-gray-900 font-medium">hello@prosektorweb.com</p>
                            <p className="text-gray-500">0 555 555 55 55</p>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
                        © 2026 Prosektorweb. Tüm hakları saklıdır.
                    </div>
                </div>
            </footer>
        </div>
    )
}
