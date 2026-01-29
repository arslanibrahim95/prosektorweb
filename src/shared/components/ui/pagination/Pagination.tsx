'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    const searchParams = useSearchParams()

    const buildPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))
        return `${baseUrl}?${params.toString()}`
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-between mt-6">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Sayfa {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
                <Link
                    href={buildPageUrl(Math.max(1, currentPage - 1))}
                    className={`p-2 rounded-xl border border-neutral-200 transition-all ${currentPage === 1
                            ? 'opacity-30 pointer-events-none'
                            : 'hover:bg-neutral-50 hover:border-neutral-300'
                        }`}
                >
                    <ChevronLeft className="w-5 h-5 text-neutral-600" />
                </Link>
                <Link
                    href={buildPageUrl(Math.min(totalPages, currentPage + 1))}
                    className={`p-2 rounded-xl border border-neutral-200 transition-all ${currentPage === totalPages
                            ? 'opacity-30 pointer-events-none'
                            : 'hover:bg-neutral-50 hover:border-neutral-300'
                        }`}
                >
                    <ChevronRight className="w-5 h-5 text-neutral-600" />
                </Link>
            </div>
        </div>
    )
}
