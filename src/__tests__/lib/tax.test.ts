import { describe, it, expect } from 'vitest'
import { getTaxRate, calculateTax } from '@/shared/lib'
import { Decimal } from 'decimal.js'

describe('Tax Utilities', () => {
    describe('getTaxRate', () => {
        it('should return 20% for current date (after 2023-07-10)', () => {
            const date = new Date('2024-01-01')
            const rate = getTaxRate(date)
            expect(rate).toBeInstanceOf(Decimal)
            expect(rate.toNumber()).toBe(20)
        })

        it('should return 18% for old date (before 2023-07-10)', () => {
            const date = new Date('2022-01-01')
            const rate = getTaxRate(date)
            expect(rate).toBeInstanceOf(Decimal)
            expect(rate.toNumber()).toBe(18)
        })

        it('should fallback to 20% if no date match (very old date)', () => {
            const date = new Date('1990-01-01')
            const rate = getTaxRate(date)
            expect(rate).toBeInstanceOf(Decimal)
            expect(rate.toNumber()).toBe(20) // Default fallback in code
        })
    })

    describe('calculateTax', () => {
        it('should calculate correct amounts for 20% tax', () => {
            const amount = 1000
            const result = calculateTax(amount, new Date('2024-01-01'))

            expect(result.subtotal).toBe('1000')
            expect(result.taxAmount).toBe('200')
            expect(result.total).toBe('1200')
            expect(result.rate).toBe(20)
        })

        it('should calculate correct amounts for 18% tax', () => {
            const amount = 1000
            const result = calculateTax(amount, new Date('2022-01-01'))

            expect(result.subtotal).toBe('1000')
            expect(result.taxAmount).toBe('180')
            expect(result.total).toBe('1180')
            expect(result.rate).toBe(18)
        })
    })
})
