# Caching Strategy & Implementation

**Status**: Planned  
**Driver**: Performance & Cost Reduction  
**Pattern**: Cache-Aside (Redis > Memory > DB)

## 1. Hotspots Identified
| Hotspot | Type | Justification | Current State |
| :--- | :--- | :--- | :--- |
| **Admin Dashboard** (`dashboard.ts`) | DB Aggregation | 14+ parallel DB queries on every load. High cost at scale. | Partial `unstable_cache` (file-system) |
| **Financial Reports** (`reports.ts`) | DB Aggregation | Heavy historical data processing (Invoice aggregations). | No caching (RT query) |
| **AI Generation** (`generate.ts`) | External/Compute | Expensive API calls (OpenAI/Claude) + Python processing. | DB Persistence (GeneratedContent table) acts as cache |

## 2. Server Caching Design (Cache-Aside)
We will implement a `getOrSet` utility that wraps expensive calls.

**Key Schema:**  
`cache:<entity>:<id>:<variant>`
- `cache:dashboard:stats` (TTL: 5m)
- `cache:reports:revenue:v1` (TTL: 1h)
- `cache:reports:projects:v1` (TTL: 10m)

**Stampede Protection:**  
- **Singleflight:** If multiple identical requests arrive, only one executes the loader; others wait for the result.
- **Locking:** Distributed lock via Redis (optional for extremely heavy tasks, but singleflight is usually sufficient for read-through).

**Memory Layout:**
1. **L1 (In-Memory):** LRU Cache (max 100 items). Fast but local to instance.
2. **L2 (Redis):** Shared state. Persistent across deploys/instances.
3. **Source:** DB / API.

## 3. HTTP Caching Design
**Public Assets & Pages:**
- `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
- Use Vercel Edge caching where possible.

**Private/Admin API:**
- `Cache-Control: private, no-cache` (Ensure sensitive data isn't cached publicly)
- Use `ETag` for revalidation to save bandwidth.

## 4. Frontend Caching (React Query)
- **StaleTime:**
  - Dashboard: 1 minute (User can manual refresh)
  - Lists (Users/Companies): 5 minutes
  - Static Config (Enums/Types): Infinitely
- **Invalidation:**
  - On Mutation (e.g., `createCompany`), invalidate `['companies', 'list']`.

## 5. Invalidation Policy
**Explicit Triggers:**
- **On New Invoice:** `purges: ['cache:dashboard:stats', 'cache:reports:revenue:*']`
- **On New Ticket:** `purges: ['cache:dashboard:stats']`
- **On User Role Change:** `purges: ['auth:session:*']` (handled by Auth.js)

**Manual Purge:**
- Endpoint: `/api/admin/cache/purge?key=<pattern>` (Protected)

## 6. Observability Plan
**Metrics to Track:**
- `cache_hit_count` / `cache_miss_count`
- `cache_latency_ms`
- `redis_error_count`

**Alerts:**
- Hit rate < 80% on hotspots.
- DB CPU > 70%.
