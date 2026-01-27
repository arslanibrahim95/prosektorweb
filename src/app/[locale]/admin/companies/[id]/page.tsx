import { getCompany } from '@/features/crm/actions/companies'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft, Edit, Building2, MapPin, Phone, Mail, Globe, Calendar, Users, Briefcase, FileText, Receipt, Layers, MessageSquare
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { CrmNotesSection } from '@/features/crm/components/NotesSection'
import { CrmContactsSection } from '@/features/crm/components/ContactsSection'
import { CrmActivitiesSection } from '@/features/crm/components/ActivitiesSection'
import { CrmStatusBadge } from '@/features/crm/components/StatusBadge'

interface CompanyDetailPageProps {
    params: Promise<{ id: string }>
}

const dangerClassColors: Record<string, string> = {
    LESS_DANGEROUS: 'bg-green-100 text-green-700',
    DANGEROUS: 'bg-yellow-100 text-yellow-700',
    VERY_DANGEROUS: 'bg-red-100 text-red-700',
}

const dangerClassLabels: Record<string, string> = {
    LESS_DANGEROUS: 'Az Tehlikeli',
    DANGEROUS: 'Tehlikeli',
    VERY_DANGEROUS: 'Çok Tehlikeli',
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
    const { id } = await params
    const company = await getCompany(id) as any

    if (!company) {
        notFound()
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
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-neutral-900 font-serif">{company.name}</h1>
                                <CrmStatusBadge status={company.status} companyId={company.id} />
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                {company.taxId && (
                                    <span className="text-sm text-neutral-500">VKN: {company.taxId}</span>
                                )}
                                {company.source && (
                                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
                                        {company.source}
                                    </span>
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
                    <Link
                        href={`/admin/invoices/new?companyId=${company.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
                    >
                        <Receipt className="w-4 h-4" />
                        Fatura Kes
                    </Link>

                    {/* View As Button */}
                    <form action={async () => {
                        'use server'
                        const { impersonateCompany } = await import('@/features/system/actions/admin-ops')
                        await impersonateCompany(company.id)
                    }}>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors">
                            <Layers className="w-4 h-4" />
                            Portal'a Git
                        </button>
                    </form>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">İşyeri</span>
                        <Layers className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{company.workplaces.length}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Çalışan</span>
                        <Users className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">
                        {company.workplaces.reduce((sum: number, wp: any) => sum + wp._count.employees, 0)}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Fatura</span>
                        <Receipt className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{company._count.invoices}</div>
                </div>
                <div className="bg-white rounded-xl border border-neutral-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-500">Notlar</span>
                        <MessageSquare className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold text-neutral-900">{company.notes.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Company Info & Contacts */}
                <div className="space-y-6">
                    {/* Company Info */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-brand-600" />
                            Firma Bilgileri
                        </h2>
                        <div className="space-y-4">
                            {company.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-neutral-400" />
                                    <a href={`mailto:${company.email}`} className="text-brand-600 hover:underline">
                                        {company.email}
                                    </a>
                                </div>
                            )}
                            {company.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-neutral-400" />
                                    <a href={`tel:${company.phone}`} className="text-neutral-900">
                                        {company.phone}
                                    </a>
                                </div>
                            )}
                            {company.taxOffice && (
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-neutral-400" />
                                    <span className="text-neutral-600">{company.taxOffice}</span>
                                </div>
                            )}
                            {company.address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                                    <span className="text-neutral-600">{company.address}</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-400">
                                Kayıt: {new Date(company.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                        </div>
                    </div>

                    {/* Contacts */}
                    <CrmContactsSection contacts={company.contacts} companyId={company.id} />
                </div>

                {/* Middle Column - Notes */}
                <div>
                    <CrmNotesSection notes={company.notes} companyId={company.id} />
                </div>

                {/* Right Column - Activities */}
                <div>
                    <CrmActivitiesSection activities={company.activities} companyId={company.id} />
                </div>
            </div>

            {/* Workplaces */}
            {company.workplaces.length > 0 && (
                <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                    <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-brand-600" />
                        İşyerleri ({company.workplaces.length})
                    </h2>
                    <div className="space-y-3">
                        {company.workplaces.map((workplace: any) => (
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
                </div>
            )}
        </div>
    )
}
