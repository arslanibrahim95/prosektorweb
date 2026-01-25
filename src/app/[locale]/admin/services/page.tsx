import { getServices, deleteService, renewService } from '@/features/finance/actions/services'
import { Plus, RefreshCw, AlertTriangle, Calendar, Trash2 } from 'lucide-react'
import { ServiceType } from '@prisma/client'
import { PageHeader } from '@/components/admin/ui/PageHeader'
import { FilterBar } from '@/components/admin/ui/FilterBar'
import { EmptyState } from '@/components/admin/ui/EmptyState'
import { statusStyles } from '@/components/admin/ui/styles'

const typeLabels: Record<string, string> = {
    HOSTING: 'Hosting',
    DOMAIN: 'Domain',
    SEO: 'SEO',
    MAINTENANCE: 'Bakım',
    SOCIAL_MEDIA: 'Sosyal Medya',
    ADS: 'Reklam',
    OTHER: 'Diğer',
}

interface ServicesPageProps {
    searchParams: Promise<{ q?: string }>
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
    const params = await searchParams
    const query = params.q || ''

    const upcomingRenewals = await getServices({ upcoming: true }) as any
    const services = await getServices({ search: query }) as any


    return (
        <div className="space-y-8">
            <PageHeader
                title="Hizmet & Abonelikler"
                description="Hosting, domain ve diğer tekrarlayan hizmet takibi"
                action={{
                    label: "Yeni Hizmet",
                    href: "/admin/services/new",
                    icon: Plus
                }}
            />

            {/* Upcoming Renewals Alert Section - Keeping specialized look but aligning grid */}
            {upcomingRenewals.length > 0 && !query && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        Yaklaşan Yenilemeler (30 Gün)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingRenewals.map((service: any) => (
                            <div key={service.id} className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex flex-col justify-between h-full">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase">
                                            {Number(service.price).toLocaleString('tr-TR')} {service.currency}
                                        </span>
                                        <span className="text-xs text-orange-600 font-bold flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(service.renewDate).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-neutral-900 mb-1">{service.name}</h4>
                                    <p className="text-xs text-neutral-500">{service.company.name}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-neutral-100">
                                    <form action={async () => {
                                        'use server'
                                        await renewService(service.id)
                                    }}>
                                        <button className="w-full py-2 bg-orange-600 text-white rounded-lg text-xs font-bold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2">
                                            <RefreshCw className="w-3 h-3" />
                                            Yenile
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <FilterBar placeholder="Hizmet veya müşteri ara..." />

            {/* All Services List */}
            {services.length === 0 ? (
                <EmptyState
                    title="Hizmet Bulunamadı"
                    description={query ? "Arama kriterlerinize uygun hizmet bulunamadı." : "Henüz hiç hizmet eklenmemiş."}
                    icon={RefreshCw}
                    action={!query ? { label: "İlk Hizmeti Oluştur", href: "/admin/services/new" } : undefined}
                />
            ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className={statusStyles.tableHeader}>Hizmet Adı</th>
                                <th className={statusStyles.tableHeader}>Müşteri</th>
                                <th className={statusStyles.tableHeader}>Tür</th>
                                <th className={statusStyles.tableHeader}>Fiyat</th>
                                <th className={statusStyles.tableHeader}>Yenileme</th>
                                <th className={`${statusStyles.tableHeader} text-right`}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {services.map((service: any) => (
                                <tr key={service.id} className={statusStyles.tableRow}>
                                    <td className={statusStyles.tableCell}>
                                        <div className="font-medium text-neutral-900">{service.name}</div>
                                    </td>
                                    <td className={statusStyles.tableCell}>
                                        <div className="text-sm text-neutral-600">{service.company.name}</div>
                                    </td>
                                    <td className={statusStyles.tableCell}>
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${statusStyles.neutral}`}>
                                            {typeLabels[service.type] || service.type}
                                        </span>
                                    </td>
                                    <td className={statusStyles.tableCell}>
                                        <div className="font-mono text-sm text-neutral-900">
                                            {Number(service.price).toLocaleString('tr-TR')} {service.currency}
                                        </div>
                                    </td>
                                    <td className={statusStyles.tableCell}>
                                        <div className={`flex items-center gap-2 text-sm ${new Date(service.renewDate) < new Date() ? 'text-red-600 font-bold' : 'text-neutral-600'}`}>
                                            <Calendar className="w-4 h-4" />
                                            {new Date(service.renewDate).toLocaleDateString('tr-TR')}
                                            {service.isReminderSent && (
                                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded">Hatırlatıldı</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`${statusStyles.tableCell} text-right`}>
                                        <div className="flex items-center justify-end gap-2">
                                            <form action={async () => {
                                                'use server'
                                                await deleteService(service.id)
                                            }}>
                                                <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
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
