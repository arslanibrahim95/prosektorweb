'use client'

import { useState, useMemo } from 'react'
import { updateTaskStatus, deleteTask } from '@/actions/task' // Import actions
import {
    Clock,
    Calendar,
    CheckCircle2,
    Circle,
    PlayCircle,
    Trash2,
} from 'lucide-react'

export type Task = {
    id: string
    title: string
    description: string | null
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'
    priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    dueDate: Date | null
    webProject?: { name: string } | null
}

export function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
    // Optimistic UI could be added here, but for now we rely on server action revalidation
    const tasks = initialTasks

    // Bolt Optimization: Group tasks by status once to avoid filtering in every render loop (O(N) vs O(N*Columns))
    const tasksByStatus = useMemo(() => {
        const grouped: Record<string, Task[]> = {
            TODO: [],
            IN_PROGRESS: [],
            DONE: [],
            ARCHIVED: [] // Ensure all keys exist
        }
        tasks.forEach(task => {
            if (grouped[task.status]) {
                grouped[task.status].push(task)
            }
        })
        return grouped
    }, [tasks])

    const columns = [
        { id: 'TODO', title: 'Yapılacaklar', icon: Circle, color: 'text-neutral-500', bg: 'bg-neutral-50' },
        { id: 'IN_PROGRESS', title: 'Sürüyor', icon: PlayCircle, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'DONE', title: 'Tamamlandı', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' }
    ]

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        await updateTaskStatus(taskId, newStatus)
    }

    const handleDelete = async (taskId: string) => {
        if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
            await deleteTask(taskId)
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'URGENT': return 'bg-red-100 text-red-700 border-red-200'
            case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'LOW': return 'bg-neutral-100 text-neutral-600 border-neutral-200'
            default: return 'bg-blue-50 text-blue-700 border-blue-100' // NORMAL
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
            {columns.map(col => {
                const columnTasks = tasksByStatus[col.id] || []

                return (
                    <div key={col.id} className={`rounded-2xl border border-neutral-200/60 flex flex-col h-full max-h-[calc(100vh-12rem)] `}>
                        {/* Column Header */}
                        <div className={`p-4 border-b border-neutral-100 flex items-center justify-between rounded-t-2xl ${col.bg}`}>
                            <div className="flex items-center gap-2">
                                <col.icon className={`w-5 h-5 ${col.color}`} />
                                <h3 className="font-bold text-neutral-900">{col.title}</h3>
                                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-neutral-500 border border-neutral-200">
                                    {columnTasks.length}
                                </span>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="p-3 space-y-3 overflow-y-auto flex-1 min-h-[200px]">
                            {columnTasks.map(task => (
                                <div key={task.id} className="group bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-lg border ${getPriorityColor(task.priority)}`}>
                                            {task.priority === 'URGENT' ? 'Acil' : task.priority === 'HIGH' ? 'Yüksek' : task.priority === 'LOW' ? 'Düşük' : 'Normal'}
                                        </span>

                                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            {/* Simple Move Buttons for Quick Actions */}
                                            {col.id === 'TODO' && (
                                                <button
                                                    onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                                                    className="p-1.5 hover:bg-blue-50 text-neutral-400 hover:text-blue-600 rounded-lg"
                                                    title="Başla"
                                                >
                                                    <PlayCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {col.id === 'IN_PROGRESS' && (
                                                <button
                                                    onClick={() => handleStatusChange(task.id, 'DONE')}
                                                    className="p-1.5 hover:bg-green-50 text-neutral-400 hover:text-green-600 rounded-lg"
                                                    title="Tamamla"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded-lg"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h4 className="font-bold text-neutral-800 mb-1">{task.title}</h4>

                                    {task.webProject && (
                                        <div className="flex items-center gap-1 text-xs text-blue-600 mb-2 font-medium">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                            {task.webProject.name}
                                        </div>
                                    )}

                                    {task.description && (
                                        <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{task.description}</p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-50 pt-3">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(task.id).toLocaleDateString('tr-TR')} {/* Using ID approx for creation if wanted, or just nothing */}
                                        </div>
                                        {task.dueDate && (
                                            <div className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() ? 'text-red-500 font-bold' : ''}`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(task.dueDate).toLocaleDateString('tr-TR')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {columnTasks.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-neutral-100 rounded-xl">
                                    <p className="text-sm text-neutral-400">Görev yok</p>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
