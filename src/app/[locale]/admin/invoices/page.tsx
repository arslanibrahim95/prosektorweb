import { getInvoices, getInvoiceStats } from '@/features/finance/actions/invoices'
import Link from 'next/link'
import {
    Plus,
    Search,
    Receipt,
    Eye,
    ChevronLeft,
    ChevronRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'

interface InvoicesPageProps {
    searchParams: Promise<{
        search?: string
        status?: string
        page?: string
    }>
}

const statusLabels: Record<string, string> = {
    DRAFT: 'Taslak',
    PENDING: 'Bekliyor',
    PAID: 'Ödendi',
    PARTIAL: 'Kısmi',
    CANCELLED: 'İptal',
}

const statusColors: Record<string, string> = {
    DRAFT: 'bg-neutral-100 text-neutral-600',
    PENDING: 'bg-orange-100 text-orange-700',
    PAID: 'bg-green-100 text-green-700',
    PARTIAL: 'bg-yellow-100 text-yellow-700',
    CANCELLED: 'bg-red-100 text-red-700',
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
    const params = await searchParams
    const search = params.search || ''
    const status = params.status || undefined // 'all' filter removed from backend, pass undefined
    const page = parseInt(params.page || '1', 10)

    const [invoicesData, stats] = await Promise.all([
        getInvoices(page, 10, search),
        getInvoiceStats(),
    ])

    const { data: invoices, meta } = invoicesData
    const { total, totalPages: pages, page: currentPage } = meta

    const formatCurrency = (amount: number | any) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(Number(amount) || 0)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Faturalar</h1>
                    <p className="text-neutral-500 mt-1">Toplam {total} fatura kayıtlı</p>
                </div>
                <Link
                    href="/admin/invoices/new"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Fatura
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Toplam Gelir</span>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{formatCurrency(stats.totalRevenue)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Bekleyen Tutar</span>
                        <Clock className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pendingAmount)}</div>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Ödenen Fatura</span>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">{stats.paidCount}</div>
                </div>
                <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Bekleyen Fatura</span>
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingCount}</div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <form className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Fatura no veya firma adı ile ara..."
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <select
                        name="status"
                        defaultValue={status}
                        className="px-4 py-3 bg-neutral-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="PENDING">Bekliyor</option>
                        <option value="PARTIAL">Kısmi Ödeme</option>
                        <option value="PAID">Ödendi</option>
                        <option value="CANCELLED">İptal</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
                    >
                        Filtrele
                    </button>
                </form>
            </div>

            {/* Invoice List */}
            {invoices.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">Fatura Bulunamadı</h3>
                    <p className="text-neutral-500 mb-6">
                        {search ? 'Arama kriterlerinize uygun fatura bulunamadı.' : 'Henüz hiç fatura eklenmemiş.'}
                    </p>
                    <Link
                        href="/admin/invoices/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        İlk Faturayı Oluştur
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Fatura No</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Firma</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Tarih</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Tutar</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Durum</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/invoices/${invoice.id}`} className="font-bold text-brand-600 hover:text-brand-700">
                                            {invoice.invoiceNo}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/companies/${invoice.company.id}`} className="text-neutral-900 hover:text-brand-600">
                                            {invoice.company.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        <div>{new Date(invoice.issueDate).toLocaleDateString('tr-TR')}</div>
                                        <div className="text-xs text-neutral-400">
                                            Vade: {new Date(invoice.dueDate).toLocaleDateString('tr-TR')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="font-bold text-neutral-900">{formatCurrency(invoice.total)}</div>
                                        {Number(invoice.paidAmount) > 0 && (
                                            <div className="text-xs text-green-600">
                                                Ödenen: {formatCurrency(invoice.paidAmount)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${statusColors[invoice.status]}`}>
                                            {statusLabels[invoice.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/admin/invoices/${invoice.id}`}
                                            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors inline-flex"
                                            title="Detay"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
                            <div className="text-sm text-neutral-500">
                                Sayfa {currentPage} / {pages}
                            </div>
                            <div className="flex items-center gap-2">
                                {currentPage > 1 && (
                                    <Link
                                        href={`/admin/invoices?page=${currentPage - 1}${search ? `&search=${search}` : ''}${status !== 'all' ? `&status=${status}` : ''}`}
                                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Link>
                                )}
                                {currentPage < pages && (
                                    <Link
                                        href={`/admin/invoices?page=${currentPage + 1}${search ? `&search=${search}` : ''}${status !== 'all' ? `&status=${status}` : ''}`}
                                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
