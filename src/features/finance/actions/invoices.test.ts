/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createInvoice } from './invoices'
import { prisma } from '@/server/db'
import { redis } from '@/shared/lib'
import { auth } from '@/auth'
import { Decimal } from 'decimal.js'

vi.mock('@/lib/prisma', () => ({
    prisma: {
        invoice: {
            create: vi.fn(),
            findUnique: vi.fn(),
            findFirst: vi.fn(),
        },
        auditLog: {
            create: vi.fn(),
        },
        $transaction: vi.fn((cb) => cb(prisma)),
    },
}))

vi.mock('@/lib/redis', () => ({
    redis: {
        get: vi.fn(),
        set: vi.fn(),
    },
}))

vi.mock('@/auth', () => ({
    auth: vi.fn(),
}))

vi.mock('@/lib/cache', () => ({
    invalidateCache: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
    checkRateLimit: vi.fn().mockResolvedValue({ success: true }),
    getClientIp: vi.fn().mockResolvedValue('127.0.0.1')
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Invoice Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createInvoice', () => {
        it('should calculate tax and total correctly with Decimal.js', async () => {
            // Mock Auth as ADMIN
            ; (auth as any).mockResolvedValue({ user: { role: 'ADMIN' } })

            const input = {
                companyId: 'company-1',
                subtotal: '100',
                taxRate: '20',
                issueDate: new Date(),
                dueDate: new Date(),
                invoiceNo: '2026-0001'
            }

                ; (prisma.invoice.create as any).mockResolvedValue({ id: 'inv-1', invoiceNo: '2026-0001' })

            const result = await createInvoice(input)

            expect(result.success).toBe(true)
            expect(prisma.invoice.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    subtotal: '100',
                    taxRate: '20',
                    taxAmount: '20',
                    total: '120'
                })
            }))
        })

        it('should handle floating point decimals correctly (e.g. 0.1 + 0.2)', async () => {
            ; (auth as any).mockResolvedValue({ user: { role: 'ADMIN' } })

            const input = {
                companyId: 'company-1',
                subtotal: '0.1',
                taxRate: '200', // 200% tax for easy test
                issueDate: new Date(),
                dueDate: new Date(),
                invoiceNo: '2026-0002'
            }
                // 0.1 * 2 = 0.2 tax. Total 0.3.
                // In JS floats 0.1 + 0.2 is 0.30000000000000004

                ; (prisma.invoice.create as any).mockResolvedValue({ id: 'inv-2', invoiceNo: '2026-0002' })

            const result = await createInvoice(input)

            expect(result.success).toBe(true)
            expect(prisma.invoice.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    subtotal: '0.1',
                    taxAmount: '0.2',
                    total: '0.3' // Should be exactly "0.3" thanks to Decimal.toString()
                })
            }))
        })

        it('should return existing invoice for same idempotencyKey', async () => {
            ; (auth as any).mockResolvedValue({ user: { role: 'ADMIN' } })

            const idempotencyKey = 'unique-key-123'
            const input = {
                companyId: 'company-1',
                subtotal: '100',
                taxRate: '20',
                issueDate: new Date(),
                dueDate: new Date(),
                idempotencyKey
            }

                ; (redis.get as any).mockResolvedValue('existing-inv-id')
                ; (prisma.invoice.findFirst as any).mockResolvedValue({ id: 'existing-inv-id', invoiceNo: '2026-9999' })

            const result = await createInvoice(input)

            expect(result.success).toBe(true)
            expect(result.data.id).toBe('existing-inv-id')
            expect(prisma.invoice.create).not.toHaveBeenCalled()
            // Redis check removed from implementation
            // expect(redis.get).toHaveBeenCalledWith(`invoice:idempotency:${idempotencyKey}`)
        })
    })
})
