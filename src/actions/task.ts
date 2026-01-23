'use server'

import { prisma } from '@/lib/prisma'
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types'
import { requireAuth } from '@/lib/auth-guard'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client'

const TaskSchema = z.object({
    title: z.string().min(1, 'Başlık zorunludur'),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
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
        await requireAuth()

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
    } catch (error: unknown) {
        console.error('createTask error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: 'Görev oluşturulurken hata oluştu.' }
    }
}

export async function updateTaskStatus(id: string, status: string): Promise<TaskFormState> {
    try {
        await requireAuth()

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
        await requireAuth()

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
        const session = await auth()
        if (!session?.user) return { success: false, data: [] }

        // Tasks are admin-only feature for now
        if (session.user.role !== 'ADMIN') {
            return { success: false, data: [] }
        }

        const where: Prisma.TaskWhereInput = { parentId: null } // Only get top-level tasks
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
                description: true,
                webProjectId: true,
                assignedTo: true,
                estimatedHours: true,
                actualHours: true,
                webProject: {
                    select: { name: true }
                },
                _count: {
                    select: { subTasks: true }
                },
                subTasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                        dueDate: true,
                        assignedTo: true
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        return { success: true, data: tasks }
    } catch (error) {
        console.error('getTasks error:', error)
        return { success: false, data: [] }
    }
}

interface SubTaskInput {
    parentId: string
    title: string
    priority?: string
    dueDate?: string
    assignedTo?: string
}

export async function createSubTask(input: SubTaskInput): Promise<TaskFormState> {
    try {
        await requireAuth()

        const parent = await prisma.task.findUnique({
            where: { id: input.parentId },
            select: { id: true, webProjectId: true }
        })

        if (!parent) {
            return { success: false, error: 'Ana görev bulunamadı' }
        }

        let dueDate: Date | undefined
        if (input.dueDate) {
            dueDate = new Date(input.dueDate)
        }

        const subTask = await prisma.task.create({
            data: {
                title: input.title,
                priority: (input.priority as any) || 'NORMAL',
                dueDate,
                assignedTo: input.assignedTo,
                parentId: input.parentId,
                webProjectId: parent.webProjectId,
                status: 'TODO'
            }
        })

        revalidatePath('/admin/tasks')
        return { success: true, data: subTask }
    } catch (error) {
        console.error('createSubTask error:', error)
        return { success: false, error: 'Alt görev oluşturulamadı' }
    }
}

export async function updateTask(id: string, data: {
    title?: string
    description?: string
    status?: string
    priority?: string
    dueDate?: string
    assignedTo?: string
    estimatedHours?: number
    actualHours?: number
}): Promise<TaskFormState> {
    try {
        await requireAuth()

        const updateData: any = {}

        if (data.title !== undefined) updateData.title = data.title
        if (data.description !== undefined) updateData.description = data.description

        // Validation for Enums
        if (data.status !== undefined) {
            const StatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED'])
            const result = StatusSchema.safeParse(data.status)
            if (!result.success) throw new Error('Geçersiz görev durumu')
            updateData.status = data.status
        }

        if (data.priority !== undefined) {
            const PrioritySchema = z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
            const result = PrioritySchema.safeParse(data.priority)
            if (!result.success) throw new Error('Geçersiz görev önceliği')
            updateData.priority = data.priority
        }

        if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo
        if (data.estimatedHours !== undefined) updateData.estimatedHours = data.estimatedHours
        if (data.actualHours !== undefined) updateData.actualHours = data.actualHours
        if (data.dueDate !== undefined) {
            updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
        }

        await prisma.task.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/admin/tasks')
        return { success: true }
    } catch (error) {
        console.error('updateTask error:', error)
        return { success: false, error: 'Görev güncellenemedi' }
    }
}
