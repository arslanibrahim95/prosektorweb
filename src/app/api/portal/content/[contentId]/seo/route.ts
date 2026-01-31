import { auth } from '@/auth'
import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'
import { z } from 'zod'

const seoSchema = z.object({
    metaTitle: z.string().max(100).optional().nullable(),
    metaDescription: z.string().max(200).optional().nullable(),
})

export const PUT = safeApi<{ success: true }, { contentId: string }>(async (request, { params }) => {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const { contentId } = params
    const body = seoSchema.parse(await request.json())

    if (session.user.role === 'ADMIN') {
        const content = await prisma.generatedContent.findUnique({ where: { id: contentId } })
        if (!content) throw new Error('Content not found')
    } else {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true }
        })
        if (!user?.companyId) throw new Error('No company found')

        const content = await prisma.generatedContent.findFirst({
            where: { id: contentId, webProject: { companyId: user.companyId } }
        })
        if (!content) throw new Error('Content not found or access denied')
    }

    await prisma.generatedContent.update({
        where: { id: contentId },
        data: {
            metaTitle: body.metaTitle ?? null,
            metaDescription: body.metaDescription ?? null,
        }
    })

    return { success: true }
}, { checkCsrf: true })
