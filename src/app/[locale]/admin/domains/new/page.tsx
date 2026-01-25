import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { NewDomainForm } from '@/features/projects/components/NewDomainForm'
import { prisma } from '@/lib/prisma'

export default async function NewDomainPage() {
    // Get companies for dropdown
    const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    // Get default IP from API config
    let defaultIp = ''
    try {
        const config = await prisma.apiConfig.findFirst({
            where: { isActive: true },
            select: { defaultIp: true },
        })
        defaultIp = config?.defaultIp || ''
    } catch (e) { }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/domains"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Domain</h1>
                    <p className="text-neutral-500 mt-1">Yeni bir domain kaydı ekleyin</p>
                </div>
            </div>

            <NewDomainForm companies={companies} defaultIp={defaultIp} />
        </div>
    )
}
