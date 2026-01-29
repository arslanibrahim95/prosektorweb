import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'
import React from 'react'

describe('Input', () => {
    it('sets aria-invalid when error is true', () => {
        render(<Input error={true} aria-label="Test Input" />)
        const input = screen.getByLabelText('Test Input')
        expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('does not set aria-invalid when error is false', () => {
        render(<Input error={false} aria-label="Test Input" />)
        const input = screen.getByLabelText('Test Input')
        expect(input).not.toHaveAttribute('aria-invalid', 'true')
    })

    it('hides leading icon from screen readers', () => {
        render(<Input leadingIcon={<span data-testid="icon">Icon</span>} aria-label="Test Input" />)
        // The icon wrapper should have aria-hidden="true"
        // We need to find the wrapper. The leadingIcon is rendered inside the wrapper.
        const icon = screen.getByTestId('icon')
        const wrapper = icon.parentElement
        expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    })
})
