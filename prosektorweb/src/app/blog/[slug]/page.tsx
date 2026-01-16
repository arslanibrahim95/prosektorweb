import Link from 'next/link'
import { Shield, ChevronLeft, Calendar, Clock, User, Tag, ArrowLeft, ArrowRight } from 'lucide-react'
import { notFound } from 'next/navigation'

// Demo post data - will be replaced with DB query
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

<h2>Onaylı Defter Neden Bu Kadar Önemli?</h2>
<p>İSG uzmanının kendini korumasının en önemli yolu, tüm tespit ve önerilerini <strong>onaylı deftere</strong> yazmasıdır. Bu defter, mahkemede ispat aracı olarak kullanılabilmektedir.</p>

<h2>Sonuç</h2>
<p>İSG uzmanları "günah keçisi" değildir. Ancak görevlerini eksiksiz yapmaları ve bunu belgeleyerek kanıtlamaları gerekmektedir. Yazılı iletişim ve kayıt tutma, hem yasal koruma hem de profesyonellik açısından kritik önem taşımaktadır.</p>
      `,
            coverImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd',
            category: { name: 'Mevzuat', slug: 'mevzuat' },
            tags: ['İSG Uzmanı', 'Sorumluluk', 'İş Kazası', 'Yargıtay'],
            author: 'ProSektorWeb',
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

                    <Link
                        href="/blog"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Blog&apos;a Dön
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-24 pb-0">
                <div className="relative h-96 overflow-hidden">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                </div>
            </section>

            {/* Content */}
            <article className="relative -mt-32 z-10 px-6 pb-24">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 mb-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium mb-6 hover:bg-blue-600/30 transition"
                        >
                            {post.category.name}
                        </Link>

                        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
                            {post.title}
                        </h1>

                        <p className="text-xl text-white/60 mb-8">
                            {post.excerpt}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-white/50">
                            <span className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                {post.author}
                            </span>
                            <span className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {post.publishedAt}
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {post.readingTime} dakika
                            </span>
                        </div>
                    </div>

                    {/* Article Content */}
                    <div
                        className="prose prose-invert prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-p:text-white/70 prose-p:leading-relaxed
              prose-li:text-white/70
              prose-strong:text-white prose-strong:font-semibold
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            "
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-4 h-4 text-white/50" />
                            <span className="text-sm text-white/50">Etiketler</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 bg-white/5 rounded-full text-sm text-white/70"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-12 grid md:grid-cols-2 gap-4">
                        <Link
                            href="/blog"
                            className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition group"
                        >
                            <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white transition" />
                            <div>
                                <div className="text-xs text-white/40 mb-1">Önceki Makale</div>
                                <div className="font-medium line-clamp-1">Risk Değerlendirmesi Yöntemleri</div>
                            </div>
                        </Link>
                        <Link
                            href="/blog"
                            className="flex items-center justify-end gap-4 p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition group text-right"
                        >
                            <div>
                                <div className="text-xs text-white/40 mb-1">Sonraki Makale</div>
                                <div className="font-medium line-clamp-1">İşyeri Hekimi Görevleri</div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white transition" />
                        </Link>
                    </div>
                </div>
            </article>

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
