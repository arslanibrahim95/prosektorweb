import { getDomainById } from '@/actions/domain'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Globe,
    Building2,
    Server,
    Shield,
    Calendar,
    Edit,
    Trash2,
    Plus
} from 'lucide-react'
import { DnsRecordsSection } from '@/components/admin/domain/DnsRecordsSection'

interface DomainDetailPageProps {
    params: Promise<{ id: string }>
}

const statusConfig: Record<string, { label: string, color: string }> = {
    ACTIVE: { label: 'Aktif', color: 'bg-green-100 text-green-700' },
    PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-700' },
    EXPIRED: { label: 'Süresi Dolmuş', color: 'bg-red-100 text-red-700' },
    SUSPENDED: { label: 'Askıda', color: 'bg-neutral-100 text-neutral-600' },
}

export default async function DomainDetailPage({ params }: DomainDetailPageProps) {
    const { id } = await params
    const domain = await getDomainById(id)

    if (!domain) {
        notFound()
    }

    const status = statusConfig[domain.status] || statusConfig.PENDING

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/domains"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                            <Globe className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-neutral-900 font-serif">{domain.name}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.color}`}>
                                    {status.label}
                                </span>
                                {domain.sslEnabled && (
                                    <span className="flex items-center gap-1 text-green-600 text-sm">
                                        <Shield className="w-4 h-4" />
                                        SSL
                                    </span>
                                )}
                            </div>
                            {domain.company && (
                                <Link href={`/admin/companies/${domain.company.id}`} className="text-neutral-500 hover:text-brand-600 flex items-center gap-1 mt-1">
                                    <Building2 className="w-4 h-4" />
                                    {domain.company.name}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Domain Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Domain Bilgileri</h2>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-neutral-500 mb-1">Uzantı</div>
                                <div className="font-medium">{domain.extension}</div>
                            </div>
                            {domain.registrar && (
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Registrar</div>
                                    <div className="font-medium">{domain.registrar}</div>
                                </div>
                            )}
                            {domain.serverIp && (
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Sunucu IP</div>
                                    <div className="font-mono text-brand-600 flex items-center gap-2">
                                        <Server className="w-4 h-4" />
                                        {domain.serverIp}
                                    </div>
                                </div>
                            )}
                            {domain.registeredAt && (
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Kayıt Tarihi</div>
                                    <div className="font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-neutral-400" />
                                        {new Date(domain.registeredAt).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            )}
                            {domain.expiresAt && (
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Bitiş Tarihi</div>
                                    <div className="font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-neutral-400" />
                                        {new Date(domain.expiresAt).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            )}
                            {domain.notes && (
                                <div>
                                    <div className="text-sm text-neutral-500 mb-1">Notlar</div>
                                    <div className="text-neutral-700">{domain.notes}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4">Hızlı İşlemler</h2>
                        <div className="space-y-2">
                            <a
                                href={`https://${domain.name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-4 py-3 bg-brand-50 text-brand-700 rounded-xl hover:bg-brand-100 transition-colors"
                            >
                                <Globe className="w-5 h-5" />
                                Siteyi Ziyaret Et
                            </a>
                            <button className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-50 text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors">
                                <Edit className="w-5 h-5" />
                                Düzenle
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right - DNS Records */}
                <div className="lg:col-span-2">
                    <DnsRecordsSection records={domain.dnsRecords} domainId={domain.id} serverIp={domain.serverIp || ''} />
                </div>
            </div>
        </div>
    )
}
