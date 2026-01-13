# ProSektorWeb Blog Yazım Sistemi - Codex/GPT İçin

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
# Örnek: ID 22 için
write_to_file: src/data/blog/22-yeni-konu-slug.json
```

### 3. JSON Formatı
```json
{
  "id": "22",
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
node -e "JSON.parse(require('fs').readFileSync('src/data/blog/22-yeni-konu.json'))"
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

## 📋 Codex İçin Konu Listesi (10 adet)

| # | Başlık | Kategori |
|---|--------|----------|
| 22 | **Forklift Operatörü Güvenlik Rehberi** | İş Güvenliği |
| 23 | **Kimyasal Madde Güvenliği ve GBF Okuma Rehberi** | Risk Yönetimi |
| 24 | **Kapalı Alan Çalışması: Riskler ve Önlemler** | İş Güvenliği |
| 25 | **Ofis Çalışanları İçin Ergonomi Rehberi** | Sağlık |
| 26 | **Meslek Hastalıkları: Tanı, Bildirim ve Önleme** | Sağlık |
| 27 | **İşyeri Stres Yönetimi ve Tükenmişlik Sendromu** | Sağlık |
| 28 | **OSGB Seçerken Dikkat Edilmesi Gerekenler** | Dijital Dönüşüm |
| 29 | **Sıcak Çalışma İzin Sistemi (Hot Work Permit)** | İş Güvenliği |
| 30 | **Vinç ve Kaldırma Ekipmanları Güvenliği** | İş Güvenliği |
| 31 | **El Aletleri ve Taşınabilir Ekipman Güvenliği** | İş Güvenliği |

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
- Gemini'nin ID aralığını (12-21) kullanma

### ✅ YAP
- Her yazı için ayrı dosya oluştur
- Önce `AGENT-RULES.md` oku
- Son ID'yi kontrol et
- JSON'u doğrula

---

## 📌 Mevcut Durum

| Bilgi | Değer |
|-------|-------|
| Mevcut yazı sayısı | 11 |
| Son ID | 11 |
| **Gemini ID aralığı** | 12-21 |
| **Codex ID aralığı** | 22-31 |

---

## 🔄 Multi-Agent Koordinasyon

```
┌─────────────────┐    ┌─────────────────┐
│     GEMINI      │    │     CODEX       │
│   ID: 12-21     │    │   ID: 22-31     │
│                 │    │                 │
│  blog/12-*.json │    │  blog/22-*.json │
│  blog/13-*.json │    │  blog/23-*.json │
│       ...       │    │       ...       │
└─────────────────┘    └─────────────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
           ┌───────────────┐
           │   AGENT-RULES │
           │   Koordinatör │
           └───────────────┘
```

Bu sistem sayesinde iki agent aynı anda çalışabilir, çakışma olmaz!
