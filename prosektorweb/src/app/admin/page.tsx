import { prisma } from '@/lib/prisma'
import { FileText, MessageSquare, Layers, Eye } from 'lucide-react'

export default async function AdminDashboard() {
    // Fetch stats in parallel
    const [postsCount, messagesCount, unreadMessagesCount, categoriesCount] = await Promise.all([
        prisma.blogPost.count(),
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { read: false } }),
        prisma.blogCategory.count(),
    ])

    const stats = [
        {
            label: 'Toplam Blog Yazısı',
            value: postsCount,
            icon: FileText,
            color: 'bg-blue-50 text-blue-600'
        },
        {
            label: 'Okunmamış Mesajlar',
            value: unreadMessagesCount,
            icon: MessageSquare,
            color: 'bg-red-50 text-red-600'
        },
        {
            label: 'Toplam Kategori',
            value: categoriesCount,
            icon: Layers,
            color: 'bg-purple-50 text-purple-600'
        },
        {
            label: 'Toplam Mesaj',
            value: messagesCount,
            icon: MessageSquare,
            color: 'bg-orange-50 text-orange-600'
        }
    ]

    return (
        <div>
            <h1 className="text-2xl font-bold font-serif text-neutral-900 mb-8">Genel Bakış</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-neutral-500 mb-1">{stat.label}</div>
                            <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section could go here */}
            <div className="mt-8 p-8 bg-white rounded-2xl border border-neutral-200 shadow-sm text-center py-16">
                <div className="text-neutral-400 mb-2">Hoşgeldiniz!</div>
                <h2 className="text-xl font-bold text-neutral-900">Admin Paneline Başarılı Bir Şekilde Giriş Yaptınız</h2>
                <p className="text-neutral-500 mt-2 max-w-md mx-auto">Sol menüyü kullanarak blog yazılarını yönetebilir veya gelen mesajları kontrol edebilirsiniz.</p>
            </div>
        </div>
    )
}
