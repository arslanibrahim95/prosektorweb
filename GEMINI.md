# ProSektorWeb Project Rules (v2)

## 0) Amaç ve Kapsam
Bu doküman; ProSektorWeb projesinde **kod kalitesi, güvenlik, erişilebilirlik, performans ve release disiplinini** standardize eder. Kurallar "öneri" değil; **PR kabul kriteridir.**

---

## 1) Vibe Coding & Engineering Manifesto 🛡️

**Motto:** "Çalışıyor" ≠ "Prod'a Hazır". AI ile hızlı kod yazarken ("Vibe Coding") güvenliği ve sürdürülebilirliği korumak esastır.

### 1.1 Mutlak Kırmızı Çizgiler (Red Lines)
- **Para / Ödeme:** Float YASAK. JS `Number` veya `parseFloat` asla para için kullanılmaz. Kuruş (Integer) veya `Decimal.js` + DB `DECIMAL` zorunludur. İşlemler Atomic olmalıdır.
- **Secrets / .env:** `.gitignore` ilk kontrol noktasıdır. Secret sızıntısında silmek yetmez; **Revoke & Rotate** şarttır.
- **Webhook:** At-Least-Once teslimat prensibiyle çalışılmalı. `event_id` ile **Idempotency** sağlanmalıdır.
- **Email:** Normalizasyon zorunludur (`john.doe+test@gmail.com` == `johndoe@gmail.com`).

### 1.2 Feature Gate Checklist (Her PR İçin)
- **Strings:** Unicode, Emoji ve Invisible Character desteği.
- **Numbers:** Negatif değer, sıfır, overflow (2038) ve NaN kontrolleri.
- **Arrays:** Boş `[]`, null/undefined kontrolleri.
- **Concurrency:** Race condition ve double-submit koruması.
- **Recursion:** Max depth ile sonsuz döngü koruması.

---

## 2) Repo Yapısı ve Modülerlik

### 2.1 Zorunlu Dizin Konvansiyonu (Next.js App Router)

```
prosektorweb/
├── src/
│   ├── app/[locale]/           # Next.js App Router sayfaları (SSR/RSC)
│   ├── components/
│   │   ├── ui/                 # Temel UI bileşenleri (Atomic, Logic YASAK)
│   │   ├── admin/              # Admin'e özel bileşenler
│   │   └── auth/               # Auth akışına özel bileşenler
│   ├── features/               # İş kabiliyetleri (modüller)
│   ├── actions/                # Genel Server Actions
│   ├── lib/                    # Ortak yardımcılar (date, crypto, pipeline)
│   │   ├── pipeline/           # AI Pipeline logic ve RULES.md
│   │   └── prisma.ts           # Prisma client instance
│   ├── i18n/                   # next-intl konfigürasyonu
│   └── middleware.ts           # Auth + Rate limiting + Bot protection
├── prisma/                     # Veritabanı şeması ve migrasyonlar
├── docs/                       # Proje dokümantasyonu (Playbook, RULES, Prompts)
└── messages/                   # Çeviri dosyaları
```

### 2.2 Dependency Diet (Bağımlılık Hijyeni)
- **Prensip:** Minimum bağımlılık, maksimum performans.
- **Kural:** Aynı işi yapan birden fazla kütüphane yasaktır (Örn: `gsap` YASAK, `framer-motion` KULLANILIR).
- **Yönetim:** `npm audit` ve `depcheck` ile düzenli temizlik.

---

## 3) Kod Standartları (Quality Gate)

### 3.1 Dil ve Stil
- **TypeScript zorunlu**; `any` yasaktır.
- **Zod** ile tüm input/output validasyonu (Server Actions dahil).
- **No dead code**: Kullanılmayan export/komponent bırakılmaz.

### 3.2 Hata Yönetimi
- **Server Actions**: `ActionResult<T>` tipi ile tutarlı dönüş.
- **DB işlemleri**: "Hep ya da Hiç" (Atomicity). Unique Key ile Idempotency.

---

## 4) Veritabanı ve Data Model

- **ID & Sayaçlar:** Overflow koruması için `BIGINT` kullanımı.
- **Pagination:** Offset YASAK. **Cursor-based pagination** zorunludur.
- **Soft Delete:** `deletedAt` filtresi (Prisma Extension ile otomatik).
- **Transaction:** Finansal veya ilişkili çoklu işlemlerde zorunlu.

---

## 5) Güvenlik (Minimum Baseline)

- **AuthZ:** Her endpoint/action "Kim, Neye Erişebilir?" kontrolü yapmalı.
- **Sessions:** Şifre değişiminde veya logout'ta `sessionVersion` artırılmalı, tüm oturumlar invalidate edilmelidir.
- **Rate Limiting:** IP tabanlı ve kullanıcı tabanlı limitler `middleware.ts` üzerinden uygulanır.
- **Bot Protection:** Kritik formlarda ve endpoint'lerde bot tespiti.

---

## 6) Performans & Core Web Vitals SLO'ları

- **Lighthouse:** Mobile ≥ 70, Accessibility ≥ 90.
- **LCP:** ≤ 2.5s | **INP:** ≤ 200ms | **CLS:** ≤ 0.1.
- **Bundle:** Dynamic imports ve route-based splitting. `next/image` zorunlu.
- **Query:** N+1 sorgu tespiti ve önlenmesi.

---

## 7) Antigravity Prompt Kütüphanesi 📚

AI ile geliştirme yaparken `docs/prompts/` altındaki "Gate Prompt"ları kullanılmalıdır:
1. **Security Gate:** Unicode & Injection savunması.
2. **Idempotency Gate:** Çift işlem önleme.
3. **Money Gate:** Finansal doğruluk.
4. **React Cleanup Gate:** Bellek yönetimi.
... ve diğerleri (Toplam 20+ Gate).

---

## 8) Release ve Operasyon

- **Commit:** Conventional Commits (`type(scope): description`) + **WHY** açıklaması.
- **CI/CD:** `typecheck`, `lint`, `build` ve `test:unit` geçmeden merge edilemez.
- **Deploy:** `npx prisma db push` ve `pm2 restart` adımları otomatize edilmiştir.

---

## Hızlı Referans

```bash
# Geliştirme ve Test
npm run dev          # Dev mode
npm run typecheck    # TS kontrolü
npm run lint         # Lint kontrolü
npm run test:unit    # Unit testler

# Bağımlılık ve Güvenlik
npm run deps:audit   # Güvenlik denetimi
npm run deps:check   # Kullanılmayan paket kontrolü
```

**Versiyon:** 2.0.0 | **Son Güncelleme:** 2026-01-28