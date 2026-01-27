# Logging & Observability Standard

**Status:** ENFORCED
**Logger:** Pino (Structured JSON)

## 1. The Golden Rule
❌ **NEVER** use `console.log`, `console.error`, or `console.warn` in production code.
✅ **ALWAYS** use `import { logger } from '@/lib/logger'`

## 2. Usage Guide

### Info (Business Events)
Start/End of major workflows, significant state changes.
```ts
logger.info({ userId, invoiceId, amount }, 'Invoice created successfully');
```

### Warn (Recoverable Issues)
Retries, fallback triggered, validation failures (business logic).
```ts
logger.warn({ key, error: err.message }, 'Redis cache miss, falling back to DB');
```

### Error (Action Required)
Exceptions, 5xx responses, data corruption.
```ts
logger.error({ error, stack: error.stack, context: 'payment_gateway' }, 'Payment processing failed');
```

### Debug (Dev Only)
Verbose payloads, loop iterations. Hidden in production by default.
```ts
logger.debug({ payload }, 'Incoming webhook payload');
```

## 3. Context & Correlation
Every log entry automatically includes:
- `timestamp` (ISO)
- `level` (numeric/label)
- `service` ("prosektorweb")

**Request Context:** 
Use `safeApi` wrapper or ensure `requestId` is passed to the logger context manually if inside a deep function.
```ts
logger.info({ requestId, ...otherData }, 'Message');
```

## 4. Redaction Policy
The following keys are **automatically redacted** (removed/masked) from log output:
- `password`, `token`, `secret`, `authorization`, `cookie`
- `apiKey`, `creditCard`, `cvv`, `ssn`
- `email`, `phone`, `address` (PII)

**Do not** explicitly log full user objects if you can avoid it. Log IDs.

## 5. How to Debug (Production)
Logs are JSON streams. Pipe them to `jq` or upload to Datadog/CloudWatch.

**Find traces for a specific Request ID:**
```bash
cat app.log | grep "req-123-abc"
```

**Find all errors in the last hour:**
```bash
grep '"level":50' app.log
```
