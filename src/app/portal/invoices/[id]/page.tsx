import { getInvoiceById } from '@/actions/portal'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Receipt, CreditCard, Calendar, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react'

// Status config
const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    DRAFT: { label: 'Taslak', color: 'text-neutral-600', bgColor: 'bg-neutral-100' },
    PENDING: { label: 'Bekliyor', color: 'text-amber-600', bgColor: 'bg-amber-100' },
    PAID: { label: 'Ödendi', color: 'text-green-600', bgColor: 'bg-green-100' },
    PARTIAL: { label: 'Kısmi Ödeme', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    CANCELLED: { label: 'İptal', color: 'text-red-600', bgColor: 'bg-red-100' },
}

const paymentMethodLabels: Record<string, string> = {
    CASH: 'Nakit',
    BANK: 'Havale/EFT',
    CREDIT_CARD: 'Kredi Kartı',
    OTHER: 'Diğer',
}

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const invoice = await getInvoiceById(id)

    if (!invoice) {
        notFound()
    }

    const statusInfo = statusConfig[invoice.status] || statusConfig.PENDING
    const remainingAmount = Number(invoice.total) - Number(invoice.paidAmount)
    const isPaid = invoice.status === 'PAID'
    const isOverdue = !isPaid && new Date(invoice.dueDate) < new Date()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link
                        href="/portal/invoices"
                        className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Tüm Faturalar
                    </Link>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Fatura #{invoice.invoiceNo}</h1>
                    <p className="text-neutral-500 mt-1">
                        {invoice.company?.name}
                    </p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.label}
                </span>
            </div>

            {/* Overdue Warning */}
            {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                        <p className="font-bold text-red-900">Vadesi Geçmiş Fatura</p>
                        <p className="text-sm text-red-700">
                            Bu faturanın vadesi {new Date(invoice.dueDate).toLocaleDateString('tr-TR')} tarihinde dolmuştur.
                        </p>
                    </div>
                </div>
            )}

            {/* Amount Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-600">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Fatura Tutarı</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {Number(invoice.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Ödenen</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                        {Number(invoice.paidAmount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                </div>

                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${remainingAmount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                            {remainingAmount > 0 ? <Clock className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Kalan</span>
                    </div>
                    <p className={`text-2xl font-bold ${remainingAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {remainingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Info */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Fatura Bilgileri</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-500">Fatura No</span>
                            <span className="font-medium text-neutral-900">{invoice.invoiceNo}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-500">Düzenleme Tarihi</span>
                            <span className="font-medium text-neutral-900">
                                {new Date(invoice.issueDate).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-500">Vade Tarihi</span>
                            <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-neutral-900'}`}>
                                {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-500">Ara Toplam</span>
                            <span className="font-medium text-neutral-900">
                                {Number(invoice.subtotal).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="text-neutral-500">KDV (%{Number(invoice.taxRate)})</span>
                            <span className="font-medium text-neutral-900">
                                {Number(invoice.taxAmount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="font-bold text-neutral-900">Genel Toplam</span>
                            <span className="font-bold text-neutral-900">
                                {Number(invoice.total).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Ödeme Geçmişi</h2>
                    {invoice.payments.length > 0 ? (
                        <div className="space-y-3">
                            {invoice.payments.map((payment: any) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">
                                                {Number(payment.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {paymentMethodLabels[payment.method]} • {new Date(payment.paymentDate).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                    </div>
                                    {payment.reference && (
                                        <span className="text-xs text-neutral-400">#{payment.reference}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl text-neutral-500">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">Henüz ödeme yapılmamış</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Description & Notes */}
            {(invoice.description || invoice.notes) && (
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4">Açıklama</h2>
                    {invoice.description && (
                        <p className="text-neutral-600 mb-4">{invoice.description}</p>
                    )}
                    {invoice.notes && (
                        <p className="text-neutral-500 text-sm">{invoice.notes}</p>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            {remainingAmount > 0 && (
                <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-brand-900">Ödeme Yapın</h3>
                            <p className="text-sm text-brand-700">
                                Kalan tutar: {remainingAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                        </div>
                    </div>
                    <button className="w-full sm:w-auto px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors">
                        Online Ödeme Yap
                    </button>
                </div>
            )}
        </div>
    )
}
