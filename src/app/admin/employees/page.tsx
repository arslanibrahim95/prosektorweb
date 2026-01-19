import { getEmployees } from '@/actions/employee'
import Link from 'next/link'
import { Plus, Search, Users, MapPin, Building2, Phone } from 'lucide-react'

interface EmployeesPageProps {
    searchParams: Promise<{ q?: string }>
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
    const params = await searchParams
    const q = params.q || ''
    const employees = await getEmployees(q)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Çalışanlar</h1>
                    <p className="text-neutral-500 mt-1">Sistemdeki kayıtlı tüm personel listesi</p>
                </div>
                <Link
                    href="/admin/employees/new"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Çalışan
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <form className="relative">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="İsim, TC no veya işyeri ara..."
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                    <Link
                        key={employee.id}
                        href={`/admin/employees/${employee.id}`}
                        className="bg-white p-6 rounded-2xl border border-neutral-200 hover:border-brand-300 hover:shadow-lg transition-all group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">{employee.firstName} {employee.lastName}</h3>
                                <div className="text-sm text-neutral-500">{employee.position || 'Pozisyon Yok'}</div>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm text-neutral-500">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                {employee.workplace.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                ({employee.workplace.company.name})
                            </div>
                            {employee.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {employee.phone}
                                </div>
                            )}
                        </div>
                    </Link>
                ))}

                {employees.length === 0 && (
                    <div className="col-span-full text-center py-12 text-neutral-500">
                        Kayıt bulunamadı.
                    </div>
                )}
            </div>
        </div>
    )
}
