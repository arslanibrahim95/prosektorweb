import { getSystemUser } from '@/features/system/actions/system-users'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { UserForm } from '@/components/admin/user/UserForm'

interface UserIdPageProps {
    params: Promise<{ id: string }>
}

export default async function UserEditPage({ params }: UserIdPageProps) {
    const { id } = await params
    const user = await getSystemUser(id)

    if (!user) {
        notFound()
    }

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
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Kullanıcı Düzenle</h1>
                    <p className="text-neutral-500 mt-1">{user.name} kullanıcısının bilgilerini güncelleyin</p>
                </div>
            </div>

            <UserForm user={user as any} />
        </div>
    )
}
