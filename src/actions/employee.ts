'use server'

import { prisma } from '@/lib/prisma'
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { EmployeeGender } from '@prisma/client'

// ==========================================
// TYPES & SCHEMAS
// ==========================================

const EmployeeSchema = z.object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    tcNo: z.string().length(11, 'TCKN 11 haneli olmalı').optional().or(z.literal('')),
    workplaceId: z.string().min(1, 'İşyeri seçimi zorunlu'),
    position: z.string().optional(),
    gender: z.nativeEnum(EmployeeGender).optional(),
    phone: z.string().optional(),
    email: z.string().email('Geçersiz e-posta').optional().or(z.literal('')),
    recruitmentDate: z.string().optional(),
})

export interface EmployeeActionResult {
    success: boolean
    data?: any
    error?: string
}

// ==========================================
// ACTIONS
// ==========================================

export async function createEmployee(formData: FormData): Promise<EmployeeActionResult> {
    try {
        await requireAuth()

        const rawData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            tcNo: formData.get('tcNo') as string || undefined,
            workplaceId: formData.get('workplaceId') as string,
            position: formData.get('position') as string || undefined,
            gender: formData.get('gender') as EmployeeGender || undefined,
            phone: formData.get('phone') as string || undefined,
            email: formData.get('email') as string || undefined,
            recruitmentDate: formData.get('recruitmentDate') as string || undefined,
        }

        const validated = EmployeeSchema.parse(rawData)

        const employee = await prisma.employee.create({
            data: {
                ...validated,
                recruitmentDate: validated.recruitmentDate ? new Date(validated.recruitmentDate) : undefined,
            },
        })

        revalidatePath('/admin/employees')
        revalidatePath(`/admin/workplaces/${validated.workplaceId}`)
        return { success: true, data: employee }
    } catch (error: unknown) {
        console.error('createEmployee error:', error)
        if (error instanceof z.ZodError) { return { success: false, error: getZodErrorMessage(error) } }
        if (false) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        // Handle unique constraint violation (TC No)
        if (error.code === 'P2002') {
            return { success: false, error: 'Bu TC Kimlik Numarası ile kayıtlı çalışan zaten var.' }
        }
        return { success: false, error: 'Çalışan oluşturulurken hata oluştu.' }
    }
}

export async function updateEmployee(id: string, formData: FormData): Promise<EmployeeActionResult> {
    try {
        await requireAuth()

        const rawData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            tcNo: formData.get('tcNo') as string || undefined,
            workplaceId: formData.get('workplaceId') as string,
            position: formData.get('position') as string || undefined,
            gender: formData.get('gender') as EmployeeGender || undefined,
            phone: formData.get('phone') as string || undefined,
            email: formData.get('email') as string || undefined,
            recruitmentDate: formData.get('recruitmentDate') as string || undefined,
        }

        const validated = EmployeeSchema.parse(rawData)

        await prisma.employee.update({
            where: { id },
            data: {
                ...validated,
                recruitmentDate: validated.recruitmentDate ? new Date(validated.recruitmentDate) : undefined,
            },
        })

        revalidatePath('/admin/employees')
        revalidatePath(`/admin/employees/${id}`)
        revalidatePath(`/admin/workplaces/${validated.workplaceId}`)
        return { success: true }
    } catch (error: unknown) {
        console.error('updateEmployee error:', error)
        if (error.code === 'P2002') {
            return { success: false, error: 'Bu TC Kimlik Numarası zaten kullanımda.' }
        }
        return { success: false, error: 'Güncelleme başarısız.' }
    }
}

export async function deleteEmployee(id: string): Promise<EmployeeActionResult> {
    try {
        await requireAuth()

        await prisma.employee.delete({ where: { id } })
        revalidatePath('/admin/employees')
        return { success: true }
    } catch (error) {
        console.error('deleteEmployee error:', error)
        return { success: false, error: 'Silme işlemi başarısız.' }
    }
}

// ==========================================
// QUERIES
// ==========================================

export async function getEmployees(search?: string, workplaceId?: string) {
    try {
        const where: any = {}

        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { tcNo: { contains: search } },
                { workplace: { title: { contains: search } } },
            ]
        }

        if (workplaceId) {
            where.workplaceId = workplaceId
        }

        const employees = await prisma.employee.findMany({
            where,
            include: {
                workplace: {
                    include: {
                        company: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        })
        return employees
    } catch (error) {
        console.error('getEmployees error:', error)
        return []
    }
}

export async function getEmployeeById(id: string) {
    try {
        const employee = await prisma.employee.findUnique({
            where: { id },
            include: {
                workplace: {
                    include: {
                        company: true
                    }
                }
            },
        })
        return employee
    } catch (error) {
        console.error('getEmployeeById error:', error)
        return null
    }
}
