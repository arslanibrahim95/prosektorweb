import Link from 'next/link'
import { ChevronLeft, Construction } from 'lucide-react'

export default function NewBlogPostPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/blog"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Blog Yazısı</h1>
                    <p className="text-neutral-500 mt-1">İçerik oluştur ve yayınla</p>
                </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Geliştirme Aşamasında</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                    Blog yazısı editörü yakında aktif olacak. Şu an için mevcut yazıları görüntüleyebilirsiniz.
                </p>
            </div>
        </div>
    )
}
