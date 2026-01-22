'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-guard'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { TicketStatus, TicketPriority, TicketCategory } from '@prisma/client'

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

        const ticket = await prisma.ticket.create({
            data: {
                companyId: validated.companyId,
                subject: validated.subject,
                priority: validated.priority,
                category: validated.category,
                status: TicketStatus.OPEN,
                messages: {
                    create: {
                        content: validated.message,
                        isStaffReply: true // Admin panelinden açıldığı için varsayılan true
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
    } catch (error: any) {
        console.error('createTicket error:', error)
        if (error instanceof z.ZodError) {
            return { success: false, error: (error as any).errors[0].message }
        }
        return { success: false, error: 'Talep oluşturulurken hata oluştu.' }
    }
}

export async function addMessage(ticketId: string, content: string, isStaffReply: boolean = true) {
    try {
        await requireAuth()

        const validated = MessageSchema.parse({ content, isStaffReply })

        await prisma.ticketMessage.create({
            data: {
                ticketId,
                content: validated.content,
                isStaffReply: validated.isStaffReply
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
        const ticket = await prisma.ticket.findUnique({
            where: { id },
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
