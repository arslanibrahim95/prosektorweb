import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { EmployeeForm } from '@/features/crm/components/EmployeeForm'
import { prisma } from '@/lib/prisma'

export default async function NewEmployeePage() {
    const workplaces = await prisma.workplace.findMany({
        where: { isActive: true },
        select: { id: true, title: true },
        orderBy: { title: 'asc' },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/employees"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Çalışan</h1>
                    <p className="text-neutral-500 mt-1">Personel girişi yapın</p>
                </div>
            </div>

            <EmployeeForm workplaces={workplaces} />
        </div>
    )
}
