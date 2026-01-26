import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://prosektorweb.com'
    const locales = ['tr', 'en']

    const routes = [
        '',
        '/portfolio',
        '/blog',
        '/cerez-politikasi',
        '/gizlilik-ve-kvkk',
        '/mesafeli-satis-sozlesmesi',
    ]

    // Static pages with locales
    const staticPages = routes.flatMap((route) =>
        locales.map((locale) => {
            const localePrefix = locale === 'tr' ? '' : `/${locale}`
            return {
                url: `${baseUrl}${localePrefix}${route}`,
                lastModified: new Date(),
                changeFrequency: route === '/blog' ? 'daily' as const : 'weekly' as const,
                priority: route === '' ? 1 : 0.8,
            }
        })
    )

    // Dynamic blog posts
    const blogPosts = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, createdAt: true },
    })

    const dynamicPages = blogPosts.flatMap((post) =>
        locales.map((locale) => {
            const localePrefix = locale === 'tr' ? '' : `/${locale}`
            return {
                url: `${baseUrl}${localePrefix}/blog/${post.slug}`,
                lastModified: post.updatedAt || post.createdAt,
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }
        })
    )

    return [...staticPages, ...dynamicPages]
}
