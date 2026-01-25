import { getDomains, getDomainStats } from '@/features/projects/actions/domains'
import Link from 'next/link'
import {
    Globe,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Settings,
    Building2,
    Server,
    Shield,
    Calendar
} from 'lucide-react'

interface DomainsPageProps {
    searchParams: Promise<{ q?: string, search?: string }>
}

const statusConfig: Record<string, { label: string, color: string }> = {
    ACTIVE: { label: 'Aktif', color: 'bg-green-100 text-green-700' },
    PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
    EXPIRED: { label: 'Süresi Dolmuş', color: 'bg-red-100 text-red-700' },
    SUSPENDED: { label: 'Askıda', color: 'bg-neutral-100 text-neutral-600' },
}

export default async function DomainsPage({ searchParams }: DomainsPageProps) {
    const params = await searchParams
    const searchQuery = params.q || params.search || ''

    const [domainsData, stats] = await Promise.all([
        getDomains(1, 100, searchQuery), // TODO: Implement real pagination in UI
        getDomainStats(),
    ])

    const { data: domains } = domainsData

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Domain Yönetimi</h1>
                    <p className="text-neutral-500 mt-1">Kayıtlı domainler ve DNS yönetimi</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/domains/settings"
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        API Ayarları
                    </Link>
                    <Link
                        href="/admin/domains/new"
                        className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                    >
                        <Plus className="w-5 h-5" />
                        Domain Ekle
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Toplam</span>
                        <Globe className="w-4 h-4 text-brand-500" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Aktif</span>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Beklemede</span>
                        <Clock className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Yakında Bitiyor</span>
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{stats.expiringSoon}</div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <form className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="Domain ara..."
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                    >
                        Ara
                    </button>
                </form>
            </div>

            {/* Domains List */}
            {domains.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                    <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Globe className="w-10 h-10 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Henüz Domain Yok</h3>
                    <p className="text-neutral-500 max-w-md mx-auto mb-6">
                        Müşterileriniz için yönetilen domain ekleyin.
                    </p>
                    <Link
                        href="/admin/domains/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        İlk Domain'i Ekle
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Domain</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Firma</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Sunucu IP</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-neutral-500 uppercase">DNS</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-neutral-500 uppercase">SSL</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Durum</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Bitiş</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {domains.map((domain) => {
                                const status = statusConfig[domain.status] || statusConfig.PENDING
                                return (
                                    <tr key={domain.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/admin/domains/${domain.id}`} className="group">
                                                <div className="font-bold text-neutral-900 group-hover:text-brand-600 flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-brand-500" />
                                                    {domain.name}
                                                </div>
                                                {domain.registrar && (
                                                    <div className="text-xs text-neutral-400">{domain.registrar}</div>
                                                )}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            {domain.company ? (
                                                <Link href={`/admin/companies/${domain.company.id}`} className="text-neutral-600 hover:text-brand-600 flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    {domain.company.name}
                                                </Link>
                                            ) : (
                                                <span className="text-neutral-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {domain.serverIp ? (
                                                <span className="font-mono text-sm text-neutral-600 flex items-center gap-1">
                                                    <Server className="w-4 h-4" />
                                                    {domain.serverIp}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                                {domain._count.dnsRecords}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {domain.sslEnabled ? (
                                                <Shield className="w-5 h-5 text-green-500 mx-auto" />
                                            ) : (
                                                <Shield className="w-5 h-5 text-neutral-300 mx-auto" />
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {domain.expiresAt ? (
                                                <span className="text-sm text-neutral-600 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(domain.expiresAt).toLocaleDateString('tr-TR')}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
