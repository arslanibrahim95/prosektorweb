import { prisma } from '@/lib/prisma'
import { FileText, MessageSquare, Layers, Eye, Users, Building, HardHat, AlertTriangle } from 'lucide-react'

export default async function AdminDashboard() {
    // Use try-catch to handle potential DB connection issues gracefully during dev
    let postsCount = 0
    let messagesCount = 0
    let companiesCount = 0
    let workplacesCount = 0
    let employeesCount = 0
    let dbError = false

    try {
        const stats = await Promise.all([
            prisma.blogPost.count(),
            prisma.contactMessage.count({ where: { read: false } }),
            prisma.company.count(),
            prisma.workplace.count(),
            prisma.employee.count(),
        ])
        postsCount = stats[0]
        messagesCount = stats[1]
        companiesCount = stats[2]
        workplacesCount = stats[3]
        employeesCount = stats[4]
    } catch (e) {
        console.error("Dashboard Stats Error:", e)
        dbError = true
    }

    const stats = [
        {
            label: 'Toplam Firma',
            value: companiesCount,
            icon: Building,
            color: 'bg-blue-50 text-blue-600',
            desc: 'Sistemdeki müşteri sayısı'
        },
        {
            label: 'Aktif İşyeri',
            value: workplacesCount,
            icon: Layers,
            color: 'bg-indigo-50 text-indigo-600',
            desc: 'Hizmet verilen nokta'
        },
        {
            label: 'Toplam Personel',
            value: employeesCount,
            icon: Users,
            color: 'bg-purple-50 text-purple-600',
            desc: 'Takip edilen çalışan'
        },
        {
            label: 'Bekleyen Mesaj',
            value: messagesCount,
            icon: MessageSquare,
            color: 'bg-orange-50 text-orange-600',
            desc: 'Okunmamış iletişim formu'
        }
    ]

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold font-serif text-neutral-900">Genel Bakış</h1>
                <div className="text-sm text-neutral-500">
                    {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {dbError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                        <span className="font-bold">Veritabanı Bağlantı Hatası:</span> İstatistikler şu an güncel olmayabilir. Lütfen veritabanı bağlantınızı kontrol edin.
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            {/* <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+%12</span> */}
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
                            <div className="text-sm font-medium text-neutral-900">{stat.label}</div>
                            <div className="text-xs text-neutral-500 mt-1">{stat.desc}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <HardHat className="w-5 h-5 text-brand-600" />
                        Hızlı İşlemler
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 rounded-xl border border-neutral-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-left group">
                            <div className="font-bold text-brand-700 group-hover:text-brand-800">Yeni Firma Ekle</div>
                            <div className="text-xs text-neutral-500 mt-1">Müşteri portföyüne ekle</div>
                        </button>
                        <button className="p-4 rounded-xl border border-neutral-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-left group">
                            <div className="font-bold text-brand-700 group-hover:text-brand-800">Yeni Personel</div>
                            <div className="text-xs text-neutral-500 mt-1">İş giriş kaydı oluştur</div>
                        </button>
                        <button className="p-4 rounded-xl border border-neutral-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-left group">
                            <div className="font-bold text-brand-700 group-hover:text-brand-800">Saha Denetimi</div>
                            <div className="text-xs text-neutral-500 mt-1">Denetim raporu başlat</div>
                        </button>
                        <button className="p-4 rounded-xl border border-neutral-100 hover:border-brand-200 hover:bg-brand-50 transition-all text-left group">
                            <div className="font-bold text-brand-700 group-hover:text-brand-800">Blog Yazısı</div>
                            <div className="text-xs text-neutral-500 mt-1">İçerik paylaş</div>
                        </button>
                    </div>
                </div>

                {/* System Status / Notifications */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                    <h3 className="text-lg font-bold text-neutral-900 mb-4">Sistem Durumu</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="flex-1 text-sm font-medium text-neutral-700">Veritabanı Bağlantısı</div>
                            <div className="text-xs text-green-600 font-bold">Aktif</div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="flex-1 text-sm font-medium text-neutral-700">API Servisleri</div>
                            <div className="text-xs text-green-600 font-bold">Çalışıyor</div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <div className="flex-1 text-sm font-medium text-neutral-700">Yedekleme (Daily)</div>
                            <div className="text-xs text-neutral-500">03:00 - Tamamlandı</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
