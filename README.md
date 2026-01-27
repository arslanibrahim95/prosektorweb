# ProSektorWeb

OSGB (İş Sağlığı ve Güvenliği) firmaları için profesyonel operasyon ve CRM yönetim platformu.

## 🚀 Hızlı Başlangıç

```bash
# 1. Bağımlılıkları Yükle
npm install

# 2. Çevresel Değişkenleri Ayarla
cp .env.example .env

# 3. Veritabanını Başlat (Docker/Local)
npx prisma generate
npx prisma db push

# 4. Geliştirme Sunucusunu Başlat
npm run dev
# -> http://localhost:3000
```

## ⚙️ Konfigürasyon (.env)

| Değişken | Zorunlu | Açıklama |
| :--- | :---: | :--- |
| `DATABASE_URL` | ✅ | MySQL/MariaDB bağlantı URL'i |
| `AUTH_SECRET` | ✅ | NextAuth için rastgele 32-bit hash string |
| `UPSTASH_REDIS_REST_URL` | ✅ | Redis HTTP API URL (Önbellekleme için) |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | Redis AUTH Token |
| `OPENAI_API_KEY` | ❌ | AI İçerik üretimi için API anahtarı |

## 🛠️ Sık Kullanılan Komutlar

- **Test:** `npm run test:unit` (Birim testleri çalıştırır - Vitest)
- **Lint:** `npm run lint` (Kod standartlarını denetler)
- **Build:** `npm run build` (Production için optimize eder)
- **Deploy:** `./server-sync.sh` (Sunucu senkronizasyonu)

## 🚨 Sorun Giderme

1.  **Veritabanı Hatası (P1001/P1002):** `.env` içindeki `DATABASE_URL`'in erişilebilir olduğunu kontrol edin (VPN/Firewall).
2.  **Redis Hatası:** `UPSTASH_REDIS_REST_URL` eksik ise Rate Limit ve Cache devre dışı kalır veya hata fırlatır.
3.  **Hydration Mismatch:** Browser eklentileri HTML'i bozuyor olabilir. Gizli sekmede deneyin.

## 📚 Dokümantasyon

- **Mimarisi:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Log Standartları:** [docs/logging.md](./docs/logging.md)
- **Katkı Kuralları:** [CONTRIBUTING.md](./CONTRIBUTING.md)
