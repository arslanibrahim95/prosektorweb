import { getProject } from '@/features/projects/actions/projects'
import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BlogPostForm } from '@/features/content/components/portal/BlogPostForm'

export default async function AdminEditBlogPostPage({ params }: { params: Promise<{ id: string; postId: string }> }) {
    const { id, postId } = await params
    const project = await getProject(id) as any
    if (!project) notFound()

    const post = await prisma.companyBlogPost.findFirst({
        where: { id: postId, webProjectId: id },
        include: { coverImage: { select: { id: true, url: true, alt: true } } }
    })
    if (!post) notFound()

    const tags = Array.isArray(post.tags) ? post.tags as string[] : []

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/projects/${id}/blog`}
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Blog Yazısını Düzenle</h1>
                    <p className="text-neutral-500 mt-0.5">{post.title}</p>
                </div>
            </div>

            <BlogPostForm
                projectId={id}
                companyId={project.companyId}
                basePath="/admin/projects"
                initialData={{
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt || '',
                    content: post.content,
                    coverImageId: post.coverImageId,
                    coverImageUrl: post.coverImage?.url || null,
                    tags,
                    metaTitle: post.metaTitle || '',
                    metaDescription: post.metaDescription || '',
                    published: post.published,
                }}
            />
        </div>
    )
}
