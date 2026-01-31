import { auth } from '@/auth'
import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getApiCompanyId, validateProjectAccess } from '@/server/lib/api-auth'

const blogPostSchema = z.object({
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

export const GET = safeApi<any, { id: string }>(async (_request: NextRequest, { params }) => {
    const { companyId, isAdmin } = await getApiCompanyId()
    const { id } = params
    const project = await validateProjectAccess(id, companyId, isAdmin)

    const where: any = { webProjectId: id }
    if (!isAdmin) where.companyId = companyId

    const posts = await prisma.companyBlogPost.findMany({
        where,
        include: { coverImage: { select: { url: true, alt: true } } },
        orderBy: { createdAt: 'desc' },
    })

    return posts
})

export const POST = safeApi<any, { id: string }>(async (request, { params }) => {
    const { companyId, isAdmin } = await getApiCompanyId()
    const { id } = params
    const project = await validateProjectAccess(id, companyId, isAdmin)

    const body = blogPostSchema.parse(await request.json())

    const post = await prisma.companyBlogPost.create({
        data: {
            companyId: project.companyId,
            webProjectId: id,
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

    return post
}, { checkCsrf: true })
