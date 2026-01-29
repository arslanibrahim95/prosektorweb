import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'

export const GET = safeApi(async () => {
    const categories = await prisma.blogCategory.findMany({
        orderBy: {
            name: 'asc'
        }
    })

    return categories
}, {
    rateLimit: { limit: 100, windowSeconds: 3600 },
    cacheControl: 'public, max-age=86400, stale-while-revalidate=604800' // 1 day cache, 1 week stale
})
