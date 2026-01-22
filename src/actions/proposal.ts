'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { ProposalStatus } from '@prisma/client'

// ==========================================
// TYPES & SCHEMAS
// ==========================================

const ProposalItemSchema = z.object({
    description: z.string().min(1, 'Açıklama gereklidir'),
    quantity: z.number().min(1, 'Miktar en az 1 olmalı'),
    unitPrice: z.number().min(0, 'Birim fiyat negatif olamaz'),
})

const ProposalSchema = z.object({
    companyId: z.string().min(1, 'Firma seçimi zorunlu'),
    subject: z.string().min(2, 'Konu en az 2 karakter olmalı'),
    validUntil: z.string().optional(), // Date string from input
    currency: z.string().default('TRY'),
    notes: z.string().optional(),
    items: z.array(ProposalItemSchema).min(1, 'En az bir kalem eklemelisiniz'),
})

export type ProposalFormState = {
    success?: boolean
    error?: string
    data?: any
}

// ==========================================
// ACTIONS
// ==========================================

export async function createProposal(formData: any): Promise<ProposalFormState> {
    try {
        await requireAuth()

        // Client-side might send JSON instead of FormData for complex nested structures
        const validated = ProposalSchema.parse(formData)

        // Calculate totals
        let subtotal = 0
        validated.items.forEach(item => {
            subtotal += item.quantity * item.unitPrice
        })

        // Default tax rate 20%
        const taxRate = 20
        const taxAmount = subtotal * (taxRate / 100)
        const total = subtotal + taxAmount

        const proposal = await prisma.proposal.create({
            data: {
                companyId: validated.companyId,
                subject: validated.subject,
                validUntil: validated.validUntil ? new Date(validated.validUntil) : undefined,
                currency: validated.currency,
                notes: validated.notes,
                status: ProposalStatus.DRAFT,
                subtotal,
                taxRate,
                taxAmount,
                total,
                items: {
                    create: validated.items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.quantity * item.unitPrice
                    }))
                }
            }
        })

        await logAudit({
            action: 'CREATE',
            entity: 'Proposal',
            entityId: proposal.id,
            details: { subject: validated.subject, total },
        })

        revalidatePath('/admin/proposals')
        return { success: true, data: proposal }
    } catch (error: any) {
        console.error('createProposal error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: (error as any).errors[0].message }
        }
        return { success: false, error: 'Teklif oluşturulurken hata oluştu.' }
    }
}

export async function updateProposalStatus(id: string, status: ProposalStatus) {
    try {
        await requireAuth()

        await prisma.proposal.update({
            where: { id },
            data: { status }
        })

        await logAudit({
            action: 'UPDATE',
            entity: 'Proposal',
            entityId: id,
            details: { newStatus: status },
        })

        revalidatePath('/admin/proposals')
        revalidatePath(`/admin/proposals/${id}`)
        return { success: true }
    } catch (error) {
        console.error('updateProposalStatus error:', error)
        return { success: false, error: 'Durum güncellenemedi.' }
    }
}

export async function deleteProposal(id: string) {
    try {
        await requireAuth()

        // Get proposal info before delete for audit
        const proposal = await prisma.proposal.findUnique({
            where: { id },
            select: { subject: true },
        })

        await prisma.proposal.delete({ where: { id } })

        await logAudit({
            action: 'DELETE',
            entity: 'Proposal',
            entityId: id,
            details: { subject: proposal?.subject },
        })

        revalidatePath('/admin/proposals')
        return { success: true }
    } catch (error) {
        console.error('deleteProposal error:', error)
        return { success: false, error: 'Silme işlemi başarısız.' }
    }
}

// ==========================================
// QUERIES
// ==========================================

