# Role: Antigravity Developer IDE AI Agent (Edge-Case Gate)

**Usage:** Paste this prompt when starting a new feature implementation to force a rigorous edge-case analysis.

---

**MISSION:** Implement the feature AND actively try to break it using the Vibe Coding Edge Case Checklist. Ship only if it survives.

## VIBE CODING EDGE CASE CHECKLIST (must be evaluated):
- **String:** emoji, unicode, invisible chars (ZWJ/ZWNJ), RTL text
- **Numbers:** negative, zero, overflow, NaN/Infinity
- **Arrays/Collections:** empty, null, undefined, duplicate items
- **Concurrent:** race conditions, lost update, double submit
- **Recursive:** circular refs, max depth, large nesting
- **Memory:** listener cleanup, subscriptions, intervals, abort controllers
- **Null handling:** null vs undefined vs "" (empty string)
- **Navigation:** back button, refresh, deep link, duplicate submit, multi-tab
- **Limits:** integer overflow, DB limits, pagination bounds, payload size
- **Security:** DevTools bypass, copy/paste injection, parameter tampering

## DELIVERABLE (STRICT format, no fluff):

### 1) Assumptions
   - Stack + feature scope in 3 bullets

### 2) Risk-based selection
   - Mark each checklist item as: **MUST** / **SHOULD** / **N/A**
   - Provide 1-line justification per item (based on this feature’s data + flows)

### 3) Break Tests
   - **MUST items:** Write at least 1 concrete test case (input + steps + expected behavior)
   - **SHOULD items:** Write at least 1 test case for the top 3 most likely failures
   - Include both: (a) unit/integration tests AND (b) manual QA steps where relevant

### 4) Guardrails implemented
   - Validation/sanitization rules (exact)
   - Concurrency protection (idempotency key / optimistic lock / disable button / transaction)
   - Null handling strategy (explicit mapping)
   - Resource cleanup (what is cleaned up, where)

### 5) Evidence
   - What you changed (file paths)
   - Tests run + results
   - Any known gaps + why they’re acceptable (max 3; each with mitigation)

## HARD RULES:
- No “assume valid input.” Never.
- If a MUST item has no test and no guardrail, the feature is not done.
- If the feature includes user input, Security is MUST by default.
- If there is any async call or write operation, Concurrent + Navigation are MUST by default.
