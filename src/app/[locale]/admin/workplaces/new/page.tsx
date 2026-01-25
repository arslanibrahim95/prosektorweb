import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WorkplaceForm } from '@/features/crm/components/WorkplaceForm'
import { prisma } from '@/lib/prisma'

export default async function NewWorkplacePage() {
    const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/workplaces"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni İşyeri</h1>
                    <p className="text-neutral-500 mt-1">Sisteme yeni işyeri veya şantiye kaydedin</p>
                </div>
            </div>

            <WorkplaceForm companies={companies} />
        </div>
    )
}
