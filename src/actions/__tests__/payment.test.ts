import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'
import { Decimal } from 'decimal.js'

// 1. Must mock before imports
vi.mock('@/lib/prisma', () => ({
    prisma: mockDeep(),
}))

import { createPayment } from '@/features/finance/actions/payments'
import { prisma } from '@/server/db'

const prismaMock = prisma as any

// Mocks
vi.mock('@/lib/auth-guard', () => ({
    requireAuth: vi.fn(),
}))

vi.mock('@/lib/guards/tenant-guard', () => ({
    requireTenantAccess: vi.fn(),
    TenantAccessError: Error,
    UnauthorizedError: Error,
}))

vi.mock('@/lib/audit', () => ({
    logAudit: vi.fn(),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('createPayment', () => {
    const mockFormData = new FormData()
    mockFormData.append('invoiceId', 'inv-123')
    mockFormData.append('amount', '100')
    mockFormData.append('paymentDate', '2024-01-01')
    mockFormData.append('method', 'BANK')

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should create payment successfully when optimistic lock passes', async () => {
        // Setup initial invoice state
        const mockInvoice = {
            id: 'inv-123',
            total: new Decimal(1000),
            paidAmount: new Decimal(0),
            companyId: 'comp-1',
            version: 1,
        }

        // Mock transaction execution
        prismaMock.$transaction.mockImplementation(async (callback: any) => {
            return callback(prismaMock)
        })

        // Mock finds and reads
        prismaMock.invoice.findFirst.mockResolvedValue(mockInvoice as any)

        // Mock payment create
        prismaMock.payment.create.mockResolvedValue({ id: 'pay-1', amount: new Decimal(100) } as any)

        // Mock successful optimistic update (count: 1)
        prismaMock.invoice.updateMany.mockResolvedValue({ count: 1 })

        const result = await createPayment(mockFormData)

        expect(result.success).toBe(true)
        expect(prismaMock.payment.create).toHaveBeenCalled()
        expect(prismaMock.invoice.updateMany).toHaveBeenCalledWith({
            where: { id: 'inv-123', version: 1 }, // Should use version for locking
            data: {
                paidAmount: expect.objectContaining({ d: [100] }), // Decimal(100)
                status: 'PARTIAL',
                version: { increment: 1 }
            }
        })
    })

    it('should retry on concurrent modification error', async () => {
        // Setup initial invoice state
        const mockInvoice = {
            id: 'inv-123',
            total: new Decimal(1000),
            paidAmount: new Decimal(0),
            companyId: 'comp-1',
            version: 1,
        }

        prismaMock.$transaction.mockImplementation(async (callback: any) => {
            return callback(prismaMock)
        })

        prismaMock.invoice.findFirst.mockResolvedValue(mockInvoice as any)

        // First attempt fails (count: 0), Second attempt succeeds (count: 1)
        prismaMock.invoice.updateMany
            .mockResolvedValueOnce({ count: 0 }) // Fail first
            .mockResolvedValueOnce({ count: 1 }) // Succeed retry

        prismaMock.payment.create.mockResolvedValue({ id: 'pay-1', amount: new Decimal(100) } as any)

        const result = await createPayment(mockFormData)

        expect(result.success).toBe(true)
        // updateMany should be called twice due to retry loop
        expect(prismaMock.invoice.updateMany).toHaveBeenCalledTimes(2)
    })

    it('should fail after max retries', async () => {
        prismaMock.$transaction.mockImplementation(async (callback: any) => {
            return callback(prismaMock)
        })

        prismaMock.invoice.findFirst.mockResolvedValue({
            id: 'inv-123',
            total: new Decimal(1000),
            paidAmount: new Decimal(0),
            companyId: 'comp-1',
            version: 1,
        } as any)

        // Always fail optimistic lock
        prismaMock.invoice.updateMany.mockResolvedValue({ count: 0 })

        const result = await createPayment(mockFormData)

        expect(result.success).toBe(false)
        expect(result.error).toContain('Eşzamanlı işlem hatası')
        // Should try 3 times
        expect(prismaMock.invoice.updateMany).toHaveBeenCalledTimes(3)
    })
})
