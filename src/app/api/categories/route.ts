import { prisma } from '@/lib/prisma'
import { safeApi } from '@/lib/safe-api'

export const GET = safeApi(async () => {
    const categories = await prisma.blogCategory.findMany({
        orderBy: {
            name: 'asc'
        }
    })

    return categories
}, {
    rateLimit: { limit: 100, windowSeconds: 3600 }
})
