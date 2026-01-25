'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { AuditAction } from '@prisma/client'

export interface AuditLogFilters {
    search?: string
    action?: string
    entity?: string
    startDate?: string
    endDate?: string
}

export async function getAuditLogs(page: number = 1, limit: number = 20, filters?: AuditLogFilters) {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { data: [], meta: { total: 0, page: 1, limit, totalPages: 0 } }
        }

        const skip = (page - 1) * limit
        const where: any = {}

        if (filters?.search) {
            where.OR = [
                { userName: { contains: filters.search } },
                { userEmail: { contains: filters.search } },
                { entityId: { contains: filters.search } },
                { details: { contains: filters.search } }
            ]
        }

        if (filters?.action && filters.action !== 'ALL') {
            where.action = filters.action as AuditAction
        }

        if (filters?.entity && filters.entity !== 'ALL') {
            where.entity = filters.entity
        }

        if (filters?.startDate) {
            where.createdAt = { ...where.createdAt, gte: new Date(filters.startDate) }
        }

        if (filters?.endDate) {
            where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) }
        }

        const [data, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.auditLog.count({ where })
        ])

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    } catch (e) {
        console.error('getAuditLogs Error:', e)
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
    }
}

export async function getAuditLog(id: string) {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') return null

        return await prisma.auditLog.findUnique({
            where: { id }
        })
    } catch (e) {
        return null
    }
}
