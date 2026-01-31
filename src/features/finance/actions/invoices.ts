'use server'

import { prisma } from '@/server/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getErrorMessage, getZodErrorMessage, isPrismaUniqueConstraintError, validatePagination, invalidateCache, logger, redis } from '@/shared/lib'
import { checkRateLimit, getClientIp } from '@/shared/lib/rate-limit'
import { z } from 'zod'
import { getUserCompanyId, requireTenantAccess } from '@/features/system/lib/guards/tenant-guard'
import { AuditAction, InvoiceStatus, PaymentMethod } from '@prisma/client'
import { Decimal } from 'decimal.js'

export interface InvoiceInput {
    companyId: string
    invoiceNo?: string
    issueDate: Date | string
    dueDate: Date | string
    subtotal: string // String for Decimal
    taxRate: string // String for Decimal
    description?: string
    notes?: string
    idempotencyKey?: string
}

const InvoiceSchema = z.object({
    companyId: z.string().min(1, 'Firma seçilmeli'),
    invoiceNo: z.string().optional(),
    issueDate: z.coerce.date(),
    dueDate: z.coerce.date(),
    subtotal: z.string().min(1, 'Tutar girilmeli'), // Expect string
    taxRate: z.string().default('20'), // Expect string
    description: z.string().optional(),
    notes: z.string().optional(),
    idempotencyKey: z.string().optional()
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
        logger.error({ error: e }, 'Audit Log Failed')
    }
}

/**
 * Generate invoice number inside transaction (race-condition safe)
 */
async function generateInvoiceNoInTx(tx: any): Promise<string> {
    const year = new Date().getFullYear()
    const lastInvoice = await tx.invoice.findFirst({
        where: { invoiceNo: { startsWith: `${year}-` } },
        orderBy: { invoiceNo: 'desc' },
    })

    if (!lastInvoice) return `${year}-0001`
    const lastSeq = parseInt(lastInvoice.invoiceNo.split('-')[1])
    return `${year}-${String(lastSeq + 1).padStart(4, '0')}`
}

export async function generateInvoiceNo(): Promise<string> {
    const year = new Date().getFullYear()
    const lastInvoice = await prisma.invoice.findFirst({
        where: { invoiceNo: { startsWith: `${year}-` } },
        orderBy: { invoiceNo: 'desc' }
    })

    if (!lastInvoice) return `${year}-0001`
    const lastSeq = parseInt(lastInvoice.invoiceNo.split('-')[1])
    return `${year}-${String(lastSeq + 1).padStart(4, '0')}`
}

export async function getInvoices(cursor?: string, limit: number = 20, search?: string) {
    try {
        const session = await auth()

        const where: any = {
            deletedAt: null
        }

        if (search) {
            where.OR = [
                { invoiceNo: { contains: search } },
                { company: { name: { contains: search } } }
            ]
        }

        const [data, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                take: limit + 1, // Fetch one extra to check for next page
                skip: cursor ? 1 : 0,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: [
                    { issueDate: 'desc' },
                    { id: 'desc' } // Ensure stable sort for cursor pagination
                ],
                include: {
                    company: { select: { id: true, name: true } }
                }
            }),
            prisma.invoice.count({ where })
        ])

        let nextCursor: string | null = null
        if (data.length > limit) {
            const nextItem = data.pop() // Remove the extra item
            nextCursor = nextItem?.id || null
        }

        return {
            data,
            meta: {
                total,
                nextCursor,
                hasMore: !!nextCursor
            }
        }
    } catch (e) {
        logger.error({ error: e, cursor, limit, search }, 'getInvoices Error')
        return { data: [], meta: { total: 0, nextCursor: null, hasMore: false } }
    }
}

export async function getInvoice(id: string) {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                company: true,
                payments: true
            }
        })

        if (!invoice) return null

        const total = new Decimal(invoice.total)
        const paidAmount = new Decimal(invoice.paidAmount)
        const remainingAmount = total.minus(paidAmount)

        return {
            ...invoice,
            remainingAmount: remainingAmount.toString()
        }
    } catch (e) {
        return null
    }
}

