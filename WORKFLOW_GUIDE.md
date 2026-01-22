# Lokal ve Sunucu Geliştirme İş Akışı Rehberi

Geliştirmelerin kendi cihazınızda (Lokal) yapılıp, GitHub aracılığıyla Sunucuya (Production) aktarıldığı senaryo için görev dağılımı.

## 💻 1. Lokal Cihazda Yapılacaklar (Geliştirme Ortamı)

Kodlama, test ve özellik ekleme işlemleri burada yapılır. Sunucuya doğrudan kod yazılmaz.

*   **Kodlama:** Yeni özellikler ekleme, bug fix yapma.
*   **Veritabanı Şema Değişiklikleri:**
    *   `schema.prisma` dosyasını düzenle.
    *   `npx prisma migrate dev` komutuyla migration dosyası oluştur ve lokal veritabanına uygula.
*   **Test:**
    *   Uygulamayı `npm run dev` ile çalıştırıp tarayıcıda test et.
    *   (Varsa) Otomatik testleri çalıştır: `npm run test`.
    *   `npm run build` komutunu çalıştırarak build hatası almadığından emin ol.
*   **Git İşlemleri:**
    *   Değişiklikleri commitle: `git commit -m "feat: yeni özellik eklendi"`.
    *   GitHub'a gönder: `git push origin main`.

---

## ☁️ 2. Sunucuda Yapılacaklar (Canlı Ortam)

Sunucuda kod düzenlemesi **yapılmaz**. Sadece GitHub'dan gelen güncel kod çalıştırılır.

### Güncelleme Adımları (Deploy Process):

Sunucuya SSH ile bağlandıktan sonra sırasıyla:

1.  **Kodu Çek:**
    ```bash
    cd /var/www/prosektorweb
    git pull origin main
    ```

2.  **Bağımlılıkları Güncelle (Eğer package.json değiştiyse):**
    ```bash
    pnpm install --frozen-lockfile
    ```

3.  **Veritabanını Güncelle (Eğer schema.prisma değiştiyse):**
    *   ⚠️ **Dikkat:** Production ortamında `migrate dev` KULLANILMAZ.
    ```bash
    npx prisma migrate deploy
    npx prisma generate
    ```

4.  **Uygulamayı Derle (Build):**
    ```bash
    pnpm build
    ```

5.  **Servisi Yeniden Başlat:**
    *   Kesintisiz geçiş için PM2 reload kullanılır.
    ```bash
    pm2 reload prosektorweb
    ```

---

## 🔑 3. Ortam Değişkenleri (.env) Yönetimi

Lokal ve Sunucu ortamları farklı `.env` dosyalarına sahip olmalıdır.

| Değişken | Lokal (.env) | Sunucu (.env) |
| :--- | :--- | :--- |
| **DATABASE_URL** | `mysql://root:pass@localhost:3306/prosektor_dev` | `mysql://user:secure_pass@localhost:3306/prosektor_prod` |
| **NEXTAUTH_URL** | `http://localhost:3000` | `https://prosektorweb.com` |
| **NODE_ENV** | `development` | `production` |

*   **Kural:** `.env` dosyasını Git'e atma (`.gitignore` içinde olduğundan emin ol).
*   **Değişiklik:** Eğer yeni bir API anahtarı (örn: `RESEND_API_KEY`) eklersen, bunu hem lokaldeki `.env` dosyasına hem de sunucudaki `.env` dosyasına **manuel** olarak eklemelisin.

---

## 🛠 Sık Karşılaşılan Durumlar

*   **Sunucuda Build Hatası Alıyorum:**
    *   Genelde lokalde çalışıp sunucuda çalışmayan kodlar (büyük harf/küçük harf duyarlılığı) veya sunucudaki yetersiz RAM kaynaklıdır.
    *   Çözüm: Lokaldeki `npm run build` komutunun hatasız bittiğinden emin ol.

*   **Veritabanı Uyuşmazlığı:**
    *   Lokalde migration oluşturmadan (`migrate dev` yapmadan) şema değiştirip push'ladıysan, sunucuda `migrate deploy` hata verebilir. Her şema değişikliği için lokalde bir migration dosyası oluştuğundan emin ol.
