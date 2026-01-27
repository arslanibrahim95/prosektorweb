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
    currentStartDate?: string
    currentEndDate?: string
}

export function AuditFilters({
    currentEntity,
    currentAction,
    currentStartDate,
    currentEndDate
}: AuditFiltersProps) {
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
        <div className="flex gap-4 flex-wrap items-end bg-white p-4 rounded-xl border border-neutral-200">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Modül</label>
                <select
                    className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                    value={currentEntity || ''}
                    onChange={(e) => updateFilter('entity', e.target.value)}
                >
                    {ENTITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">İşlem Tipi</label>
                <select
                    className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
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

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Başlangıç</label>
                <input
                    type="date"
                    className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                    value={currentStartDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Bitiş</label>
                <input
                    type="date"
                    className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                    value={currentEndDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                />
            </div>

            <button
                onClick={() => router.push('/admin/audit')}
                className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-brand-600 transition-colors uppercase tracking-widest"
            >
                Sıfırla
            </button>
        </div>
    )
}
