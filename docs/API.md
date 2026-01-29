# API Dokümantasyonu

> ProsektorWeb API referansı ve kullanım örnekleri.

---

## İçindekiler

1. [Server Actions](#server-actions)
2. [API Routes](#api-routes)
3. [Tipler](#tipler)
4. [Hata Kodları](#hata-kodları)

---

## Server Actions

### Authentication

#### `login`

Kullanıcı girişi yapar.

```typescript
import { login } from '@/features/auth/actions/auth-actions';

const result = await login({
    email: "user@example.com",
    password: "password123"
});

// Başarılı yanıt
{
    success: true,
    data: {
        user: {
            id: "123",
            email: "user@example.com",
            name: "John Doe"
        }
    },
    meta: { requestId: "uuid" }
}

// Hata yanıtı
{
    success: false,
    error: {
        code: "INVALID_CREDENTIALS",
        message: "E-posta veya şifre hatalı"
    },
    meta: { requestId: "uuid" }
}
```

#### `logout`

Kullanıcı çıkışı yapar.

```typescript
import { logout } from '@/features/auth/actions/auth-actions';

const result = await logout();
```

#### `resetPassword`

Şifre sıfırlama isteği gönderir.

```typescript
import { resetPassword } from '@/features/auth/actions/auth-actions';

const result = await resetPassword({
    email: "user@example.com"
});
```

---

### AI Generation

#### `generateContent`

AI destekli içerik üretir.

```typescript
import { generateContent } from '@/features/ai-generation/actions/generation';

const result = await generateContent({
    prompt: "OSGB hizmetleri hakkında blog yazısı",
    type: "blog",
    options: {
        tone: "professional",    // "professional" | "casual" | "technical"
        length: "medium",        // "short" | "medium" | "long"
        language: "tr"
    }
});

// Başarılı yanıt
{
    success: true,
    data: {
        content: "...",
        title: "OSGB Hizmetleri: İş Güvenliği Rehberi",
        seoScore: 85,
        wordCount: 450
    }
}
```

#### `generateSEO`

SEO optimize edilmiş meta veriler üretir.

```typescript
import { generateSEO } from '@/features/ai-generation/actions/generation';

const result = await generateSEO({
    content: "Blog yazısı içeriği...",
    targetKeywords: ["OSGB", "iş güvenliği", "işyeri hekimi"]
});

// Başarılı yanıt
{
    success: true,
    data: {
        title: "OSGB Hizmetleri | İş Güvenliği Çözümleri",
        description: "Profesyonel OSGB hizmetleri...",
        keywords: ["osgb", "iş güvenliği", "..."],
        ogImage: "https://..."
    }
}
```

---

### Finance

#### `createInvoice`

Yeni fatura oluşturur.

```typescript
import { createInvoice } from '@/features/finance/actions/invoices';

const result = await createInvoice({
    companyId: "company-123",
    items: [
        {
            description: "OSGB Hizmetleri",
            quantity: 1,
            unitPrice: 5000,
            taxRate: 20
        }
    ],
    dueDate: new Date("2026-02-28"),
    notes: "Ödeme süresi 30 gündür"
});
```

#### `getInvoicePDF`

Fatura PDF'ini getirir.

```typescript
import { getInvoicePDF } from '@/features/finance/actions/invoices';

const result = await getInvoicePDF({
    invoiceId: "inv-123"
});

// Başarılı yanıt
{
    success: true,
    data: {
        url: "/api/invoices/inv-123/pdf",
        filename: "Fatura-2026-001.pdf"
    }
}
```

---

### CRM

#### `createCompany`

Yeni şirket oluşturur.

```typescript
import { createCompany } from '@/features/crm/actions/companies';

const result = await createCompany({
    name: "Örnek Şirket A.Ş.",
    taxNumber: "1234567890",
    email: "info@ornek.com",
    phone: "+90 212 555 0000",
    address: {
        street: "Örnek Cad. No:1",
        city: "İstanbul",
        postalCode: "34000"
    }
});
```

#### `addContact`

Şirkete yeni kişi ekler.

```typescript
import { addContact } from '@/features/crm/actions/contacts';

const result = await addContact({
    companyId: "company-123",
    name: "Ahmet Yılmaz",
    email: "ahmet@ornek.com",
    phone: "+90 532 123 4567",
    position: "İK Müdürü"
});
```

---

### Projects

#### `createProject`

Yeni proje oluşturur.

```typescript
import { createProject } from '@/features/projects/actions/projects';

const result = await createProject({
    companyId: "company-123",
    name: "Web Sitesi Yenileme",
    description: "Kurumsal web sitesi tasarım ve geliştirme",
    type: "web",
    budget: 25000,
    startDate: new Date("2026-02-01"),
    endDate: new Date("2026-04-01")
});
```

#### `updateProjectStatus`

Proje durumunu günceller.

```typescript
import { updateProjectStatus } from '@/features/projects/actions/projects';

const result = await updateProjectStatus({
    projectId: "proj-123",
    status: "in_progress",  // "draft" | "pending" | "in_progress" | "completed" | "cancelled"
    notes: "Müşteri onayı alındı"
});
```

---

## API Routes

### Authentication

#### POST `/api/auth/[...nextauth]`

NextAuth.js authentication endpoint.

**Desteklenen Provider'lar:**
- Credentials (email/password)
- Google OAuth (opsiyonel)

---

### AI Generation

#### POST `/api/generate`

AI içerik üretimi.

```http
POST /api/generate
Content-Type: application/json
Authorization: Bearer {token}

{
    "prompt": "OSGB hizmetleri hakkında blog yazısı",
    "type": "blog",
    "options": {
        "tone": "professional",
        "length": "medium"
    }
}
```

**Yanıt:**
```json
{
    "success": true,
    "data": {
        "content": "...",
        "title": "...",
        "seoScore": 85
    }
}
```

---

### Domain Management

#### GET `/api/cloudflare/domains`

Domain sorgulama.

```http
GET /api/cloudflare/domains?query=example.com
Authorization: Bearer {token}
```

**Yanıt:**
```json
{
    "success": true,
    "data": {
        "available": true,
        "domain": "example.com",
        "price": 12.99,
        "currency": "USD"
    }
}
```

#### GET `/api/cloudflare/domains/{domain}/dns`

DNS kayıtlarını getir.

```http
GET /api/cloudflare/domains/example.com/dns
Authorization: Bearer {token}
```

---

### Invoices

#### GET `/api/invoices/{id}/pdf`

Fatura PDF'i indir.

```http
GET /api/invoices/inv-123/pdf
Authorization: Bearer {token}
```

**Yanıt:** PDF dosyası

---

## Tipler

### ActionResponse

Tüm server actions için standart yanıt formatı.

```typescript
interface ActionResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
    meta?: {
        requestId: string;
        timestamp?: string;
    };
}
```

### PaginationParams

Sayfalama parametreleri.

```typescript
interface PaginationParams {
    page?: number;      // Varsayılan: 1
    limit?: number;     // Varsayılan: 20, Maks: 100
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
```

### PaginatedResponse

Sayfalanmış yanıt formatı.

```typescript
interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
```

---

## Hata Kodları

### Genel Hatalar

| Kod | Açıklama | HTTP Status |
|-----|----------|-------------|
| `INTERNAL_ERROR` | Sunucu hatası | 500 |
| `VALIDATION_ERROR` | Geçersiz giriş | 400 |
| `UNAUTHORIZED` | Yetkisiz erişim | 401 |
| `FORBIDDEN` | Yasaklı erişim | 403 |
| `NOT_FOUND` | Kaynak bulunamadı | 404 |
| `RATE_LIMITED` | Çok fazla istek | 429 |

### Auth Hataları

| Kod | Açıklama |
|-----|----------|
| `INVALID_CREDENTIALS` | E-posta veya şifre hatalı |
| `ACCOUNT_LOCKED` | Hesap kilitli |
| `EMAIL_NOT_VERIFIED` | E-posta doğrulanmamış |
| `SESSION_EXPIRED` | Oturum süresi doldu |

### Business Hataları

| Kod | Açıklama |
|-----|----------|
| `DUPLICATE_RECORD` | Kayıt zaten mevcut |
| `INSUFFICIENT_FUNDS` | Yetersiz bakiye |
| `INVALID_STATE` | Geçersiz işlem durumu |
| `DEPENDENCY_EXISTS` | Bağlı kayıt var |

---

## Rate Limiting

### Tier'lar

| Tier | Limit | Pencere | Kullanım |
|------|-------|---------|----------|
| `GLOBAL` | 500 | 60s | Tüm istekler |
| `PAGE` | 50 | 10s | HTML sayfaları |
| `API` | 100 | 60s | API istekleri |
| `AUTH` | 10 | 60s | Kimlik doğrulama |
| `BOT` | 5 | 60s | Şüpheli IP'ler |
| `AUTHENTICATED` | 1000 | 60s | Giriş yapmış kullanıcılar |
| `ADMIN` | 5000 | 60s | Admin kullanıcılar |

### Rate Limit Yanıtı

```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706461200

{
    "success": false,
    "error": {
        "code": "RATE_LIMITED",
        "message": "Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin."
    }
}
```

---

## Örnek Kullanımlar

### React Component ile Server Action

```typescript
'use client';

import { useState, useTransition } from 'react';
import { createInvoice } from '@/features/finance/actions/invoices';
import { Button } from '@/shared/components/ui';

export function InvoiceForm() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<ActionResponse<any> | null>(null);

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const response = await createInvoice(formData);
            setResult(response);

            if (response.success) {
                // Başarılı - formu temizle veya yönlendir
            }
        });
    };

    return (
        <form action={handleSubmit}>
            {/* Form alanları */}
            <Button type="submit" disabled={isPending}>
                {isPending ? 'Gönderiliyor...' : 'Fatura Oluştur'}
            </Button>

            {result?.error && (
                <div className="error">{result.error.message}</div>
            )}
        </form>
    );
}
```

### Server Component ile Data Fetching

```typescript
// app/(admin)/invoices/page.tsx
import { getInvoices } from '@/features/finance/actions/invoices';
import { DataTable } from '@/shared/components/ui';

export default async function InvoicesPage({
    searchParams
}: {
    searchParams: { page?: string; status?: string }
}) {
    const page = parseInt(searchParams.page || '1');
    const result = await getInvoices({
        page,
        limit: 20,
        status: searchParams.status
    });

    if (!result.success) {
        return <div>Hata: {result.error?.message}</div>;
    }

    return (
        <DataTable
            data={result.data.items}
            pagination={result.data.pagination}
        />
    );
}
```

### Error Handling

```typescript
import { ActionError } from '@/shared/lib';

async function handleAction() {
    try {
        const result = await someAction();

        if (!result.success) {
            // Business logic error
            switch (result.error?.code) {
                case 'VALIDATION_ERROR':
                    // Form hatalarını göster
                    break;
                case 'UNAUTHORIZED':
                    // Login sayfasına yönlendir
                    break;
                default:
                    // Genel hata mesajı
            }
        }
    } catch (error) {
        // Network veya beklenmeyen hata
        console.error('Unexpected error:', error);
    }
}
```
