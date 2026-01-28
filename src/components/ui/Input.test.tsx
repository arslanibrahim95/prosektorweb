import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input Component', () => {
    it('renders with group class on wrapper', () => {
        const { container } = render(<Input leadingIcon={<span>Icon</span>} />)
        // The first div should be the wrapper
        const wrapper = container.firstChild
        expect(wrapper).toHaveClass('group')
    })

    it('sets aria-invalid when error is present', () => {
        render(<Input error />)
        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('sets aria-hidden on leading icon wrapper', () => {
        const { container } = render(<Input leadingIcon={<span data-testid="icon">Icon</span>} />)
        // Find the wrapper of the icon. It is the first child of the main wrapper.
        // Structure: <div (wrapper)> <div (icon-wrapper)> ... </div> <input /> </div>
        // We can search for the text "Icon" and find its parent or closest div.
        const icon = screen.getByText('Icon')
        // The icon is wrapped in a div
        const iconWrapper = icon.parentElement
        expect(iconWrapper).toHaveAttribute('aria-hidden', 'true')
    })
})
