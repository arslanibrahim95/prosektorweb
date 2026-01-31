import { getClientDomains } from '@/features/crm/actions/client-portal'
import {
    Globe, Shield, Calendar, AlertCircle, CheckCircle,
    ExternalLink, Lock, Unlock
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    ACTIVE: { label: 'Aktif', color: 'text-green-600', bgColor: 'bg-green-100' },
    PENDING: { label: 'Beklemede', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    EXPIRED: { label: 'Süresi Dolmuş', color: 'text-red-600', bgColor: 'bg-red-100' },
    SUSPENDED: { label: 'Askıda', color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
}

export default async function DomainsPage() {
    const domains = await getClientDomains()

    const today = new Date()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 font-serif">Domainlerim</h1>
                <p className="text-neutral-500 mt-1">
                    Domain kayıtlarınızı ve SSL durumlarını görüntüleyin.
                </p>
            </div>

            {/* Domains List */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6">
                    Kayıtlı Domainler ({domains.length})
                </h2>

                {domains.length > 0 ? (
                    <div className="space-y-4">
                        {domains.map((domain: any) => {
                            const config = statusConfig[domain.status] || statusConfig.PENDING
                            const expiresAt = domain.expiresAt ? new Date(domain.expiresAt) : null
                            const daysUntilExpiry = expiresAt
                                ? Math.ceil((expiresAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                                : null
                            const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0

                            return (
                                <div key={domain.id} className="p-5 bg-neutral-50 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                                <Globe className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                                                    {domain.name}
                                                    <a
                                                        href={`https://${domain.name}`}
                                                        target="_blank"
                                                        className="text-brand-600 hover:text-brand-700"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                                                        {config.label}
                                                    </span>
                                                    {domain.registrar && (
                                                        <span className="text-xs text-neutral-500">
                                                            {domain.registrar}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* SSL Status */}
                                            <div className="text-center">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-1 ${domain.sslEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                    }`}>
                                                    {domain.sslEnabled ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                                                </div>
                                                <p className="text-xs text-neutral-500">SSL</p>
                                            </div>

                                            {/* Expiry */}
                                            {expiresAt && (
                                                <div className="text-right">
                                                    <p className={`text-sm font-medium flex items-center gap-1 ${isExpiringSoon ? 'text-amber-600' : 'text-neutral-700'
                                                        }`}>
                                                        <Calendar className="w-4 h-4" />
                                                        {isExpiringSoon && <AlertCircle className="w-4 h-4" />}
                                                        {expiresAt.toLocaleDateString('tr-TR')}
                                                    </p>
                                                    <p className="text-xs text-neutral-500">Bitiş Tarihi</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Globe className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="font-bold text-neutral-900 mb-2">Kayıtlı domain yok</h3>
                        <p className="text-neutral-500 text-sm">
                            Domain kaydı için bizimle iletişime geçin.
                        </p>
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 mb-1">Domain Yönetimi</h3>
                        <p className="text-sm text-blue-700">
                            Domainlerinizin yönetimi (DNS, yönlendirme, e-posta) tarafımızca yapılmaktadır.
                            Değişiklik talepleriniz için destek talebi oluşturabilirsiniz.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
