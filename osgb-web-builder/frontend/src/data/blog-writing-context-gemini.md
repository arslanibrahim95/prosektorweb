# Gemini Blog Görevi

## ⚡ Basit Kural
**Sadece içerik yaz, `blog-queue/` klasörüne koy. ID yönetme!**

---

## 📁 Dosya Yolu
```
src/data/blog-queue/gemini-[KONU].json
```

## 📝 JSON Şablonu (ID YOK!)
```json
{
  "slug": "konu-slug",
  "title": "Konu Başlığı",
  "excerpt": "150-200 karakter özet",
  "content": "<h2>...</h2><p>...</p>",
  "coverImage": "https://images.unsplash.com/...",
  "category": { "name": "İş Güvenliği", "slug": "is-guvenligi" },
  "tags": [{ "name": "Tag", "slug": "tag" }],
  "author": { "name": "ProSektorWeb Editör" },
  "publishedAt": "2026-01-13",
  "readingTime": 7,
  "featured": false
}
```

---

## 📋 Gemini Konu Listesi

| Dosya Adı | Konu |
|-----------|------|
| `gemini-asbest.json` | Asbest Maruziyeti ve Güvenli Söküm |
| `gemini-calisan-temsilcisi.json` | Çalışan Temsilcisi ve İSG Kurulu |
| `gemini-radyasyon.json` | Radyasyon Güvenliği (NDT) |
| `gemini-tarim.json` | Tarım Sektöründe İSG |
| `gemini-biyolojik-risk.json` | Biyolojik Risk Etmenleri |
| `gemini-5s.json` | 5S Yöntemi |
| `gemini-titresim.json` | Titreşim Maruziyeti |
| `gemini-acil-aydinlatma.json` | Acil Durum Aydınlatması |
| `gemini-ise-donus.json` | İşe Dönüş Programları |
| `gemini-termal-konfor.json` | Termal Konfor |

---

## ⛔ KURALLAR
- ❌ `blog/` klasörüne yazma
- ❌ ID ekleme
- ❌ Soru sorma
- ✅ `blog-queue/` klasörüne yaz
- ✅ Dosya adı: `gemini-[konu].json`
