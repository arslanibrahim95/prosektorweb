# Code Reading Ritual Log

**Goal:** Ensure we actually understand the code we maintain.
**Frequency:** Weekly (60 mins)

## The Ritual Agenda (60m)
1.  **Skim (10m):** Check recent commits/PRs. What changed?
2.  **Trace (20m):** Follow ONE user flow end-to-end (e.g., "User clicks Login" -> DB Update).
3.  **Deep Read (20m):** Pick one complex module. Read every line. Write invariants.
4.  **Action (10m):** Create 2 tiny refactor tickets (rename var, extract func) or add 1 test.

---

## Log Entries

### [2026-01-27] Resiliency & Logging

**Skim:**
- Checked `src/lib/logger.ts`. Confirmed Redaction is active.
- Checked `src/lib/cache.ts`. Confirmed singleflight logic.

**Trace: AI Generation Flow**
`Action(generatePageContent)` -> `executeWithRetry` (New) -> `spawn(python)` -> `stdout` parse.
- **Invariant:** Python script MUST output `=====` separator or we can't parse content.
- **Risk:** If Python hangs silently (no stderr), wrapper timeout kills it at 120s.

**Deep Read: `src/lib/resiliency.ts`**
- `executeWithRetry` uses `Promise.race` against a `setTimeout` promise.
- **Complexity:** Backoff calculation uses `Math.random` normalization for jitter.
- **Improvement:** Could expose `attempt` count to the callback function for granular logging inside the action.

**Actions:**
1.  [ ] Refactor `ai-providers.ts` to be a class instead of a huge object.
2.  [ ] Add integration test that mocks the Python script delay to verify timeout.

---
