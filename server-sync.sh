#!/bin/bash
# ProSektorWeb - Full Server Sync Script
# Bu script sunucuda çalıştırılacak

set -e  # Hata durumunda dur

echo "🔄 ProSektorWeb Sunucu Senkronizasyonu Başlıyor..."

# 1. Doğru dizine git
cd /var/www/prosektorweb/prosektorweb || cd /var/www/prosektorweb || exit 1

echo "📁 Dizin: $(pwd)"

# 2. Git durumunu kontrol et
echo "📥 GitHub'dan çekiliyor..."
git fetch origin

# 3. HEAD'i GitHub main ile zorla eşitle
echo "🔄 Reset yapılıyor..."
git reset --hard origin/main

# 4. Şu anki commit'i göster
echo "✅ Commit: $(git log --oneline -1)"

# 5. Next.js cache'i temizle
echo "🧹 Cache temizleniyor..."
rm -rf .next node_modules/.cache

# 6. Bağımlılıkları güncelle
echo "📦 Bağımlılıklar kontrol ediliyor..."
npm install

# 7. Prisma client'ı yeniden oluştur
echo "🗄️ Prisma generate..."
npx prisma generate

# 8. Build al
echo "🔨 Build alınıyor..."
npm run build

# 9. PM2 restart
echo "🚀 PM2 restart..."
pm2 restart all

echo ""
echo "✅ TAMAMLANDI!"
echo "📋 Footer kontrolü için:"
head -5 src/components/layout/Footer.tsx
