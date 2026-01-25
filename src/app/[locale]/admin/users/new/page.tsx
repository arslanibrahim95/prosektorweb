import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { UserForm } from '@/components/admin/user/UserForm'

export default function NewUserPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/users"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Kullanıcı</h1>
                    <p className="text-neutral-500 mt-1">Sisteme erişimi olan yeni personel ekleyin</p>
                </div>
            </div>

            <UserForm />
        </div>
    )
}
