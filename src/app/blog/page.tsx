import Link from 'next/link'
import { ChevronLeft, Search, Calendar, Clock, ChevronRight, User } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Helper to format date
const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date)
}

export default async function BlogPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; category?: string; search?: string }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const categorySlug = params.category
    const search = params.search
    const LIMIT = 9

    // Build query conditions
    const where: Prisma.BlogPostWhereInput = {
        published: true,
        ...(categorySlug && { category: { slug: categorySlug } }),
        ...(search && {
            OR: [
                { title: { contains: search } },
                { excerpt: { contains: search } }
            ]
        })
    }

    // Fetch data in parallel
    const [categories, posts, totalPosts] = await Promise.all([
        prisma.blogCategory.findMany({ orderBy: { name: 'asc' } }),
        prisma.blogPost.findMany({
            where,
            include: { category: true },
            orderBy: { publishedAt: 'desc' },
            skip: (page - 1) * LIMIT,
            take: LIMIT
        }),
        prisma.blogPost.count({ where })
    ])

    const totalPages = Math.ceil(totalPosts / LIMIT)

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-900">
            {/* Navbar with inner variant */}
            <Navbar variant="inner" />

            {/* Header */}
            <section className="pt-32 pb-16 px-6 bg-white border-b border-neutral-200 relative overflow-hidden">
                {/* Aurora Background (Subtle) */}
                <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[150%] bg-brand-50/60 blur-[100px] rounded-full -z-10 pointer-events-none mix-blend-multiply" />

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <span className="inline-block px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-sm font-bold mb-6">
                        ProSektorWeb Blog
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black font-serif mb-6 text-neutral-900 tracking-tight leading-[1.1] drop-shadow-sm">
                        İSG Dünyasından Güncel Bilgiler
                    </h1>
                    <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-light">
                        İş sağlığı ve güvenliği alanında uzman makaleler, mevzuat değişiklikleri ve sektörel rehberler.
                    </p>
                </div>
            </section>

            {/* Search & Filters */}
            <section className="px-6 -mt-8 mb-16 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-brand-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Makale ara..."
                                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all placeholder:text-neutral-400"
                            />
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <Link href="/blog" className={`px-5 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-colors ${!categorySlug ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-white text-neutral-600 hover:text-brand-600'}`}>
                                Tümü
                            </Link>
                            {categories.map((cat) => (
                                <Link
                                    key={cat.slug}
                                    href={`/blog?category=${cat.slug}`}
                                    className={`px-5 py-2.5 rounded-md text-sm font-semibold border transition-colors ${categorySlug === cat.slug ? 'bg-brand-600 text-white border-brand-600' : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-brand-600 hover:border-brand-200'}`}
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Grid */}
            <section className="px-6 pb-24">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
                            >
                                {/* Image */}
                                <div className="aspect-[4/3] relative overflow-hidden bg-neutral-100">
                                    {post.coverImage && (
                                        <img
                                            src={post.coverImage}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-brand-700 text-xs font-bold rounded-full shadow-sm">
                                            {post.category?.name || 'Genel'}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium mb-4">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(post.publishedAt)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {post.readingTime} dk okuma
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold font-serif mb-3 text-neutral-900 leading-tight group-hover:text-brand-600 transition-colors">
                                        {post.title}
                                    </h2>

                                    <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                                        {post.excerpt}
                                    </p>

                                    <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-semibold text-neutral-700">{post.authorName}</span>
                                        </div>
                                        <span className="text-sm font-bold text-brand-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                            Oku <ChevronRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-16">
                            <Link
                                href={page > 1 ? `/blog?page=${page - 1}` : '#'}
                                className={`w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-lg transition ${page > 1 ? 'hover:bg-neutral-50 text-neutral-600' : 'opacity-30 cursor-not-allowed text-neutral-400'}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Link>

                            {Array.from({ length: totalPages }).map((_, i) => (
                                <Link
                                    key={i}
                                    href={`/blog?page=${i + 1}`}
                                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold shadow-md transition ${page === i + 1 ? 'bg-brand-600 text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
                                >
                                    {i + 1}
                                </Link>
                            ))}

                            <Link
                                href={page < totalPages ? `/blog?page=${page + 1}` : '#'}
                                className={`w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-lg transition ${page < totalPages ? 'hover:bg-neutral-50 text-neutral-600' : 'opacity-30 cursor-not-allowed text-neutral-400'}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}
                    <div className="text-center text-sm text-gray-400 mt-4 font-medium">
                        Toplam {totalPosts} makale • Sayfa {page}/{totalPages || 1}
                    </div>
                </div>
            </section>

            {/* Footer with inner variant */}
            <Footer variant="inner" />
        </div>
    )
}
