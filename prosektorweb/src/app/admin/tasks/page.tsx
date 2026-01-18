import { getTasks } from '@/actions/task'
import { PageHeader } from '@/components/admin/ui/PageHeader'
import { TaskBoard } from '@/components/admin/task/TaskBoard'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function TasksPage() {
    const { data: tasks = [] } = await getTasks()

    return (
        <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
            <PageHeader
                title="Görevler"
                description="Kişisel iş takibi ve proje görevleri"
                backUrl="/admin"
                action={{
                    label: 'Yeni Görev',
                    href: '/admin/tasks/new',
                    icon: Plus
                }}
            />

            <div className="flex-1 min-h-0">
                <TaskBoard initialTasks={tasks as any[]} />
            </div>
        </div>
    )
}
