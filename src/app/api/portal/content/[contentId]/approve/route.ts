import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { safeApi } from '@/lib/safe-api'

export const POST = safeApi<{ success: true }, { contentId: string }>(async (request, { params }) => {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    const { contentId } = params

    // Kullanıcının firma bilgisini al
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true, email: true }
    })

    if (!user?.companyId) {
        throw new Error('No company found for user')
    }

    // İçeriği ve projeyi doğrula
    const content = await prisma.generatedContent.findFirst({
        where: {
            id: contentId,
            webProject: {
                companyId: user.companyId
            }
        }
    })

    if (!content) {
        throw new Error('Content not found or access denied')
    }

    // Onayla
    await prisma.generatedContent.update({
        where: { id: contentId },
        data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: user.email || session.user.id,
        }
    })

    return { success: true }
}, { checkCsrf: true })
