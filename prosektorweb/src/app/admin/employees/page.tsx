import Link from 'next/link'
import { Users, Plus, Construction } from 'lucide-react'

export default function EmployeesPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Çalışanlar</h1>
                    <p className="text-neutral-500 mt-1">Personel listesi ve yönetimi</p>
                </div>
                <Link
                    href="/admin/employees/new"
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/30"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Çalışan
                </Link>
            </div>

            {/* Coming Soon */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Geliştirme Aşamasında</h3>
                <p className="text-neutral-500 max-w-md mx-auto">
                    Çalışan yönetimi modülü yakında aktif olacak. Şu an için firmalara çalışan eklemek için önce firma oluşturmanız gerekmektedir.
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
