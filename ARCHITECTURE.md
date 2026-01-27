# System Architecture

## 1. High-Level Overview

ProSektorWeb is a **B2B SaaS Monolith** built on Next.js 16 (App Router), focusing on server-side rendering and stateless scaling.

```mermaid
graph TD
    Client[Browser / Mobile] -->|HTTPS| CDN[Cloudflare]
    CDN -->|Load Verify| App[Next.js Server]
    
    subgraph Infrastructure
        App -->|Query| DB[(MySQL - Prisma)]
        App -->|Cache/Lock| Redis[(Upstash Redis)]
        App -->|Jobs| Queue[Background Jobs]
    end
    
    subgraph External Services
        App -->|AI Gen| OpenAI[OpenAI API]
        App -->|Email| SMTP[Email Provider]
    end
```

## 2. Key Architectural Decisions

| Decision | Context | Trade-off |
| :--- | :--- | :--- |
| **Server Components First** | Use React Server Components for data fetching. | **Pro:** No client waterfall, SEO friendly. **Con:** Learning curve, strictly serialized props. |
| **Cache-Aside Pattern** | Explicit `getOrSet` wrapper vs implicit cache. | **Pro:** Full control over invalidation keys (`dashboard:stats`). **Con:** Requires manual key management. |
| **Prisma ORM** | Type-safe database access. | **Pro:** Productivity & Safety. **Con:** Cold start latency in serverless (mitigated by long-running container). |
| **Pino Logging** | Structured JSON logging in prod. | **Pro:** Machine-readable, queryable. **Con:** Harder to read manually without tools (jq). |
| **Upstash Redis** | HTTP-based Redis connection. | **Pro:** Works in serverless/edge without connection pool issues. **Con:** Slightly higher latency than TCP connection. |

## 3. Performance & Caching Strategy

We use a **Multi-Layer Caching** strategy:
1.  **L1 Memory:** Short-lived (seconds) process-local cache for extremely hot paths.
2.  **L2 Redis:** Distributed cache (minutes/hours) for expensive aggregations.
3.  **HTTP Cache:** `Cache-Control` headers for public static content (Blog/Categories).

**Stampede Protection:**
All expensive queries are wrapped in `getOrSet`, which implements **Singleflight** (deduplication) to ensure only one database query runs per key per instance, even under load.

## 4. Observability

-   **Logs:** All output is JSON structured. Contains `level`, `time`, `service`, `requestId`.
-   **Correlation:** `requestId` is propagated through the stack.
-   **Redaction:** PII (Email, Password, Token) is strictly redacted at the logger level.
-   **Metrics:** We track specific events via `logger.info` (e.g., `invoice_created`, `cache_miss`).

## 5. Security

-   **Authentication:** NextAuth.js (Session based).
-   **Authorization:** RBAC via Middleware + `tenant-guard` (Company Isolation).
-   **Rate Limiting:** Sliding Window (Redis) implemented in `src/lib/rate-limit.ts`.
-   **Input Validation:** Strict Zod schemas for all Server Actions.
