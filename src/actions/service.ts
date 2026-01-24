'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { getErrorMessage, getZodErrorMessage, validatePagination } from '@/lib/action-types'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ServiceType, BillingCycle, ServiceStatus } from '@prisma/client'
import { generateInvoiceNo } from './invoice'

// ==========================================
// TYPES & SCHEMAS
// ==========================================

const ServiceSchema = z.object({
    companyId: z.string().min(1, 'Müşteri seçimi zorunlu'),
    name: z.string().min(3, 'Hizmet adı en az 3 karakter olmalı'),
    type: z.nativeEnum(ServiceType),
    price: z.number().min(0, 'Fiyat 0 veya daha büyük olmalı'),
    currency: z.string().default('TRY'),
    billingCycle: z.nativeEnum(BillingCycle),
    startDate: z.string(), // Input type="date" returns string
    renewDate: z.string().optional(), // Eğer elle girilirse
})

export type ServiceFormState = {
    success?: boolean
    error?: string
    data?: any
}

// Helper: Calculate Renew Date based on cycle
function calculateRenewDate(start: Date, cycle: BillingCycle): Date {
    const date = new Date(start)
    if (cycle === 'MONTHLY') date.setMonth(date.getMonth() + 1)
    else if (cycle === 'YEARLY') date.setFullYear(date.getFullYear() + 1)
    return date
}

// ==========================================
// ACTIONS
// ==========================================

export async function createService(formData: FormData): Promise<ServiceFormState> {
    try {
        await requireAuth()

        const rawData = {
            companyId: formData.get('companyId'),
            name: formData.get('name'),
            type: formData.get('type'),
            price: Number(formData.get('price')),
            currency: formData.get('currency'),
            billingCycle: formData.get('billingCycle'),
            startDate: formData.get('startDate'),
            renewDate: formData.get('renewDate'),
        }

        const validated = ServiceSchema.parse(rawData)
        const startDate = new Date(validated.startDate)

        // Auto-calculate renew date if not provided or valid
        let renewDate = validated.renewDate ? new Date(validated.renewDate) : calculateRenewDate(startDate, validated.billingCycle)

        // For ONETIME, renewDate could be same as start or null (but schema requires Date, so let's set it largely in future or same day)
        // Actually for ONETIME handling logic might be different, keeping simple for now.

        const service = await prisma.service.create({
            data: {
                companyId: validated.companyId,
                name: validated.name,
                type: validated.type,
                price: validated.price,
                currency: validated.currency,
                billingCycle: validated.billingCycle,
                startDate: startDate,
                renewDate: renewDate,
                status: ServiceStatus.ACTIVE
            }
        })

        await logAudit({
            action: 'CREATE',
            entity: 'Service',
            entityId: service.id,
            details: { name: validated.name, price: validated.price },
        })

        revalidatePath('/admin/services')
        return { success: true, data: service }
    } catch (error: unknown) {
        console.error('createService error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: getErrorMessage(error) }
    }
}

export async function renewService(id: string) {
    try {
        await requireAuth()

        const service = await prisma.service.findUnique({ where: { id } })
        if (!service) throw new Error('Hizmet bulunamadı')

        const newRenewDate = calculateRenewDate(service.renewDate, service.billingCycle)

        // 1. Generate Invoice for this renewal
        const invoiceNo = await generateInvoiceNo()
        const taxRate = 20
        const subtotal = Number(service.price)
        const taxAmount = subtotal * (taxRate / 100)
        const total = subtotal + taxAmount

        await prisma.invoice.create({
            data: {
                invoiceNo,
                companyId: service.companyId,
                issueDate: new Date(),
                dueDate: service.renewDate, // Vade tarihi = Şu anki bitiş tarihi (yeni dönem başı)
                subtotal,
                taxRate,
                taxAmount,
                total,
                status: 'PENDING',
                description: `${service.name} - Hizmet Yenileme (${service.renewDate.toLocaleDateString('tr-TR')} - ${newRenewDate.toLocaleDateString('tr-TR')})`,
            }
        })

        // 2. Update Service Date
        await prisma.service.update({
            where: { id },
            data: {
                renewDate: newRenewDate,
                isReminderSent: false,
                status: ServiceStatus.ACTIVE
            }
        })

        revalidatePath('/admin/services')
        revalidatePath('/admin/invoices') // Update invoice list too
        return { success: true }
    } catch (error) {
        console.error('renewService error:', error)
        return { success: false, error: 'Yenileme işlemi başarısız.' }
    }
}

export async function updateServiceStatus(id: string, status: ServiceStatus) {
    try {
        await requireAuth()

        await prisma.service.update({ where: { id }, data: { status } })

        await logAudit({
            action: 'UPDATE',
            entity: 'Service',
            entityId: id,
            details: { newStatus: status },
        })

        revalidatePath('/admin/services')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Durum güncellenemedi' }
    }
}

export async function deleteService(id: string) {
    try {
        await requireAuth()

        const service = await prisma.service.findUnique({
            where: { id },
            select: { name: true },
        })

        await prisma.service.delete({ where: { id } })

        await logAudit({
            action: 'DELETE',
            entity: 'Service',
            entityId: id,
            details: { name: service?.name },
        })

        revalidatePath('/admin/services')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Silme işlemi başarısız' }
    }
}

// ==========================================
// QUERIES
// ==========================================

export async function getServices(options?: {
    status?: ServiceStatus
    upcoming?: boolean
    search?: string
    page?: number
    limit?: number
}) {
    const { status, upcoming, search = '' } = options || {}
    const { page, limit, skip } = validatePagination(options?.page, options?.limit)

    try {
        const session = await auth()
        if (!session?.user) return { services: [], total: 0, pages: 0, currentPage: 1 }

        const where: any = {}

        // Tenant isolation for non-admin users
        if (session.user.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })
            if (!user?.companyId) return { services: [], total: 0, pages: 0, currentPage: 1 }
            where.companyId = user.companyId
        }

        if (status) {
            where.status = status
        }

        if (upcoming) {
            // Get services expiring in next 30 days
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

            where.renewDate = {
                lte: thirtyDaysFromNow,
                gte: new Date()
            }
            where.status = ServiceStatus.ACTIVE
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { company: { name: { contains: search } } },
            ]
        }

        const [services, total] = await Promise.all([
            prisma.service.findMany({
                where,
                skip,
                take: limit,
                include: {
                    company: { select: { id: true, name: true } }
                },
                orderBy: { renewDate: 'asc' }
            }),
            prisma.service.count({ where })
        ])

        return {
            services,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error('getServices error:', error)
        return { services: [], total: 0, pages: 0, currentPage: 1 }
    }
}
