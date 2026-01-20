'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

async function getClientCompanyId() {
    const session = await auth()
    return (session?.user as any)?.companyId || null
}

// Get domains for client
export async function getClientDomains() {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    return await prisma.domain.findMany({
        where: { companyId },
        orderBy: { expiresAt: 'asc' }
    })
}

// Get proposals for client
export async function getClientProposals() {
    const companyId = await getClientCompanyId()
    if (!companyId) return []

    return await prisma.proposal.findMany({
        where: { companyId },
        include: {
            items: true
        },
        orderBy: { createdAt: 'desc' }
    })
}

// Approve proposal with token
export async function approveProposal(proposalId: string, token: string) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { success: false, error: 'Oturum geçersiz.' }

    const proposal = await prisma.proposal.findFirst({
        where: {
            id: proposalId,
            companyId,
            approvalToken: token,
            status: 'SENT'
        }
    })

    if (!proposal) {
        return { success: false, error: 'Teklif bulunamadı veya zaten onaylanmış.' }
    }

    await prisma.proposal.update({
        where: { id: proposalId },
        data: {
            status: 'ACCEPTED',
            approvedAt: new Date()
        }
    })

    return { success: true }
}
