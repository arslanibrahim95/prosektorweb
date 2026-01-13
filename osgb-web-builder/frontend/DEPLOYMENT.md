# ProSektorWeb Sunucu Kurulum Rehberi

## 📋 Gereksinimler
- Ubuntu 20.04+
- Plesk
- Node.js 20.x
- PM2
- Nginx (Plesk ile gelir)

---

## 🔧 İlk Kurulum (Bir Kere Yapılacak)

### 1. SSH ile Sunucuya Bağlan
```bash
ssh root@prosektorweb.com
```

### 2. Node.js 20 Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v  # v20.x olmalı
```

### 3. PM2 Kurulumu
```bash
npm install -g pm2
```

### 4. Web Dizinine Git
```bash
cd /var/www/vhosts/prosektorweb.com/
```

### 5. Repo'yu Klonla
```bash
# Mevcut httpdocs varsa yedekle
mv httpdocs httpdocs_backup

# Repo'yu klonla
git clone https://github.com/KULLANICI_ADI/REPO_ADI.git httpdocs
cd httpdocs
```

### 6. İlk Build
```bash
npm install
npm run build
```

### 7. PM2 ile Başlat
```bash
pm2 start npm --name "prosektorweb" -- start
pm2 save
pm2 startup
```

---

## 🌐 Plesk Nginx Ayarları

**Plesk → prosektorweb.com → Apache & nginx Settings → Additional nginx directives:**

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 🔒 SSL Sertifikası

Plesk → prosektorweb.com → SSL/TLS Certificates → Let's Encrypt

---

## 🔄 Güncelleme İşlemi

Her güncelleme için:

```bash
ssh root@prosektorweb.com
cd /var/www/vhosts/prosektorweb.com/httpdocs
./deploy.sh
```

Veya lokalden:
```bash
# Mac'ten
ssh root@prosektorweb.com "cd /var/www/vhosts/prosektorweb.com/httpdocs && ./deploy.sh"
```

---

## 📊 PM2 Komutları

```bash
pm2 status           # Durumu gör
pm2 logs prosektorweb # Logları gör
pm2 restart prosektorweb # Yeniden başlat
pm2 stop prosektorweb    # Durdur
pm2 monit            # Canlı izleme
```

---

## 🐛 Sorun Giderme

### Port 3000 kullanımda
```bash
lsof -i :3000
kill -9 <PID>
```

### PM2 çalışmıyor
```bash
pm2 delete prosektorweb
pm2 start npm --name "prosektorweb" -- start
```

### Build hatası
```bash
rm -rf .next node_modules
npm install
npm run build
```
