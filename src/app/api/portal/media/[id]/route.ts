import { auth } from '@/auth'
import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'
import { deleteFile } from '@/server/lib/storage'

export const DELETE = safeApi<{ success: true }, { id: string }>(async (_request, { params }) => {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const { id } = params

    // Admin can delete any media; client only their own
    if (session.user.role === 'ADMIN') {
        const asset = await prisma.mediaAsset.findUnique({ where: { id } })
        if (!asset) throw new Error('Media not found')
        await deleteFile(asset.path)
        await prisma.mediaAsset.delete({ where: { id } })
    } else {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true }
        })
        if (!user?.companyId) throw new Error('No company found')

        const asset = await prisma.mediaAsset.findFirst({
            where: { id, companyId: user.companyId }
        })
        if (!asset) throw new Error('Media not found or access denied')

        await deleteFile(asset.path)
        await prisma.mediaAsset.delete({ where: { id } })
    }

    return { success: true }
}, { checkCsrf: true })
