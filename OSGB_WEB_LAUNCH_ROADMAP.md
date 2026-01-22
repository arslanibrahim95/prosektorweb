# OSGB Web Sitesi Hazırlama ve Yayına Alma Yol Haritası

Bu rehber, **ProSektorWeb** altyapısını kullanarak bir OSGB (Ortak Sağlık Güvenlik Birimi) müşterisi için web sitesi satışı, üretimi ve yayına alma sürecini adım adım anlatır.

## 🏁 Aşama 1: Hazırlık (Sistem Ayarları)
Müşteri gelmeden önce panelde hazır olması gerekenler.

1.  **Hizmet Paketlerini Tanımla:**
    *   `Admin > Abonelikler > Yeni Hizmet` yolunu izle.
    *   Örnek Paketler: "OSGB Başlangıç Web Sitesi", "Kurumsal OSGB Paketi (SEO Dahil)".
    *   Fiyat ve yenileme periyodunu (Yıllık) belirle.

2.  **Sözleşme Şablonlarını Yükle:**
    *   Mesafeli Satış Sözleşmesi ve Hizmet Sözleşmesi metinlerini `Ayarlar` bölümünden veya kod içinde güncelle.

---

## 🤝 Aşama 2: Satış ve Onboarding (CRM)
Müşteri ile ilk temas ve anlaşma süreci.

1.  **Firma Kaydı Oluştur:**
    *   `Admin > Müşteriler > Yeni Firma` butonuna tıkla.
    *   OSGB'nin resmi unvanını, vergi numarasını ve yetkili iletişim bilgilerini gir.
    *   Durumunu `LEAD` (Potansiyel) olarak işaretle.

2.  **Teklif Sunumu:**
    *   `Admin > Teklifler > Yeni Teklif` oluştur.
    *   Hazırladığın "Web Sitesi Hizmeti"ni kaleme ekle.
    *   Teklifi PDF olarak indirip müşteriye gönder veya sistem üzerinden onaya sun.

3.  **Anlaşma ve Proje Başlatma:**
    *   Teklif onaylandığında durumu `ACCEPTED` yap.
    *   Müşterinin durumunu `CUSTOMER` olarak güncelle.
    *   `Admin > Web Projeleri > Yeni Proje` oluştur ve ilgili firma ile eşleştir.

---

## 🎨 Aşama 3: Üretim ve İçerik (Development)
Web sitesinin teknik olarak hazırlanması.

1.  **Domain Yönetimi:**
    *   Müşterinin mevcut bir domaini varsa transfer et veya `Admin > Domainler` üzerinden yeni domain kaydını takip et.
    *   NS (NameServer) kayıtlarını kendi sunucuna yönlendir.

2.  **İçerik Toplama:**
    *   Müşteriye `Portal` erişimi ver (`Admin > Müşteriler > Kullanıcı Oluştur`).
    *   Müşteriden Logo, "Hakkımızda" yazısı, Referanslar ve İletişim bilgilerini `Destek Talebi` (Ticket) üzerinden göndermesini iste.

3.  **Geliştirme Süreci:**
    *   `Admin > Web Projeleri` detayından proje durumunu `DESIGNING` -> `DEVELOPMENT` olarak ilerlet.
    *   Lokal ortamda (`AGENTS_TODO.md` rehberine göre) siteyi hazırla.
    *   Renkler, fontlar ve logoyu OSGB kurumsal kimliğine göre ayarla.

---

## 🚀 Aşama 4: Yayına Alma (Launch)
Sitenin canlıya taşınması.

1.  **Sunucu Konfigürasyonu:**
    *   `SERVER_SECURITY.md` dosyasındaki adımları takip et.
    *   Nginx üzerinde yeni bir `server block` (vhost) oluştur: `domain.com`.
    *   SSL Sertifikasını (LetsEncrypt) kur.

2.  **DNS Kontrolü:**
    *   Domain'in `A` kaydının sunucu IP adresine yönlendiğinden emin ol.

3.  **Son Kontroller:**
    *   İletişim formları çalışıyor mu? (Admin paneline mesaj düşüyor mu?)
    *   Mobil uyumluluk tamam mı?
    *   Google Search Console ve Analytics kodları eklendi mi?

4.  **Canlıya Geçiş:**
    *   Proje durumunu `LIVE` olarak güncelle.
    *   Müşteriye "Siteniz Yayında" e-postası gönder.

---

## 🛠 Aşama 5: Devir ve Bakım (Maintenance)
Satış sonrası destek.

1.  **Portal Eğitimi:**
    *   Müşteriye kendi panelinden (`Portal`) faturalarını nasıl göreceğini ve destek talebi nasıl açacağını göster.

2.  **Periyodik İşlemler:**
    *   Yıllık domain/hosting yenileme zamanı geldiğinde sistem otomatik hatırlatma yapacaktır (`MISSING_FEATURES.md` içindeki otomasyon yapıldıysa).
    *   Gelen güncelleme taleplerini `Admin > Destek Talepleri` üzerinden yönet.
