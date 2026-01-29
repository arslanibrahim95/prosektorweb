import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS class'larını birleştirir ve çakışmaları çözer.
 * clsx ile koşullu class'ları birleştirir, tailwind-merge ile
 * Tailwind class çakışmalarını (örn: px-2 px-4 -> px-4) çözer.
 *
 * @param inputs - Birleştirilecek class değerleri (string, array, object, vb.)
 * @returns Birleştirilmiş ve optimize edilmiş class string'i
 *
 * @example
 * ```tsx
 * cn('px-2 py-1', 'px-4') // 'py-1 px-4'
 * cn('btn', { 'btn-primary': isPrimary, 'btn-lg': isLarge })
 * cn(['px-2', 'py-1'], 'text-red-500')
 * ```
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Metni URL-friendly slug formatına dönüştürür.
 * Türkçe karakterleri İngilizce karşılıklarına çevirir,
 * özel karakterleri kaldırır ve boşlukları tire ile değiştirir.
 *
 * @param text - Dönüştürülecek metin
 * @returns URL-friendly slug string'i
 *
 * @example
 * ```typescript
 * slugify('Türkçe Başlık') // 'turkce-baslik'
 * slugify('İstanbul Şehir Rehberi') // 'istanbul-sehir-rehberi'
 * slugify('Çok Güzel Bir Yazı!') // 'cok-guzel-bir-yazi'
 * ```
 */
export function slugify(text: string): string {
    const trMap: Record<string, string> = {
        'ç': 'c', 'ğ': 'g', 'ş': 's', 'ü': 'u', 'ı': 'i', 'ö': 'o',
        'Ç': 'C', 'Ğ': 'G', 'Ş': 'S', 'Ü': 'U', 'İ': 'I', 'Ö': 'O'
    };
    for (const key in trMap) {
        text = text.replace(new RegExp(key, 'g'), trMap[key]);
    }
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}
