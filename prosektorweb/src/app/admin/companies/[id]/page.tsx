import { getCompanyById } from '@/actions/company'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft,
    Edit,
    Trash2,
    Building2,
    MapPin,
    Phone,
    Mail,
    FileText,
    Plus,
    Layers,
    Users,
    AlertTriangle
} from 'lucide-react'

interface CompanyDetailPageProps {
    params: Promise<{ id: string }>
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
    const { id } = await params
    const company = await getCompanyById(id)

    if (!company) {
        notFound()
    }

    // Tehlike sınıfı renkleri
    const dangerClassColors = {
        LESS_DANGEROUS: 'bg-green-100 text-green-700',
        DANGEROUS: 'bg-yellow-100 text-yellow-700',
        VERY_DANGEROUS: 'bg-red-100 text-red-700',
    }

    const dangerClassLabels = {
        LESS_DANGEROUS: 'Az Tehlikeli',
        DANGEROUS: 'Tehlikeli',
        VERY_DANGEROUS: 'Çok Tehlikeli',
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/companies"
                        className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/30">
                            {company.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 font-serif">{company.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${company.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                    }`}>
                                    {company.isActive ? 'Aktif' : 'Pasif'}
                                </span>
                                {company.taxId && (
                                    <span className="text-sm text-neutral-500">VKN: {company.taxId}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href={`/admin/companies/${company.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Düzenle
                    </Link>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Company Details */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-brand-600" />
                        Firma Bilgileri
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="text-sm text-neutral-500 mb-1">E-posta</div>
                            <div className="flex items-center gap-2 text-neutral-900">
                                <Mail className="w-4 h-4 text-neutral-400" />
                                {company.email || '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-500 mb-1">Telefon</div>
                            <div className="flex items-center gap-2 text-neutral-900">
                                <Phone className="w-4 h-4 text-neutral-400" />
                                {company.phone || '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-500 mb-1">Vergi Dairesi</div>
                            <div className="flex items-center gap-2 text-neutral-900">
                                <FileText className="w-4 h-4 text-neutral-400" />
                                {company.taxOffice || '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-neutral-500 mb-1">Kayıt Tarihi</div>
                            <div className="text-neutral-900">
                                {new Date(company.createdAt).toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                        {company.address && (
                            <div className="md:col-span-2">
                                <div className="text-sm text-neutral-500 mb-1">Adres</div>
                                <div className="flex items-start gap-2 text-neutral-900">
                                    <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                                    {company.address}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-neutral-500">İşyeri Sayısı</span>
                            <Layers className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="text-3xl font-bold text-neutral-900">{company.workplaces.length}</div>
                    </div>
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-neutral-500">Toplam Çalışan</span>
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="text-3xl font-bold text-neutral-900">
                            {company.workplaces.reduce((sum, wp) => sum + wp._count.employees, 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Workplaces */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-brand-600" />
                        İşyerleri
                    </h2>
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors text-sm">
                        <Plus className="w-4 h-4" />
                        İşyeri Ekle
                    </button>
                </div>

                {company.workplaces.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">
                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Bu firmaya ait işyeri bulunmuyor.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {company.workplaces.map((workplace) => (
                            <div key={workplace.id} className="p-4 bg-neutral-50 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${workplace.dangerClass === 'VERY_DANGEROUS' ? 'bg-red-500' :
                                            workplace.dangerClass === 'DANGEROUS' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`} />
                                    <div>
                                        <div className="font-bold text-neutral-900">{workplace.title}</div>
                                        <div className="text-sm text-neutral-500 flex items-center gap-3">
                                            {workplace.sgkId && <span>SGK: {workplace.sgkId}</span>}
                                            {workplace.naceCode && <span>NACE: {workplace.naceCode}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${dangerClassColors[workplace.dangerClass]}`}>
                                        {dangerClassLabels[workplace.dangerClass]}
                                    </span>
                                    <div className="text-sm text-neutral-500">
                                        <Users className="w-4 h-4 inline mr-1" />
                                        {workplace._count.employees} çalışan
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
