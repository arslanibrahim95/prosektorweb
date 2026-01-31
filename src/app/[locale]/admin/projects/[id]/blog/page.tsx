import { getProject } from '@/features/projects/actions/projects'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Plus } from 'lucide-react'
import { BlogPostList } from '@/features/content/components/portal/BlogPostList'

export default async function AdminBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProject(id) as any
    if (!project) notFound()

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/projects/${id}`}
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-emerald-600" />
                            Blog Yönetimi
                        </h1>
                        <p className="text-neutral-500 mt-0.5">{project.name} — {project.company?.name}</p>
                    </div>
                </div>
                <Link
                    href={`/admin/projects/${id}/blog/new`}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Yazı
                </Link>
            </div>

            <BlogPostList projectId={id} basePath="/admin/projects" />
        </div>
    )
}
