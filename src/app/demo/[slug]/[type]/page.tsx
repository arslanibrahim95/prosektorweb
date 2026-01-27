import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { DynamicPageRenderer } from '@/features/projects/components/DynamicPageRenderer'
import { ContentType } from '@prisma/client'

export const dynamic = 'force-dynamic'

const TYPE_MAP: Record<string, ContentType> = {
    'about': 'ABOUT',
    'services': 'SERVICES',
    'contact': 'CONTACT',
    'faq': 'FAQ',
    'blog': 'BLOG'
}

export default async function DemoSubPage({
    params
}: {
    params: Promise<{ slug: string, type: string }>
}) {
    const { slug, type } = await params
    const contentType = TYPE_MAP[type.toLowerCase()]

    if (!contentType) notFound()

    const project = await prisma.webProject.findUnique({
        where: { slug },
        include: {
            company: true,
            generatedContents: {
                where: { contentType: contentType },
                take: 1
            }
        }
    })

    if (!project) notFound()

    const pageContent = project.generatedContents[0]
    const companyName = project.company.name || project.name

    if (!pageContent) {
        return (
            <div className="py-32 text-center">
                <h1 className="text-4xl font-bold mb-4 uppercase">{type}</h1>
                <p className="text-neutral-500">Bu sayfanın içeriği henüz hazırlanmamış.</p>
            </div>
        )
    }

    return (
        <DynamicPageRenderer
            title={pageContent.title || companyName}
            htmlContent={pageContent.content}
            companyName={companyName}
            contentType={contentType}
        />
    )
}
