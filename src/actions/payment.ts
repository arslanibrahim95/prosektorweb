'use server'

import { prisma } from '@/lib/prisma'
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types'
import { requireAuth } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { PaymentMethod } from '@prisma/client'

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
        }

        const validatedData = PaymentSchema.parse(rawData)

        // Retry loop for optimistic locking
        let lastError: unknown
        for (let attempt = 0; attempt < MAX_PAYMENT_RETRIES; attempt++) {
            try {
                const result = await prisma.$transaction(async (tx) => {
                    // Read current invoice state
                    const invoice = await tx.invoice.findUniqueOrThrow({
                        where: { id: validatedData.invoiceId },
                    })

                    const currentPaidAmount = Number(invoice.paidAmount)
                    const total = Number(invoice.total)
                    const newPaidAmount = currentPaidAmount + validatedData.amount

                    // Validate payment doesn't exceed total
                    if (newPaidAmount > total) {
                        throw new Error('PAYMENT_EXCEEDS_TOTAL')
                    }

                    // Determine new status
                    let newStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING'
                    if (newPaidAmount >= total) {
                        newStatus = 'PAID'
                    } else if (newPaidAmount > 0) {
                        newStatus = 'PARTIAL'
                    }

                    // Create payment first
                    const payment = await tx.payment.create({
                        data: {
                            invoiceId: validatedData.invoiceId,
                            amount: validatedData.amount,
                            paymentDate: new Date(validatedData.paymentDate),
                            method: validatedData.method,
                            reference: validatedData.reference || null,
                            notes: validatedData.notes || null,
                        },
                    })

                    // Optimistic lock: Update only if paidAmount hasn't changed
                    // This prevents lost updates from concurrent payments
                    const updateResult = await tx.invoice.updateMany({
                        where: {
                            id: validatedData.invoiceId,
                            paidAmount: currentPaidAmount, // Optimistic lock condition
                        },
                        data: {
                            paidAmount: newPaidAmount,
                            status: newStatus,
                        },
                    })

                    // If no rows updated, another transaction modified the invoice
                    if (updateResult.count === 0) {
                        throw new Error('CONCURRENT_MODIFICATION')
                    }

                    return { payment, newPaidAmount, newStatus }
                })

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

        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }

        if (error instanceof Error && error.message === 'PAYMENT_EXCEEDS_TOTAL') {
            return { success: false, error: 'Ödeme tutarı fatura toplamını aşamaz.' }
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

        // Retry loop for optimistic locking
        let lastError: unknown
        for (let attempt = 0; attempt < MAX_PAYMENT_RETRIES; attempt++) {
            try {
                const result = await prisma.$transaction(async (tx) => {
                    const payment = await tx.payment.findUnique({
                        where: { id },
                        include: { invoice: true },
                    })

                    if (!payment) {
                        throw new Error('PAYMENT_NOT_FOUND')
                    }

                    // Read current state for optimistic lock
                    const currentPaidAmount = Number(payment.invoice.paidAmount)
                    const paymentAmount = Number(payment.amount)
                    const invoiceTotal = Number(payment.invoice.total)
                    const newPaidAmount = Math.max(0, currentPaidAmount - paymentAmount)

                    // Determine new status
                    let newStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING'
                    if (newPaidAmount >= invoiceTotal) {
                        newStatus = 'PAID'
                    } else if (newPaidAmount > 0) {
                        newStatus = 'PARTIAL'
                    }

                    // Delete payment first
                    await tx.payment.delete({ where: { id } })

                    // Optimistic lock: Update only if paidAmount hasn't changed
                    const updateResult = await tx.invoice.updateMany({
                        where: {
                            id: payment.invoiceId,
                            paidAmount: currentPaidAmount, // Optimistic lock condition
                        },
                        data: {
                            paidAmount: newPaidAmount,
                            status: newStatus,
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

        if (error instanceof Error && error.message === 'PAYMENT_NOT_FOUND') {
            return { success: false, error: 'Ödeme bulunamadı.' }
        }

        return { success: false, error: 'Ödeme silinirken bir hata oluştu.' }
    }
}
