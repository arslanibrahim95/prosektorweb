'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, Save, Shield, User, Mail, Key } from 'lucide-react'
import { createSystemUser, updateSystemUser, ActionResult } from '@/features/system/actions/system-users'

interface UserFormProps {
    user?: {
        id: string
        name: string
        firstName: string | null
        lastName: string | null
        email: string
        role: string
        isActive: boolean
    }
}

export function UserForm({ user }: UserFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const isEditing = !!user

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        let result: ActionResult
        if (isEditing && user) {
            result = await updateSystemUser(user.id, formData)
        } else {
            result = await createSystemUser(formData)
        }

        if (result.success) {
            router.push('/admin/users')
            router.refresh()
        } else {
            setError(result.error || 'İşlem başarısız')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-600" />
                    {isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
                </h2>

                {/* Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Ad
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            defaultValue={user?.firstName || ''}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Soyad
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            defaultValue={user?.lastName || ''}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Tam İsim (Görünen) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        defaultValue={user?.name || ''}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        E-posta <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="email"
                            name="email"
                            required
                            defaultValue={user?.email || ''}
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Şifre {isEditing && <span className="text-neutral-400 font-normal">(Değiştirmek için doldurun)</span>}
                        {!isEditing && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                        <Key className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="password"
                            name="password"
                            required={!isEditing}
                            minLength={6}
                            placeholder={isEditing ? '******' : 'Güçlü bir şifre belirleyin'}
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                        Yetki Rolü <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Shield className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <select
                            name="role"
                            defaultValue={user?.role || 'OFFICE'}
                            className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
                        >
                            <option value="ADMIN">Yönetici (Tam Yetki)</option>
                            <option value="DOCTOR">Hekim</option>
                            <option value="EXPERT">Uzman</option>
                            <option value="OFFICE">Ofis Personeli</option>
                        </select>
                    </div>
                </div>

                {/* Active Status */}
                {isEditing && (
                    <div className="pt-4 border-t border-neutral-100">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="isActive"
                                defaultChecked={user?.isActive}
                                className="w-5 h-5 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
                            />
                            <div>
                                <div className="font-semibold text-neutral-900 group-hover:text-brand-600 transition-colors">Hesap Aktif</div>
                                <div className="text-xs text-neutral-500">Pasif yapıldığında kullanıcı giriş yapamaz</div>
                            </div>
                        </label>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
                <Link
                    href="/admin/users"
                    className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                >
                    İptal
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {isEditing ? 'Değişiklikleri Kaydet' : 'Kullanıcı Oluştur'}
                </button>
            </div>
        </form>
    )
}
