import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ contentId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { contentId } = await params
        const body = await request.json()
        const { content: newContent } = body

        // Kullanıcının firma bilgisini al
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true }
        })

        if (!user?.companyId) {
            return NextResponse.json({ error: 'No company' }, { status: 403 })
        }

        // İçeriği ve projeyi doğrula
        const existingContent = await prisma.generatedContent.findFirst({
            where: {
                id: contentId,
                webProject: {
                    companyId: user.companyId
                }
            }
        })

        if (!existingContent) {
            return NextResponse.json({ error: 'Content not found' }, { status: 404 })
        }

        // Güncelle
        await prisma.generatedContent.update({
            where: { id: contentId },
            data: {
                content: newContent,
                status: 'APPROVED', // Müşteri düzenlediyse onaylı sayıyoruz veya DRAFT bırakabiliriz
                approvedAt: new Date(), // Otomatik onay
                updatedAt: new Date(),
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Content update error:', error)
        return NextResponse.json(
            { error: 'Update failed' },
            { status: 500 }
        )
    }
}
