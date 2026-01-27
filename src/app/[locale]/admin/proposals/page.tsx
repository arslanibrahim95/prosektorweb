import { getProposals } from '@/features/crm/actions/proposals'
import Link from 'next/link'
import { Plus, ArrowUpRight, FileText } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { FilterBar } from '@/components/ui/FilterBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { statusStyles } from '@/components/ui/admin-styles'

// Status Badge Helper
const statusMap: Record<string, { label: string, color: string }> = {
    DRAFT: { label: 'Taslak', color: statusStyles.neutral },
    SENT: { label: 'Gönderildi', color: statusStyles.info },
    ACCEPTED: { label: 'Onaylandı', color: statusStyles.success },
    REJECTED: { label: 'Reddedildi', color: statusStyles.error },
    EXPIRED: { label: 'Süresi Doldu', color: statusStyles.warning },
}

interface ProposalsPageProps {
    searchParams: Promise<{ q?: string }>
}

export default async function ProposalsPage({ searchParams }: ProposalsPageProps) {
    const params = await searchParams
    const query = params.q || ''

    // Use server-side search via getProposals
    const { proposals } = await getProposals({ search: query })


    return (
        <div className="space-y-8">
            <PageHeader
                title="Teklifler"
                description="Müşterilere sunulan fiyat teklifleri"
                action={{
                    label: "Yeni Teklif",
                    href: "/admin/proposals/new",
                    icon: Plus
                }}
            />

            <FilterBar placeholder="Teklif veya müşteri ara..." />

            {/* List */}
            {proposals.length === 0 ? (
                <EmptyState
                    title="Teklif Bulunamadı"
                    description={query ? "Arama kriterlerinize uygun teklif bulunamadı." : "Henüz hiç teklif oluşturulmamış."}
                    icon={FileText}
                    action={!query ? { label: "İlk Teklifi Oluştur", href: "/admin/proposals/new" } : undefined}
                />
            ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className={statusStyles.tableHeader}>Konu</th>
                                <th className={statusStyles.tableHeader}>Müşteri</th>
                                <th className={statusStyles.tableHeader}>Tutar</th>
                                <th className={statusStyles.tableHeader}>Durum</th>
                                <th className={`${statusStyles.tableHeader} text-right`}>İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {proposals.map((proposal) => {
                                const status = statusMap[proposal.status] || statusMap.DRAFT
                                return (
                                    <tr key={proposal.id} className={statusStyles.tableRow}>
                                        <td className={statusStyles.tableCell}>
                                            <div className="font-bold text-neutral-900">{proposal.subject}</div>
                                            <div className="text-xs text-neutral-400 mt-1">{new Date(proposal.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className={statusStyles.tableCell}>
                                            <div className="font-medium text-neutral-700">{proposal.company.name}</div>
                                        </td>
                                        <td className={statusStyles.tableCell}>
                                            <div className="font-mono font-medium text-neutral-900">
                                                {Number(proposal.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                            </div>
                                        </td>
                                        <td className={statusStyles.tableCell}>
                                            <span className={`${statusStyles.badge} ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className={`${statusStyles.tableCell} text-right`}>
                                            <Link
                                                href={`/admin/proposals/${proposal.id}`}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 text-neutral-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
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
