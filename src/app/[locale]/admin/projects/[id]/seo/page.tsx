import { getProject } from '@/features/projects/actions/projects'
import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Search } from 'lucide-react'
import { SeoEditor } from '@/features/seo/components/portal/SeoEditor'

export default async function AdminSeoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProject(id) as any
    if (!project) notFound()

    const contentPages = await prisma.generatedContent.findMany({
        where: { webProjectId: id, contentType: { not: 'DESIGN' } },
        orderBy: { contentType: 'asc' },
    })

    const contentLabels: Record<string, string> = {
        HOMEPAGE: 'Anasayfa',
        ABOUT: 'Hakkımızda',
        SERVICES: 'Hizmetler',
        CONTACT: 'İletişim',
        FAQ: 'SSS',
        BLOG: 'Blog',
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/projects/${id}`}
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                        <Search className="w-6 h-6 text-amber-600" />
                        SEO Ayarları
                    </h1>
                    <p className="text-neutral-500 mt-0.5">{project.name} — {project.company?.name}</p>
                </div>
            </div>

            {contentPages.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400">
                    Henüz düzenlenecek sayfa içeriği yok. Önce içerik üretimi yapın.
                </div>
            ) : (
                <div className="space-y-6">
                    {contentPages.map((content: any) => (
                        <div key={content.id} className="bg-white border border-neutral-200 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-neutral-900 mb-4">
                                {contentLabels[content.contentType] || content.contentType}
                            </h2>
                            <SeoEditor
                                contentId={content.id}
                                initialTitle={content.metaTitle}
                                initialDescription={content.metaDescription}
                                pageTitle={content.title || contentLabels[content.contentType] || ''}
                                siteUrl={project.siteUrl || undefined}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
