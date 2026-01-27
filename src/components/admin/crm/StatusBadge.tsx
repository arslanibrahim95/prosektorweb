'use client'

import { useState } from 'react'
import { updateCompanyStatus } from '@/actions/crm'
import { ChevronDown } from 'lucide-react'

interface CrmStatusBadgeProps {
    status: string
    companyId: string
}

const statusConfig: Record<string, { label: string, color: string }> = {
    LEAD: { label: 'Potansiyel', color: 'bg-blue-100 text-blue-700' },
    PROSPECT: { label: 'İlgilenen', color: 'bg-purple-100 text-purple-700' },
    NEGOTIATION: { label: 'Görüşmede', color: 'bg-orange-100 text-orange-700' },
    CUSTOMER: { label: 'Müşteri', color: 'bg-green-100 text-green-700' },
    CHURNED: { label: 'Kaybedilen', color: 'bg-red-100 text-red-700' },
}

export function CrmStatusBadge({ status, companyId }: CrmStatusBadgeProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(status)
    const [loading, setLoading] = useState(false)

    const config = statusConfig[currentStatus] || statusConfig.LEAD

    const handleStatusChange = async (newStatus: string) => {
        setLoading(true)
        const result = await updateCompanyStatus(companyId, newStatus)
        if (result.success) {
            setCurrentStatus(newStatus)
        }
        setLoading(false)
        setIsOpen(false)
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${config.color} hover:opacity-80 transition-opacity disabled:opacity-50`}
            >
                {config.label}
                <ChevronDown className="w-3 h-3" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-neutral-200 overflow-hidden z-20 min-w-[160px]">
                        {Object.entries(statusConfig).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => handleStatusChange(key)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-50 flex items-center gap-2 ${key === currentStatus ? 'bg-neutral-100' : ''
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${value.color.replace('text-', 'bg-').split(' ')[0]}`} />
                                {value.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
