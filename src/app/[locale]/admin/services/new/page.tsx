import { prisma } from '@/lib/prisma'
import { createService } from '@/features/finance/actions/services'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'

export default async function NewServicePage() {
    const companies = await prisma.company.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/services"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Hizmet Tanımla</h1>
                    <p className="text-neutral-500 mt-1">Hosting, domain veya bakım anlaşması ekle</p>
                </div>
            </div>

            <form action={async (formData: FormData) => { 'use server'; await createService(formData) }} className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">Müşteri <span className="text-red-500">*</span></label>
                    <select name="companyId" required className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                        <option value="">Seçiniz</option>
                        {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Hizmet Adı <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="Örn: 2024 Hosting Hizmeti"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Hizmet Türü</label>
                        <select name="type" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                            <option value="HOSTING">Hosting</option>
                            <option value="DOMAIN">Domain</option>
                            <option value="SEO">SEO Danışmanlığı</option>
                            <option value="MAINTENANCE">Bakım Anlaşması</option>
                            <option value="SOCIAL_MEDIA">Sosyal Medya</option>
                            <option value="ADS">Reklam Yönetimi</option>
                            <option value="OTHER">Diğer</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Fiyat <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            name="price"
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Para Birimi</label>
                        <select name="currency" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                            <option value="TRY">TL (₺)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Faturalandırma</label>
                        <select name="billingCycle" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                            <option value="YEARLY">Yıllık</option>
                            <option value="MONTHLY">Aylık</option>
                            <option value="ONETIME">Tek Seferlik</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Başlangıç Tarihi <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            name="startDate"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Yenileme Tarihi (Opsiyonel)</label>
                        <input
                            type="date"
                            name="renewDate"
                            placeholder="Otomatik hesaplanır"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                        <p className="text-xs text-neutral-400">Boş bırakırsanız döngüye göre otomatik hesaplanır.</p>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                    <Link href="/admin/services" className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors">
                        İptal
                    </Link>
                    <button type="submit" className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg shadow-brand-600/20">
                        <Save className="w-5 h-5" />
                        Kaydet
                    </button>
                </div>
            </form>
        </div>
    )
}
