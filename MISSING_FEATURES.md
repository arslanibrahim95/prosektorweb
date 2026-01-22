# Keşfedilen Eksik Özellik Setleri ve İyileştirme Fırsatları

Mevcut proje yapısı (OSGB + Web Ajansı) incelendiğinde, sektör standartlarında olması beklenen ancak kod tabanında henüz tam karşılığı bulunmayan potansiyel özellikler aşağıda listelenmiştir.

## 1. Otomasyon ve Bildirimler (Automation)

Mevcut sistemde manuel yapılan işleri otomatize etmek için.

*   **📅 Sözleşme ve Hizmet Yenileme Hatırlatıcıları:**
    *   Hizmet süresi dolmadan 30, 15 ve 3 gün önce müşteriye ve yöneticiye otomatik e-posta/SMS gönderimi. (Cron Job + Resend/Twilio)
*   **🧾 Tekrarlayan Faturalar (Recurring Invoices):**
    *   Aylık bakım anlaşmaları için her ayın 1'inde otomatik fatura taslağı oluşturulması.
*   **🔔 Slack/Discord Bildirimleri:**
    *   Yeni bir destek talebi (Ticket) açıldığında veya ödeme alındığında admin ekibinin kullandığı Slack kanalına bildirim düşmesi.

## 2. Doküman ve Dosya Yönetimi (DMS)

*   **☁️ Dosya Depolama (S3/R2 Entegrasyonu):**
    *   Şu an proje dosyaları muhtemelen sunucuda tutuluyor olabilir. Ölçeklenebilirlik için AWS S3 veya Cloudflare R2 entegrasyonu yapılmalı.
*   **📄 PDF Oluşturucu (PDF Generator):**
    *   Verilen tekliflerin veya kesilen faturaların tek tıkla profesyonel PDF formatında indirilmesi (`react-pdf` veya `puppeteer` ile).
*   **✍️ Dijital İmza (E-Signature):**
    *   Müşterilerin sözleşmeleri panel üzerinden dijital olarak onaylaması ve IP/Zaman damgasının kaydedilmesi.

## 3. İletişim ve Müşteri İlişkileri

*   **💬 WhatsApp Entegrasyonu:**
    *   Müşterilerin panel üzerinden tek tıkla WhatsApp destek hattına bağlanması veya sistemin WhatsApp üzerinden bildirim atması.
*   **📧 E-posta Şablon Yönetimi:**
    *   Admin panelinden e-posta şablonlarının (Hoşgeldin, Fatura, Bayram Tebriği) HTML olarak düzenlenebilmesi.

## 4. Güvenlik ve Denetim (Audit)

*   **🕵️ İşlem Günlükleri (Audit Logs):**
    *   "Hangi yönetici, hangi faturayı sildi?" veya "Hangi kullanıcı ne zaman giriş yaptı?" gibi kritik işlemlerin veritabanında loglanması.
*   **🔐 İki Faktörlü Doğrulama (2FA):**
    *   Admin girişi için Google Authenticator veya SMS ile doğrulama zorunluluğu.

## 5. Finansal Geliştirmeler

*   **💳 Sanal POS Entegrasyonu (Iyzico/Stripe):**
    *   Müşterilerin panel üzerinden kredi kartı ile fatura ödeyebilmesi. Şu an sadece "Ödendi" olarak işaretleme var gibi görünüyor.
*   **📊 Gider Takibi:**
    *   Sadece gelirler değil, sunucu maliyetleri, personel giderleri gibi kalemlerin de girilerek net kârın hesaplanması.

---

## 🚀 Önerilen Geliştirme Sırası

1.  **Audit Logs:** Güvenlik ve hata takibi için ilk sırada.
2.  **S3/R2 Entegrasyonu:** Sunucu diskini doldurmamak için kritik.
3.  **PDF Generator:** Profesyonel görünüm için gerekli.
4.  **Otomatik Hatırlatıcılar:** Nakit akışını hızlandırır.
