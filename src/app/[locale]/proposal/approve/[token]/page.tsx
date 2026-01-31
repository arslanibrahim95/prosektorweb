'use client'

import { useEffect, useState } from 'react'
import { getProposalByToken, approveProposalByToken } from '@/features/crm/actions/proposals'
import { CheckCircle, XCircle, Loader2, FileText, Calendar, Building2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
    params: Promise<{ token: string }>
}

interface ProposalItem {
    description: string
    quantity: number
    unitPrice: string
    totalPrice: string
}

interface ProposalData {
    id: string
    subject: string
    companyName: string
    items: ProposalItem[]
    subtotal: string
    taxRate: string
    taxAmount: string
    total: string
    currency: string
    validUntil: Date | null
    notes: string | null
}

type PageStatus = 'loading' | 'viewing' | 'approving' | 'success' | 'error'

export default function ApproveProposalPage({ params }: Props) {
    const [status, setStatus] = useState<PageStatus>('loading')
    const [message, setMessage] = useState('')
    const [proposal, setProposal] = useState<ProposalData | null>(null)
    const [token, setToken] = useState<string>('')

    // Load proposal on mount (without approving)
    useEffect(() => {
        const loadProposal = async () => {
            const { token: resolvedToken } = await params
            setToken(resolvedToken)

            const result = await getProposalByToken(resolvedToken)

            if (result.success) {
                setProposal(result.data)
                setStatus('viewing')
            } else {
                setStatus('error')
                setMessage(result.error)
            }
        }

        loadProposal()
    }, [params])

    // Handle explicit approval
    const handleApprove = async () => {
        setStatus('approving')

        const result = await approveProposalByToken(token)

        if (result.success) {
            setStatus('success')
            setMessage('Teklifi onayladınız! En kısa sürede sizinle iletişime geçeceğiz.')
        } else {
            setStatus('error')
            setMessage(result.error || 'Bir hata oluştu.')
        }
    }

    const formatCurrency = (amount: string | number, currency: string = 'TRY') => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency,
        }).format(Number(amount))
    }

    const formatDate = (date: Date | null) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-neutral-200 overflow-hidden">
                {/* Header */}
                <div className="bg-brand-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white font-serif">Teklif Onayı</h1>
                    <p className="text-brand-100 text-sm mt-2">ProSektorWeb</p>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
                            <p className="text-neutral-600">Teklif yükleniyor...</p>
                        </div>
                    )}

                    {/* Viewing State - Show proposal details */}
                    {status === 'viewing' && proposal && (
                        <div className="space-y-6">
                            {/* Proposal Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-neutral-500 text-sm">
                                    <Building2 className="w-4 h-4" />
                                    <span>{proposal.companyName}</span>
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900">{proposal.subject}</h2>
                                {proposal.validUntil && (
                                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                                        <Calendar className="w-4 h-4" />
                                        <span>Geçerlilik: {formatDate(proposal.validUntil)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Items Table */}
                            <div className="border border-neutral-200 rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-50">
                                        <tr>
                                            <th className="text-left p-3 font-semibold text-neutral-700">Açıklama</th>
                                            <th className="text-right p-3 font-semibold text-neutral-700">Miktar</th>
                                            <th className="text-right p-3 font-semibold text-neutral-700">Birim Fiyat</th>
                                            <th className="text-right p-3 font-semibold text-neutral-700">Tutar</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proposal.items.map((item, index) => (
                                            <tr key={index} className="border-t border-neutral-100">
                                                <td className="p-3 text-neutral-700">{item.description}</td>
                                                <td className="p-3 text-right text-neutral-600">{item.quantity}</td>
                                                <td className="p-3 text-right text-neutral-600">
                                                    {formatCurrency(item.unitPrice, proposal.currency)}
                                                </td>
                                                <td className="p-3 text-right font-medium text-neutral-900">
                                                    {formatCurrency(item.totalPrice, proposal.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">Ara Toplam</span>
                                    <span className="text-neutral-700">{formatCurrency(proposal.subtotal, proposal.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-neutral-500">KDV (%{proposal.taxRate})</span>
                                    <span className="text-neutral-700">{formatCurrency(proposal.taxAmount, proposal.currency)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-neutral-200">
                                    <span className="text-neutral-900">Genel Toplam</span>
                                    <span className="text-brand-600">{formatCurrency(proposal.total, proposal.currency)}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            {proposal.notes && (
                                <div className="text-sm text-neutral-500 bg-neutral-50 rounded-xl p-4">
                                    <p className="font-semibold text-neutral-700 mb-1">Notlar:</p>
                                    <p>{proposal.notes}</p>
                                </div>
                            )}

                            {/* Approval Button */}
                            <div className="pt-4 border-t border-neutral-100">
                                <p className="text-sm text-neutral-500 mb-4 text-center">
                                    Bu teklifi onaylamak için aşağıdaki butona tıklayın.
                                </p>
                                <button
                                    onClick={handleApprove}
                                    className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Teklifi Onayla
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Approving State */}
                    {status === 'approving' && (
                        <div className="text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-brand-600 animate-spin mx-auto" />
                            <p className="text-neutral-600">Teklif onaylanıyor...</p>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">Onay Başarılı!</h2>
                            <p className="text-neutral-600">{message}</p>
                        </div>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-neutral-900">İşlem Başarısız</h2>
                            <p className="text-neutral-600">{message}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-neutral-50 border-t border-neutral-100 text-center">
                    <Link href="/" className="text-sm text-brand-600 hover:underline font-medium">
                        Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        </div>
    )
}
