import { getRevenueData, getProjectStats, getInvoiceStats, getTicketStats } from '@/features/system/actions/reports'
import { RevenueChart } from '@/features/system/components/admin/reports/RevenueChart'
import { ProjectPipeline } from '@/features/system/components/admin/reports/ProjectPipeline'
import { PageHeader } from '@/shared/components/ui'
import { TrendingUp, Receipt, Ticket, Layers, DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default async function ReportsPage() {
    const [revenueData, projectStats, invoiceStats, ticketStats] = await Promise.all([
        getRevenueData(),
        getProjectStats(),
        getInvoiceStats(),
        getTicketStats()
    ])

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)

    return (
        <div className="space-y-8">
            <PageHeader
                title="Raporlar"
                description="Gelir, proje ve destek metriklerinizi takip edin"
            />

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Tahsil Edilen</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{formatCurrency(invoiceStats.paid)}</p>
                    <p className="text-xs text-green-600 mt-1 font-medium">Ödenen faturalar</p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Bekleyen</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{formatCurrency(invoiceStats.pending)}</p>
                    <p className="text-xs text-yellow-600 mt-1 font-medium">Ödeme bekleniyor</p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Gecikmiş</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{formatCurrency(invoiceStats.overdue)}</p>
                    <p className="text-xs text-red-600 mt-1 font-medium">Vadesi geçmiş</p>
                </div>

                <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-neutral-500">Aktif Proje</span>
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">
                        {projectStats.reduce((sum, p) => sum + p.value, 0)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">Toplam proje sayısı</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900">Aylık Gelir</h3>
                            <p className="text-sm text-neutral-500">Son 6 ayın ödenen faturaları</p>
                        </div>
                        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-brand-600" />
                        </div>
                    </div>
                    <RevenueChart data={revenueData} />
                </div>

                {/* Project Pipeline */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-neutral-900">Proje Durumları</h3>
                            <p className="text-sm text-neutral-500">Tüm projelerin dağılımı</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    {projectStats.length > 0 ? (
                        <ProjectPipeline data={projectStats} />
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-neutral-400">
                            Henüz proje yok
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Stats */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900">Destek Talepleri</h3>
                        <p className="text-sm text-neutral-500">Ticket durumları özeti</p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-orange-600" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-neutral-50 rounded-xl">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900">{ticketStats.open}</p>
                        <p className="text-sm text-neutral-500 mt-1">Açık Talep</p>
                    </div>
                    <div className="text-center p-6 bg-neutral-50 rounded-xl">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900">{ticketStats.resolved}</p>
                        <p className="text-sm text-neutral-500 mt-1">Çözülen</p>
                    </div>
                    <div className="text-center p-6 bg-neutral-50 rounded-xl">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Ticket className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900">{ticketStats.thisMonth}</p>
                        <p className="text-sm text-neutral-500 mt-1">Bu Ay</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
