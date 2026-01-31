import { getInvoice } from '@/features/finance/actions/invoices'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Receipt,
    Building2,
    Calendar,
    CreditCard,
    Plus,
    Banknote,
    CheckCircle2
} from 'lucide-react'
import { PaymentForm } from '@/features/finance/components/PaymentForm'
import { DownloadButton } from '@/components/pdf/DownloadButton'
import { InvoiceDocument } from '@/components/pdf/InvoiceDocument'

interface InvoiceDetailPageProps {
    params: Promise<{ id: string }>
}

const statusLabels: Record<string, string> = {
    DRAFT: 'Taslak',
    PENDING: 'Bekliyor',
    PAID: 'Ödendi',
    PARTIAL: 'Kısmi Ödeme',
    CANCELLED: 'İptal',
}

const statusColors: Record<string, string> = {
    DRAFT: 'bg-neutral-100 text-neutral-600',
    PENDING: 'bg-orange-100 text-orange-700',
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-red-100 text-red-700',
}

const paymentMethodLabels: Record<string, string> = {
    CASH: 'Nakit',
    BANK: 'Havale/EFT',
    CREDIT_CARD: 'Kredi Kartı',
    OTHER: 'Diğer',
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
    const { id } = await params
    const invoice = await getInvoice(id) as any

    if (!invoice) {
        notFound()
    }

    const formatCurrency = (amount: number | any) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(Number(amount) || 0)
    }

    const remaining = Number(invoice.remainingAmount)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/invoices"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-neutral-900 font-serif">{invoice.invoiceNo}</h1>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[invoice.status]}`}>
                                {statusLabels[invoice.status]}
                            </span>
                        </div>
                        <p className="text-neutral-500 mt-1">
                            <Link href={`/admin/companies/${invoice.company.id}`} className="hover:text-brand-600">
                                {invoice.company.name}
                            </Link>
                        </p>
                    </div>
                </div>

                <div>
                    <DownloadButton
                        document={<InvoiceDocument data={JSON.parse(JSON.stringify(invoice))} />}
                        fileName={`fatura-${invoice.invoiceNo}.pdf`}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - Invoice Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoice Info */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-brand-600" />
                            Fatura Bilgileri
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-sm text-neutral-500 mb-1">Düzenleme Tarihi</div>
                                <div className="flex items-center gap-2 text-neutral-900">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    {new Date(invoice.issueDate).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500 mb-1">Vade Tarihi</div>
                                <div className="flex items-center gap-2 text-neutral-900">
                                    <Calendar className="w-4 h-4 text-neutral-400" />
                                    {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500 mb-1">KDV Oranı</div>
                                <div className="text-neutral-900">%{Number(invoice.taxRate)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-neutral-500 mb-1">Ödeme Sayısı</div>
                                <div className="text-neutral-900">{invoice.payments.length}</div>
                            </div>
                        </div>
                        {invoice.description && (
                            <div className="mt-6 pt-6 border-t border-neutral-100">
                                <div className="text-sm text-neutral-500 mb-1">Açıklama</div>
                                <div className="text-neutral-900">{invoice.description}</div>
                            </div>
                        )}
                    </div>

                    {/* Payments */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-brand-600" />
                                Ödeme Geçmişi
                            </h2>
                        </div>

                        {invoice.payments.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <Banknote className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>Henüz ödeme kaydı yok.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invoice.payments.map((payment: any) => (
                                    <div key={payment.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-neutral-900">{formatCurrency(payment.amount)}</div>
                                                <div className="text-sm text-neutral-500">
                                                    {paymentMethodLabels[payment.method]} • {new Date(payment.paymentDate).toLocaleDateString('tr-TR')}
                                                </div>
                                            </div>
                                        </div>
                                        {payment.reference && (
                                            <span className="text-sm text-neutral-500 font-mono">{payment.reference}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right - Summary & Payment Form */}
                <div className="space-y-6">
                    {/* Amount Summary */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Tutar Özeti</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-neutral-500">Ara Toplam</span>
                                <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neutral-500">KDV (%{Number(invoice.taxRate)})</span>
                                <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                            </div>
                            <div className="flex justify-between border-t border-neutral-100 pt-3">
                                <span className="font-bold text-neutral-900">Genel Toplam</span>
                                <span className="font-bold text-lg">{formatCurrency(invoice.total)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                                <span>Ödenen</span>
                                <span className="font-medium">{formatCurrency(invoice.paidAmount)}</span>
                            </div>
                            <div className="flex justify-between text-orange-600 border-t border-neutral-100 pt-3">
                                <span className="font-bold">Kalan</span>
                                <span className="font-bold text-lg">{formatCurrency(remaining)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                            <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-brand-600" />
                                Ödeme Ekle
                            </h3>
                            <PaymentForm invoiceId={invoice.id} remaining={remaining} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
