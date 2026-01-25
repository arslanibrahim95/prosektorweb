import { getEmployeeById } from '@/features/crm/actions/employees'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, User, Building2, Calendar, Phone, Mail } from 'lucide-react'
import { EmployeeForm } from '@/features/crm/components/EmployeeForm'

interface EmployeeDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
    const { id } = await params
    const employee = await getEmployeeById(id)

    if (!employee) {
        notFound()
    }

    const workplaces = await prisma.workplace.findMany({
        where: { isActive: true },
        select: { id: true, title: true },
        orderBy: { title: 'asc' },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/employees"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                            <User className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 font-serif">{employee.firstName} {employee.lastName}</h1>
                            <div className="flex items-center gap-2 text-neutral-500 mt-1">
                                <span>{employee.position || 'Pozisyon Yok'}</span>
                                <span>•</span>
                                <Link href={`/admin/workplaces/${employee.workplaceId}`} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                                    <Building2 className="w-4 h-4" />
                                    {employee.workplace.title}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <EmployeeForm workplaces={workplaces} employee={employee} />
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
                        <h2 className="font-bold text-neutral-900 mb-4">Özet Bilgiler</h2>

                        {employee.recruitmentDate && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs text-neutral-500">İşe Giriş</div>
                                    <div className="text-sm font-medium">{new Date(employee.recruitmentDate).toLocaleDateString('tr-TR')}</div>
                                </div>
                            </div>
                        )}

                        {employee.phone && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs text-neutral-500">Telefon</div>
                                    <div className="text-sm font-medium">{employee.phone}</div>
                                </div>
                            </div>
                        )}

                        {employee.email && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-xs text-neutral-500">E-posta</div>
                                    <div className="text-sm font-medium truncate max-w-[150px]">{employee.email}</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
