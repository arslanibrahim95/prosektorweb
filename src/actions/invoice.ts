'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { getErrorMessage, getZodErrorMessage, isPrismaUniqueConstraintError, validatePagination } from '@/lib/action-types'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import {
    getUserCompanyId,
    requireTenantAccess,
    requireCompanyAccess,
    TenantAccessError,
    UnauthorizedError
} from '@/lib/guards/tenant-guard'
import { InvoiceStatus } from '@prisma/client'

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

/**
 * Generate invoice number - for display/suggestion only
 * Actual number is generated inside transaction during creation
 */
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

/**
 * Generate invoice number inside transaction (race-condition safe)
 */
async function generateInvoiceNoInTx(tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]): Promise<string> {
    const year = new Date().getFullYear()
    const lastInvoice = await tx.invoice.findFirst({
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

import { createSafeAction } from '@/lib/safe-action'

// ... existing imports ...

// ==========================================
// CREATE
// ==========================================

const MAX_INVOICE_RETRIES = 3

const createInvoiceHandler = async (formData: FormData) => {
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

    // Use transaction with retry for race condition handling
    let lastError: unknown
    for (let attempt = 0; attempt < MAX_INVOICE_RETRIES; attempt++) {
        try {
            const invoice = await prisma.$transaction(async (tx) => {
                // If user provided invoice number, use it; otherwise generate inside tx
                let invoiceNo = validatedData.invoiceNo
                if (!invoiceNo || invoiceNo === 'AUTO') {
                    invoiceNo = await generateInvoiceNoInTx(tx)
                }

                return tx.invoice.create({
                    data: {
                        invoiceNo,
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
            })

            await logAudit({
                action: 'CREATE',
                entity: 'Invoice',
                entityId: invoice.id,
                details: { invoiceNo: invoice.invoiceNo, total },
            })

            revalidatePath('/admin/invoices')
            return invoice
        } catch (error) {
            lastError = error
            // If unique constraint error, retry with new number
            if (isPrismaUniqueConstraintError(error)) {
                continue
            }
            throw error
        }
    }

    // All retries exhausted
    console.error('createInvoice: max retries exceeded', lastError)
    throw new Error('Fatura numarası oluşturulamadı, lütfen tekrar deneyin.')
}

export const createInvoice = createSafeAction('createInvoice', createInvoiceHandler)

// ==========================================
// READ (List)
// ==========================================

export async function getInvoices(options?: {
    search?: string
    status?: string
    page?: number
    limit?: number
}) {
    const { search = '', status = '' } = options || {}
    const { page, limit, skip } = validatePagination(options?.page, options?.limit)

    try {
        const session = await auth()
        if (!session?.user) {
            return { invoices: [], total: 0, pages: 0, currentPage: 1 }
        }

        const where: any = {}

        // Tenant Isolation: Clients can only see their own invoices
        if (session.user.role !== 'ADMIN') {
            // Client must have a companyId to see invoices
            // We need to fetch user's companyId from DB to be sure (session might be stale)
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })

            if (!user?.companyId) {
                return { invoices: [], total: 0, pages: 0, currentPage: 1 }
            }

            where.companyId = user.companyId
        }


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
        const session = await auth()
        if (!session?.user) return null

        const userCompanyId = await getUserCompanyId(session.user.id, session.user.role as 'ADMIN' | 'CLIENT')
        if (session.user.role !== 'ADMIN' && !userCompanyId) return null

        const invoice = await prisma.invoice.findFirst({
            where: {
                id,
                companyId: session.user.role === 'ADMIN' ? undefined : userCompanyId!,
            },
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

        // Tenant isolation: verify user can access this invoice
        await requireTenantAccess('invoice', id)

        const StatusSchema = z.nativeEnum(InvoiceStatus)
        const parsed = StatusSchema.safeParse(status)
        if (!parsed.success) {
            return { success: false, error: 'Geçersiz fatura durumu' }
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: { status: parsed.data },
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
        if (error instanceof TenantAccessError || error instanceof UnauthorizedError) {
            return { success: false, error: error.message }
        }
        return { success: false, error: 'Durum güncellenirken bir hata oluştu.' }
    }
}

// ==========================================
// DELETE
// ==========================================

export async function deleteInvoice(id: string): Promise<InvoiceActionResult> {
    try {
        await requireAuth()

        // Tenant isolation: verify user can access this invoice
        await requireTenantAccess('invoice', id)

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
        if (error instanceof TenantAccessError || error instanceof UnauthorizedError) {
            return { success: false, error: error.message }
        }
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
