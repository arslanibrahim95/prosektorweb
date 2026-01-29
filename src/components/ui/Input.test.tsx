import { render, screen } from '@testing-library/react'
import { Input } from './Input'
import { describe, it, expect } from 'vitest'

describe('Input Component Accessibility', () => {
    it('sets aria-invalid when error prop is true', () => {
        render(<Input error />)
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('sets aria-invalid to false when error prop is false', () => {
        render(<Input />)
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-invalid', 'false')
    })

    it('hides leading icon from screen readers', () => {
         const { container } = render(<Input leadingIcon={<span className="icon">Icon</span>} />)
         // The leading icon wrapper is the first child of the root div
         // structure: div.relative > div.absolute > icon
         const wrapper = container.querySelector('.absolute.left-4')
         expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    })
})
