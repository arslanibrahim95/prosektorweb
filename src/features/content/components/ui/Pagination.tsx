'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
    currentPage: number
    totalPages: number
    baseUrl: string
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
    const searchParams = useSearchParams()

    // Helper to generate URL
    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', pageNumber.toString())
        return `${baseUrl}?${params.toString()}`
    }

    /*
      Pagination Logic:
      - Always show first and last page
      - Show 1 page around current page
      - Show dots if gap > 1
    */
    const generatePagination = () => {
        const delta = 1 // Number of pages to show around current
        const range = []
        const rangeWithDots = []

        // 1. Generate core range
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i)
            }
        }

        // 2. Add dots
        let l: number | null = null
        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1)
                } else if (i - l !== 1) {
                    rangeWithDots.push('...')
                }
            }
            rangeWithDots.push(i)
            l = i
        }

        return rangeWithDots
    }

    if (totalPages <= 1) return null

    const pages = generatePagination()

    return (
        <div className="flex items-center justify-center gap-2 mt-16 select-none">
            {/* Prev Button */}
            <Link
                href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
                className={`w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl transition-all duration-200 
                ${currentPage > 1
                        ? 'hover:bg-white hover:shadow-md hover:border-brand-200 text-neutral-600 bg-neutral-50'
                        : 'opacity-50 cursor-not-allowed text-neutral-300 bg-neutral-50'
                    }`}
                aria-disabled={currentPage <= 1}
            >
                <ChevronLeft className="w-5 h-5" />
            </Link>

            {/* Pages */}
            <div className="flex items-center gap-1 md:gap-2 bg-neutral-100/50 p-1 rounded-xl">
                {pages.map((page, i) => {
                    if (page === '...') {
                        return (
                            <div key={`dots-${i}`} className="w-8 h-10 flex items-center justify-center text-neutral-400">
                                <MoreHorizontal className="w-4 h-4" />
                            </div>
                        )
                    }

                    const pageNumber = page as number
                    const isActive = pageNumber === currentPage

                    return (
                        <Link
                            key={page}
                            href={createPageUrl(pageNumber)}
                            className={`min-w-[40px] h-10 px-2 flex items-center justify-center rounded-lg text-sm font-bold transition-all duration-200
                            ${isActive
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 scale-105'
                                    : 'text-neutral-500 hover:text-brand-600 hover:bg-white'
                                }`}
                        >
                            {page}
                        </Link>
                    )
                })}
            </div>

            {/* Next Button */}
            <Link
                href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
                className={`w-10 h-10 flex items-center justify-center border border-neutral-200 rounded-xl transition-all duration-200 
                ${currentPage < totalPages
                        ? 'hover:bg-white hover:shadow-md hover:border-brand-200 text-neutral-600 bg-neutral-50'
                        : 'opacity-50 cursor-not-allowed text-neutral-300 bg-neutral-50'
                    }`}
                aria-disabled={currentPage >= totalPages}
            >
                <ChevronRight className="w-5 h-5" />
            </Link>
        </div>
    )
}
