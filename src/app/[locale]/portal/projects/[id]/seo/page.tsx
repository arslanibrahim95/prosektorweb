import { getProjectById } from '@/features/auth/actions/portal'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { SeoEditor } from '@/features/seo/components/portal/SeoEditor'

export default async function SeoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProjectById(id)
    if (!project) notFound()

    const contentPages = (project.generatedContents || []).filter(
        (c: any) => c.contentType !== 'DESIGN'
    )

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
            <div>
                <Link
                    href={`/portal/projects/${id}`}
                    className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Projeye Dön
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                    <Search className="w-6 h-6 text-brand-600" />
                    SEO Ayarları
                </h1>
                <p className="text-neutral-500 mt-1">{project.name}</p>
            </div>

            {contentPages.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400">
                    Henüz düzenlenecek sayfa içeriği yok.
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
