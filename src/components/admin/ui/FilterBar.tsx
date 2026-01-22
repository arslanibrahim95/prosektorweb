'use client'

import { Search } from 'lucide-react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useTransition } from 'react'

interface FilterOption {
    label: string
    value: string
}

interface FilterBarProps {
    placeholder?: string
    statusOptions?: FilterOption[]
    statusValue?: string // Default status if needed
}

export function FilterBar({ placeholder = "Ara...", statusOptions }: FilterBarProps) {
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('q', term)
        } else {
            params.delete('q')
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`)
        })
    }

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams)
        if (status && status !== 'all') {
            params.set('status', status)
        } else {
            params.delete('status')
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`)
        })
    }

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        aria-label={placeholder}
                        defaultValue={searchParams.get('q')?.toString()}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                    />
                </div>
                {statusOptions && (
                    <select
                        defaultValue={searchParams.get('status')?.toString() || ''}
                        aria-label="Durum Filtresi"
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-4 py-3 bg-neutral-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-w-[200px] cursor-pointer"
                    >
                        <option value="all">Tüm Durumlar</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    )
}
