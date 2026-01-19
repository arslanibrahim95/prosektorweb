import Link from 'next/link'
import { Shield, ChevronLeft, Calendar, Clock, User, Tag, ArrowLeft, ArrowRight, Share2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'

// Helper to format date
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date)
}

export default async function BlogDetailPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    // Fetch Post from DB
    const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: { category: true }
    })

    if (!post) {
        notFound()
    }

    // Parse tags safely
    const tags = Array.isArray(post.tags) ? post.tags : []

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-900">
            {/* Navbar with inner variant */}
            <Navbar variant="inner" />

            {/* Hero */}
            <section className="pt-24 pb-0 relative">
                <div className="absolute inset-0 bg-white h-2/3 -z-10" />
                <div className="max-w-4xl mx-auto px-6 pt-12">

                    {/* Breadcrumb / Category */}
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href={`/blog?category=${post.category?.slug}`}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-brand-200 shadow-sm text-brand-600 rounded-full text-sm font-bold hover:shadow-md transition"
                        >
                            {post.category?.name || 'Genel'}
                        </Link>
                        <div className="text-sm text-neutral-500 font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.publishedAt)}
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif leading-[1.1] mb-8 text-neutral-900 tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between border-y border-neutral-200 py-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-neutral-900">{post.authorName}</div>
                                <div className="text-xs text-neutral-500 font-medium">{post.readingTime} dakika okuma süresi</div>
                            </div>
                        </div>
                        <button className="p-3 rounded-full hover:bg-neutral-100 text-neutral-600 transition">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-xl mb-16">
                        {post.coverImage && (
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <article className="max-w-3xl mx-auto px-6 pb-24">
                {/* Article Content */}
                <div
                    className="prose prose-lg max-w-none prose-neutral
              prose-headings:font-black prose-headings:font-serif prose-headings:text-neutral-900 prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:text-neutral-600 prose-p:leading-8
              prose-strong:text-neutral-900 prose-strong:font-bold
              prose-a:text-brand-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
              prose-li:text-neutral-600
            "
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                <div className="mt-16 pt-8 border-t border-neutral-200">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag: any) => (
                            <span
                                key={tag}
                                className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-md text-sm font-medium hover:border-brand-200 hover:text-brand-600 transition cursor-pointer"
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
                        className="group p-6 bg-white rounded-xl border border-neutral-200 hover:border-brand-200 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center gap-2 text-sm text-neutral-500 font-bold mb-2 group-hover:text-brand-600 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Önceki
                        </div>
                        <div className="font-bold text-neutral-900 line-clamp-1 font-serif">Tüm Yazılar</div>
                    </Link>
                    <Link
                        href="/blog"
                        className="group p-6 bg-white rounded-xl border border-neutral-200 hover:border-brand-200 hover:shadow-lg transition-all text-right"
                    >
                        {/* Placeholder for Next Post logic - currently returns to list */}
                        <div className="flex items-center justify-end gap-2 text-sm text-neutral-500 font-bold mb-2 group-hover:text-brand-600 transition-colors">
                            Sonraki <ArrowRight className="w-4 h-4" />
                        </div>
                        <div className="font-bold text-neutral-900 line-clamp-1 font-serif">Sıradaki Yazı</div>
                    </Link>
                </div>
            </article>

            {/* Shared Footer */}
            <Footer variant="inner" />
        </div>
    )
}
