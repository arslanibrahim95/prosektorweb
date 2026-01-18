import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params

        // Find post by slug
        const post = await prisma.blogPost.findUnique({
            where: {
                slug,
                published: true
            },
            include: {
                category: true
            }
        })

        if (!post) {
            return NextResponse.json(
                { error: 'Blog yazısı bulunamadı' },
                { status: 404 }
            )
        }

        // Increment view count (optional, simple implementation)
        // In a high-traffic app, this should be done via a separate queue/worker or analytics service
        await prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
        })

        // Parse tags if needed (consistency with list endpoint)
        const formattedPost = {
            ...post,
            tags: typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags
        }

        return NextResponse.json(formattedPost)
    } catch (error) {
        console.error('Error fetching blog post:', error)
        return NextResponse.json(
            { error: 'Blog yazısı yüklenirken hata oluştu' },
            { status: 500 }
        )
    }
}
