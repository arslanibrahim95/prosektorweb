import { getWorkplaceById } from '@/actions/workplace'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Layers, Users, MapPin, Building2, Pencil, Trash2 } from 'lucide-react'
import { WorkplaceForm } from '@/components/admin/workplace/WorkplaceForm'

interface WorkplaceDetailPageProps {
    params: Promise<{ id: string }>
}

const dangerClassMap: Record<string, { label: string, color: string }> = {
    LESS_DANGEROUS: { label: 'Az Tehlikeli', color: 'bg-green-100 text-green-700' },
    DANGEROUS: { label: 'Tehlikeli', color: 'bg-yellow-100 text-yellow-700' },
    VERY_DANGEROUS: { label: 'Çok Tehlikeli', color: 'bg-red-100 text-red-700' },
}

export default async function WorkplaceDetailPage({ params }: WorkplaceDetailPageProps) {
    const { id } = await params
    const workplace = await getWorkplaceById(id)

    if (!workplace) {
        notFound()
    }

    const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    })

    const danger = dangerClassMap[workplace.dangerClass]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/workplaces"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Layers className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-neutral-900 font-serif">{workplace.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${danger.color}`}>
                                    {danger.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-neutral-500 mt-1">
                                <Link href={`/admin/companies/${workplace.companyId}`} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                                    <Building2 className="w-4 h-4" />
                                    {workplace.company.name}
                                </Link>
                                {(workplace.province || workplace.district) && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {workplace.district}/{workplace.province}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <WorkplaceForm companies={companies} workplace={workplace} />
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Employee Quick Stats */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Çalışanlar
                            </h2>
                            <Link
                                href="/admin/employees/new"
                                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
                            >
                                + Ekle
                            </Link>
                        </div>
                        <div className="text-3xl font-bold text-neutral-900 mb-1">{workplace.employees.length}</div>
                        <div className="text-sm text-neutral-500">Kayıtlı Personel</div>

                        <div className="mt-4 space-y-2">
                            {workplace.employees.slice(0, 5).map(emp => (
                                <Link
                                    key={emp.id}
                                    href={`/admin/employees/${emp.id}`}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-50 text-sm transition-colors"
                                >
                                    <span className="font-medium text-neutral-700">{emp.firstName} {emp.lastName}</span>
                                    <span className="text-neutral-400">→</span>
                                </Link>
                            ))}
                            {workplace.employees.length > 5 && (
                                <Link href="/admin/employees" className="block text-center text-xs text-neutral-500 hover:text-brand-600 mt-2">
                                    Tümünü Gör
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
