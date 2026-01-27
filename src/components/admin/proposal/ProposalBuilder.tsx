'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, Plus, Trash2, Calculator, FileText } from 'lucide-react'
import { createProposal } from '@/features/crm/actions/proposals'

interface Props {
    companies: Array<{ id: string; name: string }>
}

type ProposalItem = {
    id: string
    description: string
    quantity: number
    unitPrice: number
}

export function ProposalBuilder({ companies }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form State
    const [companyId, setCompanyId] = useState('')
    const [subject, setSubject] = useState('')
    const [validUntil, setValidUntil] = useState('')
    const [items, setItems] = useState<ProposalItem[]>([
        { id: '1', description: '', quantity: 1, unitPrice: 0 }
    ])

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
    const taxRate = 0.20
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    const handleAddItem = () => {
        setItems([
            ...items,
            { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, unitPrice: 0 }
        ])
    }

    const handleRemoveItem = (id: string) => {
        if (items.length === 1) return
        setItems(items.filter(i => i.id !== id))
    }

    const handleItemChange = (id: string, field: keyof ProposalItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value }
            }
            return item
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validation
        if (!companyId) {
            setError('Lütfen bir müşteri seçin')
            setLoading(false)
            return
        }

        const payload = {
            companyId,
            subject,
            validUntil: validUntil ? new Date(validUntil) : undefined,
            items: items.map(i => ({
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice
            }))
        }

        const result = await createProposal(payload)

        if (result.success) {
            router.push('/admin/proposals')
            router.refresh()
        } else {
            setError(result.error || 'Bir hata oluştu')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header Info */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-600" />
                            Teklif Detayları
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Teklif Konusu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Örn: Web Sitesi Tasarımı ve Yazılımı"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Müşteri <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    required
                                >
                                    <option value="">Seçiniz</option>
                                    {companies.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Geçerlilik Tarihi
                                </label>
                                <input
                                    type="date"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-neutral-900">Hizmet Kalemleri</h2>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" />
                                Kalem Ekle
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id} className="flex gap-3 items-start p-3 bg-neutral-50 rounded-xl group hover:border-brand-200 border border-transparent transition-colors">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Hizmet Açıklaması"
                                            value={item.description}
                                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="w-20">
                                        <input
                                            type="number"
                                            placeholder="Adet"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            placeholder="Fiyat"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm text-right"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-neutral-200 p-6 sticky top-6">
                        <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-neutral-500" />
                            Özet
                        </h3>

                        <div className="space-y-3 text-sm border-b border-neutral-100 pb-4 mb-4">
                            <div className="flex justify-between text-neutral-600">
                                <span>Ara Toplam</span>
                                <span className="font-medium">{subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                            </div>
                            <div className="flex justify-between text-neutral-600">
                                <span>KDV (%20)</span>
                                <span className="font-medium">{taxAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-lg font-bold text-neutral-900 mb-6">
                            <span>Genel Toplam</span>
                            <span className="text-brand-600">{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Teklifi Oluştur'}
                            </button>
                            <Link
                                href="/admin/proposals"
                                className="w-full py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors text-center"
                            >
                                İptal
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
