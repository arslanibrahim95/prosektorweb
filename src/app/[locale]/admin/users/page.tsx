import { getSystemUsers } from '@/features/system/actions/system-users'
import Link from 'next/link'
import {
    Users,
    Plus,
    Search,
    Shield,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    UserCog
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

interface UsersPageProps {
    searchParams: Promise<{ q?: string, page?: string }>
}

const roleConfig: Record<string, { label: string, color: string }> = {
    ADMIN: { label: 'Yönetici', color: 'bg-purple-100 text-purple-700' },
    DOCTOR: { label: 'Hekim', color: 'bg-blue-100 text-blue-700' },
    EXPERT: { label: 'Uzman', color: 'bg-indigo-100 text-indigo-700' },
    OFFICE: { label: 'Ofis', color: 'bg-gray-100 text-gray-700' },
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
    const params = await searchParams
    const searchQuery = params.q || ''
    const page = Number(params.page) || 1

    const { data: users, meta } = await getSystemUsers(page, 20, searchQuery)

    return (
        <div className="space-y-6">
            <PageHeader
                title="Kullanıcı Yönetimi"
                description="Sistem yöneticileri ve personel yönetimi"
                action={{
                    label: "Yeni Kullanıcı",
                    href: "/admin/users/new",
                    icon: Plus
                }}
            />

            {/* Stats - Optional/Later */}

            {/* Filter */}
            <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <form className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchQuery}
                            placeholder="İsim veya e-posta ara..."
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                        />
                    </div>
                </form>
            </div>

            {/* List */}
            {users.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-200 p-16 text-center">
                    <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">Kullanıcı Bulunamadı</h3>
                    <p className="text-neutral-500 max-w-md mx-auto mb-6">
                        Sisteme erişebilecek yeni personel ekleyin.
                    </p>
                    <Link
                        href="/admin/users/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
                    >
                        <Plus className="w-5 h-5" />
                        Yeni Kullanıcı
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Kullanıcı</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Rol</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Durum</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-500 uppercase">Eklenme</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-neutral-500 uppercase">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {users.map((user) => {
                                const role = roleConfig[user.role] || { label: user.role, color: 'bg-gray-100 text-gray-800' }

                                return (
                                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-sm">
                                                    {user.name?.slice(0, 2).toUpperCase() || '??'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-neutral-900">{user.name || 'İsimsiz'}</div>
                                                    <div className="text-xs text-neutral-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${role.color}`}>
                                                <Shield className="w-3 h-3" />
                                                {role.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isActive ? (
                                                <span className="text-green-600 flex items-center gap-1.5 text-sm font-medium">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="text-neutral-400 flex items-center gap-1.5 text-sm font-medium">
                                                    <XCircle className="w-4 h-4" />
                                                    Pasif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-500">
                                            {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/users/${user.id}`}
                                                className="inline-flex items-center justify-center p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                            >
                                                <UserCog className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
