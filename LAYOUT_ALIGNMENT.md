# Yerleşim ve Hizalama Standartları Rehberi (Layout & Alignment)

Bu belge, projedeki görsel tutarlılığı sağlamak için Grid, Spacing (Boşluklar), Container ve Hizalama kurallarını belirler. Kodlama yaparken bu standartlara uyulması, UI'ın profesyonel ve dengeli görünmesini sağlar.

## 1. Container ve Sayfa Yapısı

Tüm sayfa içerikleri (Dashboard ve Landing) belirli bir genişliğe hapsedilmeli ve ortalanmalıdır.

*   **Standart Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
*   **Dar Okuma Alanı (Blog/Doküman):** `max-w-3xl mx-auto`
*   **Tam Genişlik (Full Width):** Arka plan renkleri için `w-full` kullanılır, ancak *içerik* mutlaka container içine alınır.

**Örnek:**
```tsx
// Yanlış ❌
<div className="w-full p-10">...</div>

// Doğru ✅
<section className="w-full bg-neutral-50">
  <div className="max-w-7xl mx-auto px-6 py-24">
    ...içerik...
  </div>
</section>
```

## 2. Grid Sistemi ve Kartlar

Responsive tasarımda kartların ve sütunların davranışı.

*   **Grid Yapısı:**
    *   **Mobil:** 1 sütun (`grid-cols-1`)
    *   **Tablet:** 2 sütun (`md:grid-cols-2`)
    *   **Desktop:** 3 veya 4 sütun (`lg:grid-cols-3` / `xl:grid-cols-4`)
*   **Boşluklar (Gap):** Standart kartlar arası boşluk `gap-6` veya `gap-8` olmalı.
*   **Eşit Yükseklik:** Yan yana duran kartların içeriği az olsa bile eşit boyda görünmesi için `h-full` kullanılmalı.

**Örnek:**
```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} className="flex flex-col h-full bg-white rounded-xl p-6">
       <h3 className="mb-2">{item.title}</h3>
       <p className="flex-1">{item.description}</p> {/* flex-1 içeriği iterek butonu alta sabitler */}
       <button className="mt-4">Detay</button>
    </div>
  ))}
</div>
```

## 3. Dikey Ritim (Vertical Rhythm)

Bölümler (Section) ve elementler arasındaki dikey boşluk standartları.

*   **Section Spacing:**
    *   Geniş boşluk (Landing Page ana bölümler): `py-24` veya `py-32`
    *   Orta boşluk (Admin paneli bölümleri): `py-12`
    *   Dar boşluk (İçerik arası): `py-6` veya `py-8`
*   **Stack (Yığın) Boşlukları:**
    *   Form elemanları arası: `space-y-4` veya `gap-4`
    *   Kart içi başlık-metin arası: `mb-2` (başlık altı), `mb-4` (paragraf altı)

## 4. Tipografi Hizalaması

*   **Metin Hizalaması:**
    *   Başlıklar (H1, H2): Genellikle `text-center` (Landing) veya `text-left` (Admin/Dashboard).
    *   Paragraflar: Okunabilirlik için `text-left` tercih edilmeli. Landing page'de ortalanmış başlıklarda `text-center` ve `max-w-2xl mx-auto` ile satır uzunluğu kısıtlanmalı (75-80 karakter).
*   **Optik Denge:**
    *   İkon ve Metin beraber kullanıldığında mutlaka `flex items-center gap-2` ile dikeyde ortalanmalı.

## 5. Z-Index ve Katman Yönetimi

*   **Modal & Overlay:** `z-50`
*   **Sticky Header:** `z-40`
*   **Dropdown Menu:** `z-30`
*   **Dekoratif Arka Plan Objeleri:** `z-0` veya `-z-10`

---

### ✅ Hızlı Kontrol Listesi (Checklist)

1.  [ ] Sayfa içeriği `max-w-7xl mx-auto` içinde mi?
2.  [ ] Mobil görünümde yatay scroll (taşma) var mı? (`px-4` veya `px-6` unutulmuş olabilir)
3.  [ ] Kartlar aynı satırda eşit yükseklikte mi?
4.  [ ] İkon ve metinler birbirine hizalı mı (`items-center`)?
5.  [ ] Bölümler arası boşluklar (`py-24` vs `py-8`) tutarlı mı?
