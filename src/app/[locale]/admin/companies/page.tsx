import { getCompanies } from '@/features/crm/actions/companies'
import Link from 'next/link'
import {
    Plus,
    Search,
    Building2,
    Eye,
    Edit,
    MapPin,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

interface CompaniesPageProps {
    searchParams: Promise<{
        search?: string
        page?: string
    }>
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
    const params = await searchParams
    const search = params.search || ''
    const page = parseInt(params.page || '1', 10)

    const { data: companies, meta } = await getCompanies(page, 10, search)
    const { total, totalPages: pages, page: currentPage } = meta

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Firmalar</h1>
                    <p className="text-neutral-500 mt-1">Toplam {total} firma kayıtlı</p>
                </div>
                <Link
                    href="/admin/companies/new"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Firma
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <form className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={search}
                            placeholder="Firma adı, VKN veya e-posta ile ara..."
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
                    >
                        Ara
                    </button>
                </form>
            </div>

            {/* Company List */}
            {companies.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-2">Firma Bulunamadı</h3>
                    <p className="text-neutral-500 mb-6">
                        {search ? 'Arama kriterlerinize uygun firma bulunamadı.' : 'Henüz hiç firma eklenmemiş.'}
                    </p>
                    <Link
                        href="/admin/companies/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        İlk Firmayı Ekle
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Firma</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">İletişim</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">VKN</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">İşyeri</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">Durum</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-neutral-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {companies.map((company) => (
                                <tr key={company.id} className="hover:bg-neutral-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                {company.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <Link href={`/admin/companies/${company.id}`} className="font-bold text-neutral-900 hover:text-brand-600 transition-colors">
                                                    {company.name}
                                                </Link>
                                                {company.address && (
                                                    <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {company.address.length > 40 ? company.address.slice(0, 40) + '...' : company.address}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {company.email && (
                                                <div className="text-sm text-neutral-600 flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-neutral-400" />
                                                    {company.email}
                                                </div>
                                            )}
                                            {company.phone && (
                                                <div className="text-sm text-neutral-600 flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-neutral-400" />
                                                    {company.phone}
                                                </div>
                                            )}
                                            {!company.email && !company.phone && (
                                                <span className="text-sm text-neutral-400">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-neutral-600 font-mono">
                                            {company.taxId || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg font-bold text-sm">
                                            {company._count.workplaces}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${company.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                            }`}>
                                            {company.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/companies/${company.id}`}
                                                className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                                title="Detay"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                            <Link
                                                href={`/admin/companies/${company.id}/edit`}
                                                className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Düzenle"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="px-6 py-4 border-t border-neutral-100 flex items-center justify-between">
                            <div className="text-sm text-neutral-500">
                                Sayfa {currentPage} / {pages}
                            </div>
                            <div className="flex items-center gap-2">
                                {currentPage > 1 && (
                                    <Link
                                        href={`/admin/companies?page=${currentPage - 1}${search ? `&search=${search}` : ''}`}
                                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Link>
                                )}
                                {currentPage < pages && (
                                    <Link
                                        href={`/admin/companies?page=${currentPage + 1}${search ? `&search=${search}` : ''}`}
                                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
