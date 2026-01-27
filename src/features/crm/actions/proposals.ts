'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { getErrorMessage, getZodErrorMessage, validatePagination } from '@/lib/action-types'
import { z } from 'zod'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { AuditAction, ProposalStatus, Prisma } from '@prisma/client'
import { toDecimal, calculateTaxPrecise } from '@/lib/money'
import { Decimal } from 'decimal.js'
import crypto from 'crypto'

const ProposalItemSchema = z.object({
    description: z.string().min(1, 'Açıklama gereklidir'),
    quantity: z.number().min(1, 'Miktar en az 1 olmalı'),
    unitPrice: z.number().min(0, 'Birim fiyat negatif olamaz'),
})

const ProposalSchema = z.object({
    companyId: z.string().min(1, 'Firma seçimi zorunlu'),
    subject: z.string().min(2, 'Konu en az 2 karakter olmalı'),
    validUntil: z.string().optional(),
    currency: z.string().default('TRY'),
    taxRate: z.number().optional().default(20),
    notes: z.string().optional(),
    items: z.array(ProposalItemSchema).min(1, 'En az bir kalem eklemelisiniz'),
})

export interface ProposalInput {
    companyId: string
    subject: string
    validUntil?: string | Date
    currency?: string
    taxRate?: number
    notes?: string
    items: {
        description: string
        quantity: number
        unitPrice: number
    }[]
}

export interface ActionResult {
    success: boolean
    error?: string
    data?: any
    invoiceId?: string
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

export async function getProposals(options: { search?: string, page?: number, limit?: number } = {}) {
    const { search, page = 1, limit = 20 } = options
    const skip = (page - 1) * limit

    try {
        const session = await auth()
        if (!session?.user) return { proposals: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }

        const where: Prisma.ProposalWhereInput = {}

        // AuthZ: Non-admins can only see their own company's proposals
        if (session.user.role !== 'ADMIN') {
            if (!session.user.companyId) return { proposals: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
            where.companyId = session.user.companyId
        }

        if (search) {
            where.OR = [
                { subject: { contains: search } },
                { company: { name: { contains: search } } }
            ]
        }

        const [proposals, total] = await Promise.all([
            prisma.proposal.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    company: { select: { name: true } }
                }
            }),
            prisma.proposal.count({ where })
        ])

        return {
            proposals,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (e) {
        console.error("getProposals error:", e)
        return { proposals: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    }
}

export async function getProposal(id: string) {
    try {
        const session = await auth()
        if (!session?.user) return null

        const proposal = await prisma.proposal.findUnique({
            where: { id },
            include: {
                company: true,
                items: true
            }
        })

        if (!proposal) return null

        // AuthZ: ADMIN or USER who belongs to this company
        if (session.user.role !== 'ADMIN' && session.user.companyId !== proposal.companyId) {
            return null
        }

        return proposal
    } catch (e) {
        return null
    }
}

export async function createProposal(input: ProposalInput | any): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }
        const validated = ProposalSchema.parse(input)

        let subtotal = new Decimal(0)
        validated.items.forEach(item => {
            subtotal = subtotal.plus(toDecimal(item.quantity).mul(toDecimal(item.unitPrice)))
        })

        const taxRate = validated.taxRate || 20
        const { taxAmount, total } = calculateTaxPrecise(subtotal, taxRate)

        const proposal = await prisma.proposal.create({
            data: {
                companyId: validated.companyId,
                subject: validated.subject,
                validUntil: validated.validUntil ? new Date(validated.validUntil) : undefined,
                currency: validated.currency,
                notes: validated.notes,
                status: ProposalStatus.DRAFT,
                subtotal: subtotal.toString(),
                taxRate: taxRate.toString(),
                taxAmount: taxAmount.toString(),
                total: total.toString(),
                items: {
                    create: validated.items.map(item => {
                        const itemSubtotal = toDecimal(item.quantity).mul(toDecimal(item.unitPrice))
                        return {
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: toDecimal(item.unitPrice).toString(),
                            totalPrice: itemSubtotal.toString()
                        }
                    })
                }
            }
        })

        await logActivity('CREATE', 'Proposal', proposal.id, { subject: validated.subject, total: total.toString() })
        revalidatePath('/admin/proposals')
        return { success: true, data: proposal }
    } catch (e: any) {
        if (e instanceof z.ZodError) return { success: false, error: getZodErrorMessage(e) }
        return { success: false, error: 'Teklif oluşturulamadı' }
    }
}

export async function generateApprovalToken(id: string): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const token = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

        await prisma.proposal.update({
            where: { id },
            data: {
                approvalToken: hashedToken,
                tokenExpiresAt: expiresAt,
                status: 'SENT'
            }
        })

        await logActivity('UPDATE', 'Proposal', id, { action: 'GENERATE_TOKEN', status: 'SENT', expiresAt })
        revalidatePath(`/admin/proposals/${id}`)
        return { success: true, data: token }
    } catch (e) {
        return { success: false, error: 'Token oluşturulamadı' }
    }
}

