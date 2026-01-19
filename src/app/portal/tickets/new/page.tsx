'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, Loader2 } from 'lucide-react'
import { createClientTicket } from '@/actions/portal'

export default function NewTicketPage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')

    async function handleSubmit(formData: FormData) {
        setError('')

        startTransition(async () => {
            const result = await createClientTicket(formData)

            if (result.success) {
                router.push('/portal/tickets')
            } else {
                setError(result.error || 'Bir hata oluştu')
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link
                    href="/portal/tickets"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Destek Talebi</h1>
                    <p className="text-neutral-500 mt-1">Yardım almak için talebinizi iletin</p>
                </div>
            </div>

            <form action={handleSubmit} className="bg-white rounded-2xl border border-neutral-200 p-8 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                        Konu *
                    </label>
                    <input
                        type="text"
                        name="subject"
                        required
                        placeholder="Örn: Web sitemde hata var"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                        Kategori
                    </label>
                    <select
                        name="category"
                        defaultValue="OTHER"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white"
                    >
                        <option value="TECHNICAL">Teknik Sorun</option>
                        <option value="BILLING">Faturalama</option>
                        <option value="FEATURE_REQUEST">Özellik Talebi</option>
                        <option value="OTHER">Diğer</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                        Öncelik
                    </label>
                    <select
                        name="priority"
                        defaultValue="NORMAL"
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all bg-white"
                    >
                        <option value="LOW">Düşük</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">Yüksek</option>
                        <option value="URGENT">Acil</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">
                        Mesajınız *
                    </label>
                    <textarea
                        name="message"
                        required
                        rows={6}
                        placeholder="Sorununuzu detaylı olarak açıklayın..."
                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all resize-none"
                    />
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-neutral-100">
                    <Link
                        href="/portal/tickets"
                        className="px-6 py-3 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                    >
                        İptal
                    </Link>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium shadow-lg shadow-brand-600/30 disabled:opacity-50"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        Gönder
                    </button>
                </div>
            </form>
        </div>
    )
}
