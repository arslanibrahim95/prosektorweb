# ProSektorWeb - İş Sağlığı ve Güvenliği Yönetim Sistemi

OSGB'lere özel profesyonel web çözümleri ve yönetim paneli.

## 🚀 Hızlı Kurulum

### Gereksinimler
- Node.js 18+
- MySQL/MariaDB
- npm veya yarn

### Kurulum Adımları

```bash
# 1. Projeyi klonla
git clone https://github.com/arslanibrahim95/prosektorweb.git
cd prosektorweb

# 2. Bağımlılıkları yükle
npm install

# 3. Environment değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle (veritabanı şifresi, admin şifresi vs.)

# 4. Veritabanı şemasını oluştur
npx prisma db push

# 5. Geliştirme sunucusunu başlat
npm run dev
```

## 📦 Production Deployment

```bash
# Sunucuda deploy için
./deploy.sh

# Veya manuel:
npm ci --only=production
npx prisma generate
npx prisma db push
npm run build
npm start
```

## 🔐 Admin Paneli

- URL: `/admin`
- Varsayılan: `.env` dosyasındaki `ADMIN_EMAIL` ve `ADMIN_PASSWORD`

## 📁 Proje Yapısı

```
prosektorweb/
├── src/
│   ├── app/           # Next.js App Router
│   │   ├── admin/     # Admin Panel
│   │   ├── blog/      # Public Blog
│   │   └── api/       # API Routes
│   ├── components/    # React Components
│   ├── actions/       # Server Actions
│   └── lib/           # Utilities
├── prisma/
│   └── schema.prisma  # Database Schema
├── public/            # Static Files
└── .env.example       # Environment Template
```

## 🛠️ Teknolojiler

- **Framework:** Next.js 14 (App Router)
- **Database:** MySQL/MariaDB + Prisma ORM
- **Auth:** NextAuth.js v5
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## 📞 Destek

hello@prosektorweb.com

---

## 🛠️ Sunucu Modernizasyonu ve DevOps

Sistemi modernize etmek, güvenliği artırmak ve Claude Code ile uyumlu bir dağıtım hattı kurmak için yapılan geliştirmeler:

### 1. Entegrasyon ve Dağıtım Hattı
- **Merkezi Site Yöneticisi:** `/root/generated_sites/` klasörünü tarayan ve yeni siteleri aaPanel'e otomatik ekleyen `site_manager.py` geliştirildi.
- **Claude Code Entegrasyonu:** `manifest.json` tabanlı standart konfigürasyon arayüzü.
- **Otomatik DNS & Nginx:** Dinamik domain yönetimi, otomatik DNS Zone ve Nginx router yapılandırması.

### 2. Güvenlik ve Tip Güvenliği
- **ActionResponse:** Tüm server action'lar için merkezi tip sistemi (`src/lib/action-types.ts`).
- **Type Safety Cleanup:** `error: any` yerine `error: unknown` kullanımı ve güvenli hata yakalama.
- **Build Fixes:** Next.js 16 / Turbopack uyumluluğu ve Zod entegrasyonu güncellendi.

### 3. DevOps ve Veritabanı
- **Audit Log:** Kritik işlemler için veritabanı seviyesinde audit log sistemi.
- **Server Sync Script:** GitHub değişikliklerini sunucuya çeken, build alan ve PM2'yi restart eden `./server-sync.sh` scripti.

### 📂 Dosya Yapısı (Sunucu Tarafı)
- `/root/site_manager.py`: Ana dağıtım scripti.
- `/root/server-sync.sh`: Tek tık deploy.
- `/root/router/`: Merkezi PHP router ve Nginx şablonları.

> [!TIP]
> Sunucu tarafındaki kod değişiklikleri için sadece `./server-sync.sh` çalıştırmanız build ve restart dahil tüm süreci bitirir.

