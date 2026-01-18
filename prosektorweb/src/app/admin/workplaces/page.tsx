import Link from 'next/link'
import { Layers, Plus, Construction } from 'lucide-react'

export default function WorkplacesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">İşyerleri</h1>
                    <p className="text-neutral-500 mt-1">SGK dosyaları ve şubeler</p>
                </div>
                <button
                    disabled
                    className="flex items-center gap-2 px-6 py-3 bg-neutral-300 text-neutral-500 rounded-xl font-medium cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                    Yeni İşyeri
                </button>
            </div>

            {/* Coming Soon */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Geliştirme Aşamasında</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                    İşyeri yönetimi modülü yakında aktif olacak. Şu an için işyeri eklemek için firma detay sayfasından ilerleyebilirsiniz.
                </p>
                <Link
                    href="/admin/companies"
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                >
                    Firmalara Git
                </Link>
            </div>
        </div>
    )
}
