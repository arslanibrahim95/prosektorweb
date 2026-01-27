import { createTask } from '@/features/system/actions/tasks'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ChevronLeft, Save } from 'lucide-react'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function NewTaskPage() {
    const projects = await prisma.webProject.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    })

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/tasks"
                    className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 font-serif">Yeni Görev</h1>
                    <p className="text-neutral-500 mt-1">Yapılacak iş ekle</p>
                </div>
            </div>

            <form action={async (formData: FormData) => { 'use server'; await createTask(formData) }} className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">Başlık <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="title"
                        required
                        placeholder="Örn: Logo Tasarımı"
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Öncelik</label>
                        <select name="priority" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                            <option value="NORMAL">Normal</option>
                            <option value="HIGH">Yüksek</option>
                            <option value="URGENT">Acil</option>
                            <option value="LOW">Düşük</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-700">Bitiş Tarihi</label>
                        <input
                            type="date"
                            name="dueDate"
                            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">İlgili Proje (Opsiyonel)</label>
                    <select name="webProjectId" className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none">
                        <option value="">Seçiniz</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-700">Açıklama</label>
                    <textarea
                        name="description"
                        rows={4}
                        placeholder="Detaylar..."
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
                    />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                    <Link href="/admin/tasks" className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors">
                        İptal
                    </Link>
                    <SubmitButton label="Kaydet" icon={Save} />
                </div>
            </form>
        </div>
    )
}
