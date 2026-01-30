import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Input } from './Input'

// Mock the shared lib to avoid server-side imports (Prisma)
// Note: We mock the specific file now because Input imports directly from it
vi.mock('@/shared/lib/utils', () => ({
    cn: (...inputs: any[]) => inputs.flat().filter(Boolean).join(' ')
}))

describe('Input Component Accessibility', () => {
    it('should have an accessible password toggle button', () => {
        render(<Input type="password" placeholder="Password" />)

        // Find by accessible name - this confirms the button has an accessible name
        const toggleButton = screen.getByRole('button', { name: /show password/i })

        expect(toggleButton).toBeInTheDocument()

        // Verify it is keyboard accessible (tabIndex should not be -1)
        expect(toggleButton).not.toHaveAttribute('tabIndex', '-1')

        // Verify initial state
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false')

        // Test interaction: Click to show password
        fireEvent.click(toggleButton)

        expect(toggleButton).toHaveAttribute('aria-label', 'Hide password')
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true')

        // Test interaction: Click to hide password
        fireEvent.click(toggleButton)

        expect(toggleButton).toHaveAttribute('aria-label', 'Show password')
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
    })
})
