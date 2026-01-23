'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

async function getClientCompanyId() {
    const session = await auth()
    return (session?.user as any)?.companyId || null
}

// Helper to get current user ID
async function getUserId() {
    const session = await auth()
    return session?.user?.id
}

const updateProfileSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır.'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz.')
})

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Mevcut şifre gereklidir.'),
    newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır.')
})

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

// Get single proposal details for portal
export async function getClientProposalById(id: string) {
    const companyId = await getClientCompanyId()
    if (!companyId) return null

    return await prisma.proposal.findFirst({
        where: { id, companyId },
        include: {
            items: true,
            company: true
        }
    })
}

// Approve proposal from portal (session based)
export async function approveClientProposal(id: string) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { success: false, error: 'Oturum geçersiz.' }

    const proposal = await prisma.proposal.findFirst({
        where: { id, companyId, status: 'SENT' }
    })

    if (!proposal) return { success: false, error: 'Teklif bulunamadı veya işlem yapılamaz.' }

    await prisma.proposal.update({
        where: { id },
        data: {
            status: 'ACCEPTED',
            approvedAt: new Date()
        }
    })

    revalidatePath('/portal/proposals')
    revalidatePath(`/portal/proposals/${id}`)
    return { success: true }
}

// Reject proposal from portal
export async function rejectClientProposal(id: string) {
    const companyId = await getClientCompanyId()
    if (!companyId) return { success: false, error: 'Oturum geçersiz.' }

    const proposal = await prisma.proposal.findFirst({
        where: { id, companyId, status: 'SENT' }
    })

    if (!proposal) return { success: false, error: 'Teklif bulunamadı veya işlem yapılamaz.' }

    await prisma.proposal.update({
        where: { id },
        data: {
            status: 'REJECTED'
        }
    })

    revalidatePath('/portal/proposals')
    revalidatePath(`/portal/proposals/${id}`)
    return { success: true }
}

// Update client profile
export async function updateClientProfile(data: z.infer<typeof updateProfileSchema>) {
    const userId = await getUserId()
    if (!userId) return { success: false, error: 'Oturum geçersiz.' }

    const validation = updateProfileSchema.safeParse(data)
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message }
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email
            }
        })

        revalidatePath('/portal/profile')
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Profil güncellenirken bir hata oluştu.' }
    }
}

// Change client password
export async function changeClientPassword(data: z.infer<typeof changePasswordSchema>) {
    const userId = await getUserId()
    if (!userId) return { success: false, error: 'Oturum geçersiz.' }

    const validation = changePasswordSchema.safeParse(data)
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message }
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return { success: false, error: 'Kullanıcı bulunamadı.' }

        const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password)
        if (!isPasswordValid) {
            return { success: false, error: 'Mevcut şifre hatalı.' }
        }

        const hashedPassword = await bcrypt.hash(data.newPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: 'Şifre değiştirilirken bir hata oluştu.' }
    }
}
