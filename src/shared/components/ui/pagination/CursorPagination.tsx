'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

interface CursorPaginationProps {
    nextCursor: string | null
    baseUrl: string
}

export function CursorPagination({ nextCursor, baseUrl }: CursorPaginationProps) {
    const searchParams = useSearchParams()
    const currentCursor = searchParams.get('cursor')

    const createQueryString = (name: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === null) {
            params.delete(name)
        } else {
            params.set(name, value)
        }
        return params.toString()
    }

    // Don't render anything if we are on the first page and there is no next page
    if (!currentCursor && !nextCursor) {
        return null
    }

    return (
        <div className="flex items-center justify-between mt-6">
            <div className="flex-1">
                {currentCursor && (
                    <Link
                        href={`${baseUrl}?${createQueryString('cursor', null)}`}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Başa Dön
                    </Link>
                )}
            </div>

            <div className="flex gap-2">
                {/* 
                  Since cursor pagination doesn't easily support "Previous" without maintaining a stack history,
                  we usually provide a "Start Over" (above) or just browser back.
                  However, we can keep the UI consistent strictly forward-only for now as per minimal implementation.
                  If the user wants "Previous", we'd need to architect bi-directional cursors or history.
                  For this task, we focus on strictly verifying "Next" works.
                */}

                {/* Next Page Button */}
                <Link
                    href={nextCursor ? `${baseUrl}?${createQueryString('cursor', nextCursor)}` : '#'}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-lg transition-colors ${nextCursor
                            ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                            : 'text-gray-400 bg-gray-50 border-gray-200 pointer-events-none cursor-not-allowed'
                        }`}
                    aria-disabled={!nextCursor}
                >
                    Sonraki
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    )
}
