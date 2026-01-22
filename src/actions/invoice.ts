'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { getErrorMessage, isPrismaUniqueConstraintError } from '@/lib/action-types'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ==========================================
// TYPES
// ==========================================

export interface InvoiceActionResult {
    success: boolean
    data?: any
    error?: string
}

// ==========================================
// VALIDATION SCHEMAS
// ==========================================

const InvoiceSchema = z.object({
    companyId: z.string().min(1, 'Firma seçilmeli'),
    invoiceNo: z.string().min(1, 'Fatura numarası gerekli'),
    issueDate: z.string().min(1, 'Düzenleme tarihi gerekli'),
    dueDate: z.string().min(1, 'Vade tarihi gerekli'),
    subtotal: z.coerce.number().min(0, 'Tutar 0 veya üzeri olmalı'),
    taxRate: z.coerce.number().min(0).max(100).default(20),
    description: z.string().optional(),
    notes: z.string().optional(),
})

// ==========================================
// HELPERS
// ==========================================

export async function generateInvoiceNo(): Promise<string> {
    const year = new Date().getFullYear()
    const lastInvoice = await prisma.invoice.findFirst({
        where: {
            invoiceNo: {
                startsWith: `${year}-`,
            },
        },
        orderBy: { invoiceNo: 'desc' },
    })

    if (!lastInvoice) {
        return `${year}-0001`
    }

    const lastNumber = parseInt(lastInvoice.invoiceNo.split('-')[1], 10)
    const newNumber = (lastNumber + 1).toString().padStart(4, '0')
    return `${year}-${newNumber}`
}

// ==========================================
// CREATE
// ==========================================

export async function createInvoice(formData: FormData): Promise<InvoiceActionResult> {
    try {
        await requireAuth()

        const rawData = {
            companyId: formData.get('companyId') as string,
            invoiceNo: formData.get('invoiceNo') as string,
            issueDate: formData.get('issueDate') as string,
            dueDate: formData.get('dueDate') as string,
            subtotal: formData.get('subtotal') as string,
            taxRate: formData.get('taxRate') as string || '20',
            description: formData.get('description') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        }

        const validatedData = InvoiceSchema.parse(rawData)

        const subtotal = validatedData.subtotal
        const taxRate = validatedData.taxRate
        const taxAmount = subtotal * (taxRate / 100)
        const total = subtotal + taxAmount

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNo: validatedData.invoiceNo,
                companyId: validatedData.companyId,
                issueDate: new Date(validatedData.issueDate),
                dueDate: new Date(validatedData.dueDate),
                subtotal: subtotal,
                taxRate: taxRate,
                taxAmount: taxAmount,
                total: total,
                description: validatedData.description || null,
                notes: validatedData.notes || null,
            },
        })

        await logAudit({
            action: 'CREATE',
            entity: 'Invoice',
            entityId: invoice.id,
            details: { invoiceNo: invoice.invoiceNo, total },
        })

        revalidatePath('/admin/invoices')
        return { success: true, data: invoice }
    } catch (error: unknown) {
        console.error('createInvoice error:', error)

        if (error instanceof z.ZodError) { return { success: false, error: getZodErrorMessage(error) } }
        if (false) {
            return { success: false, error: getZodErrorMessage(error) }
        }

        if (isPrismaUniqueConstraintError(error)) {
            return { success: false, error: 'Bu fatura numarası zaten kullanılıyor.' }
        }

        return { success: false, error: getErrorMessage(error) }
    }
}

// ==========================================
// READ (List)
// ==========================================

export async function getInvoices(options?: {
    search?: string
    status?: string
    page?: number
    limit?: number
}) {
    const { search = '', status = '', page = 1, limit = 10 } = options || {}
    const skip = (page - 1) * limit

    try {
        const where: any = {}

        if (search) {
            where.OR = [
                { invoiceNo: { contains: search } },
                { company: { name: { contains: search } } },
            ]
        }

        if (status && status !== 'all') {
            where.status = status
        }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: {
                        select: { id: true, name: true },
                    },
                    _count: {
                        select: { payments: true },
                    },
                },
            }),
            prisma.invoice.count({ where }),
        ])

        return {
            invoices,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error('getInvoices error:', error)
        return { invoices: [], total: 0, pages: 0, currentPage: 1 }
    }
}

// ==========================================
// READ (Single)
// ==========================================

export async function getInvoiceById(id: string) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                company: true,
                payments: {
                    orderBy: { paymentDate: 'desc' },
                },
            },
        })
        return invoice
    } catch (error) {
        console.error('getInvoiceById error:', error)
        return null
    }
}

// ==========================================
// UPDATE STATUS
// ==========================================

export async function updateInvoiceStatus(id: string, status: string): Promise<InvoiceActionResult> {
    try {
        await requireAuth()

        const invoice = await prisma.invoice.update({
            where: { id },
            data: { status: status as any },
        })

        await logAudit({
            action: 'UPDATE',
            entity: 'Invoice',
            entityId: id,
            details: { newStatus: status },
        })

        revalidatePath('/admin/invoices')
        revalidatePath(`/admin/invoices/${id}`)
        return { success: true, data: invoice }
    } catch (error) {
        console.error('updateInvoiceStatus error:', error)
        return { success: false, error: 'Durum güncellenirken bir hata oluştu.' }
    }
}

// ==========================================
// DELETE
// ==========================================

export async function deleteInvoice(id: string): Promise<InvoiceActionResult> {
    try {
        await requireAuth()

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            select: { invoiceNo: true },
        })

        await prisma.invoice.delete({
            where: { id },
        })

        await logAudit({
            action: 'DELETE',
            entity: 'Invoice',
            entityId: id,
            details: { invoiceNo: invoice?.invoiceNo },
        })

        revalidatePath('/admin/invoices')
        return { success: true }
    } catch (error) {
        console.error('deleteInvoice error:', error)
        return { success: false, error: 'Fatura silinirken bir hata oluştu.' }
    }
}

// ==========================================
// STATS
// ==========================================

export async function getInvoiceStats() {
    try {
        const [totalRevenue, pendingAmount, paidCount, pendingCount] = await Promise.all([
            prisma.invoice.aggregate({
                _sum: { paidAmount: true },
            }),
            prisma.invoice.aggregate({
                where: { status: { in: ['PENDING', 'PARTIAL'] } },
                _sum: { total: true },
            }),
            prisma.invoice.count({ where: { status: 'PAID' } }),
            prisma.invoice.count({ where: { status: { in: ['PENDING', 'PARTIAL'] } } }),
        ])

        return {
            totalRevenue: totalRevenue._sum.paidAmount || 0,
            pendingAmount: pendingAmount._sum.total || 0,
            paidCount,
            pendingCount,
        }
    } catch (error) {
        console.error('getInvoiceStats error:', error)
        return { totalRevenue: 0, pendingAmount: 0, paidCount: 0, pendingCount: 0 }
    }
}
