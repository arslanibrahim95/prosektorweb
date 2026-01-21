# UI/UX İyileştirme ve Geliştirme Önerileri

Bu rapor, ProSektorWeb projesinin hem son kullanıcı (Home/Landing) hem de yönetici (Server/Admin) arayüzlerindeki kullanıcı deneyimini artırmak için hazırlanmıştır.

## 🏠 Home (Frontend / Client / Landing)

Müşteri ve ziyaretçilerin karşılaştığı yüz.

### 1. Erişilebilirlik (Accessibility)
*   **Contrast Sorunları:** "Aurora" arka plan efektleri üzerindeki beyaz metinlerin okunabilirliği bazı ekranlarda düşük kalabilir. Metinlerin arkasına hafif bir `backdrop-blur` veya gölge (`drop-shadow`) eklenmeli.
*   **Form Etiketleri:** `ContactForm.tsx` içindeki inputlar için `aria-label` veya `htmlFor` eşleştirmeleri tam olsa da, hata mesajları (`state.errors`) ekran okuyucular için `role="alert"` ile işaretlenmeli.
*   **Klavye Navigasyonu:** Modal sistemi (`ModalSystem`) açıldığında, focus'un modal içine hapsedilmesi (trap focus) ve `ESC` tuşu ile kapanabilmesi sağlanmalı.

### 2. Responsive & Layout
*   **Mobil Menü:** `Navbar` bileşenindeki mobil menü açıldığında sayfa kaydırması (body scroll) engellenmeli. Aksi takdirde hem menü hem arka plan kayabilir.
*   **Tabletlarda Grid Yapısı:** "Neden Biz?" ve "Nasıl Çalışırız?" kartları tablet boyutlarında (768px-1024px) bazen çok daralıyor. Grid yapısı `md:grid-cols-2` yerine `md:grid-cols-1 lg:grid-cols-2` şeklinde optimize edilebilir.

### 3. Etkileşim ve Geri Bildirim
*   **Loading Skeleton:** Sayfa ilk yüklenirken veya modal açılırken içerik gelene kadar boş ekran yerine "Skeleton" yükleme efektleri kullanılmalı.
*   **Button States:** "GÖNDER" butonuna basıldığında `isPending` durumu var ancak butonun boyutu veya rengi değişerek "basıldığı" hissi daha net verilebilir (Active state).

---

## 🖥️ Server (Admin Panel / Backend UI)

Yöneticilerin işlerini hızlı ve hatasız yapmasını sağlayan arayüz.

### 1. Veri Görselleştirmesi (Dashboard)
*   **Özet Kartları:** Dashboard ana sayfasında sadece sayısal veriler (Toplam Fatura: 15) yerine, trend okları (Geçen aya göre %20 artış 🔼) eklenmeli.
*   **Grafikler:** `recharts` kütüphanesi kullanılarak aylık gelir/gider veya müşteri kazanım grafikleri eklenmeli. Şu an metin tabanlı yoğunluk var.

### 2. Tablo Deneyimi (Data Tables)
*   **Boş Durumlar (Empty States):** `EmptyState` bileşeni mevcut ancak daha yönlendirici olabilir. "Teklif Bulunamadı" yerine "İlk Teklifini Oluştur" butonu daha belirgin ve ortada olmalı.
*   **Sıralama (Sorting):** Tablo başlıklarına (Konu, Müşteri, Tutar) tıklanarak `ASC/DESC` sıralama yapabilme özelliği eklenmeli.
*   **Toplu İşlemler:** Tablo satırlarının başına checkbox konularak "Toplu Sil", "Toplu Onayla" gibi aksiyonlar eklenmeli.

### 3. Form ve Validasyon
*   **Anlık Validasyon:** `useActionState` ile sunucu taraflı validasyon var ancak kullanıcı yazarken (onBlur veya onChange) client-side basit kontroller (email formatı, boş alan) yapılarak anında geri bildirim verilmeli.
*   **Karmaşık Formlar:** "Yeni Firma Ekle" veya "Teklif Oluştur" gibi uzun formlar, "Adım Adım" (Stepper) yapısına dönüştürülerek bilişsel yük azaltılmalı.

### 4. Navigasyon ve Breadcrumbs
*   **Derinlik:** Admin panelinde alt sayfalara (Örn: Teklif Detay) girildiğinde, geri dönmeyi kolaylaştıran "Breadcrumb" (Ana Sayfa > Teklifler > #2024-01) yapısı eklenmeli.
