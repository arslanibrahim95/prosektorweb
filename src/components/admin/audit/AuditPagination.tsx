'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface AuditPaginationProps {
    currentPage: number
    totalPages: number
}

export function AuditPagination({ currentPage, totalPages }: AuditPaginationProps) {
    const searchParams = useSearchParams()

    const buildPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))
        return `/admin/audit?${params.toString()}`
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
                Sayfa {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
                <Link
                    href={buildPageUrl(Math.max(1, currentPage - 1))}
                    className={`p-2 rounded-lg border border-neutral-200 ${currentPage === 1
                            ? 'opacity-50 pointer-events-none'
                            : 'hover:bg-gray-50'
                        }`}
                    aria-disabled={currentPage === 1}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <Link
                    href={buildPageUrl(Math.min(totalPages, currentPage + 1))}
                    className={`p-2 rounded-lg border border-neutral-200 ${currentPage === totalPages
                            ? 'opacity-50 pointer-events-none'
                            : 'hover:bg-gray-50'
                        }`}
                    aria-disabled={currentPage === totalPages}
                >
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    )
}
