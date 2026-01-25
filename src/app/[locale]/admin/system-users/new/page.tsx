'use client'

import { createSystemUser } from '@/features/system/actions/system-users'
import { GradientButton } from '@/components/ui/GradientButton'
import Link from 'next/link'
import { ArrowLeft, Save, Shield, User } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSystemUserPage() {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setError(null)
        startTransition(async () => {
            const result = await createSystemUser(formData)
            if (result.success) {
                router.push('/admin/system-users')
            } else {
                setError(result.error || 'Bir hata oluştu')
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/system-users"
                    className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 font-serif">Yeni Personel Ekle</h1>
                    <p className="text-neutral-500">Sisteme yeni bir yönetici veya personel tanımlayın</p>
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <form action={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Ad Soyad</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Örn: Ahmet Yılmaz"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">E-posta Adresi</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="ahmet@prosektor.com"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Şifre</label>
                            <input
                                name="password"
                                type="password"
                                required
                                minLength={6}
                                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                placeholder="******"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Rol</label>
                            <select
                                name="role"
                                className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                            >
                                <option value="OFFICE">Ofis Personeli</option>
                                <option value="DOCTOR">İşyeri Hekimi</option>
                                <option value="EXPERT">İSG Uzmanı</option>
                                <option value="ADMIN">Sistem Yöneticisi</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <GradientButton
                            type="submit"
                            disabled={isPending}
                            className="min-w-[120px]"
                        >
                            {isPending ? 'Kaydediliyor...' : 'Kaydet'}
                        </GradientButton>
                    </div>
                </form>
            </div>
        </div>
    )
}
