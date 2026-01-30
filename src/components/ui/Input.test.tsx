import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Test Input" />)
    expect(screen.getByPlaceholderText('Test Input')).toBeInTheDocument()
  })

  it('renders password toggle button when type is password', () => {
    render(<Input type="password" placeholder="Password" />)
    const button = screen.getByRole('button') // The only button in the component
    expect(button).toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    render(<Input type="password" placeholder="Password" />)
    const input = screen.getByPlaceholderText('Password') as HTMLInputElement
    const button = screen.getByRole('button')

    expect(input.type).toBe('password')

    fireEvent.click(button)
    expect(input.type).toBe('text')

    fireEvent.click(button)
    expect(input.type).toBe('password')
  })

  it('has accessible label for password toggle', () => {
    render(<Input type="password" placeholder="Password" />)
    // We expect the button to have an aria-label.
    // This test will likely fail on the current implementation as it lacks aria-label.
    // We'll check for either "Şifreyi göster" (Show password)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label')
  })

  it('is keyboard accessible', () => {
    render(<Input type="password" placeholder="Password" />)
    const button = screen.getByRole('button')
    expect(button).not.toHaveAttribute('tabIndex', '-1')
  })
})
