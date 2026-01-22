'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { AuditAction } from '@prisma/client'

const ENTITY_OPTIONS = [
    { value: '', label: 'Tüm Modüller' },
    { value: 'Company', label: 'Firma' },
    { value: 'Invoice', label: 'Fatura' },
    { value: 'Proposal', label: 'Teklif' },
    { value: 'Ticket', label: 'Destek' },
    { value: 'Service', label: 'Hizmet' },
    { value: 'User', label: 'Kullanıcı' },
]

const ACTION_OPTIONS = [
    { value: '', label: 'Tüm İşlemler' },
    { value: 'CREATE', label: 'Oluşturma' },
    { value: 'UPDATE', label: 'Güncelleme' },
    { value: 'DELETE', label: 'Silme' },
    { value: 'LOGIN', label: 'Giriş' },
    { value: 'LOGOUT', label: 'Çıkış' },
]

interface AuditFiltersProps {
    currentEntity?: string
    currentAction?: string
}

export function AuditFilters({ currentEntity, currentAction }: AuditFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        // Reset to page 1 when filter changes
        params.delete('page')

        router.push(`/admin/audit?${params.toString()}`)
    }

    return (
        <div className="flex gap-4 flex-wrap">
            <select
                className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={currentEntity || ''}
                onChange={(e) => updateFilter('entity', e.target.value)}
            >
                {ENTITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <select
                className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={currentAction || ''}
                onChange={(e) => updateFilter('action', e.target.value)}
            >
                {ACTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
