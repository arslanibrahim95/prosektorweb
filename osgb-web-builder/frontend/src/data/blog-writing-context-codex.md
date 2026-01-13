# Codex Blog Görevi

## ⚡ Basit Kural
**Sadece içerik yaz, `blog-queue/` klasörüne koy. ID yönetme!**

---

## 📁 Dosya Yolu
```
src/data/blog-queue/codex-[KONU].json
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

## 📋 Codex Konu Listesi

| Dosya Adı | Konu |
|-----------|------|
| `codex-forklift.json` | Forklift Güvenlik Rehberi |
| `codex-kimyasal.json` | Kimyasal Madde ve GBF |
| `codex-kapali-alan.json` | Kapalı Alan Çalışması |
| `codex-ergonomi.json` | Ofis Ergonomisi |
| `codex-meslek-hastaliklari.json` | Meslek Hastalıkları |
| `codex-stres.json` | Stres Yönetimi |
| `codex-osgb-secimi.json` | OSGB Seçimi |
| `codex-sicak-calisma.json` | Sıcak Çalışma İzni |
| `codex-vinc.json` | Vinç Güvenliği |
| `codex-el-aletleri.json` | El Aletleri Güvenliği |

---

## ⛔ KURALLAR
- ❌ `blog/` klasörüne yazma
- ❌ ID ekleme
- ❌ Soru sorma
- ✅ `blog-queue/` klasörüne yaz
- ✅ Dosya adı: `codex-[konu].json`
