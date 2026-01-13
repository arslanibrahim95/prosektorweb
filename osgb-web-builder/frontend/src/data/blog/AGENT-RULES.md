# 🤖 Multi-Agent Blog Yazımı Koordinasyon Kuralları

## 📁 Dosya Yapısı

```
src/data/blog/
├── _categories.json         # Kategoriler (otomatik hesaplanır)
├── 01-konu-slug.json        # ID 1
├── 02-konu-slug.json        # ID 2
└── ...
```

## ⚠️ KRİTİK KURALLAR

### 1. ASLA `blog-posts.json` dosyasını düzenleme
Bu dosya artık kullanılmıyor. Tüm yazılar `src/data/blog/` klasöründe ayrı dosyalar olarak saklanıyor.

### 2. Her yazı = 1 dosya
- Dosya adı formatı: `XX-slug.json` (XX = 2 haneli ID)
- Örnek: `15-yuksekte-calisma-guvenligi.json`

### 3. MEVCUT dosyaları silme/üzerine yazma
- Sadece **YENİ** dosya oluştur
- Var olan bir dosyayı düzenlemek için önce içeriğini oku

### 4. ID Seçimi
- Yeni yazı eklerken mevcut en yüksek ID'yi bul ve +1 ekle
- ID kontrolü için: `ls src/data/blog/ | sort -n`

---

## 📝 Yeni Blog Yazısı Ekleme Şablonu

```json
{
  "id": "XX",
  "slug": "konu-basligi-slug",
  "title": "Konu Başlığı",
  "excerpt": "Kısa açıklama (150-200 karakter)",
  "content": "<h2>...</h2><p>...</p>",
  "coverImage": "https://images.unsplash.com/...",
  "category": {
    "name": "Kategori Adı",
    "slug": "kategori-slug"
  },
  "tags": [
    {"name": "Tag1", "slug": "tag1"}
  ],
  "author": {
    "name": "ProSektorWeb Editör"
  },
  "publishedAt": "YYYY-MM-DD",
  "readingTime": 7,
  "featured": false
}
```

---

## ✅ Kategori Seçenekleri

| Kategori | Slug |
|----------|------|
| İş Güvenliği | `is-guvenligi` |
| Sağlık | `saglik` |
| Risk Yönetimi | `risk-yonetimi` |
| Dijital Dönüşüm | `dijital-donusum` |
| Mevzuat | `mevzuat` |

---

## 🔄 Agent İş Akışı

1. **Mevcut ID'leri kontrol et**
   ```bash
   ls src/data/blog/*.json | sort -n
   ```

2. **Bir sonraki ID'yi belirle**
   - En yüksek ID + 1

3. **Yeni dosyayı oluştur**
   ```bash
   # Örnek: ID 28
   write_to_file: src/data/blog/28-yeni-yazi-slug.json
   ```

4. **JSON doğrulaması yap**
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('src/data/blog/28-yeni-yazi.json'))"
   ```

---

## 🚫 YAPMA

- ❌ `blog-posts.json` dosyasını düzenleme
- ❌ Başka agent'ın dosyasını silme/değiştirme
- ❌ Aynı ID'yi kullanma
- ❌ Geçersiz JSON yazma

## ✅ YAP

- ✅ Her yazı için ayrı dosya oluştur
- ✅ ID sırasına dikkat et
- ✅ Unsplash'tan cover image kullan
- ✅ `publishedAt` tarihini güncel tut
