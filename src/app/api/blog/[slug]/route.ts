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

        // Parse tags safely
        let parsedTags = post.tags
        if (typeof post.tags === 'string') {
            try {
                parsedTags = JSON.parse(post.tags)
            } catch (e) {
                // Fallback: keep as string or empty array?
                // For stability, let's keep original string or try to split if comma separated
                parsedTags = post.tags.includes(',') ? post.tags.split(',') : [post.tags]
            }
        }

        const formattedPost = {
            ...post,
            tags: parsedTags
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
