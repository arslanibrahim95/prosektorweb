import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'
import { z } from 'zod'
import { NextRequest } from 'next/server'
import { getApiCompanyId, validateProjectAccess } from '@/server/lib/api-auth'

const designSchema = z.object({
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    bgColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    fontHeading: z.string().max(100),
    fontBody: z.string().max(100),
})

export const GET = safeApi<any, { id: string }>(async (_request: NextRequest, { params }) => {
    const { companyId, isAdmin } = await getApiCompanyId()
    const { id } = params
    await validateProjectAccess(id, companyId, isAdmin)

    const designContent = await prisma.generatedContent.findFirst({
        where: { webProjectId: id, contentType: 'DESIGN' }
    })

    if (!designContent) {
        return {
            primaryColor: '#2563eb',
            secondaryColor: '#1e40af',
            accentColor: '#f59e0b',
            bgColor: '#ffffff',
            fontHeading: 'Inter',
            fontBody: 'Inter',
        }
    }

    try {
        return JSON.parse(designContent.content)
    } catch {
        return {}
    }
}, { cacheControl: 'private, max-age=60' })

export const PUT = safeApi<{ success: true }, { id: string }>(async (request, { params }) => {
    const { companyId, isAdmin } = await getApiCompanyId()
    const { id } = params
    await validateProjectAccess(id, companyId, isAdmin)

    const body = designSchema.parse(await request.json())

    const existing = await prisma.generatedContent.findFirst({
        where: { webProjectId: id, contentType: 'DESIGN' }
    })

    const content = JSON.stringify(body)

    if (existing) {
        await prisma.generatedContent.update({
            where: { id: existing.id },
            data: { content }
        })
    } else {
        await prisma.generatedContent.create({
            data: {
                webProjectId: id,
                contentType: 'DESIGN',
                title: 'Tasarım Ayarları',
                content,
                modelUsed: 'user',
                status: 'PUBLISHED',
            }
        })
    }

    return { success: true }
}, { checkCsrf: true })