export async function updateProposalStatus(id: string, status: ProposalStatus): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        const proposal = await prisma.proposal.update({
            where: { id },
            data: { status }
        })

        await logActivity('UPDATE', 'Proposal', id, { status })
        revalidatePath('/admin/proposals')
        revalidatePath(`/admin/proposals/${id}`)
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Durum güncellenemedi' }
    }
}

export async function deleteProposal(id: string): Promise<ActionResult> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

        await prisma.proposal.delete({
            where: { id }
        })

        await logActivity('DELETE', 'Proposal', id)
        revalidatePath('/admin/proposals')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Silme işlemi başarısız' }
    }
}

export async function convertProposalToInvoice(proposalId: string): Promise<ActionResult> {
    const MAX_RETRIES = 3
    try {
        await auth()
        const proposal = await prisma.proposal.findUnique({
            where: { id: proposalId },
            include: { items: true, company: true }
        })

        if (!proposal) return { success: false, error: 'Teklif bulunamadı.' }
        if (proposal.invoiceId) return { success: false, error: 'Bu teklif zaten faturaya dönüştürülmüş.' }

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const result = await prisma.$transaction(async (tx) => {
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

                    const dueDate = new Date()
                    dueDate.setDate(dueDate.getDate() + 30)

                    const invoice = await tx.invoice.create({
                        data: {
                            invoiceNo,
                            companyId: proposal.companyId,
                            issueDate: new Date(),
                            dueDate,
                            subtotal: proposal.subtotal,
                            taxRate: proposal.taxRate,
                            taxAmount: proposal.taxAmount,
                            total: proposal.total,
                            description: `${proposal.subject} - Teklif No: ${proposalId.slice(0, 8)}`,
                            notes: proposal.notes,
                            status: 'PENDING'
                        }
                    })

                    await tx.proposal.update({
                        where: { id: proposalId },
                        data: { convertedAt: new Date(), invoiceId: invoice.id, status: 'ACCEPTED' }
                    })

                    return { invoiceId: invoice.id, invoiceNo }
                })

                revalidatePath('/admin/proposals')
                revalidatePath('/admin/invoices')
                return { success: true, data: result, invoiceId: result.invoiceId }
            } catch (txError: any) {
                if (txError.code === 'P2002' && attempt < MAX_RETRIES) continue
                throw txError
            }
        }
        return { success: false, error: 'Maksimum deneme sayısına ulaşıldı.' }
    } catch (error) {
        console.error('convertProposalToInvoice error:', error)
        return { success: false, error: 'Faturaya dönüştürme başarısız.' }
    }
}

export async function getProposalByToken(token: string) {
    try {
        const ip = await getClientIp()
        const limit = await checkRateLimit(`proposal:view:${ip}`, { limit: 10, windowSeconds: 3600 })
        if (!limit.success) return { success: false as const, error: 'Çok fazla deneme yaptınız.' }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
        const proposal = await prisma.proposal.findUnique({
            where: { approvalToken: hashedToken },
            include: { company: { select: { name: true } }, items: true }
        })

        if (!proposal) return { success: false as const, error: 'Geçersiz link.' }
        if (proposal.status === 'ACCEPTED') return { success: false as const, error: 'Zaten onaylanmış.' }

        if (proposal.tokenExpiresAt && proposal.tokenExpiresAt < new Date()) {
            return { success: false as const, error: 'Bu linkin süresi dolmuş.' }
        }

        return {
            success: true as const,
            data: {
                id: proposal.id,
                subject: proposal.subject,
                companyName: proposal.company.name,
                items: proposal.items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    totalPrice: Number(item.totalPrice),
                })),
                subtotal: Number(proposal.subtotal),
                taxRate: Number(proposal.taxRate),
                taxAmount: Number(proposal.taxAmount),
                total: Number(proposal.total),
                currency: proposal.currency,
                validUntil: proposal.validUntil,
                notes: proposal.notes,
            }
        }
    } catch (e) {
        return { success: false as const, error: 'Hata oluştu.' }
    }
}

export async function approveProposalByToken(token: string) {
    try {
        const ip = await getClientIp()
        const limit = await checkRateLimit(`proposal:approve:${ip}`, { limit: 5, windowSeconds: 3600 })
        if (!limit.success) return { success: false, error: 'Çok fazla deneme.' }

        const proposal = await prisma.proposal.findUnique({ where: { approvalToken: token } })
        if (!proposal || proposal.status === 'ACCEPTED') return { success: false, error: 'Geçersiz veya zaten onaylı.' }

        if (proposal.tokenExpiresAt && proposal.tokenExpiresAt < new Date()) {
            return { success: false, error: 'Bu linkin süresi dolmuş.' }
        }

        await prisma.proposal.update({
            where: { id: proposal.id },
            data: { status: 'ACCEPTED', approvedAt: new Date() }
        })

        revalidatePath('/admin/proposals')
        return { success: true }
    } catch (e) {
        return { success: false, error: 'Onay başarısız.' }
    }
}
