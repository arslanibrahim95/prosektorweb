import { getProjects, getProjectStats } from '@/features/projects/actions/projects'
import Link from 'next/link'
import {
    Plus,
    Search,
    Globe,
    Building2,
    Clock,
    CheckCircle2,
    Eye,
    Pause,
    AlertCircle,
    LayoutDashboard,
    TrendingUp,
    DollarSign,
    ExternalLink
} from 'lucide-react'

interface ProjectsPageProps {
    searchParams: Promise<{ q?: string, status?: string, page?: string }>
}

const statusConfig: Record<string, { label: string, color: string, icon: any }> = {
    DRAFT: { label: 'Taslak', color: 'bg-neutral-100 text-neutral-600', icon: LayoutDashboard },
    DESIGNING: { label: 'Tasarım', color: 'bg-purple-100 text-purple-700', icon: LayoutDashboard },
    DEVELOPMENT: { label: 'Geliştirme', color: 'bg-blue-100 text-blue-700', icon: Clock },
    REVIEW: { label: 'İnceleme', color: 'bg-yellow-100 text-yellow-700', icon: Eye },
    APPROVED: { label: 'Onaylı', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    DEPLOYING: { label: 'Deploy', color: 'bg-orange-100 text-orange-700', icon: TrendingUp },
    LIVE: { label: 'Yayında', color: 'bg-emerald-100 text-emerald-700', icon: Globe },
    PAUSED: { label: 'Durduruldu', color: 'bg-neutral-100 text-neutral-600', icon: Pause },
    CANCELLED: { label: 'İptal', color: 'bg-red-100 text-red-700', icon: AlertCircle },
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
    const params = await searchParams
    const searchQuery = params.q || ''
    const statusFilter = params.status || ''

    const page = Number(params.page) || 1
    const limit = 10

    const [projectsData, stats] = await Promise.all([
        getProjects(page, limit, searchQuery, statusFilter),
        getProjectStats(),
    ])

    const { data: projects, meta } = projectsData
    const totalPages = meta.totalPages
    const currentPage = meta.page


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Web Projeleri</h1>
                    <p className="text-neutral-500 mt-1">Müşterileriniz için oluşturulan web siteleri</p>
                </div>
                <Link
                    href="/admin/projects/new"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Proje
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="text-sm text-neutral-500 mb-1">Toplam</div>
                    <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="text-sm text-neutral-500 mb-1">Taslak</div>
                    <div className="text-2xl font-bold text-neutral-500">{stats.draft}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="text-sm text-neutral-500 mb-1">Devam Eden</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="text-sm text-neutral-500 mb-1">İncelemede</div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.review}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="text-sm text-neutral-500 mb-1">Yayında</div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.live}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="text-sm text-neutral-500 mb-1">Toplam Gelir</div>
                    <div className="text-2xl font-bold text-green-600">₺{stats.totalRevenue.toLocaleString('tr-TR')}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="text-sm text-neutral-500 mb-1">Bekleyen</div>
                    <div className="text-2xl font-bold text-orange-600">₺{stats.pendingPayment.toLocaleString('tr-TR')}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <form className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="Proje veya firma ara..."
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <select
                        name="status"
                        defaultValue={statusFilter}
                        className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="">Tüm Durumlar</option>
                        <option value="DRAFT">Taslak</option>
                        <option value="DESIGNING">Tasarım</option>
                        <option value="DEVELOPMENT">Geliştirme</option>
                        <option value="REVIEW">İnceleme</option>
                        <option value="LIVE">Yayında</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
                    >
                        Filtrele
                    </button>
                </form>
            </div>

            {/* Projects List */}
            {projects.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                    <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-10 h-10 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Henüz Proje Yok</h3>
                    <p className="text-neutral-500 max-w-md mx-auto mb-6">
                        Müşterileriniz için web sitesi projeleri oluşturun.
                    </p>
                    <Link
                        href="/admin/projects/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
                    >
                        <Plus className="w-5 h-5" />
                        İlk Projeyi Oluştur
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid gap-4">
                        {projects.map((project) => {
                            const status = statusConfig[project.status] || statusConfig.DRAFT
                            const StatusIcon = status.icon
                            return (
                                <Link
                                    key={project.id}
                                    href={`/admin/projects/${project.id}`}
                                    className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-brand-300 hover:shadow-lg transition-all group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.color}`}>
                                                <StatusIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">
                                                    {project.name}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-neutral-500 mt-1">
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="w-4 h-4" />
                                                        {project.company.name}
                                                    </span>
                                                    {project.domain && (
                                                        <span className="flex items-center gap-1">
                                                            <Globe className="w-4 h-4" />
                                                            {project.domain.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {project.price && (
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-neutral-900">
                                                        ₺{project.price.toNumber().toLocaleString('tr-TR')}
                                                    </div>
                                                    <div className={`text-xs font-medium ${project.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                                                        {project.isPaid ? 'Ödendi' : 'Bekliyor'}
                                                    </div>
                                                </div>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.color}`}>
                                                {status.label}
                                            </span>
                                            {project.siteUrl && (
                                                <a
                                                    href={project.siteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-8">
                            {currentPage > 1 && (
                                <Link
                                    href={{ query: { ...params, page: currentPage - 1 } }}
                                    className="px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600"
                                >
                                    Önceki
                                </Link>
                            )}
                            <div className="px-4 py-2 text-neutral-500">
                                Sayfa {currentPage} / {totalPages}
                            </div>
                            {currentPage < totalPages && (
                                <Link
                                    href={{ query: { ...params, page: currentPage + 1 } }}
                                    className="px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600"
                                >
                                    Sonraki
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
