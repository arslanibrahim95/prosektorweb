#!/bin/bash

# ==========================================
# ProSektorWeb - Sunucu Dağıtım Scripti
# ==========================================
# Bu script, projeyi sunucuya deploy etmek için kullanılır.
# Kullanım: ./deploy.sh

set -e

echo "🚀 ProSektorWeb Deployment Başlatılıyor..."
echo "==========================================="

# 1. Git'ten son değişiklikleri çek
echo "📥 Git pull yapılıyor..."
git pull origin main

# 2. Bağımlılıkları yükle
echo "📦 NPM bağımlılıkları yükleniyor..."
npm ci --only=production

# 3. Prisma client'ı oluştur
echo "🗄️ Prisma Client oluşturuluyor..."
npx prisma generate

# 4. Veritabanı şemasını uygula (migration)
echo "🗄️ Veritabanı şeması güncelleniyor..."
npx prisma db push

# 5. Next.js production build
echo "🔨 Production build yapılıyor..."
npm run build

# 6. PM2 ile uygulamayı yeniden başlat (eğer PM2 kullanıyorsanız)
# Eğer PM2 kurulu değilse bu satırı yorum satırı yapın
if command -v pm2 &> /dev/null; then
    echo "♻️ PM2 ile uygulama yeniden başlatılıyor..."
    pm2 restart prosektorweb || pm2 start npm --name "prosektorweb" -- start
else
    echo "⚠️ PM2 bulunamadı. Uygulamayı manuel başlatmanız gerekebilir."
    echo "   Çalıştırmak için: npm start"
fi

echo ""
echo "==========================================="
echo "✅ Deployment tamamlandı!"
echo "==========================================="
