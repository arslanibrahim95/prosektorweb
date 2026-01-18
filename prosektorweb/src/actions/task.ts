'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const TaskSchema = z.object({
    title: z.string().min(1, 'Başlık zorunludur'),
    description: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED']).optional(),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().optional(), // Form data sends string
    webProjectId: z.string().optional(),
})

export type TaskFormState = {
    success?: boolean
    error?: string
    data?: any
}

export async function createTask(formData: FormData): Promise<TaskFormState> {
    try {
        const validated = TaskSchema.parse({
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status') || 'TODO',
            priority: formData.get('priority') || 'NORMAL',
            dueDate: formData.get('dueDate') || undefined,
            webProjectId: formData.get('webProjectId') || undefined,
        })

        let dueDate: Date | undefined
        if (validated.dueDate) {
            dueDate = new Date(validated.dueDate)
        }

        const task = await prisma.task.create({
            data: {
                title: validated.title,
                description: validated.description,
                status: validated.status as any,
                priority: validated.priority as any,
                dueDate: dueDate,
                webProjectId: validated.webProjectId || null,
            }
        })

        revalidatePath('/admin/tasks')
        // Also revalidate the project page if linked
        if (validated.webProjectId) {
            revalidatePath(`/admin/projects/${validated.webProjectId}`)
        }

        return { success: true, data: task }
    } catch (error: any) {
        console.error('createTask error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: (error as any).errors[0].message }
        }
        return { success: false, error: 'Görev oluşturulurken hata oluştu.' }
    }
}

export async function updateTaskStatus(id: string, status: string): Promise<TaskFormState> {
    try {
        const statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED']
        if (!statuses.includes(status)) {
            return { success: false, error: 'Geçersiz durum' }
        }

        await prisma.task.update({
            where: { id },
            data: { status: status as any }
        })

        revalidatePath('/admin/tasks')
        return { success: true }
    } catch (error) {
        console.error('updateTaskStatus error:', error)
        return { success: false, error: 'Durum güncellenemedi' }
    }
}

export async function deleteTask(id: string): Promise<TaskFormState> {
    try {
        await prisma.task.delete({ where: { id } })
        revalidatePath('/admin/tasks')
        return { success: true }
    } catch (error) {
        console.error('deleteTask error:', error)
        return { success: false, error: 'Silinemedi' }
    }
}

export async function getTasks(webProjectId?: string) {
    try {
        const where: any = {}
        if (webProjectId) where.webProjectId = webProjectId

        const tasks = await prisma.task.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                dueDate: true,
                description: true, // Needed for board card preview (truncated) but let's keep it for now as UI uses it
                webProjectId: true,
                webProject: {
                    select: { name: true }
                }
            }
        })

        return { success: true, data: tasks }
    } catch (error) {
        console.error('getTasks error:', error)
        return { success: false, data: [] }
    }
}
