# Codex İçin Blog Yazıları Görevi

> **Acil Durum:** blog-posts.json'dan ID 1-12 silindi. Aşağıdaki yazıları oluşturman gerekiyor.

## ⚠️ KRİTİK KURALLAR
1. **MEVCUT DOSYAYI SİLME** - Sadece yeni post ekle
2. Her yazı için ayrı JSON oluştur: `codex-posts-2-5-8-11.json`
3. Sonra merge et

## Senin Görevin: ID 2, 5, 8, 11

### ID 2: İş Kazalarını Önlemenin 10 Etkili Yöntemi
- **Kategori:** İş Güvenliği
- **Excerpt:** İş kazalarını azaltmak için uygulanabilir 10 pratik yöntem ve saha ipuçları.
- **Kapak:** Unsplash'tan güvenlik temalı görsel

### ID 5: Çalışan Sağlığı Takip Sistemlerinin Önemi
- **Kategori:** Sağlık
- **Excerpt:** Periyodik muayeneler, portör takibi ve sağlık gözetiminin dijitalleşmesi.
- **Kapak:** Unsplash'tan sağlık temalı görsel

### ID 8: İşyerinde Psikolojik Taciz (Mobbing) ve Önleme Yöntemleri
- **Kategori:** Risk Yönetimi
- **Excerpt:** Mobbing tanımı, belirtileri, yasal haklar ve OSGB'lerin rolü.
- **Kapak:** Unsplash'tan ofis temalı görsel

### ID 11: Gece Çalışmasının Sağlığa Etkileri ve Koruyucu Önlemler
- **Kategori:** Sağlık
- **Excerpt:** Vardiyalı çalışmanın sağlık riskleri ve işverenin yükümlülükleri.
- **Kapak:** Unsplash'tan gece çalışması temalı görsel

## JSON Format Örneği

```json
{
    "id": "2",
    "slug": "is-kazalarini-onlemenin-10-etkili-yontemi",
    "title": "İş Kazalarını Önlemenin 10 Etkili Yöntemi",
    "excerpt": "...",
    "content": "<h2>...</h2><p>...</p>",
    "coverImage": "https://images.unsplash.com/...",
    "category": {"name": "İş Güvenliği", "slug": "is-guvenligi"},
    "tags": [...],
    "author": {"name": "ProSektorWeb Editör"},
    "publishedAt": "2026-01-XX",
    "readingTime": 6,
    "featured": false
}
```

## Merge Komutu

```bash
cd src/data && node -e "
const fs = require('fs');
const codex = JSON.parse(fs.readFileSync('codex-posts-2-5-8-11.json'));
const main = JSON.parse(fs.readFileSync('blog-posts.json'));
main.posts = [...main.posts, ...codex];
main.posts.sort((a,b) => parseInt(a.id) - parseInt(b.id));
fs.writeFileSync('blog-posts.json', JSON.stringify(main, null, 2));
console.log('✅ Merged! Total:', main.posts.length);
"
```

---

## Kalan yazılar (ID 3, 6, 9, 12) - User veya başka agent:

| ID | Konu |
|----|------|
| 3 | OSGB'lerde Dijital Dönüşüm: Neden ve Nasıl? |
| 6 | Kişisel Koruyucu Donanım (KKD) Seçim Rehberi |
| 9 | Yangın Güvenliği Temel Eğitimi ve Tatbikatlar |
| 12 | Portör Muayenesi Rehberi |
