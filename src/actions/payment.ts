'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

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
    method: z.enum(['CASH', 'BANK', 'CREDIT_CARD', 'OTHER']),
    reference: z.string().optional(),
    notes: z.string().optional(),
})

// ==========================================
// CREATE PAYMENT
// ==========================================

export async function createPayment(formData: FormData): Promise<PaymentActionResult> {
    try {
        const rawData = {
            invoiceId: formData.get('invoiceId') as string,
            amount: formData.get('amount') as string,
            paymentDate: formData.get('paymentDate') as string,
            method: formData.get('method') as string,
            reference: formData.get('reference') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        }

        const validatedData = PaymentSchema.parse(rawData)

        // Get invoice to update paid amount
        const invoice = await prisma.invoice.findUnique({
            where: { id: validatedData.invoiceId },
        })

        if (!invoice) {
            return { success: false, error: 'Fatura bulunamadı.' }
        }

        const newPaidAmount = Number(invoice.paidAmount) + validatedData.amount
        const total = Number(invoice.total)

        // Determine new status
        let newStatus = invoice.status
        if (newPaidAmount >= total) {
            newStatus = 'PAID'
        } else if (newPaidAmount > 0) {
            newStatus = 'PARTIAL'
        }

        // Create payment and update invoice in a transaction
        const [payment] = await prisma.$transaction([
            prisma.payment.create({
                data: {
                    invoiceId: validatedData.invoiceId,
                    amount: validatedData.amount,
                    paymentDate: new Date(validatedData.paymentDate),
                    method: validatedData.method as any,
                    reference: validatedData.reference || null,
                    notes: validatedData.notes || null,
                },
            }),
            prisma.invoice.update({
                where: { id: validatedData.invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    status: newStatus,
                },
            }),
        ])

        revalidatePath('/admin/invoices')
        revalidatePath(`/admin/invoices/${validatedData.invoiceId}`)
        return { success: true, data: payment }
    } catch (error: any) {
        console.error('createPayment error:', error)

        if (error instanceof z.ZodError) {
            return { success: false, error: (error as any).errors[0].message }
        }

        return { success: false, error: 'Ödeme kaydedilirken bir hata oluştu.' }
    }
}

// ==========================================
// DELETE PAYMENT
// ==========================================

export async function deletePayment(id: string): Promise<PaymentActionResult> {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { invoice: true },
        })

        if (!payment) {
            return { success: false, error: 'Ödeme bulunamadı.' }
        }

        const newPaidAmount = Number(payment.invoice.paidAmount) - Number(payment.amount)

        // Determine new status
        let newStatus = payment.invoice.status
        if (newPaidAmount <= 0) {
            newStatus = 'PENDING'
        } else if (newPaidAmount < Number(payment.invoice.total)) {
            newStatus = 'PARTIAL'
        }

        await prisma.$transaction([
            prisma.payment.delete({ where: { id } }),
            prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: {
                    paidAmount: Math.max(0, newPaidAmount),
                    status: newStatus,
                },
            }),
        ])

        revalidatePath('/admin/invoices')
        revalidatePath(`/admin/invoices/${payment.invoiceId}`)
        return { success: true }
    } catch (error) {
        console.error('deletePayment error:', error)
        return { success: false, error: 'Ödeme silinirken bir hata oluştu.' }
    }
}
