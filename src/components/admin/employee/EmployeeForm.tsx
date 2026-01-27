'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, User, Briefcase, Phone, Mail, Calendar } from 'lucide-react'
import { createEmployee, updateEmployee } from '@/actions/employee'

interface Props {
    workplaces: Array<{ id: string; title: string }>
    employee?: {
        id: string
        firstName: string
        lastName: string
        tcNo: string | null
        workplaceId: string
        position: string | null
        gender: string | null
        phone: string | null
        email: string | null
        recruitmentDate: Date | null
    }
}

export function EmployeeForm({ workplaces, employee }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const isEdit = !!employee

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        // Handle date: ensure it's in valid format if present
        const dateStr = formData.get('recruitmentDate') as string
        if (dateStr && isNaN(Date.parse(dateStr))) {
            setError('Geçersiz tarih formatı')
            setLoading(false)
            return
        }

        let result
        if (isEdit && employee) {
            result = await updateEmployee(employee.id, formData)
        } else {
            result = await createEmployee(formData)
        }

        if (result.success) {
            router.push('/admin/employees')
            router.refresh()
        } else {
            setError(result.error || 'Bir hata oluştu')
        }
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
                <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-brand-600" />
                    Personel Bilgileri
                </h2>

                <div className="space-y-6">
                    {/* Temel Bilgiler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Ad <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                defaultValue={employee?.firstName || ''}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Soyad <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                defaultValue={employee?.lastName || ''}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                TC Kimlik No
                            </label>
                            <input
                                type="text"
                                name="tcNo"
                                maxLength={11}
                                defaultValue={employee?.tcNo || ''}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Cinsiyet
                            </label>
                            <select
                                name="gender"
                                defaultValue={employee?.gender || ''}
                                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                            >
                                <option value="">Seçiniz</option>
                                <option value="MALE">Erkek</option>
                                <option value="FEMALE">Kadın</option>
                            </select>
                        </div>
                    </div>

                    {/* İş Bilgileri */}
                    <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2">
                            Çalıştığı İşyeri <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="workplaceId"
                            required
                            defaultValue={employee?.workplaceId || ''}
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="">İşyeri Seçin</option>
                            {workplaces.map((wp) => (
                                <option key={wp.id} value={wp.id}>
                                    {wp.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Ünvan / Pozisyon
                            </label>
                            <div className="relative">
                                <Briefcase className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    name="position"
                                    defaultValue={employee?.position || ''}
                                    placeholder="Örn: Kaynakçı"
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                İşe Giriş Tarihi
                            </label>
                            <div className="relative">
                                <Calendar className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="date"
                                    name="recruitmentDate"
                                    defaultValue={employee?.recruitmentDate ? new Date(employee.recruitmentDate).toISOString().split('T')[0] : ''}
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* İletişim */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                Telefon
                            </label>
                            <div className="relative">
                                <Phone className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="tel"
                                    name="phone"
                                    defaultValue={employee?.phone || ''}
                                    placeholder="5XX..."
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                E-posta
                            </label>
                            <div className="relative">
                                <Mail className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={employee?.email || ''}
                                    placeholder="personel@mail.com"
                                    className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Link
                    href="/admin/employees"
                    className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
                >
                    İptal
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isEdit ? 'Güncelle' : 'Kaydet'}
                </button>
            </div>
        </form>
    )
}
