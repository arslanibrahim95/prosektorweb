'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client'
import { getUserCompanyId } from '@/lib/guards/tenant-guard'

// ==========================================
// TYPES & SCHEMAS
// ==========================================

const TicketSchema = z.object({
    companyId: z.string().min(1, 'Müşteri seçimi zorunlu'),
    subject: z.string().min(3, 'Konu en az 3 karakter olmalı'),
    message: z.string().min(5, 'Mesaj en az 5 karakter olmalı'),
    priority: z.nativeEnum(TicketPriority),
    category: z.nativeEnum(TicketCategory),
})

const MessageSchema = z.object({
    content: z.string().min(1, 'Mesaj boş olamaz'),
    isStaffReply: z.boolean().default(true),
})

export type TicketFormState = {
    success?: boolean
    error?: string
    data?: any
}

// ==========================================
// ACTIONS
// ==========================================

export async function createTicket(formData: FormData): Promise<TicketFormState> {
    try {
        await requireAuth()

        const rawData = {
            companyId: formData.get('companyId'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            priority: formData.get('priority'),
            category: formData.get('category'),
        }

        const validated = TicketSchema.parse(rawData)

        const session = await auth()
        const isAdmin = session?.user?.role === 'ADMIN'
        let targetCompanyId = validated.companyId

        if (!isAdmin) {
            const user = await prisma.user.findUnique({
                where: { id: session?.user?.id },
                select: { companyId: true }
            })
            if (!user?.companyId) throw new Error('Şirket kaydınız bulunamadı.')
            targetCompanyId = user.companyId // Force user's own company
        }

        const ticket = await prisma.ticket.create({
            data: {
                companyId: targetCompanyId,
                subject: validated.subject,
                priority: validated.priority,
                category: validated.category,
                status: TicketStatus.OPEN,
                messages: {
                    create: {
                        content: validated.message,
                        isStaffReply: isAdmin // If created by admin, it is staff reply. If client, no.
                    }
                }
            }
        })

        await logAudit({
            action: 'CREATE',
            entity: 'Ticket',
            entityId: ticket.id,
            details: { subject: validated.subject, priority: validated.priority },
        })

        revalidatePath('/admin/tickets')
        return { success: true, data: ticket }
    } catch (error: unknown) {
        console.error('createTicket error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: getZodErrorMessage(error) }
        }
        return { success: false, error: getErrorMessage(error) }
    }
}

export async function addMessage(ticketId: string, content: string, isStaffReply: boolean = true) {
    try {
        const session = await auth()
        if (!session?.user) return { success: false, error: 'Oturum açmalısınız.' }

        const isAdmin = session.user.role === 'ADMIN'

        // Check ticket ownership
        const ticket = await prisma.ticket.findUnique({
            where: { id: ticketId },
            select: { companyId: true }
        })

        if (!ticket) return { success: false, error: 'Talep bulunamadı' }

        if (!isAdmin) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })
            if (!user?.companyId || user.companyId !== ticket.companyId) {
                return { success: false, error: 'Yetkisiz işlem: Bu talep size ait değil.' }
            }
        }

        // Force false if not admin, preventing horizontal privilege escalation
        const finalIsStaffReply = isAdmin ? isStaffReply : false

        await prisma.ticketMessage.create({
            data: {
                ticketId,
                content: content,
                isStaffReply: finalIsStaffReply
            }
        })

        // Eğer müşteri cevap verdiyse durumu "Açık", personel cevap verdiyse "Cevaplandı/İnceleniyor" yapılabilir
        // Şimdilik basitleştirilmiş akış: Personel yazarsa durum değişmez, kullanıcı kapatana kadar.

        revalidatePath(`/admin/tickets/${ticketId}`)
        return { success: true }
    } catch (error) {
        console.error('addMessage error:', error)
        return { success: false, error: 'Mesaj gönderilemedi.' }
    }
}

export async function updateTicketStatus(id: string, status: TicketStatus) {
    try {
        await requireAuth()

        await prisma.ticket.update({
            where: { id },
            data: { status }
        })

        await logAudit({
            action: 'UPDATE',
            entity: 'Ticket',
            entityId: id,
            details: { newStatus: status },
        })

        revalidatePath('/admin/tickets')
        revalidatePath(`/admin/tickets/${id}`)
        return { success: true }
    } catch (error) {
        console.error('updateTicketStatus error:', error)
        return { success: false, error: 'Durum güncellenemedi.' }
    }
}

// ==========================================
// QUERIES
// ==========================================

export async function getTickets(options?: {
    status?: TicketStatus
    search?: string
    page?: number
    limit?: number
}) {
    const { status, search = '', page = 1, limit = 10 } = options || {}
    const skip = (page - 1) * limit

    try {
        const session = await auth()
        if (!session?.user) return { tickets: [], total: 0, pages: 0, currentPage: 1 }

        const where: any = {}

        // Tenant Isolation
        if (session.user.role !== 'ADMIN') {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { companyId: true }
            })
            if (!user?.companyId) return { tickets: [], total: 0, pages: 0, currentPage: 1 }
            where.companyId = user.companyId
        }

        if (status) {
            where.status = status
        }

        if (search) {
            where.OR = [
                { subject: { contains: search } },
                { company: { name: { contains: search } } },
            ]
        }

        const [tickets, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                skip,
                take: limit,
                include: {
                    company: { select: { id: true, name: true } },
                    _count: { select: { messages: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.ticket.count({ where })
        ])

        return {
            tickets,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page,
        }
    } catch (error) {
        console.error('getTickets error:', error)
        return { tickets: [], total: 0, pages: 0, currentPage: 1 }
    }
}

export async function getTicketById(id: string) {
    try {
        const session = await auth()
        if (!session?.user) return null

        const userCompanyId = await getUserCompanyId(session.user.id, session.user.role as 'ADMIN' | 'CLIENT')
        if (!userCompanyId && session.user.role !== 'ADMIN') return null

        const ticket = await prisma.ticket.findFirst({
            where: {
                id,
                companyId: session.user.role === 'ADMIN' ? undefined : userCompanyId,
            },
            include: {
                company: true,
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        return ticket
    } catch (error) {
        console.error('getTicketById error:', error)
        return null
    }
}
