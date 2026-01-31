import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'
import { z } from 'zod'
import { getApiCompanyId, validateProjectAccess } from '@/server/lib/api-auth'

const blogPostUpdateSchema = z.object({
    title: z.string().min(1).max(500),
    slug: z.string().min(1).max(500).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    excerpt: z.string().max(1000).optional().nullable(),
    content: z.string().min(1),
    coverImageId: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    metaTitle: z.string().max(100).optional().nullable(),
    metaDescription: z.string().max(200).optional().nullable(),
    published: z.boolean().optional().default(false),
})

async function validatePost(postId: string, projectId: string, companyId: string | null, isAdmin: boolean) {
    const where: any = { id: postId, webProjectId: projectId }
    if (!isAdmin && companyId) where.companyId = companyId

    const post = await prisma.companyBlogPost.findFirst({ where })
    if (!post) throw new Error('Blog post not found or access denied')
    return post
}

export const PUT = safeApi<any, { id: string; postId: string }>(async (request, { params }) => {
    const { companyId, isAdmin } = await getApiCompanyId()
    const { id, postId } = params
    await validateProjectAccess(id, companyId, isAdmin)
    await validatePost(postId, id, companyId, isAdmin)

    const body = blogPostUpdateSchema.parse(await request.json())

    const updated = await prisma.companyBlogPost.update({
        where: { id: postId },
        data: {
            title: body.title,
            slug: body.slug,
            excerpt: body.excerpt ?? null,
            content: body.content,
            coverImageId: body.coverImageId ?? null,
            tags: body.tags,
            metaTitle: body.metaTitle ?? null,
            metaDescription: body.metaDescription ?? null,
            published: body.published,
            publishedAt: body.published ? new Date() : null,
        },
        include: { coverImage: { select: { url: true, alt: true } } },
    })

    return updated
}, { checkCsrf: true })

export const DELETE = safeApi<{ success: true }, { id: string; postId: string }>(async (_request, { params }) => {
    const { companyId, isAdmin } = await getApiCompanyId()
    const { id, postId } = params
    await validateProjectAccess(id, companyId, isAdmin)
    await validatePost(postId, id, companyId, isAdmin)

    await prisma.companyBlogPost.delete({ where: { id: postId } })

    return { success: true }
}, { checkCsrf: true })
