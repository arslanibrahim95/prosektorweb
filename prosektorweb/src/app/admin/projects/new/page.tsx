import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { NewProjectForm } from '@/components/admin/project/NewProjectForm'
import { prisma } from '@/lib/prisma'

export default async function NewProjectPage() {
    // Get companies and domains for dropdowns
    const [companies, domains] = await Promise.all([
        prisma.company.findMany({
            where: { isActive: true },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
        prisma.domain.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        }),
    ])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/projects"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Proje</h1>
                    <p className="text-neutral-500 mt-1">Müşteri için yeni web sitesi projesi oluşturun</p>
                </div>
            </div>

            <NewProjectForm companies={companies} domains={domains} />
        </div>
    )
}
