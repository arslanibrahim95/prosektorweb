import { getWorkplaces } from '@/features/crm/actions/workplaces'
import Link from 'next/link'
import { Plus, Search, Layers, Building2, MapPin } from 'lucide-react'

interface WorkplacesPageProps {
    searchParams: Promise<{ q?: string }>
}

const dangerClassMap: Record<string, { label: string, color: string }> = {
    LESS_DANGEROUS: { label: 'Az Tehlikeli', color: 'bg-green-100 text-green-700' },
    DANGEROUS: { label: 'Tehlikeli', color: 'bg-yellow-100 text-yellow-700' },
    VERY_DANGEROUS: { label: 'Çok Tehlikeli', color: 'bg-red-100 text-red-700' },
}

export default async function WorkplacesPage({ searchParams }: WorkplacesPageProps) {
    const params = await searchParams
    const q = params.q || ''
    const { data: workplaces } = await getWorkplaces(1, 100, q)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">İşyerleri</h1>
                    <p className="text-neutral-500 mt-1">Sistemdeki kayıtlı işyeri ve şantiyeler</p>
                </div>
                <Link
                    href="/admin/workplaces/new"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni İşyeri
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
                        placeholder="İşyeri, sgk no veya firma ara..."
                        className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workplaces.map((workplace) => {
                    const danger = dangerClassMap[workplace.dangerClass]
                    return (
                        <Link
                            key={workplace.id}
                            href={`/admin/workplaces/${workplace.id}`}
                            className="bg-white p-6 rounded-2xl border border-neutral-200 hover:border-brand-300 hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Layers className="w-6 h-6" />
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${danger.color}`}>
                                    {danger.label}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-neutral-900 mb-1">{workplace.title}</h3>

                            <div className="space-y-2 text-sm text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    {workplace.company.name}
                                </div>
                                {(workplace.province || workplace.district) && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {workplace.district}/{workplace.province}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-medium text-neutral-500">
                                <span>{workplace.sgkId || 'SGK No Yok'}</span>
                                <span>{workplace._count.employees} Çalışan</span>
                            </div>
                        </Link>
                    )
                })}

                {workplaces.length === 0 && (
                    <div className="col-span-full text-center py-12 text-neutral-500">
                        Kayıt bulunamadı.
                    </div>
                )}
            </div>
        </div>
    )
}
