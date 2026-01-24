import Link from 'next/link'
import { ChevronLeft, Search, Calendar, Clock, ChevronRight, User, Image as ImageIcon } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import Particles from '@/components/ui/Particles'
import SpotlightCard from '@/components/ui/SpotlightCard'
import { Pagination } from '@/components/blog/Pagination'
import { BlogCardImage } from '@/components/blog/BlogCardImage'

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
        <div className="min-h-screen bg-transparent text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-900 relative overflow-hidden">
            {/* Background Harmonization with Main Page */}
            <div className="fixed top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-200/60 blur-[150px] rounded-full -z-20 pointer-events-none mix-blend-multiply" />
            <div className="fixed bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-100/60 blur-[150px] rounded-full -z-20 pointer-events-none mix-blend-multiply" />
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-10 pointer-events-none" />
            <div className="fixed inset-0 bg-[url('/assets/noise.svg')] opacity-10 -z-10 pointer-events-none brightness-100 contrast-150" />

            {/* Navbar with inner variant */}
            <Navbar variant="inner" />

            {/* Header */}
            <section className="pt-32 pb-16 px-6 relative z-10">


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
                    <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/50 flex flex-col md:flex-row gap-4 items-center justify-between ring-1 ring-neutral-900/5">
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
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="group h-full block"
                                >
                                    <SpotlightCard className="h-full border-neutral-200 p-0 overflow-hidden hover:shadow-xl transition-all duration-500" spotlightColor="rgba(220, 38, 38, 0.15)">
                                        {/* Image */}
                                        <div className="aspect-[16/10] relative overflow-hidden bg-neutral-100">
                                            <BlogCardImage
                                                src={post.coverImage}
                                                alt={post.title}
                                                categoryName={post.category?.name || 'Genel'}
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-brand-700 text-xs font-bold rounded-full shadow-sm ring-1 ring-black/5">
                                                    {post.category?.name || 'Genel'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-8 flex flex-col flex-grow">
                                            <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium mb-4 uppercase tracking-wider">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatDate(post.publishedAt)}
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {post.readingTime} dk
                                                </span>
                                            </div>

                                            <h2 className="text-2xl font-bold font-serif mb-3 text-neutral-900 leading-tight group-hover:text-brand-600 transition-colors">
                                                {post.title}
                                            </h2>

                                            <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
                                                {post.excerpt}
                                            </p>

                                            <div className="pt-6 border-t border-neutral-100 flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 ring-2 ring-white">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-xs font-bold text-neutral-700">{post.authorName}</span>
                                                </div>
                                                <span className="text-sm font-bold text-brand-600 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
                                                    Devamını Oku <ChevronRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center">
                                <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-10 h-10 text-neutral-400" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">Sonuç Bulunamadı</h3>
                                <p className="text-neutral-500 max-w-md mx-auto">
                                    Aradığınız kriterlere uygun makale bulunmamaktadır. Lütfen farklı anahtar kelimeler deneyin veya filtreleri temizleyin.
                                </p>
                                {categorySlug && (
                                    <Link
                                        href="/blog"
                                        className="inline-flex mt-6 px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors"
                                    >
                                        Filtreleri Temizle
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="mt-12">
                        <Pagination currentPage={page} totalPages={totalPages} baseUrl="/blog" />
                    </div>
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
