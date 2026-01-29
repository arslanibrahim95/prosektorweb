import { MetadataRoute } from 'next'
import { prisma } from '@/server/db'
import { getAllProvinces, getAllServices, getIndustrialProvinces, generateLocalUrl } from '@/features/ai-generation/lib/pipeline/seo'

// Sitemap bolme limiti (Next.js limit: 50,000 URL)
const SITEMAP_URL_LIMIT = 45000

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

    // Local SEO pages - sadece oncelikli iller (build suresini optimize et)
    const priorityProvinces = getIndustrialProvinces()
    const services = getAllServices()
    const localSeoPages: MetadataRoute.Sitemap = []

    for (const province of priorityProvinces) {
        for (const service of services) {
            // Province-level page
            localSeoPages.push({
                url: `${baseUrl}${generateLocalUrl(service, province)}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.9,
            })

            // District-level pages - sadece merkez ilceler (ilk 3)
            const centerDistricts = province.districts.slice(0, 3)
            for (const district of centerDistricts) {
                localSeoPages.push({
                    url: `${baseUrl}${generateLocalUrl(service, province, district)}`,
                    lastModified: new Date(),
                    changeFrequency: 'monthly' as const,
                    priority: 0.7,
                })
            }
        }
    }

    const allPages = [...staticPages, ...dynamicPages, ...localSeoPages]

    // Eger limiti asarsa, sadece oncelikli sayfalari dondur
    if (allPages.length > SITEMAP_URL_LIMIT) {
        console.warn(`Sitemap limit asildi: ${allPages.length} URL. Sadece ilk ${SITEMAP_URL_LIMIT} URL ekleniyor.`)
        return allPages.slice(0, SITEMAP_URL_LIMIT)
    }

    return allPages
}

