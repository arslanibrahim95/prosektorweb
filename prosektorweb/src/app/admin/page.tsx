import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
    Building2,
    Users,
    Layers,
    MessageSquare,
    FileText,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Clock,
    ArrowRight,
    Plus,
    Eye,
    CheckCircle2,
    XCircle,
    Activity,
    Server,
    Database,
    Globe,
    Shield
} from 'lucide-react'

export default async function SuperAdminDashboard() {
    // Fetch all stats with error handling
    let stats = {
        companies: 0,
        workplaces: 0,
        employees: 0,
        unreadMessages: 0,
        totalMessages: 0,
        blogPosts: 0,
        // recentCompanies: [] as any[],
        // recentMessages: [] as any[],
    }
    let dbError = false
    let dbStatus = 'connected'

    try {
        const [companies, workplaces, employees, unreadMessages, totalMessages, blogPosts] = await Promise.all([
            prisma.company.count(),
            prisma.workplace.count(),
            prisma.employee.count(),
            prisma.contactMessage.count({ where: { read: false } }),
            prisma.contactMessage.count(),
            prisma.blogPost.count(),
        ])

        stats = {
            companies,
            workplaces,
            employees,
            unreadMessages,
            totalMessages,
            blogPosts,
        }
    } catch (e) {
        console.error("Dashboard Stats Error:", e)
        dbError = true
        dbStatus = 'disconnected'
    }

    // Yüzdelik hesaplamaları (şimdilik mock)
    const trends = {
        companies: { value: '+12%', positive: true },
        employees: { value: '+8%', positive: true },
        messages: { value: '-5%', positive: false },
    }

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Super Admin Dashboard</h1>
                    <p className="text-neutral-500 mt-1">Sistem genelinde genel bakış ve yönetim merkezi</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-neutral-500">
                        {new Date().toLocaleDateString('tr-TR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                </div>
            </div>

            {/* Database Error Alert */}
            {dbError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-red-800">Veritabanı Bağlantı Hatası</h3>
                        <p className="text-sm text-red-600">Veritabanına erişilemiyor. İstatistikler güncel olmayabilir.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        Yeniden Dene
                    </button>
                </div>
            )}

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Firmalar */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Building2 className="w-7 h-7 text-white" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${trends.companies.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {trends.companies.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {trends.companies.value}
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-neutral-900 mb-1">{stats.companies}</div>
                    <div className="text-sm text-neutral-500 mb-4">Toplam Firma</div>
                    <Link href="/admin/companies" className="flex items-center gap-2 text-sm text-blue-600 font-medium group-hover:gap-3 transition-all">
                        Detayları Gör <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* İşyerleri */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Layers className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-neutral-900 mb-1">{stats.workplaces}</div>
                    <div className="text-sm text-neutral-500 mb-4">Aktif İşyeri</div>
                    <Link href="/admin/workplaces" className="flex items-center gap-2 text-sm text-indigo-600 font-medium group-hover:gap-3 transition-all">
                        Detayları Gör <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Çalışanlar */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <Users className="w-7 h-7 text-white" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm font-medium ${trends.employees.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {trends.employees.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {trends.employees.value}
                        </div>
                    </div>
                    <div className="text-4xl font-bold text-neutral-900 mb-1">{stats.employees}</div>
                    <div className="text-sm text-neutral-500 mb-4">Toplam Çalışan</div>
                    <Link href="/admin/employees" className="flex items-center gap-2 text-sm text-purple-600 font-medium group-hover:gap-3 transition-all">
                        Detayları Gör <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Mesajlar */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <MessageSquare className="w-7 h-7 text-white" />
                        </div>
                        {stats.unreadMessages > 0 && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full animate-pulse">
                                {stats.unreadMessages} Yeni
                            </span>
                        )}
                    </div>
                    <div className="text-4xl font-bold text-neutral-900 mb-1">{stats.totalMessages}</div>
                    <div className="text-sm text-neutral-500 mb-4">Toplam Mesaj</div>
                    <Link href="/admin/messages" className="flex items-center gap-2 text-sm text-orange-600 font-medium group-hover:gap-3 transition-all">
                        Mesajları Oku <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions - Spans 2 columns */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-neutral-900">Hızlı İşlemler</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="/admin/companies/new" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-neutral-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-500 transition-colors">
                                <Plus className="w-6 h-6 text-blue-600 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-neutral-700 group-hover:text-brand-700">Yeni Firma</span>
                        </Link>
                        <Link href="/admin/employees/new" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-neutral-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-500 transition-colors">
                                <Plus className="w-6 h-6 text-purple-600 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-neutral-700 group-hover:text-brand-700">Yeni Çalışan</span>
                        </Link>
                        <Link href="/admin/blog/new" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-neutral-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-500 transition-colors">
                                <FileText className="w-6 h-6 text-green-600 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-neutral-700 group-hover:text-brand-700">Blog Yazısı</span>
                        </Link>
                        <Link href="/admin/messages" className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-neutral-200 hover:border-brand-500 hover:bg-brand-50 transition-all group">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-500 transition-colors">
                                <Eye className="w-6 h-6 text-orange-600 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-bold text-neutral-700 group-hover:text-brand-700">Mesajları Gör</span>
                        </Link>
                    </div>
                </div>


                {/* Hızlı İşlemler */}
                <div>
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4">Hızlı İşlemler</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Link href="/admin/companies/new" className="bg-white p-4 rounded-2xl border border-neutral-100 hover:border-brand-200 flex flex-col items-center justify-center gap-3 py-8 group transition-all hover:shadow-lg">
                            <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-neutral-700">Yeni Firma</span>
                        </Link>
                        <Link href="/admin/projects/new" className="bg-white p-4 rounded-2xl border border-neutral-100 hover:border-brand-200 flex flex-col items-center justify-center gap-3 py-8 group transition-all hover:shadow-lg">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-neutral-700">Yeni Proje</span>
                        </Link>
                        <Link href="/admin/blog/new" className="bg-white p-4 rounded-2xl border border-neutral-100 hover:border-brand-200 flex flex-col items-center justify-center gap-3 py-8 group transition-all hover:shadow-lg">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-neutral-700">Blog Yazısı</span>
                        </Link>
                        <Link href="/admin/messages" className="bg-white p-4 rounded-2xl border border-neutral-100 hover:border-brand-200 flex flex-col items-center justify-center gap-3 py-8 group transition-all hover:shadow-lg">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                <Eye className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold text-neutral-700">Mesajları Gör</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* System Status - Left Column */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 lg:col-span-1">
                        <div className="flex items-center justify-between mb-6">

                            <h2 className="text-xl font-bold text-neutral-900">Sistem Durumu</h2>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Tümü Aktif
                            </span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Database className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-neutral-900">Veritabanı</div>
                                    <div className="text-xs text-neutral-500">MySQL / MariaDB</div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Server className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-neutral-900">API Servisi</div>
                                    <div className="text-xs text-neutral-500">Next.js Server</div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-neutral-900">Web Sitesi</div>
                                    <div className="text-xs text-neutral-500">prosektorweb.com</div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-neutral-900">SSL Sertifikası</div>
                                    <div className="text-xs text-neutral-500">Let's Encrypt</div>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Content Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Blog Stats */}
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <FileText className="w-8 h-8 opacity-80" />
                            <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">İçerik</span>
                        </div>
                        <div className="text-4xl font-bold mb-1">{stats.blogPosts}</div>
                        <div className="text-emerald-100 mb-4">Blog Yazısı</div>
                        <div className="text-sm text-emerald-100 opacity-80">
                            Sitede yayında olan toplam içerik sayısı
                        </div>
                    </div>

                    {/* Activity Feed Placeholder */}
                    <div className="md:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-neutral-900">Son Aktiviteler</h3>
                            <button className="text-sm text-brand-600 font-medium hover:underline">Tümünü Gör</button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-neutral-900">Sistem başlatıldı</div>
                                    <div className="text-xs text-neutral-500">Dashboard yüklendi ve veritabanı bağlandı</div>
                                </div>
                                <span className="text-xs text-neutral-400">Az önce</span>
                            </div>
                            <div className="flex items-center justify-center py-8 text-neutral-400">
                                <div className="text-center">
                                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Henüz kayıtlı aktivite yok</p>
                                    <p className="text-xs mt-1">Firma ve çalışan ekledikçe burada görünecek</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )
}
