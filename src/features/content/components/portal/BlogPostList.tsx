'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Trash2, Eye, EyeOff, Plus } from 'lucide-react'

interface BlogPostListProps {
    projectId: string
    basePath?: string
}

export function BlogPostList({ projectId, basePath = '/portal/projects' }: BlogPostListProps) {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/portal/projects/${projectId}/blog`)
                const json = await res.json()
                if (json.success) setPosts(json.data)
            } finally {
                setLoading(false)
            }
        })()
    }, [projectId])

    const handleDelete = async (postId: string) => {
        if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) return
        const res = await fetch(`/api/portal/projects/${projectId}/blog/${postId}`, { method: 'DELETE' })
        const json = await res.json()
        if (json.success) {
            setPosts(prev => prev.filter(p => p.id !== postId))
        }
    }

    if (loading) {
        return <div className="flex items-center justify-center py-16 text-neutral-400">Yükleniyor...</div>
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <FileText className="w-16 h-16 mb-3" />
                <span className="text-lg">Henüz blog yazısı yok</span>
                <Link
                    href={`${basePath}/${projectId}/blog/new`}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
                >
                    <Plus className="w-4 h-4" />
                    İlk Yazınızı Oluşturun
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {posts.map(post => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {post.coverImage?.url ? (
                            <img src={post.coverImage.url} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                            <div className="w-16 h-12 bg-neutral-100 rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-neutral-400" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <Link
                                href={`${basePath}/${projectId}/blog/${post.id}`}
                                className="font-medium text-neutral-900 hover:text-brand-600 truncate block"
                            >
                                {post.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                    post.published ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
                                }`}>
                                    {post.published ? <><Eye className="w-3 h-3" /> Yayında</> : <><EyeOff className="w-3 h-3" /> Taslak</>}
                                </span>
                                <span className="text-xs text-neutral-400">
                                    {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Link
                            href={`/portal/projects/${projectId}/blog/${post.id}`}
                            className="px-3 py-1.5 text-sm text-brand-600 hover:bg-brand-50 rounded-lg"
                        >
                            Düzenle
                        </Link>
                        <button
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
