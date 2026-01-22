# Dashboard Tasarım ve İyileştirme Rehberi

Bu belge, Admin ve Müşteri panellerindeki kullanıcı deneyimini zenginleştirmek için önerilen tasarım şablonlarını ve widget yapılarını içerir.

## 🖥️ 1. Admin Dashboard (Yönetici Paneli)

**Amaç:** Sistemin genel sağlığını izlemek, finansal durumu görmek ve acil aksiyon almak.

### A. Önerilen Yerleşim (Layout)

```
[KPI Kartları (4 Kolon)]
------------------------------------------------
[Gelir Grafiği (8 Kolon)] | [Son Aktiviteler (4 Kolon)]
------------------------------------------------
[Bekleyen İşler / Onaylar (Tam Genişlik)]
```

### B. Yeni Widget Önerileri

1.  **Finansal Özet Grafiği (Revenue Chart):**
    *   **Tip:** Çizgi veya Bar Grafiği (`recharts` kullanarak).
    *   **Veri:** Son 6 aylık fatura kesim ve tahsilat tutarları.
    *   **Tasarım:** X ekseninde aylar, Y ekseninde TL tutarı. Hover yapınca detaylı tooltip.

2.  **CRM Hunisi (Sales Pipeline):**
    *   **Tip:** Huni (Funnel) veya Sayaçlar.
    *   **Veri:** Potansiyel Müşteri (Lead) -> Görüşülen -> Teklif Verilen -> Müşteri.
    *   **Tasarım:** Renkli bir huni görseli veya yan yana kutular.

3.  **Acil Aksiyon Merkezi (Action Center):**
    *   Kırmızı/Sarı uyarılarla "Onay Bekleyen Teklif (2)", "Süresi Dolan Hizmet (5)", "Okunmamış Destek Talebi (3)" gibi maddeleri listeler. Tıklanınca ilgili sayfaya götürür.

4.  **Sistem Sağlığı (Gelişmiş):**
    *   Mevcut olan `System Status` bileşenine "CPU Kullanımı" veya "Son Yedekleme Zamanı" gibi metrikler eklenebilir (Node.js/PM2 entegrasyonu varsa).

---

## 🏠 2. Müşteri Dashboard (Portal)

**Amaç:** Müşterinin satın aldığı hizmetin durumunu görmesi ve kendini güvende hissetmesi.

### A. Önerilen Yerleşim (Layout)

```
[Hoşgeldin & Durum Özeti (Tam Genişlik Banner)]
------------------------------------------------
[Proje İlerleme Durumu (Timeline)]
------------------------------------------------
[Aktif Hizmetler (Grid)] | [Destek & İletişim (Sidebar)]
```

### B. Yeni Widget Önerileri

1.  **Proje Zaman Çizelgesi (Project Timeline):**
    *   **Tip:** Yatay Stepper (Adım Adım İlerleme).
    *   **Adımlar:** Sipariş Alındı -> Tasarım -> Kodlama -> İçerik Girişi -> Yayında.
    *   **Tasarım:** Aktif adım renkli, tamamlananlar tikli, gelecek adımlar gri.

2.  **Sonraki Ödeme Uyarıcısı (Next Payment):**
    *   "Sıradaki Ödemeniz: 15 Gün Sonra" şeklinde geri sayım sayacı.
    *   "Hemen Öde" butonu ile faturaya yönlendirme.

3.  **Site Performans Kartı (Analytics Lite):**
    *   Eğer site yayındaysa; "Bu hafta 150 ziyaretçi", "Mobil uyumluluk %100" gibi basit, motive edici istatistikler.

4.  **Hızlı Destek Başlat:**
    *   Karmaşık formlar yerine, "Ne konuda yardım lazım?" diye soran ve butonlarla (Fatura, Teknik, Diğer) hızlıca talep oluşturan bir modül.

---

## 🎨 Ortak Tasarım Dili (Design System)

*   **Renk Paleti:**
    *   **Gelir/Pozitif:** Emerald Green (`text-emerald-600`, `bg-emerald-50`)
    *   **Gider/Negatif:** Rose Red (`text-rose-600`, `bg-rose-50`)
    *   **Bilgi/Süreç:** Brand Blue/Indigo (`text-brand-600`, `bg-brand-50`)
    *   **Uyarı:** Amber (`text-amber-600`, `bg-amber-50`)
*   **Tipografi:**
    *   Sayısal veriler için `font-mono` veya `tracking-tight` kullanımı (daha net okunabilirlik için).
    *   Başlıklar `text-neutral-900 font-bold`, alt metinler `text-neutral-500 text-sm`.

## 🛠 Uygulama Adımları (Agent İçin)

1.  `recharts` kütüphanesini projeye dahil et (`npm install recharts`).
2.  `src/components/admin/charts` klasörü oluşturup grafik bileşenlerini buraya yaz.
3.  Portal için `Timeline` bileşeni oluştur (`src/components/portal/Timeline.tsx`).
4.  Admin ana sayfasındaki (`src/app/admin/page.tsx`) `stats` verilerini grafiklere bağla.
