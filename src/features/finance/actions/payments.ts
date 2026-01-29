'use server'

import { prisma } from '@/server/db'
import { getErrorMessage, getZodErrorMessage, logAudit, toDecimal, executeWithRetry } from '@/shared/lib'
import { requireAuth } from '@/features/auth/lib/auth-guard'
import {
    requireTenantAccess,
    TenantAccessError,
    UnauthorizedError
} from '@/features/system/lib/guards/tenant-guard'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { PaymentMethod } from '@prisma/client'
import { Decimal } from 'decimal.js'

// ==========================================
// TYPES
// ==========================================

export interface PaymentActionResult {
    success: boolean
    data?: any
    error?: string
}

// ==========================================
// VALIDATION
// ==========================================

const PaymentSchema = z.object({
    invoiceId: z.string().min(1, 'Fatura ID gerekli'),
    amount: z.coerce.number().min(0.01, 'Tutar 0\'dan büyük olmalı'),
    paymentDate: z.string().min(1, 'Ödeme tarihi gerekli'),
    method: z.nativeEnum(PaymentMethod),
    reference: z.string().optional(),
    notes: z.string().optional(),
    idempotencyKey: z.string().optional(),
})

// ==========================================
// CREATE PAYMENT
// ==========================================

const MAX_PAYMENT_RETRIES = 3

export async function createPayment(formData: FormData): Promise<PaymentActionResult> {
    try {
        await requireAuth()

        const rawData = {
            invoiceId: formData.get('invoiceId') as string,
            amount: formData.get('amount') as string,
            paymentDate: formData.get('paymentDate') as string,
            method: formData.get('method') as string,
            reference: formData.get('reference') as string || undefined,
            notes: formData.get('notes') as string || undefined,
            idempotencyKey: formData.get('idempotencyKey') as string || undefined,
        }

        const validatedData = PaymentSchema.parse(rawData)

        // Tenant isolation: verify user can access this invoice
        await requireTenantAccess('invoice', validatedData.invoiceId)

        // Retry loop for optimistic locking
        let lastError: unknown
        for (let attempt = 0; attempt < MAX_PAYMENT_RETRIES; attempt++) {
            try {
                const result = await prisma.$transaction(async (tx) => {
                    // 1. Idempotency Check
                    if (validatedData.idempotencyKey) {
                        const existingPayment = await tx.payment.findUnique({
                            where: { idempotencyKey: validatedData.idempotencyKey }
                        })
                        if (existingPayment) {
                            return { payment: existingPayment, alreadyExists: true }
                        }
                    }

                    // Read current invoice state
                    const invoice = await tx.invoice.findFirst({
                        where: { id: validatedData.invoiceId, deletedAt: null },
                        select: { id: true, paidAmount: true, total: true, version: true }
                    })

                    if (!invoice) {
                        throw new Error('INVOICE_NOT_FOUND')
                    }

                    const currentPaidAmount = new Decimal(invoice.paidAmount)
                    const total = new Decimal(invoice.total)
                    const amount = new Decimal(validatedData.amount)
                    const newPaidAmount = currentPaidAmount.plus(amount)

                    // Validate payment doesn't exceed total
                    if (newPaidAmount.gt(total)) {
                        throw new Error('PAYMENT_EXCEEDS_TOTAL')
                    }

                    // Determine new status
                    let newStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING'
                    if (newPaidAmount.gte(total)) {
                        newStatus = 'PAID'
                    } else if (newPaidAmount.gt(0)) {
                        newStatus = 'PARTIAL'
                    }

                    // Create payment first
                    const payment = await tx.payment.create({
                        data: {
                            invoiceId: validatedData.invoiceId,
                            amount: amount.toString(),
                            paymentDate: new Date(validatedData.paymentDate),
                            method: validatedData.method,
                            reference: validatedData.reference || null,
                            notes: validatedData.notes || null,
                            idempotencyKey: validatedData.idempotencyKey || null,
                        },
                    })

                    // Optimistic lock: Update only if version hasn't changed
                    const updateResult = await tx.invoice.updateMany({
                        where: {
                            id: validatedData.invoiceId,
                            version: invoice.version, // Standard optimistic lock
                        },
                        data: {
                            paidAmount: newPaidAmount,
                            status: newStatus,
                            version: { increment: 1 }
                        },
                    })

                    // If no rows updated, another transaction modified the invoice
                    if (updateResult.count === 0) {
                        throw new Error('CONCURRENT_MODIFICATION')
                    }

                    return { payment, newPaidAmount, newStatus, alreadyExists: false }
                })

                if ((result as any).alreadyExists) {
                    return { success: true, data: result.payment }
                }

                // Success - log and return
                await logAudit({
                    action: 'CREATE',
                    entity: 'Payment',
                    entityId: result.payment.id,
                    details: {
                        invoiceId: validatedData.invoiceId,
                        amount: validatedData.amount,
                        method: validatedData.method,
                        newPaidAmount: result.newPaidAmount,
                        newStatus: result.newStatus,
                    },
                })

                revalidatePath('/admin/invoices')
                revalidatePath(`/admin/invoices/${validatedData.invoiceId}`)
                return { success: true, data: result.payment }
            } catch (error) {
                lastError = error
                // Retry on concurrent modification
                if (error instanceof Error && error.message === 'CONCURRENT_MODIFICATION') {
                    continue
                }
                // Don't retry on other errors
                throw error
            }
        }

        // All retries exhausted
        console.error('createPayment: max retries exceeded', lastError)
        return { success: false, error: 'Eşzamanlı işlem hatası, lütfen tekrar deneyin.' }
    } catch (error: unknown) {
        console.error('createPayment error:', error)

        if (error instanceof TenantAccessError || error instanceof UnauthorizedError) {
            return { success: false, error: error.message }
        }

        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }

        if (error instanceof Error && error.message === 'PAYMENT_EXCEEDS_TOTAL') {
            return { success: false, error: 'Ödeme tutarı fatura toplamını aşamaz.' }
        }

        if (error instanceof Error && error.message === 'INVOICE_NOT_FOUND') {
            return { success: false, error: 'Fatura bulunamadı veya silinmiş.' }
        }

        return { success: false, error: 'Ödeme kaydedilirken bir hata oluştu.' }
    }
}

