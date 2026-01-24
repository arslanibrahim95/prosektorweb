import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { safeApi } from '@/lib/safe-api'

export const PUT = safeApi<{ success: true }, { id: string }>(async (request, { params }) => {
    const session = await auth()

    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    const { id } = params
    const body = await request.json()

    // Kullanıcının firma bilgisini al
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
    })

    if (!user?.companyId) {
        throw new Error('No company found for user')
    }

    // Projeyi doğrula
    const project = await prisma.webProject.findFirst({
        where: {
            id,
            companyId: user.companyId
        }
    })

    if (!project) {
        throw new Error('Project not found or access denied')
    }

    // Firma bilgilerini güncelle
    await prisma.company.update({
        where: { id: user.companyId },
        data: {
            phone: body.phone || null,
            email: body.email || null,
            address: body.address || null,
        }
    })

    return { success: true }
}, { checkCsrf: true })
