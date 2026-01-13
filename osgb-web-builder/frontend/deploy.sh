#!/bin/bash
# ProSektorWeb Deployment Script
# Sunucu: prosektorweb.com (Plesk + Ubuntu)

set -e

echo "🚀 ProSektorWeb Deployment Başlıyor..."

# Değişkenler
APP_DIR="/var/www/vhosts/prosektorweb.com/httpdocs"
APP_NAME="prosektorweb"

# 1. Klasöre git
cd $APP_DIR

# 2. Son değişiklikleri çek
echo "📥 Git pull..."
git pull origin main

# 3. Dependencies yükle
echo "📦 npm install..."
npm ci --production=false

# 4. Build
echo "🔨 npm run build..."
npm run build

# 5. PM2 restart
echo "🔄 PM2 restart..."
pm2 restart $APP_NAME || pm2 start npm --name $APP_NAME -- start

echo "✅ Deployment tamamlandı!"
echo "🌐 Site: https://prosektorweb.com"
