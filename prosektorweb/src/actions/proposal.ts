'use server'

import { prisma } from '@/lib/prisma'
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
        await prisma.proposal.update({
            where: { id },
            data: { status }
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
        await prisma.proposal.delete({ where: { id } })
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

export async function getProposals(status?: ProposalStatus) {
    try {
        const where: any = {}
        if (status) where.status = status

        const proposals = await prisma.proposal.findMany({
            where,
            include: {
                company: { select: { name: true } },
                _count: { select: { items: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        return proposals
    } catch (error) {
        console.error('getProposals error:', error)
        return []
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
