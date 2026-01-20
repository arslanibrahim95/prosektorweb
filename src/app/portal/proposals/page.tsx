import { getClientProposals } from '@/actions/clientServices'
import Link from 'next/link'
import {
    FileText, Calendar, Clock, CheckCircle, XCircle,
    ArrowRight, AlertCircle, Send
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    DRAFT: { label: 'Taslak', color: 'text-neutral-600', bgColor: 'bg-neutral-100', icon: FileText },
    SENT: { label: 'Gönderildi', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Send },
    ACCEPTED: { label: 'Onaylandı', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
    REJECTED: { label: 'Reddedildi', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
    EXPIRED: { label: 'Süresi Dolmuş', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Clock },
}

export default async function ProposalsPage() {
    const proposals = await getClientProposals()

    // Separate by status
    const pendingProposals = proposals.filter((p: any) => p.status === 'SENT')
    const otherProposals = proposals.filter((p: any) => p.status !== 'SENT')

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 font-serif">Teklifler</h1>
                <p className="text-neutral-500 mt-1">
                    Size gönderilen teklifleri görüntüleyin ve onaylayın.
                </p>
            </div>

            {/* Pending Proposals Banner */}
            {pendingProposals.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-bold text-blue-900">
                                {pendingProposals.length} teklif onayınızı bekliyor
                            </p>
                            <p className="text-sm text-blue-700">
                                Teklifleri inceleyip onaylayabilirsiniz.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Pending Proposals */}
            {pendingProposals.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                        <Send className="w-5 h-5 text-blue-600" />
                        Bekleyen Teklifler ({pendingProposals.length})
                    </h2>

                    <div className="space-y-4">
                        {pendingProposals.map((proposal: any) => {
                            const config = statusConfig[proposal.status]
                            return (
                                <Link
                                    key={proposal.id}
                                    href={`/portal/proposals/${proposal.id}`}
                                    className="block p-5 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-neutral-900 group-hover:text-brand-600 transition-colors">
                                                {proposal.subject}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(proposal.createdAt).toLocaleDateString('tr-TR')}
                                                </span>
                                                {proposal.validUntil && (
                                                    <span className="flex items-center gap-1 text-amber-600">
                                                        <Clock className="w-4 h-4" />
                                                        Geçerlilik: {new Date(proposal.validUntil).toLocaleDateString('tr-TR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-neutral-900">
                                                    {Number(proposal.total).toLocaleString('tr-TR', {
                                                        style: 'currency',
                                                        currency: proposal.currency
                                                    })}
                                                </p>
                                                <p className="text-xs text-neutral-500">KDV Dahil</p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-brand-600 transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* All Proposals */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6">
                    Tüm Teklifler ({proposals.length})
                </h2>

                {proposals.length > 0 ? (
                    <div className="space-y-3">
                        {proposals.map((proposal: any) => {
                            const config = statusConfig[proposal.status] || statusConfig.DRAFT
                            const Icon = config.icon
                            return (
                                <Link
                                    key={proposal.id}
                                    href={`/portal/proposals/${proposal.id}`}
                                    className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg ${config.bgColor} ${config.color} flex items-center justify-center`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-neutral-900 group-hover:text-brand-600 transition-colors">
                                                {proposal.subject}
                                            </h3>
                                            <p className="text-xs text-neutral-500">
                                                {new Date(proposal.createdAt).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs px-2 py-1 rounded-full ${config.bgColor} ${config.color} font-medium`}>
                                            {config.label}
                                        </span>
                                        <span className="font-bold text-neutral-900">
                                            {Number(proposal.total).toLocaleString('tr-TR', {
                                                style: 'currency',
                                                currency: proposal.currency
                                            })}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-neutral-400" />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-neutral-400" />
                        </div>
                        <h3 className="font-bold text-neutral-900 mb-2">Henüz teklif yok</h3>
                        <p className="text-neutral-500 text-sm">
                            Size gönderilen teklifler burada görünecektir.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
