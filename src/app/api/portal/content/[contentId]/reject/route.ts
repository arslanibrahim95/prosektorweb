import { auth } from '@/auth'
import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'

export const POST = safeApi<{ success: true }, { contentId: string }>(async (request, { params }) => {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    const { contentId } = params

    // Kullanıcının firma bilgisini al
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
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

    // Reddet
    await prisma.generatedContent.update({
        where: { id: contentId },
        data: {
            status: 'REJECTED',
        }
    })

    return { success: true }
}, { checkCsrf: true })
