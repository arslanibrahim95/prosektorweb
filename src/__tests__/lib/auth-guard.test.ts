import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requireAuth, getSession } from '@/lib/auth-guard'

// Mock the auth function
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}))

import { auth } from '@/auth'

describe('auth-guard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('requireAuth', () => {
        it('should throw error when not authenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null)

            await expect(requireAuth()).rejects.toThrow('Unauthorized: Oturum açmanız gerekiyor.')
        })

        it('should throw error when user has no session', async () => {
            vi.mocked(auth).mockResolvedValue({ user: undefined } as any)

            await expect(requireAuth()).rejects.toThrow('Unauthorized: Oturum açmanız gerekiyor.')
        })

        it('should throw error when user role is not allowed', async () => {
            vi.mocked(auth).mockResolvedValue({
                user: { id: '1', name: 'Test', email: 'test@test.com', role: 'CLIENT' }
            } as any)

            // Default requires ADMIN
            await expect(requireAuth()).rejects.toThrow('Unauthorized: Bu işlem için yetkiniz yok.')
        })

        it('should return session when ADMIN user is authenticated', async () => {
            const mockSession = {
                user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' }
            }
            vi.mocked(auth).mockResolvedValue(mockSession as any)

            const result = await requireAuth()

            expect(result.user).toEqual(mockSession.user)
        })

        it('should allow CLIENT role when explicitly specified', async () => {
            const mockSession = {
                user: { id: '1', name: 'Client', email: 'client@test.com', role: 'CLIENT', companyId: 'company-1' }
            }
            vi.mocked(auth).mockResolvedValue(mockSession as any)

            const result = await requireAuth(['ADMIN', 'CLIENT'])

            expect(result.user.role).toBe('CLIENT')
            expect(result.user.companyId).toBe('company-1')
        })

        it('should allow multiple roles', async () => {
            const mockSession = {
                user: { id: '1', name: 'Admin', email: 'admin@test.com', role: 'ADMIN' }
            }
            vi.mocked(auth).mockResolvedValue(mockSession as any)

            const result = await requireAuth(['ADMIN', 'CLIENT'])

            expect(result.user.role).toBe('ADMIN')
        })
    })

    describe('getSession', () => {
        it('should return null when not authenticated', async () => {
            vi.mocked(auth).mockResolvedValue(null)

            const result = await getSession()

            expect(result).toBeNull()
        })

        it('should return null when user is undefined', async () => {
            vi.mocked(auth).mockResolvedValue({ user: undefined } as any)

            const result = await getSession()

            expect(result).toBeNull()
        })

        it('should return session when authenticated', async () => {
            const mockSession = {
                user: { id: '1', name: 'Test', email: 'test@test.com', role: 'ADMIN' }
            }
            vi.mocked(auth).mockResolvedValue(mockSession as any)

            const result = await getSession()

            expect(result?.user).toEqual(mockSession.user)
        })
    })
})
