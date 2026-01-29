'use server'

import { prisma } from '@/server/db'
import { getErrorMessage, getZodErrorMessage, isPrismaUniqueConstraintError } from '@/shared/lib'
import { requireAuth } from '@/shared/lib/auth-guard'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { EmployeeGender } from '@prisma/client'

// ==========================================
// TC KIMLIK VALIDATION
// ==========================================

/**
 * Validates a Turkish National ID number (TC Kimlik No) using the official algorithm.
 * Rules:
 * 1. Must be exactly 11 digits
 * 2. First digit cannot be 0
 * 3. All characters must be digits
 * 4. Checksum validation for 10th digit: ((sum of odd positions * 7) - (sum of even positions)) mod 10
 * 5. Checksum validation for 11th digit: sum of first 10 digits mod 10
 */
function isValidTcNo(tcNo: string): boolean {
    // Must be exactly 11 digits
    if (!/^\d{11}$/.test(tcNo)) return false

    // First digit cannot be 0
    if (tcNo[0] === '0') return false

    const digits = tcNo.split('').map(Number)

    // Sum of odd positions (1st, 3rd, 5th, 7th, 9th) - index 0, 2, 4, 6, 8
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]

    // Sum of even positions (2nd, 4th, 6th, 8th) - index 1, 3, 5, 7
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7]

    // 10th digit validation
    const tenthDigit = ((oddSum * 7) - evenSum) % 10
    if (tenthDigit < 0 ? tenthDigit + 10 : tenthDigit !== digits[9]) return false

    // 11th digit validation
    const sumOfFirst10 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
    if (sumOfFirst10 % 10 !== digits[10]) return false

    return true
}

// ==========================================
// TYPES & SCHEMAS
// ==========================================

const EmployeeSchema = z.object({
    firstName: z.string().min(2, 'Ad en az 2 karakter olmalı'),
    lastName: z.string().min(2, 'Soyad en az 2 karakter olmalı'),
    tcNo: z.string()
        .length(11, 'TCKN 11 haneli olmalı')
        .refine((val) => isValidTcNo(val), { message: 'Geçersiz TC Kimlik Numarası' })
        .optional()
        .or(z.literal('')),
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

        // Ownership Validation
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session?.user?.id },
                select: { companyId: true }
            })

            if (!user?.companyId) throw new Error('Şirket kaydınız bulunamadı.')

            const workplace = await prisma.workplace.findUnique({
                where: { id: validated.workplaceId },
                select: { companyId: true }
            })

            if (!workplace || workplace.companyId !== user.companyId) {
                throw new Error('Yetkisiz işlem: Bu işyeri size ait değil.')
            }
        }

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
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        // Handle unique constraint violation (TC No)
        if (isPrismaUniqueConstraintError(error)) {
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
        if (isPrismaUniqueConstraintError(error)) {
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
        const session = await auth()
        if (!session?.user) return []

        const where: any = {}

        // Tenant Isolation
        if (session.user.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })

            if (!user?.companyId) return []

            // Filter employees by workplaces belonging to the user's company
            where.workplace = {
                companyId: user.companyId
            }
        }

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
        const session = await auth()
        if (!session?.user) return null

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

        if (!employee) return null

        // IDOR Check
        if (session.user.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })

            if (!user?.companyId || employee.workplace.companyId !== user.companyId) {
                return null // Unauthorized
            }
        }

        return employee
    } catch (error) {
        console.error('getEmployeeById error:', error)
        return null
    }
}
