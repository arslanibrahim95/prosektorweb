'use client'

import { useActionState, useEffect } from 'react'
import { createCompany, updateCompany, CompanyActionResult } from '@/actions/company'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Building2 } from 'lucide-react'

interface CompanyFormProps {
    company?: {
        id: string
        name: string
        taxId?: string | null
        taxOffice?: string | null
        email?: string | null
        phone?: string | null
        address?: string | null
    }
}

const initialState: CompanyActionResult = {
    success: false,
}

export function CompanyForm({ company }: CompanyFormProps) {
    const router = useRouter()
    const isEditing = !!company

    const formAction = async (prevState: CompanyActionResult, formData: FormData) => {
        if (isEditing && company) {
            return await updateCompany(company.id, formData)
        }
        return await createCompany(formData)
    }

    const [state, action, isPending] = useActionState(formAction, initialState)

    useEffect(() => {
        if (state.success) {
            router.push('/admin/companies')
            router.refresh()
        }
    }, [state.success, router])

    return (
        <form action={action} className="space-y-6">
            {/* Error Message */}
            {state.error && (
                <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>{state.error}</span>
                </div>
            )}

            {/* Firma Bilgileri */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg font-bold text-neutral-900">Firma Bilgileri</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Firma Adı */}
                    <div className="md:col-span-2">
                        <label htmlFor="name" className="block text-sm font-semibold text-neutral-700 mb-2">
                            Firma Adı <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            required
                            aria-required="true"
                            defaultValue={company?.name || ''}
                            placeholder="Örn: ABC İnşaat A.Ş."
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* VKN */}
                    <div>
                        <label htmlFor="taxId" className="block text-sm font-semibold text-neutral-700 mb-2">
                            Vergi Kimlik No (VKN)
                        </label>
                        <input
                            id="taxId"
                            type="text"
                            name="taxId"
                            defaultValue={company?.taxId || ''}
                            placeholder="10 haneli VKN"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Vergi Dairesi */}
                    <div>
                        <label htmlFor="taxOffice" className="block text-sm font-semibold text-neutral-700 mb-2">
                            Vergi Dairesi
                        </label>
                        <input
                            id="taxOffice"
                            type="text"
                            name="taxOffice"
                            defaultValue={company?.taxOffice || ''}
                            placeholder="Örn: Kadıköy V.D."
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* E-posta */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                            E-posta
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            defaultValue={company?.email || ''}
                            placeholder="info@firma.com"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Telefon */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">
                            Telefon
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            defaultValue={company?.phone || ''}
                            placeholder="+90 XXX XXX XX XX"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Adres */}
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-semibold text-neutral-700 mb-2">
                            Adres
                        </label>
                        <textarea
                            id="address"
                            name="address"
                            rows={3}
                            defaultValue={company?.address || ''}
                            placeholder="Merkez ofis adresi..."
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                >
                    İptal
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-brand-600/30"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Kaydediliyor...
                        </>
                    ) : (
                        isEditing ? 'Güncelle' : 'Firma Oluştur'
                    )}
                </button>
            </div>
        </form>
    )
}
