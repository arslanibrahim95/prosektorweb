# Failure Mode Matrix: AI Content Generation

| Dependency | Failure Type | Impact | Strategy | Log Fields | User Message | Alert |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Python Process** | `SpawnError` / Crash | Generation fails instantly. | **Fallback** to TypeScript/Node connector. | `error.code`, `stderr` | "Gelişmiş motor hatası, yedek sisteme geçiliyor..." | If >3/hr |
| **Common Timeout** | `ETIMEDOUT` (120s) | Process hangs. | **Timeout Kill** + 1 Retry (extended time). | `duration_ms` | "İşlem uzun sürdü, tekrar deneniyor..." | None |
| **AI Provider** | `429 Too Many Requests` | Generation fails. | **Exp. Backoff** (2s, 4s, 8s) + Jitter. | `retry_count`, `provider` | "Sunucu yoğun, sırada bekleniyor..." | If retry > 5 |
| **AI Provider** | `500/503 Service Unavailable` | Generation fails. | **Circuit Breaker** -> Switch Provider (e.g., Gemini -> GPT). | `statusCode` | "Servis geçici olarak kullanılamıyor." | Yes |
| **Output Parsing** | `JSONParseError` / Malformed | Content is garbage. | **LLM Repair** (Ask LLM to fix JSON) or Fallback. | `raw_output` | "Veri formatı düzeltiliyor..." | None |
| **Validation** | `ZodError` (Missing fields) | Incomplete content. | **Partial Success** (Return what we have). | `missing_fields` | "İçerik kısmen oluşturuldu." | None |

## Implementation Plan

### 1. Resiliency Wrapper (`src/lib/resiliency.ts`)
- `executeWithRetry<T>(fn, options)`: Handles retries, timeouts, and 429 backoff.
- `Result<T>`: Standardized return type `{ ok, data, error }`.

### 2. Usage in `src/actions/generate.ts`
- Wrap `spawn` calls.
- Wrap `prisma` writes.
