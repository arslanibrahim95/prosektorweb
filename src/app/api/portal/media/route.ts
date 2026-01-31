import { auth } from '@/auth'
import { prisma } from '@/server/db'
import { safeApi } from '@/shared/lib/safe-api'
import { NextRequest } from 'next/server'
import { MediaCategory } from '@prisma/client'

export const GET = safeApi(async (request: NextRequest) => {
    const session = await auth()
    if (!session?.user?.id) throw new Error('Unauthorized')

    const { searchParams } = request.nextUrl
    const category = searchParams.get('category') as MediaCategory | null
    const companyIdParam = searchParams.get('companyId')

    let companyId: string
    if (session.user.role === 'ADMIN') {
        if (!companyIdParam) throw new Error('companyId query param required for admin')
        companyId = companyIdParam
    } else {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true }
        })
        if (!user?.companyId) throw new Error('No company found')
        companyId = user.companyId
    }

    const where: any = { companyId }
    if (category) where.category = category

    const assets = await prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    })

    return assets
})
