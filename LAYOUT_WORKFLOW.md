# Hizalama ve Yerleşim İyileştirme İş Akışı (Layout Workflow)

Bu belge, `LAYOUT_ALIGNMENT.md` dosyasında belirlenen standartların projeye uygulanması için izlenecek adım adım iş akışını içerir. Kodlama Agent'ı bu sırayı takip etmelidir.

## 🏁 Aşama 1: Temel Yapı ve Container (Global)

Önce sayfanın ana iskeletini düzeltiyoruz.

1.  **AdminShell Güncellemesi:**
    *   Dosya: `src/components/admin/layout/AdminShell.tsx`
    *   Görev: `main` etiketine veya içerik kapsayıcısına `max-w-[1920px] mx-auto` ekle (Ultra-wide ekranlarda sonsuz uzamayı engellemek için).
    *   Görev: İçerik padding'ini `p-4 lg:p-8` yerine `p-6 lg:p-8` olarak güncelle.

2.  **Landing Page Container Kontrolü:**
    *   Dosya: `src/app/page.tsx`
    *   Görev: Tüm `section` içindeki `div` kapsayıcılarını `max-w-7xl mx-auto px-6` standardına getir.

---

## 🎨 Aşama 2: Bileşen Standardizasyonu (Component Level)

Tekrar kullanılabilir bileşenleri standartlara uygun hale getiriyoruz.

1.  **Butonlar (Buttons):**
    *   Hedef Dosyalar: `src/components/ui/Button.tsx` (varsa), `SubmitButton.tsx`, Portal ve Admin içindeki manuel `button` etiketleri.
    *   Kural:
        *   Primary/Secondary butonlar için yükseklik `h-11` (`py-2.5`) yapılmalı.
        *   Eğer `h-10` (`py-2`) kullanılıyorsa, proje genelinde karar verilip hepsi eşitlenmeli. Önerilen: `h-11`.

2.  **Kartlar (Cards):**
    *   Hedef Dosyalar: `StatsCard.tsx`, Proje Listesi kartları, Hizmet kartları.
    *   Kural:
        *   Padding: `p-6` (24px).
        *   Radius: `rounded-2xl`.
        *   Border: `border-neutral-200`.

3.  **İkonlar:**
    *   Kural: Kart başlıklarında ve navigasyonda kullanılan ikonları `w-5 h-5` boyutuna getir.

---

## 🔍 Aşama 3: Görsel Kontrol ve Doğrulama

1.  **Responsive Test:**
    *   Mobil (375px): Yatay scroll var mı? Padding `px-4` yeterli mi?
    *   Tablet (768px): Grid 2 kolon oldu mu?
    *   Desktop (1024px+): Grid 3/4 kolon oldu mu? Container ortalı mı?

2.  **Zıplama Kontrolü:**
    *   Landing Page'den -> Login -> Admin Paneline geçiş yaparken sol/sağ kenar boşlukları (Logo hizası) değişiyor mu? (Değişmemeli).

---

## 📝 Kontrol Listesi (Agent İçin)

- [ ] `AdminShell` genişliği sınırlandırıldı mı?
- [ ] Tüm butonlar aynı yükseklikte mi?
- [ ] Kartların padding'leri eşitlendi mi?
- [ ] Mobil menü açıldığında sayfa kayması engellendi mi?
