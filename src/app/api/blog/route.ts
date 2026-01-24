import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePagination } from '@/lib/action-types'

export async function GET(request: Request) {
    try {
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
        const formattedPosts = posts.map((post) => ({
            ...post,
            tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : (post.tags || [])
        }))

        return NextResponse.json({
            posts: formattedPosts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching blog posts:', error)
        return NextResponse.json(
            { error: 'Blog yazıları yüklenirken hata oluştu' },
            { status: 500 }
        )
    }
}
