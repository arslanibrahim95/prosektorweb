import { calculateTaxPrecise } from './money'
import { Decimal } from 'decimal.js'

/**
 * Türkiye KDV oranları geçmişi.
 * Tarihe göre en yeni geçerli oran kullanılır.
 * Dizi, en yeniden en eskiye sıralanmıştır.
 */
export const TAX_HISTORY = [
    { start: new Date('2023-07-10'), rate: new Decimal(20) },
    { start: new Date('2000-01-01'), rate: new Decimal(18) }
]

/**
 * Belirtilen tarih için geçerli KDV oranını getirir.
 * Tarih verilmezse şu anki geçerli oran döndürülür.
 *
 * @param date - İşlem tarihi (opsiyonel, varsayılan: şimdi)
 * @returns KDV Oranı (örn: 20 için %20)
 *
 * @example
 * ```typescript
 * getTaxRate() // Decimal { 20 } (şu anki oran)
 * getTaxRate(new Date('2023-01-01')) // Decimal { 18 }
 * getTaxRate(new Date('2024-01-01')) // Decimal { 20 }
 * ```
 */
export function getTaxRate(date: Date = new Date()): Decimal {
    // Tarihe göre en yeni oranı bul
    const match = TAX_HISTORY.find(h => date >= h.start)
    return match ? match.rate : new Decimal(20)
}

/**
 * Tutar üzerinden KDV hesaplar.
 * Tarihe göre geçerli KDV oranını otomatik uygular.
 *
 * @param amount - Ana tutar
 * @param date - İşlem tarihi (opsiyonel, tarihsel vergi oranları için)
 * @returns Hesaplama sonuçları (string formatında)
 *
 * @example
 * ```typescript
 * calculateTax(100)
 * // { subtotal: "100", taxAmount: "20", total: "120", rate: 20 }
 *
 * calculateTax(100, new Date('2023-01-01'))
 * // { subtotal: "100", taxAmount: "18", total: "118", rate: 18 }
 * ```
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
