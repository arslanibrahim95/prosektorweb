import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Receipt, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    OVERDUE: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<string, string> = {
    PENDING: 'Bekliyor',
    PAID: 'Ödendi',
    OVERDUE: 'Gecikmiş',
    CANCELLED: 'İptal',
}

export default async function PortalInvoicesPage() {
    const session = await auth()

    if (!session?.user) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { company: true }
    })

    if (!user?.companyId) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-neutral-900 mb-2">Firma Bağlantısı Yok</h2>
                <p className="text-neutral-500">Hesabınız henüz bir firmaya bağlanmamış.</p>
            </div>
        )
    }

    const invoices = await prisma.invoice.findMany({
        where: { companyId: user.companyId },
        orderBy: { createdAt: 'desc' }
    })

    // Calculate totals
    const pendingTotal = invoices
        .filter(i => i.status === 'PENDING')
        .reduce((sum, i) => sum + Number(i.total), 0)

    const paidTotal = invoices
        .filter(i => i.status === 'PAID')
        .reduce((sum, i) => sum + Number(i.total), 0)

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 font-serif">Faturalarım</h1>
                <p className="text-neutral-500 mt-1">Fatura geçmişinizi ve ödeme durumlarını görüntüleyin</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Bekleyen</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {pendingTotal.toLocaleString('tr-TR')} ₺
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Ödenen</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {paidTotal.toLocaleString('tr-TR')} ₺
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-brand-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Toplam</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {invoices.length} fatura
                    </p>
                </div>
            </div>

            {/* Invoices List */}
            {invoices.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                    <Receipt className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                    <h3 className="font-bold text-neutral-900 mb-2">Henüz fatura yok</h3>
                    <p className="text-neutral-500 text-sm">Faturalarınız burada görünecek.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Fatura No</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Tarih</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Vade</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Tutar</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-bold text-neutral-900">{invoice.invoiceNo}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {new Date(invoice.createdAt).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-neutral-900">
                                            {Number(invoice.total).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${statusColors[invoice.status]}`}>
                                            {statusLabels[invoice.status]}
                                        </span>
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
