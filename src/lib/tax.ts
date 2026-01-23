/**
 * Tax Configuration & Logic
 * Merkezi Vergi Oranı Yönetimi
 */

// Geçmiş vergi oranları (Tarihine göre geçerli oran alınır)
export const TAX_HISTORY = [
    { start: new Date('2023-07-10'), rate: 20 },
    { start: new Date('2000-01-01'), rate: 18 }
]

/**
 * Belirtilen tarih için geçerli KDV oranını getirir.
 * @param date İşlem tarihi (opsiyonel, varsayılan: şimdi)
 * @returns KDV Oranı (örn: 20)
 */
export function getTaxRate(date: Date = new Date()): number {
    // Tarihe göre en yeni oranı bul (sorted desc assumed or found)
    const match = TAX_HISTORY.find(h => date >= h.start)
    return match ? match.rate : 20
}

/**
 * Tutar üzerinden KDV hesaplar
 */
export function calculateTax(amount: number, date?: Date): { subtotal: number, taxAmount: number, total: number, rate: number } {
    const rate = getTaxRate(date)
    const taxAmount = amount * (rate / 100)
    return {
        subtotal: amount,
        taxAmount,
        total: amount + taxAmount,
        rate
    }
}
