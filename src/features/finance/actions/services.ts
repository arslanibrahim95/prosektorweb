'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getErrorMessage, getZodErrorMessage, validatePagination } from '@/lib/action-types'
import { z } from 'zod'
import { AuditAction, ServiceStatus, BillingCycle, ServiceType } from '@prisma/client'

export interface ServiceInput {
    companyId: string
    name: string
    description?: string
    type: ServiceType
    price: number
    currency?: string
    billingCycle: BillingCycle
    startDate: Date | string
    renewDate?: Date | string
    features?: string[]
}

const ServiceSchema = z.object({
    companyId: z.string().min(1, 'Müşteri seçimi zorunlu'),
    name: z.string().min(3, 'Hizmet adı en az 3 karakter olmalı'),
    type: z.nativeEnum(ServiceType),
    price: z.coerce.number().min(0),
    currency: z.string().default('TRY'),
    billingCycle: z.nativeEnum(BillingCycle),
    startDate: z.coerce.date(),
    renewDate: z.coerce.date().optional(),
})

export interface ActionResult {
    success: boolean
    error?: string
    data?: any
}

async function logActivity(action: AuditAction, entity: string, entityId: string, details?: any) {
    const session = await auth()
    try {
        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.stringify(details) : undefined,
                userId: session?.user?.id,
                userEmail: session?.user?.email,
                userName: session?.user?.name
            }
        })
    } catch (e) {
        console.error('Audit Log Failed:', e)
    }
}

export async function getServices(options: { upcoming?: boolean, search?: string } = {}) {
    const { upcoming, search } = options
    try {
        const where: any = {
            deletedAt: null
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ]
        }

        if (upcoming) {
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
            where.renewDate = {
                lte: thirtyDaysFromNow,
                gte: new Date()
            }
        }

        return await prisma.service.findMany({
            where,
            orderBy: upcoming ? { renewDate: 'asc' } : { name: 'asc' },
            include: {
                _count: { select: { webProjects: true } }
            }
        })
    } catch (e) {
        return []
    }
}

export async function getService(id: string) {
    try {
        return await prisma.service.findUnique({
            where: { id },
            include: {
                _count: { select: { webProjects: true } }
            }
        })
    } catch (e) {
        return null
    }
}

export async function createService(input: ServiceInput | FormData): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const rawData = input instanceof FormData ? {
            companyId: input.get('companyId'),
            name: input.get('name'),
            type: input.get('type') || 'WEB_DESIGN',
            price: input.get('price'),
            currency: input.get('currency') || 'TRY',
            billingCycle: input.get('billingCycle'),
            startDate: input.get('startDate'),
            renewDate: input.get('renewDate'),
        } : input

        const validated = ServiceSchema.parse(rawData)

        const service = await prisma.service.create({
            data: {
                ...validated,
                status: 'ACTIVE',
                renewDate: validated.renewDate || new Date()
            } as any
        })

        await logActivity('CREATE', 'Service', service.id, { name: service.name })
        revalidatePath('/admin/services')
        return { success: true, data: service }
    } catch (e: any) {
        if (e instanceof z.ZodError) return { success: false, error: getZodErrorMessage(e) }
        return { success: false, error: 'Hizmet oluşturulamadı' }
    }
}

export async function updateService(id: string, data: Partial<ServiceInput> & { status?: ServiceStatus }): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        const service = await prisma.service.update({
            where: { id },
            data: {
                ...data,
                features: data.features as any
            } as any
        })

        await logActivity('UPDATE', 'Service', service.id, data)
        revalidatePath('/admin/services')
        return { success: true, data: service }
    } catch (e) {
        return { success: false, error: 'Güncelleme başarısız' }
    }
}

export async function deleteService(id: string): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.service.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'CANCELLED' }
        })

        await logActivity('DELETE', 'Service', id)
        revalidatePath('/admin/services')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Silme işlemi başarısız' }
    }
}
import { generateInvoiceNo } from './invoices'

export async function renewService(id: string): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const service = await prisma.service.findUnique({ where: { id } })
        if (!service) return { success: false, error: 'Hizmet bulunamadı' }

        // Calculate new renew date (add 1 month or 1 year)
        const currentRenewDate = new Date(service.renewDate)
        const newRenewDate = new Date(currentRenewDate)
        if (service.billingCycle === 'MONTHLY') {
            newRenewDate.setMonth(newRenewDate.getMonth() + 1)
        } else {
            newRenewDate.setFullYear(newRenewDate.getFullYear() + 1)
        }

        // 1. Generate Invoice
        const invoiceNo = await generateInvoiceNo()
        const subtotal = Number(service.price)
        const taxRate = 20
        const taxAmount = (subtotal * taxRate) / 100
        const total = subtotal + taxAmount

        await prisma.invoice.create({
            data: {
                invoiceNo,
                companyId: service.companyId,
                issueDate: new Date(),
                dueDate: currentRenewDate,
                subtotal,
                taxRate,
                taxAmount,
                total,
                status: 'PENDING',
                description: `${service.name} - Hizmet Yenileme (${currentRenewDate.toLocaleDateString('tr-TR')} - ${newRenewDate.toLocaleDateString('tr-TR')})`,
            }
        })

        // 2. Update Service
        await prisma.service.update({
            where: { id },
            data: {
                renewDate: newRenewDate,
                isReminderSent: false,
                status: 'ACTIVE'
            }
        })

        revalidatePath('/admin/services')
        revalidatePath('/admin/invoices')
        return { success: true }
    } catch (error) {
        console.error('renewService error:', error)
        return { success: false, error: 'Yenileme işlemi başarısız' }
    }
}
