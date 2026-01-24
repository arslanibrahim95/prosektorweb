import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ contentId: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // CSRF Check
        const { checkOrigin } = await import('@/lib/csrf')
        if (!(await checkOrigin())) {
            return NextResponse.json({ error: 'Invalid Origin' }, { status: 403 })
        }

        const { contentId } = await params

        // Kullanıcının firma bilgisini al
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { companyId: true, email: true }
        })

        if (!user?.companyId) {
            return NextResponse.json({ error: 'No company' }, { status: 403 })
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
            return NextResponse.json({ error: 'Content not found' }, { status: 404 })
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

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Approve error:', error)
        return NextResponse.json(
            { error: 'Approval failed' },
            { status: 500 }
        )
    }
}
