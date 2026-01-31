'use server'

import { prisma } from '@/server/db'
import { auth } from '@/auth'
import { AuditAction } from '@prisma/client'
import { CursorPaginatedResponse } from '@/shared/lib/action-types'

export interface AuditLogFilters {
    search?: string
    action?: string
    entity?: string
    startDate?: string
    endDate?: string
}

export async function getAuditLogs(cursor?: string, limit: number = 20, filters?: AuditLogFilters): Promise<CursorPaginatedResponse<any>> {
    try {
        const session = await auth()
        if (session?.user?.role !== 'ADMIN') {
            return { data: [], meta: { nextCursor: null, limit } }
        }

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

        const data = await prisma.auditLog.findMany({
            where,
            take: limit + 1, // Fetch one extra to check for next page
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
        })

        let nextCursor: string | null = null
        if (data.length > limit) {
            const nextItem = data.pop()
            nextCursor = nextItem?.id || null
        }

        return {
            data,
            meta: {
                nextCursor,
                limit
            }
        }
    } catch (e) {
        console.error('getAuditLogs Error:', e)
        return { data: [], meta: { nextCursor: null, limit } }
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
