import { getProjectById } from '@/features/auth/actions/portal'
import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BlogPostForm } from '@/features/content/components/portal/BlogPostForm'
import { auth } from '@/auth'

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string; postId: string }> }) {
    const { id, postId } = await params
    const project = await getProjectById(id)
    if (!project) notFound()

    const session = await auth()
    if (!session?.user?.id) notFound()

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
    })

    const post = await prisma.companyBlogPost.findFirst({
        where: { id: postId, webProjectId: id, companyId: user?.companyId || '' },
        include: { coverImage: { select: { id: true, url: true, alt: true } } }
    })
    if (!post) notFound()

    const tags = Array.isArray(post.tags) ? post.tags as string[] : []

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
                <h1 className="text-2xl font-bold text-neutral-900">Blog Yazısını Düzenle</h1>
                <p className="text-neutral-500 mt-1">{post.title}</p>
            </div>

            <BlogPostForm
                projectId={id}
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
