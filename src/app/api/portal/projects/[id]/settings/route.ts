import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        // Kullanıcının firma bilgisini al
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true }
        })

        if (!user?.companyId) {
            return NextResponse.json({ error: 'No company' }, { status: 403 })
        }

        // Projeyi doğrula
        const project = await prisma.webProject.findFirst({
            where: {
                id,
                companyId: user.companyId
            }
        })

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
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

        // TODO: Sosyal medya ve çalışma saatleri için ayrı model/field gerekli
        // Şimdilik sadece temel bilgileri güncelliyoruz

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Settings update error:', error)
        return NextResponse.json(
            { error: 'Update failed' },
            { status: 500 }
        )
    }
}
