import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './Input'
import { describe, it, expect } from 'vitest'

describe('Input Component', () => {
    it('renders text input correctly', () => {
        render(<Input type="text" placeholder="Test Input" />)
        const input = screen.getByPlaceholderText('Test Input')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('type', 'text')
    })

    it('renders password input with toggle button', () => {
        render(<Input type="password" placeholder="Password" />)
        const input = screen.getByPlaceholderText('Password')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('type', 'password')

        // This part is expected to fail or need adjustment before the fix
        // We look for the button. In the "Bad" version, it has no label.
        // So we might need to find it by class or role button.
        const toggleButton = screen.getByRole('button')
        expect(toggleButton).toBeInTheDocument()
    })

    it('toggles password visibility and has accessibility attributes', () => {
        render(<Input type="password" placeholder="Password" />)
        const input = screen.getByPlaceholderText('Password')

        // After our fix, we should be able to find it by aria-label
        // But since we haven't fixed it yet, let's find it by role for now and assert what SHOULD be there
        // The test will fail on assertions until we fix the component
        const toggleButton = screen.getByRole('button')

        // Initial state
        expect(input).toHaveAttribute('type', 'password')

        // Check for accessibility attributes
        expect(toggleButton).not.toHaveAttribute('tabIndex', '-1')
        expect(toggleButton).toHaveAttribute('aria-label', 'Show password')
        expect(toggleButton).toHaveAttribute('aria-pressed', 'false')

        // Click to toggle
        fireEvent.click(toggleButton)

        // State after click
        expect(input).toHaveAttribute('type', 'text')
        expect(toggleButton).toHaveAttribute('aria-label', 'Hide password')
        expect(toggleButton).toHaveAttribute('aria-pressed', 'true')

        // Click again
        fireEvent.click(toggleButton)
        expect(input).toHaveAttribute('type', 'password')
    })
})
