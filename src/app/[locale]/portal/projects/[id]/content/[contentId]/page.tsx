import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { ContentApprovalButtons } from './ContentApprovalButtons'
import { ContentEditorWrapper } from './ContentEditorWrapper'

interface ContentDetailPageProps {
    params: Promise<{ id: string; contentId: string }>
}

const contentTypeLabels: Record<string, string> = {
    HOMEPAGE: 'Anasayfa',
    ABOUT: 'Hakkımızda',
    SERVICES: 'Hizmetler',
    CONTACT: 'İletişim',
    FAQ: 'SSS',
    BLOG: 'Blog',
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    DRAFT: { label: 'Onay Bekliyor', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    APPROVED: { label: 'Onaylandı', color: 'text-green-700', bgColor: 'bg-green-100' },
    REJECTED: { label: 'Reddedildi', color: 'text-red-700', bgColor: 'bg-red-100' },
    PUBLISHED: { label: 'Yayında', color: 'text-blue-700', bgColor: 'bg-blue-100' },
}

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
    const { id, contentId } = await params
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
    })

    if (!user?.companyId) {
        redirect('/portal')
    }

    // İçeriği ve projeyi al
    const content = await prisma.generatedContent.findFirst({
        where: {
            id: contentId,
            webProject: {
                id,
                companyId: user.companyId
            }
        },
        include: {
            webProject: true
        }
    })

    if (!content) {
        notFound()
    }

    const status = statusConfig[content.status] || statusConfig.DRAFT

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/portal/projects/${id}`}
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 font-serif">
                            {contentTypeLabels[content.contentType] || content.contentType}
                        </h1>
                        <p className="text-neutral-500">{content.webProject.name}</p>
                    </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${status.bgColor} ${status.color}`}>
                    {status.label}
                </span>
            </div>

            {/* Meta Info */}
            {(content.metaTitle || content.metaDescription) && (
                <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4">
                    <h3 className="text-sm font-medium text-neutral-500 mb-2">SEO Bilgileri</h3>
                    {content.metaTitle && (
                        <p className="font-medium text-neutral-900 mb-1">{content.metaTitle}</p>
                    )}
                    {content.metaDescription && (
                        <p className="text-sm text-neutral-600">{content.metaDescription}</p>
                    )}
                </div>
            )}

            {/* Content Editor */}
            <ContentEditorWrapper
                contentId={contentId}
                initialContent={content.content}
                projectId={id}
                status={content.status}
            />

            {/* Approval Actions */}
            {content.status === 'DRAFT' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="font-bold text-yellow-900 mb-2">Bu içeriği onaylıyor musunuz?</h3>
                    <p className="text-sm text-yellow-700 mb-4">
                        Onayladığınız içerikler sitenizde yayınlanacaktır. Değişiklik gerekirse reddedin ve destek talebi oluşturun.
                    </p>
                    <ContentApprovalButtons contentId={contentId} projectId={id} />
                </div>
            )}

            {/* Generation Info */}
            <div className="text-sm text-neutral-500 flex items-center gap-4">
                <span>Model: {content.modelUsed}</span>
                <span>•</span>
                <span>Oluşturulma: {new Date(content.generatedAt).toLocaleDateString('tr-TR')}</span>
                {content.approvedAt && (
                    <>
                        <span>•</span>
                        <span>Onay: {new Date(content.approvedAt).toLocaleDateString('tr-TR')}</span>
                    </>
                )}
            </div>
        </div>
    )
}