export async function createInvoice(input: InvoiceInput | FormData): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const rawData = input instanceof FormData ? {
            companyId: input.get('companyId') as string,
            invoiceNo: input.get('invoiceNo') as string || undefined,
            issueDate: input.get('issueDate') as string,
            dueDate: input.get('dueDate') as string,
            subtotal: input.get('subtotal') as string,
            taxRate: input.get('taxRate') as string || '20',
            description: input.get('description') as string,
            notes: input.get('notes') as string,
            idempotencyKey: input.get('idempotencyKey') as string,
        } : input

        const validated = InvoiceSchema.parse(rawData)

        // 1. Rate Limiting
        const ip = await getClientIp()
        const limit = await checkRateLimit(`invoice_create:${ip}`, { limit: 5, windowSeconds: 60 })
        if (!limit.success) return { success: false, error: 'Too Many Requests' }

        // 2. Idempotency Check
        if (validated.idempotencyKey) {
            const existingInvoice = await prisma.invoice.findFirst({
                where: { idempotencyKey: validated.idempotencyKey }
            })
            if (existingInvoice) {
                logger.info({ key: validated.idempotencyKey, invoiceId: existingInvoice.id }, 'Idempotency Hit (DB)')
                return { success: true, data: existingInvoice }
            }
        }

        // Financial Math with Decimal.js
        const subtotal = new Decimal(validated.subtotal)
        const taxRate = new Decimal(validated.taxRate)
        const taxAmount = subtotal.mul(taxRate).div(100)
        const total = subtotal.plus(taxAmount)

        // Retry logic for invoice number generation
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const invoice = await prisma.$transaction(async (tx) => {
                    let invoiceNo = validated.invoiceNo
                    if (!invoiceNo || invoiceNo === 'AUTO') {
                        invoiceNo = await generateInvoiceNoInTx(tx)
                    }

                    return tx.invoice.create({
                        data: {
                            companyId: validated.companyId,
                            invoiceNo,
                            issueDate: validated.issueDate,
                            dueDate: validated.dueDate,
                            description: validated.description,
                            notes: validated.notes,
                            subtotal: subtotal.toString(),     // Prisma maps string/decimal correctly if schema uses Decimal
                            taxRate: taxRate.toString(),
                            taxAmount: taxAmount.toString(),
                            total: total.toString(),
                            status: 'PENDING',
                            idempotencyKey: validated.idempotencyKey || null
                        }
                    })
                })

                // (Redis cache is redundant now but kept as second layer if needed, or removed)
                // if (validated.idempotencyKey) {
                //     await redis.set(`invoice:idempotency:${validated.idempotencyKey}`, invoice.id, { ex: 86400 })
                // }

                await logActivity('CREATE', 'Invoice', invoice.id, { invoiceNo: invoice.invoiceNo, total: total.toNumber() })

                // Invalidate Cache
                await invalidateCache('dashboard:admin:stats')
                await invalidateCache('reports:revenue:data')
                await invalidateCache('reports:invoices:stats')

                revalidatePath('/admin/invoices')
                return { success: true, data: invoice }
            } catch (err) {
                if (isPrismaUniqueConstraintError(err) && attempt < 2) continue
                throw err
            }
        }
        throw new Error('Could not generate unique invoice number')
    } catch (e: any) {
        if (e instanceof z.ZodError) return { success: false, error: getZodErrorMessage(e) }
        logger.error({ error: e }, 'Create Invoice Error')
        return { success: false, error: 'Fatura oluşturulamadı' }
    }
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus, expectedVersion?: number): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        // Atomic update with version lock
        const updateResult = await prisma.invoice.updateMany({
            where: {
                id,
                ...(expectedVersion !== undefined ? { version: expectedVersion } : {})
            },
            data: {
                status,
                version: { increment: 1 }
            }
        })

        if (updateResult.count === 0) {
            const exists = await prisma.invoice.findUnique({ where: { id }, select: { version: true } })
            if (exists) {
                return { success: false, error: 'Bu kayıt başka bir kullanıcı tarafından güncellenmiş. Lütfen sayfayı yenileyip tekrar deneyin. (Conflict)' }
            }
            return { success: false, error: 'Fatura bulunamadı.' }
        }

        await logActivity('UPDATE', 'Invoice', id, { status })

        // Invalidate Cache
        await invalidateCache('dashboard:admin:stats')
        await invalidateCache('reports:revenue:data')
        await invalidateCache('reports:invoices:stats')

        revalidatePath('/admin/invoices')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Güncelleme başarısız' }
    }
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { success: false, error: 'Unauthorized' }
        }

        await prisma.invoice.update({
            where: { id },
            data: { deletedAt: new Date(), status: 'CANCELLED' }
        })

        await logActivity('DELETE', 'Invoice', id)

        // Invalidate Cache
        await invalidateCache('dashboard:admin:stats')
        await invalidateCache('reports:revenue:data')
        await invalidateCache('reports:invoices:stats')

        revalidatePath('/admin/invoices')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Silme işlemi başarısız' }
    }
}

export async function getInvoiceStats() {
    try {
        const [paid, pending] = await Promise.all([
            prisma.invoice.aggregate({
                where: { status: 'PAID' },
                _sum: { total: true },
                _count: true
            }),
            prisma.invoice.aggregate({
                where: { status: 'PENDING' },
                _sum: { total: true },
                _count: true
            })
        ])

        return {
            totalRevenue: paid._sum.total?.toString() || '0',
            pendingAmount: pending._sum.total?.toString() || '0',
            paidCount: paid._count,
            pendingCount: pending._count
        }
    } catch (e) {
        return { totalRevenue: '0', pendingAmount: '0', paidCount: 0, pendingCount: 0 }
    }
}

// createPayment removed - use createPayment from src/features/finance/actions/payments.ts
