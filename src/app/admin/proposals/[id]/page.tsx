import { getProposalById, updateProposalStatus, generateApprovalToken, convertProposalToInvoice } from '@/actions/proposal'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, FileText, Calendar, Building2, Send, CheckCircle, XCircle, Receipt, LinkIcon, ExternalLink } from 'lucide-react'
import { ProposalStatus } from '@prisma/client'
import { DownloadButton } from '@/components/pdf/DownloadButton'
import { ProposalDocument } from '@/components/pdf/ProposalDocument'

interface PageProps {
    params: Promise<{ id: string }>
}

const statusMap: Record<string, { label: string, color: string }> = {
    DRAFT: { label: 'Taslak', color: 'bg-neutral-100 text-neutral-600' },
    SENT: { label: 'Gönderildi', color: 'bg-blue-100 text-blue-700' },
    ACCEPTED: { label: 'Onaylandı', color: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Reddedildi', color: 'bg-red-100 text-red-700' },
    EXPIRED: { label: 'Süresi Doldu', color: 'bg-orange-100 text-orange-700' },
}

export default async function ProposalDetailPage({ params }: PageProps) {
    const { id } = await params
    const proposal = await getProposalById(id)

    if (!proposal) notFound()

    const status = statusMap[proposal.status]

    // Build approval URL
    const approvalUrl = proposal.approvalToken
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/proposal/approve/${proposal.approvalToken}`
        : null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/proposals"
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
                    {/* DRAFT: Send to Client */}
                    {proposal.status === 'DRAFT' && (
                        <form action={async () => {
                            'use server'
                            await generateApprovalToken(id)
                        }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm">
                                <Send className="w-4 h-4" />
                                Müşteriye Gönder
                            </button>
                        </form>
                    )}

                    {/* SENT: Manual Approve/Reject */}
                    {proposal.status === 'SENT' && (
                        <>
                            <form action={async () => {
                                'use server'
                                await updateProposalStatus(id, 'ACCEPTED')
                            }}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm">
                                    <CheckCircle className="w-4 h-4" />
                                    Onayla
                                </button>
                            </form>
                            <form action={async () => {
                                'use server'
                                await updateProposalStatus(id, 'REJECTED')
                            }}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm">
                                    <XCircle className="w-4 h-4" />
                                    Reddet
                                </button>
                            </form>
                        </>
                    )}

                    {/* ACCEPTED: Convert to Invoice */}
                    {proposal.status === 'ACCEPTED' && !proposal.invoiceId && (
                        <form action={async () => {
                            'use server'
                            const result = await convertProposalToInvoice(id)
                            if (result.success && result.invoiceId) {
                                redirect(`/admin/invoices/${result.invoiceId}`)
                            }
                        }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium text-sm shadow-lg shadow-brand-600/30">
                                <Receipt className="w-4 h-4" />
                                Faturaya Dönüştür
                            </button>
                        </form>
                    )}

                    {/* Already Converted: View Invoice */}
                    {proposal.invoiceId && (
                        <Link
                            href={`/admin/invoices/${proposal.invoiceId}`}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium text-sm"
                        >
                            <Receipt className="w-4 h-4" />
                            Faturayı Görüntüle
                        </Link>
                    )}

                    {/* PDF Download */}
                    <DownloadButton
                        document={<ProposalDocument data={JSON.parse(JSON.stringify(proposal))} />}
                        fileName={`teklif-${proposal.id.slice(0, 8)}.pdf`}
                    />
                </div>
            </div>

            {/* Approval Link Card (for SENT status) */}
            {proposal.status === 'SENT' && approvalUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <LinkIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-bold text-blue-900">Müşteri Onay Linki</div>
                            <div className="text-sm text-blue-600 font-mono truncate max-w-md">{approvalUrl}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={approvalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Linki Aç"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            )}

            {/* Converted Notice */}
            {proposal.convertedAt && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <div className="font-bold text-green-900">Faturaya Dönüştürüldü</div>
                        <div className="text-sm text-green-600">
                            {new Date(proposal.convertedAt).toLocaleDateString('tr-TR', {
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
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
                        <h3 className="font-bold text-neutral-900 mb-4">Müşteri Bilgileri</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                                <div className="w-10 h-10 bg-white rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900">{proposal.company.name}</div>
                                    <div className="text-neutral-500 text-xs">Müşteri</div>
                                </div>
                            </div>

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
