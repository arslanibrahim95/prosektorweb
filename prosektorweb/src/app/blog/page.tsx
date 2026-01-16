import Link from 'next/link'
import { Shield, ChevronLeft, Search, Calendar, Clock, ChevronRight } from 'lucide-react'

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
    },
    {
        slug: 'acil-durum-tatbikati',
        title: 'İşyerinde Acil Durum Tatbikatı Düzenleme Rehberi',
        excerpt: 'Yasal zorunluluk olan acil durum tatbikatlarını etkili şekilde planlama ve uygulama.',
        coverImage: 'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42',
        category: { name: 'İş Güvenliği', slug: 'is-guvenligi' },
        publishedAt: '2026-01-10',
        readingTime: 9,
    },
    {
        slug: 'idari-para-cezalari-2026',
        title: '2026 Yılı İSG Cezaları: Kurallara Uymamanın Bedeli',
        excerpt: 'Risk analizi, eğitim eksikliği ve hekim çalıştırmama cezaları güncel rakamlarla.',
        coverImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
        category: { name: 'Mevzuat', slug: 'mevzuat' },
        publishedAt: '2026-01-09',
        readingTime: 7,
    },
]

export default function BlogPage() {
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
                        <Link href="/blog" className="text-white font-medium">Blog</Link>
                        <Link href="/#hizmetler" className="text-white/60 hover:text-white transition">Hizmetler</Link>
                        <Link href="/#iletisim" className="text-white/60 hover:text-white transition">İletişim</Link>
                    </div>

                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Ana Sayfa
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <section className="pt-32 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        İSG Blog
                    </h1>
                    <p className="text-xl text-white/60 max-w-2xl">
                        İş sağlığı ve güvenliği alanında güncel makaleler, mevzuat değişiklikleri ve sektörel analizler
                    </p>
                </div>
            </section>

            {/* Search & Filters */}
            <section className="px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Makale ara..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500 outline-none transition"
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2">
                            <button className="px-4 py-2 bg-blue-600 rounded-full text-sm font-medium">
                                Tümü
                            </button>
                            {demoCategories.map((cat) => (
                                <button
                                    key={cat.slug}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full text-sm text-white/70 hover:text-white transition"
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="px-6 pb-24">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {demoPosts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition"
                            >
                                {/* Image */}
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-3 left-3">
                                        <span className="px-3 py-1 bg-blue-600/80 rounded-full text-xs font-medium">
                                            {post.category.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <h2 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-400 transition">
                                        {post.title}
                                    </h2>
                                    <p className="text-white/50 text-sm line-clamp-2 mb-4">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {post.publishedAt}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.readingTime} dk
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition disabled:opacity-30" disabled>
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 bg-blue-600 rounded-xl font-medium">1</button>
                        <button className="w-12 h-12 bg-white/5 rounded-xl hover:bg-white/10 transition">2</button>
                        <button className="w-12 h-12 bg-white/5 rounded-xl hover:bg-white/10 transition">3</button>
                        <span className="text-white/40 px-2">...</span>
                        <button className="w-12 h-12 bg-white/5 rounded-xl hover:bg-white/10 transition">42</button>
                        <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Info */}
                    <p className="text-center text-white/40 text-sm mt-6">
                        Toplam 417 makale • Sayfa 1/42
                    </p>
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
                </div>
            </footer>
        </div>
    )
}
