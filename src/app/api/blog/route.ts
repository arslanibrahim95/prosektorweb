import { prisma } from '@/lib/prisma'
import { validatePagination } from '@/lib/action-types'
import { safeApi } from '@/lib/safe-api'

export const GET = safeApi(async (request) => {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = validatePagination(
        searchParams.get('page'),
        searchParams.get('limit') || '12'
    )
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Build where clause
    const where: Record<string, unknown> = {
        published: true
    }

    if (category) {
        where.category = {
            slug: category
        }
    }

    if (search) {
        where.OR = [
            { title: { contains: search } },
            { excerpt: { contains: search } },
            { content: { contains: search } }
        ]
    }

    // Get posts
    const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
            where,
            include: {
                category: true
            },
            orderBy: {
                publishedAt: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.blogPost.count({ where })
    ])

    // Parse tags from JSON string and fix type safety
    const formattedPosts = posts.map((post) => {
        let parsedTags = post.tags
        if (typeof post.tags === 'string') {
            try {
                parsedTags = JSON.parse(post.tags)
            } catch (error) {
                // Fallback for malformed tags
                parsedTags = post.tags.includes(',') ? post.tags.split(',') : [post.tags]
            }
        }
        return {
            ...post,
            tags: parsedTags || []
        }
    })

    return {
        data: formattedPosts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }
}, {
    rateLimit: { limit: 100, windowSeconds: 3600 }, // 100 per hour for blog listing
    cacheControl: 'public, max-age=3600, stale-while-revalidate=86400' // Cache for 1 hour, stale for 1 day
})
