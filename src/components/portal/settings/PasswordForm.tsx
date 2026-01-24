'use client'

import { changeClientPassword } from '@/actions/clientServices'
import { useState } from 'react'
import { toast } from 'sonner'
import { Lock, Save, Loader2, Eye, EyeOff } from 'lucide-react'

export function PasswordForm() {
    const [loading, setLoading] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const currentPassword = formData.get('currentPassword') as string
        const newPassword = formData.get('newPassword') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (newPassword !== confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor.')
            setLoading(false)
            return
        }

        try {
            const result = await changeClientPassword({ currentPassword, newPassword })
            if (result.success) {
                toast.success('Şifreniz başarıyla güncellendi.')
                // Formu temizle
                const form = document.getElementById('password-form') as HTMLFormElement
                form?.reset()
            } else {
                toast.error(result.error || 'Bir hata oluştu.')
            }
        } catch {
            toast.error('Beklenmedik bir hata oluştu.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-600" />
                Şifre Değiştir
            </h2>
            <form id="password-form" action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Mevcut Şifre</label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                            name="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            required
                            className="w-full pl-10 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                        >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Yeni Şifre</label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                            name="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            required
                            className="w-full pl-10 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            placeholder="Minimum 6 karakter"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                        >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Yeni Şifre (Tekrar)</label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium ml-auto"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Güncelleniyor...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Şifreyi Güncelle
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
