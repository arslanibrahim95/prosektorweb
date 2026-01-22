import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { beforeEach, vi } from 'vitest'

// Create a mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>()

// Mock the prisma module
vi.mock('@/lib/prisma', () => ({
    prisma: prismaMock,
}))

// Reset mocks before each test
beforeEach(() => {
    mockReset(prismaMock)
})

export type MockPrismaClient = DeepMockProxy<PrismaClient>
