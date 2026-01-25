import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getCompany } from '@/features/crm/actions/companies'
import { CompanyForm } from '@/features/crm/components/CompanyForm'

interface CompanyEditPageProps {
    params: Promise<{ id: string }>
}

export default async function CompanyEditPage({ params }: CompanyEditPageProps) {
    const { id } = await params
    const company = await getCompany(id) as any

    if (!company) {
        notFound()
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/companies/${company.id}`}
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Firma Düzenle</h1>
                    <p className="text-neutral-500 mt-1">{company.name}</p>
                </div>
            </div>

            {/* Form */}
            <CompanyForm company={company} />
        </div>
    )
}
