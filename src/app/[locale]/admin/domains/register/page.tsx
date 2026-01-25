import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
// import { searchDomain, purchaseDomain } from '@/features/projects/actions/domain-registrar' // searchDomain doesn't exist, unused here?
import { DomainSearchAndPurchase } from '@/features/projects/components/DomainSearchAndPurchase'
import { prisma } from '@/lib/prisma'

export default async function DomainRegisterPage() {
    // Get companies for dropdown
    const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

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
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Domain Satın Al</h1>
                    <p className="text-neutral-500 mt-1">Cloudflare üzerinden toptan fiyatlarla</p>
                </div>
            </div>

            <DomainSearchAndPurchase companies={companies} />

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 text-sm">
                <strong>Not:</strong> Domain satın alma işlemi Cloudflare hesabınızdaki ödeme yöntemiyle gerçekleşir.
                WHOIS gizliliği ücretsiz dahildir.
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 text-sm">
                <strong>.com.tr uzantıları:</strong> Türkiye uzantıları Cloudflare üzerinden satın alınamaz.
                Bu uzantılar için NIC.tr veya yerel registrar kullanmanız gerekir.
            </div>
        </div>
    )
}
