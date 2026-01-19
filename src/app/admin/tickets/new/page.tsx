import { prisma } from '@/lib/prisma'
import { createTicket } from '@/actions/ticket'
import Link from 'next/link'
import { ChevronLeft, Loader2, Save } from 'lucide-react'
import { TicketPriority, TicketCategory } from '@prisma/client'

export default async function NewTicketPage() {
    const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/tickets"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Talep Oluştur</h1>
                    <p className="text-neutral-500 mt-1">Personel olarak firma adına talep kaydı açın</p>
                </div>
            </div>

            <form action={createTicket as any} className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Müşteri <span className="text-red-500">*</span></label>
                        <select name="companyId" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                            <option value="">Seçiniz</option>
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Kategori</label>
                        <select name="category" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                            <option value="WEB_DESIGN">Web Tasarım</option>
                            <option value="SEO">SEO</option>
                            <option value="ADS">Reklam Yönetimi</option>
                            <option value="HOSTING">Hosting / Domain</option>
                            <option value="OTHER">Diğer</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">Konu <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="subject"
                        required
                        placeholder="Örn: İletişim formu çalışmıyor"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">Mesaj Detayı <span className="text-red-500">*</span></label>
                    <textarea
                        name="message"
                        required
                        rows={4}
                        placeholder="Sorunu detaylıca açıklayınız..."
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">Öncelik</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="priority" value="LOW" className="text-brand-600 focus:ring-brand-500" />
                            <span className="text-sm text-neutral-600">Düşük</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="priority" value="NORMAL" defaultChecked className="text-brand-600 focus:ring-brand-500" />
                            <span className="text-sm text-neutral-600">Normal</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="priority" value="HIGH" className="text-brand-600 focus:ring-brand-500" />
                            <span className="text-sm text-red-600 font-medium">Yüksek</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="priority" value="URGENT" className="text-brand-600 focus:ring-brand-500" />
                            <span className="text-sm text-red-700 font-bold">Acil</span>
                        </label>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                    <Link href="/admin/tickets" className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors">
                        İptal
                    </Link>
                    <button type="submit" className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg shadow-brand-600/20">
                        <Save className="w-5 h-5" />
                        Talebi Oluştur
                    </button>
                </div>
            </form>
        </div>
    )
}
