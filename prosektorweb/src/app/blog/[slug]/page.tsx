import Link from 'next/link'
import { Shield, ChevronLeft, Calendar, Clock, User, Tag, ArrowLeft, ArrowRight, Share2 } from 'lucide-react'
import { notFound } from 'next/navigation'

// Demo post data - replacement
const getPost = (slug: string) => {
    const posts: Record<string, {
        title: string
        excerpt: string
        content: string
        coverImage: string
        category: { name: string; slug: string }
        tags: string[]
        author: string
        publishedAt: string
        readingTime: number
    }> = {
        'is-guvenligi-uzmani-sorumluluk': {
            title: 'İSG Uzmanı Günah Keçisi midir? İş Kazasında Uzmanın Sorumluluğu',
            excerpt: 'İş kazası olduğunda ilk suçlanan genellikle İSG uzmanı olur. Peki yasal olarak uzmanın sorumluluğu nedir?',
            content: `
<h2>İş Kazası Olduğunda İlk Suçlanan Kimdir?</h2>
<p>Türkiye'de iş kazası meydana geldiğinde, ilk bakışta sorumlu tutulmak istenen kişi genellikle İSG uzmanı olmaktadır. Ancak 6331 sayılı İş Sağlığı ve Güvenliği Kanunu'na göre işverenin asli sorumluluğu bulunmaktadır.</p>

<h2>İSG Uzmanının Yasal Sorumlulukları</h2>
<p>İSG uzmanının sorumlulukları şunlardır:</p>
<ul>
  <li>Risk değerlendirmesi yapmak veya yaptırmak</li>
  <li>Çalışanlara eğitim vermek</li>
  <li>Denetimlerde bulunmak ve raporlamak</li>
  <li>Tehlikeli durumları yazılı olarak işverene bildirmek</li>
</ul>

<h2>Kusur Paylaşımı Nasıl Yapılır?</h2>
<p>Yargıtay kararlarına göre, İSG uzmanının kusuru ancak görevini yerine getirmemesi halinde söz konusu olmaktadır. Yazılı uyarı ve önerilerini işverene iletmiş, ancak işveren bunları uygulamamışsa, uzmanın kusuru olmayabilir.</p>

<blockquote class="bg-[#8B1E1E]/5 border-l-4 border-[#8B1E1E] pl-4 italic py-2 my-6 text-gray-700">
  "İSG uzmanının kendini korumasının en önemli yolu, tüm tespit ve önerilerini onaylı deftere yazmasıdır."
</blockquote>

<h2>Onaylı Defter Neden Bu Kadar Önemli?</h2>
<p>Bu defter, mahkemede ispat aracı olarak kullanılabilmektedir. Uzman, sorumluluğunu yerine getirdiğini bu defter ile kanıtlar.</p>

<h2>Sonuç</h2>
<p>İSG uzmanları "günah keçisi" değildir. Ancak görevlerini eksiksiz yapmaları ve bunu belgeleyerek kanıtlamaları gerekmektedir. Yazılı iletişim ve kayıt tutma, hem yasal koruma hem de profesyonellik açısından kritik önem taşımaktadır.</p>
      `,
            coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
            category: { name: 'Mevzuat', slug: 'mevzuat' },
            tags: ['İSG Uzmanı', 'Sorumluluk', 'İş Kazası', 'Yargıtay'],
            author: 'Dr. Ahmet Yılmaz',
            publishedAt: '2026-01-14',
            readingTime: 7,
        },
    }
    return posts[slug] || null
}

export default async function BlogDetailPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const post = getPost(slug)

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation - Same as List Page */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-[1200px] mx-auto px-[5%] py-4 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-gray-900 no-underline">
                        psw
                    </Link>

                    <div className="hidden md:flex items-center gap-8 text-[0.95rem] font-medium text-gray-600">
                        <Link href="/" className="hover:text-[#8B1E1E] transition-colors">Ana Sayfa</Link>
                        <Link href="/blog" className="text-[#8B1E1E] font-semibold">Blog</Link>
                        <Link href="/#iletisim" className="hover:text-[#8B1E1E] transition-colors">İletişim</Link>
                    </div>

                    <Link
                        href="/blog"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-semibold transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Tüm Yazılar
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-24 pb-0 relative">
                <div className="absolute inset-0 bg-[#F7F7F9] h-2/3 -z-10" />
                <div className="max-w-4xl mx-auto px-[5%] pt-12">

                    {/* Breadcrumb / Category */}
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 shadow-sm text-[#8B1E1E] rounded-full text-sm font-bold hover:shadow-md transition"
                        >
                            {post.category.name}
                        </Link>
                        <div className="text-sm text-gray-400 font-medium">
                            {post.publishedAt}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] mb-8 text-gray-900 tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between border-y border-gray-200 py-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#8B1E1E]/10 flex items-center justify-center text-[#8B1E1E]">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{post.author}</div>
                                <div className="text-xs text-gray-500 font-medium">{post.readingTime} dakika okuma süresi</div>
                            </div>
                        </div>
                        <button className="p-3 rounded-full hover:bg-gray-100 text-gray-500 transition">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 mb-16">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-[5%] pb-24">
                {/* Article Content */}
                <div
                    className="prose prose-lg max-w-none prose-gray
              prose-headings:font-black prose-headings:text-gray-900 prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:text-gray-600 prose-p:leading-8
              prose-strong:text-gray-900 prose-strong:font-bold
              prose-a:text-[#8B1E1E] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-li:text-gray-600
            "
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                <div className="mt-16 pt-8 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-[#8B1E1E]/5 hover:text-[#8B1E1E] transition cursor-pointer"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="mt-16 grid md:grid-cols-2 gap-6">
                    <Link
                        href="/blog"
                        className="group p-6 bg-[#F7F7F9] rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-bold mb-2 group-hover:text-[#8B1E1E] transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Önceki
                        </div>
                        <div className="font-bold text-gray-900 line-clamp-1">Risk Değerlendirmesi Yöntemleri</div>
                    </Link>
                    <Link
                        href="/blog"
                        className="group p-6 bg-[#F7F7F9] rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-lg transition-all text-right"
                    >
                        <div className="flex items-center justify-end gap-2 text-sm text-gray-400 font-bold mb-2 group-hover:text-[#8B1E1E] transition-colors">
                            Sonraki <ArrowRight className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-gray-900 line-clamp-1">İşyeri Hekimi Görevleri</div>
                    </Link>
                </div>
            </article>

            {/* Footer - Same as List Page */}
            <footer className="bg-[#F7F7F9] pt-20 pb-12 border-t border-gray-200">
                <div className="max-w-[1200px] mx-auto px-[5%]">
                    <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
                        © 2026 Prosektorweb. Tüm hakları saklıdır.
                    </div>
                </div>
            </footer>
        </div>
    )
}
