import { getProjectById } from '@/features/auth/actions/portal'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Plus } from 'lucide-react'
import { BlogPostList } from '@/features/content/components/portal/BlogPostList'

export default async function BlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProjectById(id)
    if (!project) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href={`/portal/projects/${id}`}
                        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Projeye Dön
                    </Link>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-brand-600" />
                        Blog Yönetimi
                    </h1>
                    <p className="text-neutral-500 mt-1">{project.name}</p>
                </div>
                <Link
                    href={`/portal/projects/${id}/blog/new`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Yazı
                </Link>
            </div>

            <BlogPostList projectId={id} />
        </div>
    )
}
