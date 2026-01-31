# AGENTS.md - ProsektorWeb Agent Guidelines

> **Purpose:** Guide for AI agents working on this Next.js OSGB management platform
> **Stack:** Next.js 15, TypeScript, Prisma, MariaDB, NextAuth v5, Tailwind CSS
> **Version:** 1.0

---

## Development Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint
npm run test             # Watch tests
npm run test:run        # Run tests once
npm run test:coverage    # Coverage report

# Single test commands
npx vitest src/__tests__/auth.test.ts                    # Run file
npx vitest --grep "password"                            # Run by pattern
npx vitest src/__tests__/auth.test.ts:15                # Run specific line

# Prisma
npx prisma generate    # Generate client
npx prisma migrate dev  # Create/apply migration
npx prisma studio      # Open Prisma Studio
```

---

## Code Style

### Import Order: Node → External → Internal (@/) → Relative
```typescript
import fs from 'fs/promises';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
```

### Naming: files=kebab-case, Components= PascalCase, functions=camelCase
```typescript
// user-profile.tsx
export function UserProfile() { }
export async function createInvoice() { }
const MAX_RETRY = 3;
export interface InvoiceActionResult { }
export type UserRole = 'ADMIN' | 'CLIENT';
```

### Server Actions Template
```typescript
'use server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guard';
import { getErrorMessage, getZodErrorMessage } from '@/lib/action-types';
import { revalidatePath } from 'next/cache';

const Schema = z.object({ field: z.string() });
export async function action(formData: FormData) {
  try {
    await requireAuth();
    const validated = Schema.parse({ field: formData.get('field') });
    const result = await prisma.model.create({ data: validated });
    revalidatePath('/path');
    return { success: true, data: result };
  } catch (e) {
    console.error('action error:', e);
    if (e instanceof z.ZodError) return { success: false, error: getZodErrorMessage(e) };
    return { success: false, error: getErrorMessage(e) };
  }
}
```

### API Routes Template (safeApi)

Use `safeApi` wrapper for all Route Handlers to get free Rate Limiting, Sentry, and standardized error responses.

```typescript
// app/api/route_path/route.ts
import { safeApi } from '@/lib/safe-api';
import { NextResponse } from 'next/server';

export const GET = safeApi(async (req) => {
  return { message: 'Hello World' };
}, { rateLimit: { limit: 10, windowSeconds: 60 } });

export const POST = safeApi(async (req, { params }) => {
  // Logic here
  return { success: true };
}, { requireAuth: true });
```

### Security Patterns
```typescript
await requireAuth(); // or requireAuth(['ADMIN', 'CLIENT'])

// Tenant isolation - filter in WHERE clause
if (session?.user?.role !== 'ADMIN') {
  where.companyId = user.companyId;
}

// Sanitize file paths
import { sanitizeFilename } from '@/lib/security/sanitizer';
```

### Database Patterns
```typescript
// Transactions for multi-step
await prisma.$transaction(async (tx) => { /* ... */ });

// Selective includes
include: { company: { select: { name: true } } }

// Soft delete financial records
await prisma.payment.update({ where: { id }, data: { deletedAt: new Date() } });
```

---

## Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature', () => {
  beforeEach(async () => { await prisma.user.deleteMany({}); });
  it('should work', async () => {
    const result = await fn();
    expect(result.success).toBe(true);
  });
});
```

---

## Critical Rules (NON-NEGOTIABLE)

1. **NO PLAIN TEXT PASSWORDS** - Use bcrypt.hash/compare
2. **NO ANY TYPES** - Explicit types only
3. **NO IDOR** - Tenant filter in WHERE clause
4. **NO PATH TRAVERSAL** - Sanitize file paths
5. **VALIDATE INPUT** - Use Zod schemas
6. **NO STACK EXPOSURE** - Generic messages to users
7. **REVALIDATE PATHS** - After mutations
8. **AUTH CHECK FIRST** - First line of protected actions
9. **AUDIT LOG** - Critical operations
10. **ERROR HANDLING** - Try-catch all async
11. **USE SAFE_API** - Prefer `safeApi` wrapper for Route Handlers

---

## Environment Variables

**Required:** `DATABASE_URL`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `ENCRYPTION_KEY`

**Optional:** `CLOUDFLARE_API_TOKEN`, `OPENAI_API_KEY`, `RESEND_API_KEY`

---

## Pitfalls

❌ `any` types, `as any` bypass, missing await, missing Zod handle, no revalidate, exposing logs, no transactions, N+1 includes, hardcoded env values
