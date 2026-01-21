# Sunucu Güvenlik ve Konfigürasyon Direktifleri (Gemini CLI İçin)

Bu belge, Gemini CLI veya benzeri bir asistan kullanarak sunucu yapılandırması yaparken verilecek komutları ve güvenlik standartlarını içerir.

## 1. Temel Sunucu Güvenliği (OS Hardening)

Sunucunuza ilk erişimde uygulanması gereken adımlar.

### Direktifler:
*   "Sunucuda yeni bir `deploy` kullanıcısı oluştur, bu kullanıcıya sudo yetkisi ver ancak şifresiz sudo kullanımına izin verme."
*   "SSH konfigürasyonunu güncelle: Root girişini engelle (`PermitRootLogin no`), sadece anahtar ile girişe izin ver (`PasswordAuthentication no`)."
*   "UFW (Firewall) kurulumunu yap ve aktifleştir. Sadece SSH (22 veya özel port), HTTP (80) ve HTTPS (443) portlarına izin ver."
*   "Fail2Ban kurarak SSH brute-force saldırılarına karşı koruma sağla."

## 2. Nginx ve Reverse Proxy Güvenliği

Next.js uygulamasını dış dünyaya açan kapı olan Nginx için kritik ayarlar.

### Direktifler:
*   "Nginx kurulumunu yap ve `/var/www/prosektorweb` dizinine yönlenecek şekilde bir server bloğu oluştur."
*   "SSL sertifikası için Certbot kurulumunu yap ve LetsEncrypt üzerinden sertifika al. Otomatik yenileme cron job'ını ekle."
*   "Nginx konfigürasyonuna şu güvenlik başlıklarını (Security Headers) ekle:
    *   `X-Frame-Options: DENY` (Clickjacking koruması)
    *   `X-Content-Type-Options: nosniff`
    *   `Strict-Transport-Security` (HSTS)
    *   `Referrer-Policy: no-referrer-when-downgrade`"
*   "DDoS saldırılarını engellemek için Nginx üzerinde 'Rate Limiting' ayarla (saniyede gelen istek sayısını sınırla)."
*   "Uygulamaya gelen isteklerin IP adreslerini doğru şekilde logla (`X-Forwarded-For`)."

## 3. Node.js ve PM2 (Process Management)

Uygulamanın sürekli ayakta kalması ve hatalarda yeniden başlaması için.

### Direktifler:
*   "Node.js (LTS sürümü) ve PNPM paket yöneticisini kur."
*   "PM2 (Process Manager) global olarak yükle."
*   "Uygulamayı `pm2 start npm --name 'prosektorweb' -- start` komutuyla başlatacak bir ekosistem dosyası hazırla."
*   "Sunucu yeniden başlatıldığında PM2'nin otomatik devreye girmesi için `pm2 startup` komutunu çalıştır."
*   "Uygulamanın asla `root` yetkisiyle çalıştırılmamasını sağla, `deploy` kullanıcısını kullan."

## 4. Veritabanı Güvenliği

Eğer veritabanı aynı sunucudaysa:

### Direktifler:
*   "MariaDB/MySQL veritabanını kur ve `mysql_secure_installation` scriptini çalıştır."
*   "Veritabanı portunu (3306) dış dünyaya kapat (bind-address 127.0.0.1), sadece localhost erişimine izin ver."
*   "Uygulama için ayrı bir veritabanı kullanıcısı oluştur ve sadece gerekli veritabanına erişim yetkisi ver (Grant Least Privilege)."
*   "Veritabanının günlük yedeğini alıp sıkıştırarak saklayan bir bash script yaz ve bunu cron job'a ekle."

## 5. Çevresel Değişkenler (.env)

### Direktifler:
*   "`.env` dosyasının izinlerini `600` (sadece sahibi okuyabilir) olarak ayarla."
*   "`.env` dosyasını asla Git reposuna dahil etme veya sunucuda public bir klasörde barındırma."
