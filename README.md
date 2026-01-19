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
