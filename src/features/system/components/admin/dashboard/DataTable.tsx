'use client'

import { useState } from 'react'
import {
    ChevronUp,
    ChevronDown,
    Search,
    Filter,
    Download,
    MoreHorizontal
} from 'lucide-react'
import { cn } from '@/shared/lib'

// Column definition
export interface DataTableColumn<T> {
    key: keyof T | string
    header: string
    sortable?: boolean
    render?: (value: unknown, row: T) => React.ReactNode
    width?: string
}

// Sort configuration
interface SortConfig {
    key: string
    direction: 'asc' | 'desc'
}

// Filter configuration
interface FilterConfig {
    key: string
    value: string
}

// DataTable Component
interface DataTableProps<T> {
    data: T[]
    columns: DataTableColumn<T>[]
    title?: string
    searchable?: boolean
    searchKeys?: (keyof T)[]
    filterable?: boolean
    filters?: Array<{ key: string; label: string; options: Array<{ value: string; label: string }> }>
    exportable?: boolean
    exportFilename?: string
    onExport?: (data: T[]) => void
    pageSize?: number
    emptyMessage?: string
    className?: string
}

export function DataTable<T extends Record<string, unknown>>({
    data,
    columns,
    title,
    searchable = true,
    searchKeys = [],
    filterable = false,
    filters = [],
    exportable = false,
    exportFilename = 'export',
    onExport,
    pageSize = 10,
    emptyMessage = 'Veri bulunamadı',
    className
}: DataTableProps<T>) {
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
    const [filtersState, setFiltersState] = useState<Record<string, string>>({})
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)

    // Filter data
    let filteredData = [...data]

    // Apply search filter
    if (searchQuery && searchKeys.length > 0) {
        filteredData = filteredData.filter(row => {
            return searchKeys.some(key => {
                const value = row[key]
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchQuery.toLowerCase())
                }
                return false
            })
        })
    }

    // Apply column filters
    if (filterable) {
        filters.forEach(filter => {
            const filterValue = filtersState[filter.key]
            if (filterValue && filterValue !== 'all') {
                filteredData = filteredData.filter(row => {
                    const value = row[filter.key as keyof T]
                    return String(value) === filterValue
                })
            }
        })
    }

    // Sort data
    if (sortConfig) {
        filteredData.sort((a, b) => {
            const aValue = a[sortConfig.key as keyof T]
            const bValue = b[sortConfig.key as keyof T]

            if (aValue === null || aValue === undefined) return 1
            if (bValue === null || bValue === undefined) return -1

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }

    // Pagination
    const totalPages = Math.ceil(filteredData.length / pageSize)
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Handlers
    const handleSort = (key: string) => {
        setSortConfig(prev => {
            if (prev?.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
            }
            return { key, direction: 'asc' }
        })
    }

    const handleExport = () => {
        if (onExport) {
            onExport(filteredData)
        } else {
            // Default CSV export
            const headers = columns.map(col => col.header).join(',')
            const rows = filteredData.map(row =>
                columns.map(col => {
                    const value = row[col.key as keyof T]
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value
                }).join(',')
            ).join('\n')

            const csv = `${headers}\n${rows}`
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${exportFilename}.csv`
            a.click()
        }
    }

    return (
        <div className={cn("bg-white rounded-3xl border border-neutral-200 overflow-hidden", className)}>
            {/* Header */}
            {(title || searchable || filterable || exportable) && (
                <div className="p-4 border-b border-neutral-100 flex flex-wrap items-center gap-4">
                    {title && (
                        <h3 className="font-semibold text-lg text-neutral-900">{title}</h3>
                    )}

                    <div className="flex-1" />

                    {/* Search */}
                    {searchable && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="pl-10 pr-4 py-2 bg-neutral-50 border-0 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    )}

                    {/* Filters */}
                    {filterable && filters.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            {filters.map(filter => (
                                <select
                                    key={filter.key}
                                    value={filtersState[filter.key] || 'all'}
                                    onChange={(e) => {
                                        setFiltersState(prev => ({ ...prev, [filter.key]: e.target.value }))
                                        setCurrentPage(1)
                                    }}
                                    className="px-3 py-2 bg-neutral-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                >
                                    <option value="all">{filter.label}</option>
                                    {filter.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ))}
                        </div>
                    )}

                    {/* Export */}
                    {exportable && (
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-sm font-medium hover:bg-brand-100 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            İndir
                        </button>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-100">
                            {columns.map(column => (
                                <th
                                    key={String(column.key)}
                                    className={cn(
                                        "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider",
                                        column.sortable && "cursor-pointer hover:bg-neutral-100 select-none"
                                    )}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable && handleSort(String(column.key))}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.header}
                                        {sortConfig?.key === column.key && (
                                            sortConfig.direction === 'asc'
                                                ? <ChevronUp className="w-3 h-3" />
                                                : <ChevronDown className="w-3 h-3" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-neutral-50/50 transition-colors"
                                >
                                    {columns.map(column => (
                                        <td key={String(column.key)} className="px-4 py-3 text-sm">
                                            {column.render
                                                ? column.render(row[column.key as keyof T], row)
                                                : String(row[column.key as keyof T] ?? '')
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredData.length)} / {filteredData.length}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-lg border border-neutral-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                        >
                            Önceki
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    aria-current={currentPage === page ? 'page' : undefined}
                                    className={cn(
                                        "px-3 py-1 rounded-lg text-sm",
                                        currentPage === page
                                            ? "bg-brand-600 text-white"
                                            : "border border-neutral-200 hover:bg-neutral-50"
                                    )}
                                >
                                    {page}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-lg border border-neutral-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                        >
                            Sonraki
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
