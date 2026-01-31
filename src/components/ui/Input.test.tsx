import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'
import React from 'react'

describe('Input Component', () => {
  it('renders password toggle button with correct accessibility attributes', () => {
    render(<Input type="password" placeholder="Password" />)

    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')

    // Expect the button to have an accessible name
    const toggleButton = screen.getByRole('button', { name: /şifreyi göster/i })

    expect(toggleButton).toBeInTheDocument()

    // Should be keyboard accessible
    expect(toggleButton).not.toHaveAttribute('tabIndex', '-1')

    // Should indicate state
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false')

    // Click to show password
    fireEvent.click(toggleButton)

    expect(input).toHaveAttribute('type', 'text')
    expect(toggleButton).toHaveAttribute('aria-label', 'Şifreyi gizle')
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true')

    // Click to hide password
    fireEvent.click(toggleButton)

    expect(input).toHaveAttribute('type', 'password')
    expect(toggleButton).toHaveAttribute('aria-label', 'Şifreyi göster')
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('allows customizing accessibility labels', () => {
    render(
      <Input
        type="password"
        placeholder="Password"
        showPasswordLabel="Show password"
        hidePasswordLabel="Hide password"
      />
    )

    const toggleButton = screen.getByRole('button', { name: /Show password/i })
    expect(toggleButton).toBeInTheDocument()

    fireEvent.click(toggleButton)
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide password')
  })
})
