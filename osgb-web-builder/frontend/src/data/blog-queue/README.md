# 🤖 Agent Blog İçerik Sistemi

## Basit Kural: Sadece İçerik Üret

**ID yönetimi SANA AİT DEĞİL.** Sadece içerik oluştur, `blog-queue/` klasörüne koy.

---

## 📁 Nasıl Çalışır?

```
blog-queue/              ← SADECE BURAYA YAZ
├── gemini-asbest.json   ← Agent ismi + konu
├── codex-forklift.json
└── ...

blog/                    ← BURAYA DOKUNMA
├── 01-xxx.json
├── 02-xxx.json
└── ...
```

---

## ✍️ İçerik Oluşturma

### 1. Dosya Adı
```
blog-queue/[AGENT]-[KONU-SLUG].json
```
Örnek: `blog-queue/gemini-asbest-maruziyeti.json`

### 2. JSON Şablonu (ID YOK!)
```json
{
  "slug": "asbest-maruziyeti-ve-guvenli-sokum",
  "title": "Asbest Maruziyeti ve Güvenli Söküm Prosedürleri",
  "excerpt": "Özet açıklama (150-200 karakter)",
  "content": "<h2>Başlık</h2><p>İçerik...</p>",
  "coverImage": "https://images.unsplash.com/...",
  "category": { "name": "İş Güvenliği", "slug": "is-guvenligi" },
  "tags": [{ "name": "Asbest", "slug": "asbest" }],
  "author": { "name": "ProSektorWeb Editör" },
  "publishedAt": "2026-01-13",
  "readingTime": 7,
  "featured": false
}
```

**NOT:** `"id"` EKLEME! Merge script otomatik ekleyecek.

---

## ⛔ KURALLAR

| ❌ YAPMA | ✅ YAP |
|----------|--------|
| `blog/` klasörüne yazma | `blog-queue/` klasörüne yaz |
| ID ekleme | Slug ile dosya adı ver |
| Mevcut dosyaları düzenleme | Yeni dosya oluştur |
| Soru sorma | İçerik üret, bırak |

---

## 📋 Konu Listesi

Aşağıdaki konuları yaz. Bitince user merge edecek.

### Gemini Görevleri:
1. Asbest Maruziyeti ve Güvenli Söküm
2. Çalışan Temsilcisi ve İSG Kurulu
3. Radyasyon Güvenliği (NDT)
4. Tarım Sektöründe İSG
5. Biyolojik Risk Etmenleri
6. 5S Yöntemi
7. Titreşim Maruziyeti
8. Acil Durum Aydınlatması
9. İşe Dönüş Programları
10. Termal Konfor

### Codex Görevleri:
1. Forklift Güvenlik Rehberi
2. Kimyasal Madde ve GBF
3. Kapalı Alan Çalışması
4. Ofis Ergonomisi
5. Meslek Hastalıkları
6. Stres Yönetimi
7. OSGB Seçimi
8. Sıcak Çalışma İzni
9. Vinç Güvenliği
10. El Aletleri Güvenliği

---

## 🔄 Merge İşlemi (User Yapacak)

```bash
node src/data/merge-queue.js
```

Bu script:
1. `blog-queue/` içindeki tüm dosyaları okur
2. Son ID'yi bulur
3. Her birine sırayla ID atar
4. `blog/` klasörüne taşır
5. Queue'yu temizler
