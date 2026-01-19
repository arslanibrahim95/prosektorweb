'use client'

import { useActionState, useState } from 'react'
import { createActivity, toggleActivityComplete, deleteActivity, CrmActionResult } from '@/actions/crm'
import { Activity, Plus, CheckCircle2, Circle, Phone, Mail, Calendar, FileText, Bell, Target, Trash2, Loader2, Clock } from 'lucide-react'

interface ActivityItem {
    id: string
    type: string
    title: string
    description: string | null
    dueDate: Date | null
    isCompleted: boolean
    createdAt: Date
}

interface CrmActivitiesSectionProps {
    activities: ActivityItem[]
    companyId: string
}

const activityTypeConfig: Record<string, { label: string, icon: any, color: string }> = {
    CALL: { label: 'Arama', icon: Phone, color: 'text-blue-500' },
    EMAIL: { label: 'E-posta', icon: Mail, color: 'text-purple-500' },
    MEETING: { label: 'Toplantı', icon: Calendar, color: 'text-green-500' },
    NOTE: { label: 'Not', icon: FileText, color: 'text-orange-500' },
    TASK: { label: 'Görev', icon: Target, color: 'text-red-500' },
    REMINDER: { label: 'Hatırlatma', icon: Bell, color: 'text-yellow-500' },
}

const initialState: CrmActionResult = { success: false }

export function CrmActivitiesSection({ activities, companyId }: CrmActivitiesSectionProps) {
    const [showForm, setShowForm] = useState(false)

    const formAction = async (prevState: CrmActionResult, formData: FormData) => {
        const result = await createActivity(formData)
        if (result.success) {
            setShowForm(false)
        }
        return result
    }

    const [state, action, isPending] = useActionState(formAction, initialState)

    const handleToggleComplete = async (id: string) => {
        await toggleActivityComplete(id, companyId)
    }

    const handleDelete = async (id: string) => {
        if (confirm('Bu aktiviteyi silmek istediğinizden emin misiniz?')) {
            await deleteActivity(id, companyId)
        }
    }

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    Aktiviteler
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="p-2 text-neutral-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Add Activity Form */}
            {showForm && (
                <form action={action} className="mb-4 p-4 bg-neutral-50 rounded-xl space-y-3">
                    <input type="hidden" name="companyId" value={companyId} />
                    <div className="grid grid-cols-2 gap-3">
                        <select
                            name="type"
                            required
                            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="">Tip Seçin *</option>
                            <option value="CALL">📞 Arama</option>
                            <option value="EMAIL">📧 E-posta</option>
                            <option value="MEETING">📅 Toplantı</option>
                            <option value="TASK">🎯 Görev</option>
                            <option value="REMINDER">🔔 Hatırlatma</option>
                        </select>
                        <input
                            type="date"
                            name="dueDate"
                            className="px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                    </div>
                    <input
                        type="text"
                        name="title"
                        placeholder="Başlık *"
                        required
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <textarea
                        name="description"
                        rows={2}
                        placeholder="Açıklama (opsiyonel)"
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                    {state.error && (
                        <p className="text-xs text-red-600">{state.error}</p>
                    )}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-200 rounded-lg transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                            {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                            Ekle
                        </button>
                    </div>
                </form>
            )}

            {/* Activities List */}
            {activities.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-6">Henüz aktivite yok.</p>
            ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {activities.map((activity) => {
                        const config = activityTypeConfig[activity.type] || activityTypeConfig.NOTE
                        const Icon = config.icon

                        return (
                            <div
                                key={activity.id}
                                className={`p-3 rounded-xl group relative ${activity.isCompleted ? 'bg-neutral-50 opacity-60' : 'bg-neutral-50'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <button
                                        onClick={() => handleToggleComplete(activity.id)}
                                        className="mt-0.5 flex-shrink-0"
                                    >
                                        {activity.isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Circle className="w-5 h-5 text-neutral-300 hover:text-neutral-500" />
                                        )}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${config.color}`} />
                                            <span className={`font-medium text-sm ${activity.isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                                                {activity.title}
                                            </span>
                                        </div>
                                        {activity.description && (
                                            <p className="text-xs text-neutral-500 mt-1">{activity.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                                            <span>{new Date(activity.createdAt).toLocaleDateString('tr-TR')}</span>
                                            {activity.dueDate && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    Vade: {new Date(activity.dueDate).toLocaleDateString('tr-TR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(activity.id)}
                                        className="p-1 text-neutral-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-all"
                                        title="Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
