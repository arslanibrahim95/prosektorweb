import { vi, describe, it, expect, beforeEach } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'

// 1. Mock dependencies BEFORE imports
vi.mock('@/lib/prisma', () => ({
    prisma: mockDeep(),
}))

vi.mock('@/shared/lib/headers', () => ({
    getClientIp: vi.fn(),
    getUserAgent: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
    getClientIp: vi.fn(),
}))

vi.mock('@/lib/security/idempotency', () => ({
    verifyIdempotency: vi.fn(),
}))

// Mock isomorphic-dompurify
vi.mock('isomorphic-dompurify', () => ({
    default: {
        sanitize: vi.fn((val) => val)
    }
}))

// 2. Import SUT and mocks
import { submitContact } from '@/features/support/actions/contact'
import { prisma } from '@/server/db'
import { getClientIp } from '@/shared/lib/rate-limit'
import { getUserAgent } from '@/shared/lib/headers'
import { verifyIdempotency } from '@/features/system/lib/security/idempotency'

const prismaMock = prisma as any
const getClientIpMock = getClientIp as any
const getUserAgentMock = getUserAgent as any
const verifyIdempotencyMock = verifyIdempotency as any

describe('submitContact', () => {
    const mockFormData = new FormData()
    // Valid data defaults
    mockFormData.set('name', 'John Doe')
    mockFormData.set('email', 'john@example.com')
    mockFormData.set('phone', '1234567890') // Fixed: Added phone to prevent null
    mockFormData.set('message', 'This is a valid message content.')
    mockFormData.set('kvkk', 'on')

    const mockState = { success: false, message: '' }

    beforeEach(() => {
        vi.clearAllMocks()
        // Setup default mock behaviors
        getClientIpMock.mockResolvedValue('127.0.0.1')
        getUserAgentMock.mockResolvedValue('Test Agent')
        verifyIdempotencyMock.mockResolvedValue(true) // Always new request by default
    })

    it('should fail if rate limit is exceeded (5 requests/hour)', async () => {
        // Arrange: Mock Prisma count to return 5 (limit reached)
        prismaMock.contactMessage.count.mockResolvedValue(5)

        // Act
        const result = await submitContact(mockState, mockFormData)

        // Assert
        expect(result.success).toBe(false)
        expect(result.message).toContain('Çok fazla istek gönderdiniz')
        expect(prismaMock.contactMessage.create).not.toHaveBeenCalled()
    })

    it('should fail if validation errors exist (invalid email)', async () => {
        // Arrange
        prismaMock.contactMessage.count.mockResolvedValue(0)
        const invalidData = new FormData()
        invalidData.set('name', 'John')
        invalidData.set('email', 'not-an-email') // Invalid
        invalidData.set('message', 'Short') // Invalid (<10 chars)
        // Missing KVKK

        // Act
        const result = await submitContact(mockState, invalidData)

        // Assert
        expect(result.success).toBe(false)
        expect(result.errors).toHaveProperty('email')
        expect(result.errors).toHaveProperty('message')
        expect(result.errors).toHaveProperty('kvkk')
        expect(prismaMock.contactMessage.create).not.toHaveBeenCalled()
    })

    it('should fail if idempotency check fails (double submit)', async () => {
        // Arrange
        mockFormData.set('idempotencyKey', 'duplicate-key')
        verifyIdempotencyMock.mockResolvedValue(false) // Duplicate!

        // Act
        const result = await submitContact(mockState, mockFormData)

        // Assert
        expect(result.success).toBe(false)
        expect(result.message).toContain('zaten gönderildi')
        expect(prismaMock.contactMessage.create).not.toHaveBeenCalled()
    })

    it('should succeed with valid data and save to DB', async () => {
        // Arrange
        prismaMock.contactMessage.count.mockResolvedValue(0)
        prismaMock.contactMessage.create.mockResolvedValue({ id: 'msg-1' })

        // Act
        const result = await submitContact(mockState, mockFormData)

        // Assert
        if (!result.success) {
            console.log('Test Failed Result:', result)
        }
        expect(result.success).toBe(true)
        expect(result.message).toContain('başarıyla iletildi')

        // Verify DB call
        expect(prismaMock.contactMessage.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                name: 'John Doe',
                email: 'john@example.com',
                ipAddress: '127.0.0.1',
                userAgent: 'Test Agent'
            })
        }))
    })
})
