import { prisma } from '@/server/db'
import Link from 'next/link'
import { FileText, Plus, Eye, Edit, Calendar, Tag } from 'lucide-react'

export default async function BlogAdminPage() {
    let posts: any[] = []
    let error = false

    try {
        posts = await prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                category: {
                    select: { name: true, slug: true }
                }
            }
        })
    } catch (e) {
        console.error('Blog posts fetch error:', e)
        error = true
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Blog Yönetimi</h1>
                    <p className="text-neutral-500 mt-1">Toplam {posts.length} yazı</p>
                </div>
                <Link
                    href="/admin/blog/new"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Yazı
                </Link>
            </div>

            {/* Posts List */}
            {error ? (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center text-red-600">
                    Blog yazıları yüklenirken hata oluştu.
                </div>
            ) : posts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">Henüz Yazı Yok</h3>
                    <p className="text-neutral-500">İlk blog yazınızı oluşturun.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Başlık</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Kategori</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Tarih</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Durum</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {posts.map((post) => (
                                <tr key={post.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-neutral-900 max-w-md truncate">
                                            {post.title}
                                        </div>
                                        <div className="text-sm text-neutral-500 truncate max-w-md">
                                            /{post.slug}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.category ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand-50 text-brand-700 rounded-lg text-xs font-medium">
                                                <Tag className="w-3 h-3" />
                                                {post.category.name}
                                            </span>
                                        ) : (
                                            <span className="text-neutral-400 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-neutral-600 flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-neutral-400" />
                                            {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${post.published
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-neutral-100 text-neutral-600'
                                            }`}>
                                            {post.published ? 'Yayında' : 'Taslak'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={`/blog/${post.slug}`}
                                                target="_blank"
                                                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                                title="Görüntüle"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </a>
                                            <Link
                                                href={`/admin/blog/${post.id}/edit`}
                                                className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