// ==========================================
// DELETE PAYMENT
// ==========================================

export async function deletePayment(id: string): Promise<PaymentActionResult> {
    try {
        await requireAuth()

        // Tenant isolation: verify user can access this payment
        await requireTenantAccess('payment', id)

        // Retry loop for optimistic locking
        let lastError: unknown
        for (let attempt = 0; attempt < MAX_PAYMENT_RETRIES; attempt++) {
            try {
                const result = await prisma.$transaction(async (tx) => {
                    // Note: tx doesn't have soft-delete extension, so filter manually
                    const payment = await tx.payment.findFirst({
                        where: { id, deletedAt: null },
                        include: { invoice: true },
                    })

                    if (!payment) {
                        throw new Error('PAYMENT_NOT_FOUND')
                    }

                    // Read current state for optimistic lock
                    const currentPaidAmount = new Decimal(payment.invoice.paidAmount)
                    const paymentAmount = new Decimal(payment.amount)
                    const invoiceTotal = new Decimal(payment.invoice.total)
                    const newPaidAmount = Decimal.max(0, currentPaidAmount.minus(paymentAmount))
                    const currentInvoiceVersion = payment.invoice.version

                    // Determine new status
                    let newStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING'
                    if (newPaidAmount.gte(invoiceTotal)) {
                        newStatus = 'PAID'
                    } else if (newPaidAmount.gt(0)) {
                        newStatus = 'PARTIAL'
                    }

                    // Soft delete payment (manual since tx doesn't have extension)
                    await tx.payment.update({
                        where: { id },
                        data: { deletedAt: new Date() }
                    })

                    // Optimistic lock: Update only if version hasn't changed
                    const updateResult = await tx.invoice.updateMany({
                        where: {
                            id: payment.invoiceId,
                            version: currentInvoiceVersion, // Standard optimistic lock
                        },
                        data: {
                            paidAmount: newPaidAmount,
                            status: newStatus,
                            version: { increment: 1 }
                        },
                    })

                    if (updateResult.count === 0) {
                        throw new Error('CONCURRENT_MODIFICATION')
                    }

                    return {
                        invoiceId: payment.invoiceId,
                        amount: paymentAmount,
                        newPaidAmount,
                        newStatus,
                    }
                })

                // Log deletion
                await logAudit({
                    action: 'DELETE',
                    entity: 'Payment',
                    entityId: id,
                    details: {
                        invoiceId: result.invoiceId,
                        amount: result.amount,
                        newPaidAmount: result.newPaidAmount,
                        newStatus: result.newStatus,
                    },
                })

                revalidatePath('/admin/invoices')
                revalidatePath(`/admin/invoices/${result.invoiceId}`)
                return { success: true }
            } catch (error) {
                lastError = error
                if (error instanceof Error && error.message === 'CONCURRENT_MODIFICATION') {
                    continue
                }
                throw error
            }
        }

        console.error('deletePayment: max retries exceeded', lastError)
        return { success: false, error: 'Eşzamanlı işlem hatası, lütfen tekrar deneyin.' }
    } catch (error) {
        console.error('deletePayment error:', error)

        if (error instanceof TenantAccessError || error instanceof UnauthorizedError) {
            return { success: false, error: error.message }
        }

        if (error instanceof Error && error.message === 'PAYMENT_NOT_FOUND') {
            return { success: false, error: 'Ödeme bulunamadı.' }
        }

        return { success: false, error: 'Ödeme silinirken bir hata oluştu.' }
    }
}
