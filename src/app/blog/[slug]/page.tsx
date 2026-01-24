import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Calendar, Share2, User } from 'lucide-react'
import { notFound } from 'next/navigation'
import { sanitizeHtml } from '@/lib/security/sanitize'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import TrustBadges from '@/components/ui/TrustBadges'

// --- Types ---
type Props = {
    params: Promise<{ slug: string }>
}

// --- Metadata for SEO ---
export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    const post = await prisma.blogPost.findUnique({
        where: { slug },
        select: {
            title: true,
            excerpt: true,
            metaTitle: true,
            metaDescription: true,
            coverImage: true,
            publishedAt: true,
            authorName: true,
        }
    })

    if (!post) return { title: 'Yazı Bulunamadı' }

    return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
        openGraph: {
            title: post.metaTitle || post.title,
            description: post.metaDescription || post.excerpt || undefined,
            type: 'article',
            publishedTime: post.publishedAt.toISOString(),
            authors: [post.authorName || 'ProSektorWeb'],
            images: post.coverImage ? [{ url: post.coverImage }] : [],
        }
    }
}

// --- Helper Functions ---
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date)
}

function parseTags(tags: unknown): string[] {
    if (Array.isArray(tags)) return tags as string[]
    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }
    return []
}

// --- Main Page Component ---
export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params

    // Fetch Current Post + Navigation
    const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: { category: true }
    })

    if (!post) {
        notFound()
    }

    // Parallel Fetch for Neighbors (Performance Optimization)
    const [prevPost, nextPost] = await Promise.all([
        prisma.blogPost.findFirst({
            where: { publishedAt: { lt: post.publishedAt }, published: true },
            orderBy: { publishedAt: 'desc' },
            select: { slug: true, title: true }
        }),
        prisma.blogPost.findFirst({
            where: { publishedAt: { gt: post.publishedAt }, published: true },
            orderBy: { publishedAt: 'asc' },
            select: { slug: true, title: true }
        })
    ])

    const tags = parseTags(post.tags)
    const cleanContent = sanitizeHtml(post.content)

    // Check for quality/trust related content
    const showsTrustBadges = tags.some(t =>
        ['Kurumsal Kimlik', 'Güven', 'Kalite', 'Sertifika', 'Yönetmelik'].some(kw => t.includes(kw))
    )

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-900">
            <Navbar variant="inner" />

            {/* Hero Section */}
            <section className="pt-24 pb-0 relative">
                <div className="absolute inset-0 bg-white h-2/3 -z-10" />
                <div className="max-w-4xl mx-auto px-6 pt-12">

                    {/* Meta Info */}
                    <div className="flex items-center justify-between mb-8">
                        <Link
                            href={`/blog?category=${post.category?.slug}`}
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-brand-200 shadow-sm text-brand-600 rounded-full text-sm font-bold hover:shadow-md transition"
                        >
                            {post.category?.name || 'Genel'}
                        </Link>
                        <time className="text-sm text-neutral-500 font-medium flex items-center gap-2" dateTime={post.publishedAt.toISOString()}>
                            <Calendar className="w-4 h-4" />
                            {formatDate(post.publishedAt)}
                        </time>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif leading-[1.1] mb-8 text-neutral-900 tracking-tight">
                        {post.title}
                    </h1>

                    <div className="flex items-center justify-between border-y border-neutral-200 py-6 mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 border border-brand-100">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="font-bold text-neutral-900">{post.authorName}</div>
                                <div className="text-xs text-neutral-500 font-medium">{post.readingTime} dakika okuma süresi</div>
                            </div>
                        </div>
                        <button className="p-3 rounded-full hover:bg-neutral-100 text-neutral-600 transition" aria-label="Paylaş">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative aspect-[2/1] rounded-2xl overflow-hidden shadow-xl mb-16 bg-neutral-100">
                        {post.coverImage && (
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 900px, 100vw"
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-6 pb-24">
                {cleanContent ? (
                    <div
                        className="prose prose-lg max-w-none prose-neutral
                            prose-headings:font-black prose-headings:font-serif prose-headings:text-neutral-900 prose-headings:tracking-tight
                            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                            prose-p:text-neutral-600 prose-p:leading-8
                            prose-strong:text-neutral-900 prose-strong:font-bold
                            prose-a:text-brand-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                            prose-li:text-neutral-600
                            prose-table:w-full prose-table:border-collapse prose-table:my-8
                            prose-th:bg-neutral-100 prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:border prose-th:border-neutral-200
                            prose-td:p-4 prose-td:border prose-td:border-neutral-200
                        "
                        dangerouslySetInnerHTML={{ __html: cleanContent }}
                    />
                ) : (
                    <div className="py-12 px-6 bg-neutral-50 border border-neutral-200 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📝</span>
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900">İçerik Hazırlanıyor</h3>
                        <p className="text-neutral-500 mt-2">Bu makalenin içeriği henüz eklenmemiş veya güncelleniyor.</p>
                    </div>
                )}

                {/* Trust Badges Injection */}
                {showsTrustBadges && (
                    <div className="my-16">
                        <div className="p-1 bg-gradient-to-br from-brand-100 to-transparent rounded-2xl">
                            <div className="bg-white rounded-xl p-8 border border-brand-100">
                                <h3 className="text-xl font-bold text-brand-900 mb-2 font-serif text-center">Kurumsal Güven Rozetleri</h3>
                                <p className="text-neutral-500 text-center mb-8 max-w-lg mx-auto">
                                    Yazımızda vurguladığımız üzere, akredite ve güvenilir bir hizmet almak için bu rozetleri arayın.
                                </p>
                                <TrustBadges />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-neutral-200">
                        <div className="flex flex-wrap gap-2">
                            {tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-md text-sm font-medium transition cursor-default"
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <div className="mt-16 grid md:grid-cols-2 gap-6">
                    {prevPost ? (
                        <Link
                            href={`/blog/${prevPost.slug}`}
                            className="group p-6 bg-white rounded-xl border border-neutral-200 hover:border-brand-200 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center gap-2 text-sm text-neutral-500 font-bold mb-2 group-hover:text-brand-600 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Önceki Yazı
                            </div>
                            <div className="font-bold text-neutral-900 line-clamp-2 font-serif group-hover:text-brand-900">
                                {prevPost.title}
                            </div>
                        </Link>
                    ) : (
                        <div /> // Spacer
                    )}

                    {nextPost ? (
                        <Link
                            href={`/blog/${nextPost.slug}`}
                            className="group p-6 bg-white rounded-xl border border-neutral-200 hover:border-brand-200 hover:shadow-lg transition-all text-right block"
                        >
                            <div className="flex items-center justify-end gap-2 text-sm text-neutral-500 font-bold mb-2 group-hover:text-brand-600 transition-colors">
                                Sonraki Yazı <ArrowRight className="w-4 h-4" />
                            </div>
                            <div className="font-bold text-neutral-900 line-clamp-2 font-serif group-hover:text-brand-900">
                                {nextPost.title}
                            </div>
                        </Link>
                    ) : null}
                </div>
            </article>

            <Footer variant="inner" />
        </div>
    )
}
