'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, Building2, MapPin, Hash } from 'lucide-react'
import { createWorkplace, updateWorkplace } from '@/actions/workplaces'

interface Props {
    companies: Array<{ id: string; name: string }>
    // If provided, we are in edit mode
    workplace?: {
        id: string
        title: string
        companyId: string
        sgkId: string | null
        dangerClass: string
        naceCode: string | null
        province: string | null
        district: string | null
        address: string | null
    }
}

export function WorkplaceForm({ companies, workplace }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const isEdit = !!workplace

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        let result
        if (isEdit && workplace) {
            result = await updateWorkplace(workplace.id, formData)
        } else {
            result = await createWorkplace(formData)
        }

        if (result.success) {
            router.push('/admin/workplaces')
            router.refresh()
        } else {
            setError(result.error || 'Bir hata oluştu')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-600" />
                    İşyeri Bilgileri
                </h2>

                <div className="space-y-6">
                    {/* Firma Seçimi */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Bağlı Olduğu Firma <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="companyId"
                            required
                            defaultValue={workplace?.companyId || ''}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="">Firma Seçin</option>
                            {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Başlık */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            İşyeri / Şantiye Adı <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            defaultValue={workplace?.title || ''}
                            placeholder="Örn: Merkez Ofis, Ankara Şantiyesi"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>

                    {/* Tehlike Sınıfı */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Tehlike Sınıfı <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="dangerClass"
                            required
                            defaultValue={workplace?.dangerClass || 'LESS_DANGEROUS'}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="LESS_DANGEROUS">Az Tehlikeli</option>
                            <option value="DANGEROUS">Tehlikeli</option>
                            <option value="VERY_DANGEROUS">Çok Tehlikeli</option>
                        </select>
                    </div>

                    {/* SGK & NACE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                SGK Sicil No
                            </label>
                            <div className="relative">
                                <Hash className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="sgkId"
                                    defaultValue={workplace?.sgkId || ''}
                                    placeholder="26 haneli sicil no"
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                NACE Kodu
                            </label>
                            <input
                                type="text"
                                name="naceCode"
                                defaultValue={workplace?.naceCode || ''}
                                placeholder="6 haneli kod"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    {/* Adres */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                İl
                            </label>
                            <input
                                type="text"
                                name="province"
                                defaultValue={workplace?.province || ''}
                                placeholder="İstanbul"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                İlçe
                            </label>
                            <input
                                type="text"
                                name="district"
                                defaultValue={workplace?.district || ''}
                                placeholder="Kadıköy"
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Açık Adres
                            </label>
                            <textarea
                                name="address"
                                rows={3}
                                defaultValue={workplace?.address || ''}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Link
                    href="/admin/workplaces"
                    className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                >
                    İptal
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isEdit ? 'Güncelle' : 'Oluştur'}
                </button>
            </div>
        </form>
    )
}
