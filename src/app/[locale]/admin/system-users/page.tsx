import { getSystemUsers } from '@/features/system/actions/system-users'
import Link from 'next/link'
import { Plus, Users, Shield, Clock, Search, MoreVertical, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/ui/PageHeader'
import { DeleteSystemUserButton } from '@/features/system/components/DeleteButton'

export default async function SystemUsersPage() {
    const { data: users } = await getSystemUsers() as any

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Personel Yönetimi</h1>
                    <p className="text-neutral-500 mt-1">Sistem yöneticileri ve ofis personeli</p>
                </div>
                <Link
                    href="/admin/system-users/new"
                    className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Personel
                </Link>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm text-neutral-600">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-neutral-900">Kullanıcı</th>
                            <th className="px-6 py-4 font-semibold text-neutral-900">Rol</th>
                            <th className="px-6 py-4 font-semibold text-neutral-900">Durum</th>
                            <th className="px-6 py-4 font-semibold text-neutral-900">Kayıt Tarihi</th>
                            <th className="px-6 py-4 font-semibold text-neutral-900 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {users.map((user: any) => (
                            <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold">
                                            {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-neutral-900">{user.name || user.firstName}</div>
                                            <div className="text-xs text-neutral-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold
                                        ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' :
                                                'bg-neutral-100 text-neutral-600'
                                        }
                                    `}>
                                        {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                                        ${user.isActive
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                        }
                                    `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                        {user.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <DeleteSystemUserButton id={user.id} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-12 text-center text-neutral-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <p>Henüz personel kaydı bulunmuyor.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
