'use client'

import { useActionState, useEffect, useState } from 'react'
import { createInvoice, updateInvoiceStatus, ActionResult } from '@/features/finance/actions/invoices'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Receipt, Building2, Calendar, Calculator } from 'lucide-react'

interface Company {
    id: string
    name: string
}

interface InvoiceFormProps {
    companies: Company[]
    initialInvoiceNo: string
}

const initialState: ActionResult = {
    success: false,
    error: '',
}

import { Decimal } from 'decimal.js'

// ... imports ...

export function InvoiceForm({ companies, initialInvoiceNo }: InvoiceFormProps) {
    const router = useRouter()

    // RED LINE FIX: Use strings for money input to avoid float precision issues during typing
    const [subtotal, setSubtotal] = useState<string>('')
    const [taxRate, setTaxRate] = useState<string>('20')
    const [idempotencyKey] = useState(() => window.crypto.randomUUID())

    // Safe Decimal Math (Client-side projection)
    const subVal = new Decimal(subtotal || '0')
    const taxVal = new Decimal(taxRate || '0')
    const taxAmount = subVal.mul(taxVal).div(100)
    const total = subVal.plus(taxAmount)

    const formAction = async (prevState: ActionResult, formData: FormData) => {
        return await createInvoice(formData)
    }

    const [state, action, isPending] = useActionState(formAction, initialState)

    useEffect(() => {
        if (state.success) {
            router.push('/admin/invoices')
            router.refresh()
        }
    }, [state.success, router])

    const formatCurrency = (amount: Decimal | number) => {
        const val = typeof amount === 'number' ? amount : amount.toNumber()
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(val)
    }

    return (
        <form action={action} className="space-y-6">
            <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
            {/* Error Message */}
            {!state.success && state.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>{state.error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Fatura Bilgileri */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
                            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-brand-600" />
                            </div>
                            <h2 className="text-lg font-bold text-neutral-900">Fatura Bilgileri</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Fatura No */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Fatura No <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="invoiceNo"
                                    required
                                    defaultValue={initialInvoiceNo}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-mono"
                                />
                            </div>

                            {/* Firma */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Firma <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="companyId"
                                    required
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                >
                                    <option value="">Firma Seçin</option>
                                    {companies.map((company) => (
                                        <option key={company.id} value={company.id}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Düzenleme Tarihi */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Düzenleme Tarihi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="issueDate"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Vade Tarihi */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Vade Tarihi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    required
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Açıklama */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    placeholder="Fatura açıklaması..."
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tutar Bilgileri */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <Calculator className="w-5 h-5 text-green-600" />
                            </div>
                            <h2 className="text-lg font-bold text-neutral-900">Tutar Bilgileri</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Ara Toplam */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Ara Toplam (KDV Hariç) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="subtotal"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={subtotal}
                                    onChange={(e) => setSubtotal(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* KDV Oranı */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    KDV Oranı (%)
                                </label>
                                <select
                                    name="taxRate"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                                >
                                    <option value="0">%0</option>
                                    <option value="1">%1</option>
                                    <option value="10">%10</option>
                                    <option value="20">%20</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl p-6 text-white sticky top-8">
                        <h3 className="text-lg font-bold mb-6">Fatura Özeti</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-brand-100">Ara Toplam</span>
                                <span className="font-bold">{formatCurrency(subVal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-brand-100">KDV (%{taxRate})</span>
                                <span className="font-bold">{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="border-t border-white/20 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold">Genel Toplam</span>
                                    <span className="text-2xl font-bold">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full px-8 py-4 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Receipt className="w-5 h-5" />
                                Fatura Oluştur
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full px-8 py-4 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                    >
                        İptal
                    </button>
                </div>
            </div>
        </form>
    )
}