export async function getProposals(options?: {
    status?: ProposalStatus
    search?: string
    page?: number
    limit?: number
}) {
    const { status, search = '', page = 1, limit = 10 } = options || {}
    const skip = (page - 1) * limit

    try {
        const where: any = {}

        if (status) {
            where.status = status
        }

        if (search) {
            where.OR = [
                { subject: { contains: search } },
                { company: { name: { contains: search } } },
            ]
        }

        const [proposals, total] = await Promise.all([
            prisma.proposal.findMany({
                where,
                skip,
                take: limit,
                include: {
                    company: { select: { id: true, name: true } },
                    _count: { select: { items: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.proposal.count({ where })
        ])

        return {
            proposals,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error('getProposals error:', error)
        return { proposals: [], total: 0, pages: 0, currentPage: 1 }
    }
}

export async function getProposalById(id: string) {
    try {
        const proposal = await prisma.proposal.findUnique({
            where: { id },
            include: {
                company: true,
                items: true
            }
        })
        return proposal
    } catch (error) {
        console.error('getProposalById error:', error)
        return null
    }
}

// ==========================================
// CONVERSION & APPROVAL ACTIONS
// ==========================================

/**
 * Generate a unique approval token for digital signature
 */
export async function generateApprovalToken(proposalId: string) {
    try {
        await requireAuth()

        const token = crypto.randomUUID()

        await prisma.proposal.update({
            where: { id: proposalId },
            data: {
                approvalToken: token,
                status: ProposalStatus.SENT
            }
        })

        revalidatePath('/admin/proposals')
        revalidatePath(`/admin/proposals/${proposalId}`)

        return { success: true, token }
    } catch (error) {
        console.error('generateApprovalToken error:', error)
        return { success: false, error: 'Onay linki oluşturulamadı.' }
    }
}

/**
 * Approve proposal via token (for client-side digital signature)
 */
export async function approveProposalByToken(token: string) {
    try {
        const proposal = await prisma.proposal.findUnique({
            where: { approvalToken: token }
        })

        if (!proposal) {
            return { success: false, error: 'Geçersiz veya süresi dolmuş onay linki.' }
        }

        if (proposal.status === ProposalStatus.ACCEPTED) {
            return { success: false, error: 'Bu teklif zaten onaylanmış.' }
        }

        // Check validity date
        if (proposal.validUntil && new Date() > proposal.validUntil) {
            await prisma.proposal.update({
                where: { id: proposal.id },
                data: { status: ProposalStatus.EXPIRED }
            })
            return { success: false, error: 'Teklifin geçerlilik süresi dolmuş.' }
        }

        await prisma.proposal.update({
            where: { id: proposal.id },
            data: {
                status: ProposalStatus.ACCEPTED,
                approvedAt: new Date()
            }
        })

        revalidatePath('/admin/proposals')
        return { success: true }
    } catch (error) {
        console.error('approveProposalByToken error:', error)
        return { success: false, error: 'Onay işlemi başarısız.' }
    }
}

/**
 * Convert an accepted proposal to an invoice
 * Uses transaction for atomicity and retry logic for race conditions
 */
export async function convertProposalToInvoice(proposalId: string) {
    const MAX_RETRIES = 3

    try {
        await requireAuth()

        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
            include: { items: true, company: true }
        })

        if (!proposal) {
            return { success: false, error: 'Teklif bulunamadı.' }
        }

        if (proposal.invoiceId) {
            return { success: false, error: 'Bu teklif zaten faturaya dönüştürülmüş.' }
        }

        // Retry loop for handling race conditions
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                // Use transaction to ensure atomicity
                const result = await prisma.$transaction(async (tx) => {
                    // Generate invoice number inside transaction
                    const year = new Date().getFullYear()
                    const lastInvoice = await tx.invoice.findFirst({
                        where: { invoiceNo: { startsWith: `${year}-` } },
                        orderBy: { invoiceNo: 'desc' }
                    })

                    let nextNum = 1
                    if (lastInvoice) {
                        const lastNum = parseInt(lastInvoice.invoiceNo.split('-')[1])
                        nextNum = lastNum + 1
                    }
                    const invoiceNo = `${year}-${String(nextNum).padStart(4, '0')}`

                    // Create invoice with 30-day due date
                    const dueDate = new Date()
                    dueDate.setDate(dueDate.getDate() + 30)

                    const invoice = await tx.invoice.create({
                        data: {
                            invoiceNo,
                            companyId: proposal.companyId,
                            dueDate,
                            subtotal: proposal.subtotal,
                            taxRate: proposal.taxRate,
                            taxAmount: proposal.taxAmount,
                            total: proposal.total,
                            description: `${proposal.subject} - Teklif No: ${proposalId.slice(0, 8)}`,
                            notes: proposal.notes
                        }
                    })

                    // Update proposal with conversion info (same transaction)
                    await tx.proposal.update({
                        where: { id: proposalId },
                        data: {
                            convertedAt: new Date(),
                            invoiceId: invoice.id
                        }
                    })

                    return { invoiceId: invoice.id, invoiceNo }
                })

                // Success - revalidate and return
                revalidatePath('/admin/proposals')
                revalidatePath(`/admin/proposals/${proposalId}`)
                revalidatePath('/admin/invoices')

                return { success: true, invoiceId: result.invoiceId, invoiceNo: result.invoiceNo }

            } catch (txError: unknown) {
                // Check if it's a unique constraint violation (race condition)
                const isUniqueViolation =
                    typeof txError === 'object' &&
                    txError !== null &&
                    'code' in txError &&
                    (txError as { code: string }).code === 'P2002'

                if (isUniqueViolation && attempt < MAX_RETRIES) {
                    // Wait a bit and retry
                    await new Promise(resolve => setTimeout(resolve, 100 * attempt))
                    continue
                }

                // Re-throw if not a unique violation or max retries reached
                throw txError
            }
        }

        // Should never reach here, but TypeScript needs it
        return { success: false, error: 'Maksimum deneme sayısına ulaşıldı.' }

    } catch (error) {
        console.error('convertProposalToInvoice error:', error)
        return { success: false, error: 'Faturaya dönüştürme başarısız.' }
    }
}
