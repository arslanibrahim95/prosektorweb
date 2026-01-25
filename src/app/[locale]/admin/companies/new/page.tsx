import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { CompanyForm } from '@/features/crm/components/CompanyForm'

export default function NewCompanyPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/companies"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Firma</h1>
                    <p className="text-neutral-500 mt-1">Müşteri portföyünüze yeni bir firma ekleyin</p>
                </div>
            </div>

            {/* Form */}
            <CompanyForm />
        </div>
    )
}
