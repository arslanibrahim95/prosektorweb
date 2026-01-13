# ProSektorWeb Blog Yazım Sistemi - Gemini/Claude İçin

## 🚨 YENİ SİSTEM: Ayrı Dosyalar

> **ÖNEMLİ!** Artık `blog-posts.json` KULLANILMIYOR. Her blog yazısı ayrı dosyada!

### Kurallar Dosyası
```
src/data/blog/AGENT-RULES.md
```
Bu dosyayı **mutlaka oku** - tüm koordinasyon kuralları orada.

---

## 📁 Dosya Yapısı

```
src/data/blog/
├── AGENT-RULES.md           ← Önce bunu oku!
├── _categories.json
├── 01-konu-slug.json
├── 02-konu-slug.json
└── ...
```

---

## 🔧 Yeni Yazı Ekleme Prosedürü

### 1. Son ID'yi Kontrol Et
```bash
ls src/data/blog/*.json | sort -n | tail -1
```

### 2. Yeni Dosya Oluştur
```bash
# Örnek: Son ID 11 ise, yeni ID = 12
write_to_file: src/data/blog/12-yeni-konu-slug.json
```

### 3. JSON Formatı
```json
{
  "id": "12",
  "slug": "yeni-konu-slug",
  "title": "Yeni Konu Başlığı",
  "excerpt": "Özet (150-200 karakter)",
  "content": "<h2>...</h2><p>...</p>",
  "coverImage": "https://images.unsplash.com/...",
  "category": { "name": "Kategori", "slug": "kategori-slug" },
  "tags": [{ "name": "Tag", "slug": "tag" }],
  "author": { "name": "ProSektorWeb Editör" },
  "publishedAt": "2026-01-13",
  "readingTime": 7,
  "featured": false
}
```

### 4. Doğrulama
```bash
node -e "JSON.parse(require('fs').readFileSync('src/data/blog/12-yeni-konu.json'))"
```

---

## 🚨 JSON ESCAPE KURALLARI

### YASAK:
```json
"content": "... \"Yönetmelik\" ..."  ❌ HATALI
```

### DOĞRU:
```json
"content": "... 'Yönetmelik' ..."  ✅ TEK TIRNAK
```

---

## 📋 Gemini İçin Konu Listesi (10 adet)

| # | Başlık | Kategori |
|---|--------|----------|
| 12 | **Asbest Maruziyeti ve Güvenli Söküm Prosedürleri** | İş Güvenliği |
| 13 | **Çalışan Temsilcisi Seçimi ve İSG Kurulu Oluşturma** | Mevzuat |
| 14 | **Radyasyon Güvenliği: NDT Çalışanları İçin Rehber** | Sağlık |
| 15 | **Tarım Sektöründe İSG: Traktör ve Zirai İlaç Riskleri** | İş Güvenliği |
| 16 | **Biyolojik Risk Etmenleri ve Sağlık Kuruluşlarında İSG** | Sağlık |
| 17 | **5S Yöntemi ile İşyerinde Düzen ve Güvenlik** | Risk Yönetimi |
| 18 | **Titreşim Maruziyeti ve El-Kol Titreşim Sendromu** | Sağlık |
| 19 | **Acil Durum Aydınlatması ve Kaçış Yolları Planlaması** | İş Güvenliği |
| 20 | **İşe Dönüş (Return to Work) Programları ve OSGB Rolü** | Dijital Dönüşüm |
| 21 | **Termal Konfor: Aşırı Sıcak ve Soğukta Çalışma Koşulları** | Sağlık |

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

## 🖼️ Kapak Görselleri (Unsplash)

- **Mevzuat**: `https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop`
- **İş Güvenliği**: `https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop`
- **Sağlık**: `https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop`
- **Dijital Dönüşüm**: `https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop`
- **Risk Yönetimi**: `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop`

---

## ⚠️ YAPMA / YAP

### ❌ YAPMA
- `blog-posts.json` dosyasını düzenleme
- Başka agent'ın dosyasını silme/değiştirme
- Aynı ID'yi kullanma

### ✅ YAP
- Her yazı için ayrı dosya oluştur
- Önce `AGENT-RULES.md` oku
- Son ID'yi kontrol et
- JSON'u doğrula

---

## � Mevcut Durum

| Bilgi | Değer |
|-------|-------|
| Mevcut yazı sayısı | 11 |
| Son ID | 11 |
| **Gemini ID aralığı** | 12-21 |
| **Codex ID aralığı** | 22-31 |
