import { getProjectById } from '@/features/auth/actions/portal'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BlogPostForm } from '@/features/content/components/portal/BlogPostForm'

export default async function NewBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const project = await getProjectById(id)
    if (!project) notFound()

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/portal/projects/${id}/blog`}
                    className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Blog Listesi
                </Link>
                <h1 className="text-2xl font-bold text-neutral-900">Yeni Blog Yazısı</h1>
                <p className="text-neutral-500 mt-1">{project.name}</p>
            </div>

            <BlogPostForm projectId={id} />
        </div>
    )
}
