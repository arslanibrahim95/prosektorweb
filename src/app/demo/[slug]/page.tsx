import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import { DynamicPageRenderer } from '@/features/projects/components/DynamicPageRenderer'

export const dynamic = 'force-dynamic'

export default async function InstantDemoPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const project = await prisma.webProject.findUnique({
        where: { slug },
        include: {
            company: true,
            generatedContents: {
                where: { contentType: 'HOMEPAGE' },
                take: 1
            }
        }
    })

    if (!project) notFound()

    const homeContent = project.generatedContents[0]
    const companyName = project.company.name || project.name

    if (!homeContent) {
        return (
            <div className="py-32 text-center">
                <h1 className="text-4xl font-bold mb-4">Hoş Geldiniz</h1>
                <p className="text-neutral-500">Bu sitenin içeriği henüz hazırlanmamış.</p>
            </div>
        )
    }

    return (
        <DynamicPageRenderer
            title={homeContent.title || companyName}
            htmlContent={homeContent.content}
            companyName={companyName}
            contentType="HOMEPAGE"
        />
    )
}
