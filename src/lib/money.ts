import { Decimal } from 'decimal.js'

/**
 * Common Decimal configuration
 */
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Converts a number or string to a standardized Decimal
 */
export function toDecimal(value: number | string | any): Decimal {
    if (value === null || value === undefined) return new Decimal(0)
    return new Decimal(value.toString())
}

/**
 * Formats a payment/invoice amount for consistency
 */
export function formatMoney(amount: number | string | Decimal): string {
    return toDecimal(amount).toFixed(2)
}

/**
 * Precise tax calculation helper
 */
export function calculateTaxPrecise(amount: number | string | Decimal, rate: number | string | Decimal) {
    const dAmount = toDecimal(amount)
    const dRate = toDecimal(rate)

    const taxAmount = dAmount.mul(dRate).div(100)
    const total = dAmount.plus(taxAmount)

    return {
        subtotal: dAmount,
        taxAmount,
        total,
        rate: dRate
    }
}
