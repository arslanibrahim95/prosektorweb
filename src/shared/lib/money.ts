import { Decimal } from 'decimal.js'

/**
 * Common Decimal configuration
 * @description Floating-point hesaplama hatalarını önlemek için
 * Decimal.js kütüphanesinin global ayarları.
 */
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP })

/**
 * Bir değeri Decimal nesnesine dönüştürür.
 * Null/undefined değerler için 0 döndürür.
 *
 * @param value - Dönüştürülecek değer (number, string veya Decimal)
 * @returns Decimal nesnesi
 *
 * @example
 * ```typescript
 * toDecimal(100) // Decimal { 100 }
 * toDecimal('99.99') // Decimal { 99.99 }
 * toDecimal(null) // Decimal { 0 }
 * ```
 */
export function toDecimal(value: number | string | any): Decimal {
    if (value === null || value === undefined) return new Decimal(0)
    return new Decimal(value.toString())
}

/**
 * Tutarı para birimi formatında (2 ondalık) string olarak döndürür.
 *
 * @param amount - Formatlanacak tutar
 * @returns İki ondalıklı string (örn: "100.00")
 *
 * @example
 * ```typescript
 * formatMoney(100) // "100.00"
 * formatMoney(99.999) // "100.00"
 * formatMoney("50.5") // "50.50"
 * ```
 */
export function formatMoney(amount: number | string | Decimal): string {
    return toDecimal(amount).toFixed(2)
}

/**
 * Hassas KDV hesaplaması yapar.
 * Floating-point hatalarını önlemek için Decimal.js kullanır.
 *
 * @param amount - Ana tutar
 * @param rate - KDV oranı (yüzde cinsinden, örn: 20)
 * @returns Hesaplama sonuçları (subtotal, taxAmount, total, rate)
 *
 * @example
 * ```typescript
 * calculateTaxPrecise(100, 20)
 * // { subtotal: 100, taxAmount: 20, total: 120, rate: 20 }
 *
 * calculateTaxPrecise("99.99", "18")
 * // { subtotal: 99.99, taxAmount: 17.9982, total: 117.9882, rate: 18 }
 * ```
 */
export function calculateTaxPrecise(
    amount: number | string | Decimal,
    rate: number | string | Decimal
) {
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
