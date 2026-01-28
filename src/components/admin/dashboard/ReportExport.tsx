'use client'

import { useState } from 'react'
import {
    Download,
    FileText,
    FileSpreadsheet,
    Calendar,
    Filter,
    RefreshCw,
    Printer
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Report types
export type ReportType = 'companies' | 'employees' | 'invoices' | 'projects' | 'proposals' | 'audit' | 'financial'
export type ExportFormat = 'pdf' | 'excel' | 'csv'

// Date range options
interface DateRange {
    label: string
    value: string
    days: number
}

const dateRanges: DateRange[] = [
    { label: 'Bugün', value: 'today', days: 0 },
    { label: 'Bu Hafta', value: 'week', days: 7 },
    { label: 'Bu Ay', value: 'month', days: 30 },
    { label: 'Son 3 Ay', value: 'quarter', days: 90 },
    { label: 'Bu Yıl', value: 'year', days: 365 },
    { label: 'Tüm Zamanlar', value: 'all', days: 0 },
]

// Report configuration
interface ReportConfig {
    type: ReportType
    title: string
    description: string
    icon: typeof FileText
    filters: Array<{
        key: string
        label: string
        type: 'select' | 'text' | 'date'
        options?: Array<{ value: string; label: string }>
    }>
}

// Available reports
const reports: ReportConfig[] = [
    {
        type: 'companies',
        title: 'Firma Raporu',
        description: 'Tüm firmaların listesi ve detayları',
        icon: FileText,
        filters: [
            {
                key: 'status', label: 'Durum', type: 'select', options: [
                    { value: 'all', label: 'Tümü' },
                    { value: 'LEAD', label: 'Potansiyel' },
                    { value: 'CUSTOMER', label: 'Müşteri' },
                ]
            },
            { key: 'search', label: 'Arama', type: 'text' },
        ]
    },
    {
        type: 'employees',
        title: 'Çalışan Raporu',
        description: 'İşyeri bazlı çalışan listesi',
        icon: FileText,
        filters: [
            {
                key: 'workplace', label: 'İşyeri', type: 'select', options: [
                    { value: 'all', label: 'Tümü' },
                ]
            },
            {
                key: 'dangerClass', label: 'Tehlike Sınıfı', type: 'select', options: [
                    { value: 'all', label: 'Tümü' },
                    { value: 'LESS_DANGEROUS', label: 'Az Tehlikeli' },
                    { value: 'DANGEROUS', label: 'Tehlikeli' },
                ]
            },
        ]
    },
    {
        type: 'invoices',
        title: 'Fatura Raporu',
        description: 'Fatura ve ödeme özeti',
        icon: FileText,
        filters: [
            {
                key: 'status', label: 'Durum', type: 'select', options: [
                    { value: 'all', label: 'Tümü' },
                    { value: 'PAID', label: 'Ödendi' },
                    { value: 'PENDING', label: 'Bekliyor' },
                    { value: 'OVERDUE', label: 'Vadesi Geçmiş' },
                ]
            },
        ]
    },
    {
        type: 'financial',
        title: 'Finansal Rapor',
        description: 'Gelir ve gider analizi',
        icon: FileText,
        filters: [
            {
                key: 'groupBy', label: 'Gruplama', type: 'select', options: [
                    { value: 'month', label: 'Aylık' },
                    { value: 'quarter', label: 'Üç Aylık' },
                    { value: 'year', label: 'Yıllık' },
                ]
            },
        ]
    },
    {
        type: 'audit',
        title: 'Denetim Raporu',
        description: 'Kullanıcı aktiviteleri',
        icon: FileText,
        filters: [
            {
                key: 'action', label: 'İşlem', type: 'select', options: [
                    { value: 'all', label: 'Tümü' },
                    { value: 'CREATE', label: 'Oluşturma' },
                    { value: 'UPDATE', label: 'Güncelleme' },
                    { value: 'DELETE', label: 'Silme' },
                ]
            },
        ]
    },
]

// Date Range Picker Component
interface DateRangePickerProps {
    value: DateRange
    onChange: (range: DateRange) => void
    className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={cn("relative", className)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm hover:border-brand-500 transition-colors"
            >
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{value.label}</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-neutral-200 shadow-lg z-50 overflow-hidden">
                        {dateRanges.map(range => (
                            <button
                                key={range.value}
                                onClick={() => {
                                    onChange(range)
                                    setIsOpen(false)
                                }}
                                className={cn(
                                    "w-full px-4 py-2 text-left text-sm hover:bg-neutral-50 transition-colors",
                                    value.value === range.value && "bg-brand-50 text-brand-600"
                                )}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// Report Generator Component
interface ReportGeneratorProps {
    onGenerate: (type: ReportType, format: ExportFormat, dateRange: DateRange, filters: Record<string, string>) => void
    className?: string
}

export function ReportGenerator({ onGenerate, className }: ReportGeneratorProps) {
    const [selectedReport, setSelectedReport] = useState<ReportType>('companies')
    const [dateRange, setDateRange] = useState<DateRange>(dateRanges[2]) // Default: Bu Ay
    const [filters, setFilters] = useState<Record<string, string>>({})
    const [isGenerating, setIsGenerating] = useState(false)

    const report = reports.find(r => r.type === selectedReport)!

    const handleGenerate = async (format: ExportFormat) => {
        setIsGenerating(true)
        try {
            await onGenerate(selectedReport, format, dateRange, filters)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className={cn("bg-white rounded-3xl border border-neutral-200 overflow-hidden", className)}>
            {/* Header */}
            <div className="p-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-neutral-900">Rapor Oluştur</h3>
                        <p className="text-sm text-muted-foreground">Verilerinizi dışa aktarın</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {/* Report Type Selection */}
                <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Rapor Türü
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {reports.map(r => {
                            const Icon = r.icon
                            return (
                                <button
                                    key={r.type}
                                    onClick={() => setSelectedReport(r.type)}
                                    className={cn(
                                        "p-3 rounded-xl border text-left transition-all",
                                        selectedReport === r.type
                                            ? "border-brand-500 bg-brand-50"
                                            : "border-neutral-200 hover:border-neutral-300"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className={cn(
                                            "w-4 h-4",
                                            selectedReport === r.type ? "text-brand-600" : "text-muted-foreground"
                                        )} />
                                        <span className="text-sm font-medium">{r.title}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{r.description}</p>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Date Range */}
                <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Tarih Aralığı
                    </label>
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                </div>

                {/* Filters */}
                {report.filters.length > 0 && (
                    <div>
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Filtreler
                        </label>
                        <div className="space-y-2">
                            {report.filters.map(filter => (
                                <div key={filter.key}>
                                    <label className="text-xs text-muted-foreground mb-1 block">
                                        {filter.label}
                                    </label>
                                    {filter.type === 'select' && (
                                        <select
                                            value={filters[filter.key] || 'all'}
                                            onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                            className="w-full px-3 py-2 bg-neutral-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        >
                                            {filter.options!.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    )}
                                    {filter.type === 'text' && (
                                        <input
                                            type="text"
                                            placeholder="Ara..."
                                            value={filters[filter.key] || ''}
                                            onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                            className="w-full px-3 py-2 bg-neutral-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Export Actions */}
                <div className="pt-4 border-t border-neutral-100">
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Dışa Aktarım Formatı
                    </label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleGenerate('pdf')}
                            disabled={isGenerating}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            <FileText className="w-4 h-4" />
                            PDF
                        </button>
                        <button
                            onClick={() => handleGenerate('excel')}
                            disabled={isGenerating}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Excel
                        </button>
                        <button
                            onClick={() => handleGenerate('csv')}
                            disabled={isGenerating}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                            <FileText className="w-4 h-4" />
                            CSV
                        </button>
                    </div>

                    {/* Print Preview */}
                    <button
                        onClick={() => handleGenerate('pdf')}
                        disabled={isGenerating}
                        className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-3 bg-neutral-100 text-neutral-600 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                        <Printer className="w-4 h-4" />
                        Yazdır Önizleme
                    </button>
                </div>
            </div>
        </div>
    )
}

// Quick Export Button
interface QuickExportProps {
    data: unknown[]
    filename: string
    format: ExportFormat
    label?: string
    className?: string
}

export function QuickExport({ data, filename, format, label = 'İndir', className }: QuickExportProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            if (format === 'csv') {
                exportToCSV(data, filename)
            } else if (format === 'excel') {
                // Excel export would require a library like xlsx
                console.log('Excel export not implemented yet')
            } else if (format === 'pdf') {
                // PDF export would require a library like jsPDF
                console.log('PDF export not implemented yet')
            }
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className={cn(
                "flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors disabled:opacity-50",
                className
            )}
        >
            {isExporting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
                <Download className="w-4 h-4" />
            )}
            {isExporting ? 'İndiriliyor...' : label}
        </button>
    )
}

// Helper function to export data as CSV
function exportToCSV(data: unknown[], filename: string) {
    if (data.length === 0) return

    const headers = Object.keys(data[0] as object)
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = (row as Record<string, unknown>)[header]
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`
                }
                return value
            }).join(',')
        )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
}
