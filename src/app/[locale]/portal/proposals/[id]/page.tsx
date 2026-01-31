import { getClientProposalById, approveClientProposal, rejectClientProposal } from '@/features/crm/actions/client-portal'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Calendar, Building2, CheckCircle, XCircle } from 'lucide-react'
import { DownloadButton } from '@/components/pdf/DownloadButton'
import { ProposalDocument } from '@/components/pdf/ProposalDocument'

interface PageProps {
    params: Promise<{ id: string }>
}

const statusMap: Record<string, { label: string, color: string }> = {
    DRAFT: { label: 'Hazırlanıyor', color: 'bg-neutral-100 text-neutral-600' },
    SENT: { label: 'Onay Bekliyor', color: 'bg-blue-100 text-blue-700' },
    ACCEPTED: { label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
    EXPIRED: { label: 'Süresi Doldu', color: 'bg-orange-100 text-orange-700' },
}

export default async function PortalProposalDetailPage({ params }: PageProps) {
    const { id } = await params
    const proposal = await getClientProposalById(id)

    if (!proposal) notFound()

    const status = statusMap[proposal.status] || { label: proposal.status, color: 'bg-gray-100 text-gray-700' }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/portal/proposals"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-neutral-900 font-serif">Teklif Detayı</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${status.color}`}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-neutral-500 mt-1 font-mono text-sm">{proposal.id}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* SENT: Approve/Reject Actions */}
                    {proposal.status === 'SENT' && (
                        <>
                            <form action={async () => {
                                'use server'
                                await approveClientProposal(id)
                            }}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Onayla
                                </button>
                            </form>
                            <form action={async () => {
                                'use server'
                                await rejectClientProposal(id)
                            }}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm">
                                    <XCircle className="w-4 h-4" />
                                    Reddet
                                </button>
                            </form>
                        </>
                    )}

                    {/* PDF Download */}
                    <DownloadButton
                        document={<ProposalDocument data={JSON.parse(JSON.stringify(proposal))} />}
                        fileName={`teklif-${proposal.id.slice(0, 8)}.pdf`}
                    />
                </div>
            </div>

            {/* Status Messages */}
            {proposal.status === 'ACCEPTED' && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <div className="font-bold text-green-900">Teklif Onaylandı</div>
                        <div className="text-sm text-green-600">
                            Bu teklifi {proposal.approvedAt ? new Date(proposal.approvedAt).toLocaleDateString('tr-TR') : 'tarihinde'} onayladınız. Teşekkür ederiz.
                        </div>
                    </div>
                </div>
            )}

            {proposal.status === 'REJECTED' && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <div className="font-bold text-red-900">Teklif Reddedildi</div>
                        <div className="text-sm text-red-600">
                            Bu teklifi reddettiniz. Yeni teklif için lütfen iletişime geçiniz.
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                        <div className="p-8 border-b border-neutral-100 bg-neutral-50/30">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-2">{proposal.subject}</h2>
                            <div className="flex items-center gap-6 text-sm text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {proposal.company.name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(proposal.createdAt).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <table className="w-full">
                                <thead className="border-b border-neutral-200">
                                    <tr>
                                        <th className="text-left font-bold text-neutral-500 pb-4 pl-2">Açıklama</th>
                                        <th className="text-center font-bold text-neutral-500 pb-4 w-24">Adet</th>
                                        <th className="text-right font-bold text-neutral-500 pb-4 w-32">Birim Fiyat</th>
                                        <th className="text-right font-bold text-neutral-500 pb-4 w-32">Toplam</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {proposal.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-4 pl-2 text-neutral-700">{item.description}</td>
                                            <td className="py-4 text-center text-neutral-600">{item.quantity}</td>
                                            <td className="py-4 text-right text-neutral-600 font-mono">
                                                {Number(item.unitPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 text-right text-neutral-900 font-bold font-mono">
                                                {Number(item.totalPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="mt-8 border-t border-neutral-100 pt-8 flex justify-end">
                                <div className="w-64 space-y-3">
                                    <div className="flex justify-between text-neutral-500">
                                        <span>Ara Toplam</span>
                                        <span className="font-medium">{Number(proposal.subtotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                        <span>KDV (%{Number(proposal.taxRate)})</span>
                                        <span className="font-medium">{Number(proposal.taxAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-neutral-900 border-t border-neutral-200 pt-4">
                                        <span>Toplam</span>
                                        <span className="text-brand-600">{Number(proposal.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h3 className="font-bold text-neutral-900 mb-4">Teklif Bilgileri</h3>
                        <div className="space-y-3 text-sm">
                            {proposal.validUntil && (
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl text-orange-800">
                                    <Calendar className="w-5 h-5" />
                                    <div>
                                        <div className="font-bold">Son Geçerlilik</div>
                                        <div className="text-xs opacity-80">{new Date(proposal.validUntil).toLocaleDateString('tr-TR')}</div>
                                    </div>
                                </div>
                            )}

                            {proposal.approvedAt && (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl text-green-800">
                                    <CheckCircle className="w-5 h-5" />
                                    <div>
                                        <div className="font-bold">Onay Tarihi</div>
                                        <div className="text-xs opacity-80">{new Date(proposal.approvedAt).toLocaleDateString('tr-TR')}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
