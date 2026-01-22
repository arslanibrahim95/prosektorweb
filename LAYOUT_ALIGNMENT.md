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

## 🔍 6. Mevcut Proje Analizi ve Tespitler (Eylem Planı)

Aşağıdaki maddeler mevcut kod tabanındaki (`src/components` ve `src/app`) hizalama tutarsızlıklarını gidermek için önerilmektedir.

### Landing Page vs Admin Panel Tutarsızlığı
*   **Sorun:** Landing page (`Navbar.tsx`, `Footer.tsx`) genel olarak `px-6` (24px) kenar boşluğu kullanırken, Admin paneli (`AdminShell.tsx`) `px-4 lg:px-8` kullanmaktadır. Bu durum sayfa geçişlerinde içeriklerin hafifçe zıplamasına veya hizasının kaymasına neden olur.
*   **Öneri:** Tüm projede yatay padding (horizontal padding) standardı olarak `px-6 sm:px-6 lg:px-8` kullanılmalı.

### Landing Page Container Genişlikleri
*   **Sorun:** `src/app/page.tsx` içinde farklı bölümlerde `max-w-4xl`, `max-w-6xl` ve `max-w-7xl` gibi değişken genişlikler kullanılmış.
*   **Öneri:** Tüm `section` kapsayıcıları `max-w-7xl` olarak ayarlanmalı. İçerik daha dar olması gerekiyorsa (örneğin Hero metni), `max-w-7xl` içindeki bir alt `div`'e `max-w-3xl mx-auto` verilerek sınırlandırılmalı. Bu sayede sol/sağ kenar hizaları tüm sayfa boyunca (Logo ile hizalı şekilde) korunur.

### Admin Panel Full-Width Taşması
*   **Sorun:** `AdminShell.tsx` içindeki `main` alanı geniş ekranlarda (Ultra-wide monitörler) sonsuza kadar uzamaktadır.
*   **Öneri:** `main` etiketi içine de bir `max-w-[1920px]` veya `max-w-7xl mx-auto` kısıtlaması getirilerek içeriğin çok dağılması engellenmelidir.

## 7. Mikro-Hizalama ve Bileşen Standartları (Micro-Alignment)

Admin Paneli ve Portal arasındaki görsel farkları gidermek için belirlenen standartlar.

### Buton Boyutları
*   **Sorun:** `SubmitButton` (`py-3`), Portal butonları (`py-2.5`) ve Landing butonları arasında yükseklik farkları var.
*   **Standart:**
    *   **Primary Button:** `h-10` (`py-2 px-4`) veya `h-12` (`py-3 px-6`). Proje genelinde **h-11 (py-2.5)** veya **h-12** tercih edilerek sabitlenmeli.
    *   **Secondary Button:** `h-9` veya `h-10`.

### Kart Yapısı (Cards)
*   **Sorun:** Admin kartları `p-5`, Portal kartları `p-6`. Border radius `rounded-xl` ve `rounded-2xl` karışık.
*   **Standart:**
    *   **Padding:** Kartlar için **`p-6`** (24px) standart olmalı.
    *   **Radius:** Ana kartlar için **`rounded-2xl`**, iç elemanlar (input, buton) için **`rounded-xl`** kullanılmalı.
    *   **Border:** `border border-neutral-200` standarttır.

### İkon Boyutları
*   **Sorun:** Admin'de `w-4` (16px), Portal'da `w-6` (24px) ikonlar kullanılıyor.
*   **Standart:**
    *   **Navigasyon/Dashboard İkonları:** **`w-5 h-5`** (20px) ideal dengedir.
    *   **Liste İçi Aksiyon İkonları:** **`w-4 h-4`** (16px).

### ✅ Hızlı Kontrol Listesi (Checklist)

1.  [ ] Sayfa içeriği `max-w-7xl mx-auto` içinde mi?
2.  [ ] Mobil görünümde yatay scroll (taşma) var mı? (`px-4` veya `px-6` unutulmuş olabilir)
3.  [ ] Kartlar aynı satırda eşit yükseklikte mi?
4.  [ ] İkon ve metinler birbirine hizalı mı (`items-center`)?
5.  [ ] Bölümler arası boşluklar (`py-24` vs `py-8`) tutarlı mı?
