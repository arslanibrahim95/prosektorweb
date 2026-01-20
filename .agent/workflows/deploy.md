---
description: Server'ı GitHub ile senkronize etmek için kullanılır
---

# Server Deploy Workflow

Bu workflow sunucuyu GitHub'daki en güncel kodla senkronize eder.

## Kullanım

Server'daki Gemini'ye şu komutu ver:

```bash
cd /var/www/prosektorweb/prosektorweb && chmod +x server-sync.sh && ./server-sync.sh
```

## Manuel Alternatif

Eğer script çalışmazsa:

```bash
// turbo-all
cd /var/www/prosektorweb/prosektorweb
git fetch origin
git reset --hard origin/main
rm -rf .next
npm install
npx prisma generate
npm run build
pm2 restart all
```

## Doğrulama

Script çalıştıktan sonra kontrol et:

```bash
git log --oneline -1  # En son commit gösterilmeli
head -5 src/components/layout/Footer.tsx  # "Wave SVG" yazısı görünmeli
curl -I https://prosektorweb.com  # 200 OK dönmeli
```
