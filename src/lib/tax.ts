import { toDecimal, calculateTaxPrecise } from './money'
import { Decimal } from 'decimal.js'

// Geçmiş vergi oranları (Tarihine göre geçerli oran alınır)
export const TAX_HISTORY = [
    { start: new Date('2023-07-10'), rate: new Decimal(20) },
    { start: new Date('2000-01-01'), rate: new Decimal(18) }
]

/**
 * Belirtilen tarih için geçerli KDV oranını getirir.
 * @param date İşlem tarihi (opsiyonel, varsayılan: şimdi)
 * @returns KDV Oranı (örn: 20)
 */
export function getTaxRate(date: Date = new Date()): Decimal {
    // Tarihe göre en yeni oranı bul (sorted desc assumed or found)
    const match = TAX_HISTORY.find(h => date >= h.start)
    return match ? match.rate : new Decimal(20)
}

/**
 * Tutar üzerinden KDV hesaplar
 */
export function calculateTax(amount: number | string | Decimal, date?: Date) {
    const rate = getTaxRate(date)
    const result = calculateTaxPrecise(amount, rate)

    return {
        subtotal: result.subtotal.toString(),
        taxAmount: result.taxAmount.toString(),
        total: result.total.toString(),
        rate: result.rate.toNumber()
    }
}
