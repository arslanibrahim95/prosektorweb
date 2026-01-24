import { getTasks } from '@/actions/task'
import { PageHeader } from '@/components/admin/ui/PageHeader'
import { TaskBoard, type Task } from '@/components/admin/task/TaskBoard'
import { Plus } from 'lucide-react'

export default async function TasksPage() {
    const { data: tasks = [] } = await getTasks()

    // Map the data to match Task type
    const mappedTasks: Task[] = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        webProject: task.webProject,
    }))

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
                <TaskBoard initialTasks={mappedTasks} />
            </div>
        </div>
    )
}
