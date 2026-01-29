# Güvenlik Dokümantasyonu

> ProsektorWeb güvenlik politikaları, bağımlılık yönetimi ve güvenlik kontrolleri.

---

## 📋 İçindekiler

1. [Güvenlik Özellikleri](#güvenlik-özellikleri)
2. [Bağımlılık Yönetimi](#bağımlılık-yönetimi)
3. [Güvenlik Açığı Tarama](#güvenlik-açığı-tarama)
4. [Güvenlik Kontrol Listesi](#güvenlik-kontrol-listesi)
5. [Olay Müdahale](#olay-müdahale)

---

## Güvenlik Özellikleri

### Uygulanan Güvenlik Katmanları

```mermaid
graph TB
    subgraph "Network Layer"
        A[Cloudflare WAF]
        B[DDoS Protection]
        C[SSL/TLS]
    end

    subgraph "Application Layer"
        D[Rate Limiting]
        E[CSRF Protection]
        F[Input Validation]
        G[Authentication]
        H[Authorization]
    end

    subgraph "Data Layer"
        I[SQL Injection Prevention]
        J[XSS Protection]
        K[PII Redaction]
        L[Encryption at Rest]
    end

    A --> D
    B --> D
    C --> E
    D --> F
    E --> G
    F --> H
    G --> I
    H --> J
    I --> K
    J --> L
```

### Güvenlik Önlemleri Detayı

| Özellik | Uygulama | Konum |
|---------|----------|-------|
| **Rate Limiting** | Sliding Window (Redis) | [`shared/lib/rate-limit.ts`](src/shared/lib/rate-limit.ts) |
| **CSRF Protection** | Origin check + Token | [`shared/lib/csrf.ts`](src/shared/lib/csrf.ts) |
| **Input Validation** | Zod schemas | Feature actions |
| **Authentication** | NextAuth.js v5 | [`features/auth/`](src/features/auth/) |
| **Authorization** | RBAC + Tenant Guard | [`shared/lib/auth-guard.ts`](src/shared/lib/auth-guard.ts) |
| **SQL Injection** | Prisma ORM | [`server/db/`](src/server/db/) |
| **XSS Protection** | DOMPurify | Input sanitization |
| **PII Redaction** | Pino redact paths | [`shared/lib/logger.ts`](src/shared/lib/logger.ts) |

---

## Bağımlılık Yönetimi

### Güvenlik Açığı Tarama Sonuçları

**Son Tarama:** 2026-01-28

#### Yüksek Öncelik

| Paket | Mevcut | Güvenlik Açığı | Öneri |
|-------|--------|----------------|-------|
| `next` | 16.1.2 | CVE-2025-XXXX (High) | **16.1.6+ yükselt** |

#### Orta Öncelik

| Paket | Mevcut | Güvenlik Açığı | Öneri |
|-------|--------|----------------|-------|
| `hono` | <=4.11.6 | Cache middleware bypass | `prisma` downgrade gerekli |
| `lodash` | 4.17.21 | Prototype pollution | Transitif bağımlılık |

### Bağımlılık Yükseltme Planı

```bash
# 1. Next.js güvenlik güncellemesi
npm install next@16.1.6

# 2. Prisma güncellemesi (hono transitif bağımlılığı için)
npm install prisma@6.19.2 @prisma/client@6.19.2

# 3. Lock dosyasını güncelle
npm install

# 4. Testleri çalıştır
npm run test:unit
npm run typecheck
```

### Bağımlılık Kontrol Script'leri

```bash
# Güvenlik taraması
npm run deps:audit

# Kullanılmayan bağımlılıkları kontrol et
npm run deps:check

# Temiz kurulum
npm run deps:clean && npm install
```

### Kritik Bağımlılıklar

| Paket | Versiyon | Amaç | Lisans |
|-------|----------|------|--------|
| `next` | 16.1.2 | Framework | MIT |
| `react` | 19.2.3 | UI Library | MIT |
| `@prisma/client` | 7.2.0 | ORM | Apache-2.0 |
| `next-auth` | 5.0.0-beta.30 | Authentication | ISC |
| `zod` | 4.3.5 | Validation | MIT |
| `bcryptjs` | 3.0.3 | Password hashing | MIT |

---

## Güvenlik Açığı Tarama

### Otomatik Tarama

```bash
# npm audit ile tarama
npm audit --audit-level=moderate

# Detaylı rapor
npm audit --json > security-audit.json
```

### Manuel Kontroller

#### 1. Bağımlılık Lisansları

```bash
# Lisansları kontrol et
npx license-checker --summary

# Sorunlu lisansları bul
npx license-checker --onlyAllow 'MIT;Apache-2.0;ISC;BSD-3-Clause'
```

#### 2. Eski Paketler

```bash
# Güncellenebilir paketleri listele
npm outdated

# Major versiyon değişiklikleri
npm outdated --depth=0
```

#### 3. Transitif Bağımlılıklar

```bash
# Belirli bir paketin nereden geldiğini bul
npm ls lodash

# Yüksek riskli paketleri bul
npm audit --json | jq '.vulnerabilities | to_entries[] | select(.value.severity=="high")'
```

---

## Güvenlik Kontrol Listesi

### Geliştirme Öncesi

- [ ] Yeni paketin lisansı uyumlu mu? (MIT, Apache-2.0, ISC tercih)
- [ ] Paket aktif olarak maintain ediliyor mu?
- [ ] npm audit'te güvenlik açığı var mı?
- [ ] Bundle size etkisi kabul edilebilir mi?
- [ ] Mevcut kütüphanelerle çözülebilecek mi?

### Kod İnceleme

- [ ] Tüm input'lar validasyon'dan geçiyor mu?
- [ ] SQL injection riski var mı?
- [ ] XSS riski var mı?
- [ ] Authentication kontrolleri var mı?
- [ ] Authorization kontrolleri var mı?
- [ ] PII veriler loglanıyor mu?

### Deployment Öncesi

- [ ] `npm audit` temiz mi?
- [ ] Environment variables doğru ayarlanmış mı?
- [ ] Production build test edildi mi?
- [ ] SSL/TLS sertifikaları geçerli mi?
- [ ] Rate limit'ler aktif mi?

---

## Olay Müdahale

### Güvenlik İhlali Durumunda

1. **Tespit** (0-15 dk)
   - Logları incele
   - Etkilenen sistemleri belirle
   - İhlal kapsamını değerlendir

2. **İzolasyon** (15-30 dk)
   - Etkilenen servisleri durdur
   - IP'leri blockla
   - Session'ları invalidate et

3. **Müdahale** (30-60 dk)
   - Açığı kapat
   - Patch uygula
   - Configuration'u güncelle

4. **Kurtarma** (1-4 saat)
   - Servisleri yeniden başlat
   - Veri bütünlüğünü kontrol et
   - Monitoring'i artır

5. **Post-Incident** (24-48 saat)
   - Rapor hazırla
   - Süreçleri gözden geçir
   - Önlemleri güncelle

### Acil İletişim

| Rol | İletişim | Durum |
|-----|----------|-------|
| Güvenlik Ekibi | security@prosektor.com | 7/24 |
| Teknik Lider | tech-lead@prosektor.com | 7/24 |
| DevOps | devops@prosektor.com | İş saatleri |

---

## Güvenlik Yapılandırması

### Environment Variables

```bash
# .env.local

# NextAuth
NEXTAUTH_SECRET=<random-32-char-secret>
NEXTAUTH_URL=https://prosektor.com

# Database
DATABASE_URL=mysql://user:pass@host:3306/db

# Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# External APIs
OPENAI_API_KEY=sk-...
CLOUDFLARE_API_TOKEN=...
RESEND_API_KEY=re_...
SENTRY_DSN=https://...
```

### Güvenlik Header'ları

```typescript
// next.config.js
const securityHeaders = [
    {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
    },
    {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    },
    {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
    },
    {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
    },
    {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self';"
    }
];
```

---

## En İyi Pratikler

### 1. Güvenlik Kod İncelemesi

```typescript
// ❌ Yanlış - Raw SQL
const result = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;

// ✅ Doğru - Prisma ORM
const result = await prisma.user.findUnique({ where: { email } });
```

### 2. Input Validasyonu

```typescript
// ❌ Yanlış - Validasyon yok
export async function createUser(data: any) {
    await prisma.user.create({ data });
}

// ✅ Doğru - Zod validasyonu
const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

export async function createUser(data: unknown) {
    const validated = schema.parse(data);
    await prisma.user.create({ data: validated });
}
```

### 3. Authentication Kontrolü

```typescript
// ❌ Yanlış - Auth kontrolü yok
export async function deleteUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
}

// ✅ Doğru - Auth + Authorization
export async function deleteUser(userId: string) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');
    if (session.user.role !== 'ADMIN') throw new Error('Forbidden');

    await prisma.user.delete({ where: { id: userId } });
}
```

---

## Kaynaklar

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#security-concerns)
- [Snyk Vulnerability DB](https://snyk.io/vuln)
