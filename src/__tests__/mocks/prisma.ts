import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended'
import { prisma } from '@/lib/prisma'

// 1. Mock the prisma module
vi.mock('@/lib/prisma', () => ({
    prisma: mockDeep<PrismaClient>(),
}))

// 2. Export the mocked instance for use in tests
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>

// 3. Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks()
})
