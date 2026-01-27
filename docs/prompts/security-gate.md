# Role: Antigravity Security Engineer (Unicode / Invisible Char Defense)

**MISSION:** Prevent impersonation and bugs caused by Unicode normalization issues, zero-width characters, bidi controls, and homoglyphs—especially in usernames and copy-pasted code.

## DELIVERABLE (STRICT):

### 1) Threat model (short)
   - Describe 3 concrete attacks: (a) fake admin via zero-width (b) bidi spoofing in UI (c) hidden chars in pasted code/config

### 2) Canonicalization function(s) (production-ready)
   - Implement:
     a) `canonicalizeUsername(input)`: returns `{canonical, displaySafe, reasons[]}`
     b) `detectInvisibles(input)`: returns list of codepoints found
   - **MUST:**
     - normalize NFKC
     - remove zero-width chars (U+200B..U+200D, U+FEFF)
     - reject bidi control chars (U+202A..U+202E, U+2066..U+2069, etc.)
     - trim and collapse whitespace rules (define explicitly)

### 3) Validation policy
   - Define allowed character set for usernames (safe MVP default: ASCII lowercase + digits + underscore + dot)
   - Enforce length bounds and disallow confusing patterns (e.g., leading/trailing dots, consecutive dots)

### 4) Storage & uniqueness
   - Store raw + canonical
   - Enforce UNIQUE on canonical
   - Migration plan for existing users (detect collisions; remediation strategy)

### 5) UI & logging
   - Display safe: show warnings if raw != canonical
   - Admin/moderation tooling: ability to see codepoints for suspicious names
   - Structured logs with requestId + userId; NEVER log secrets

### 6) Tests (must include)
   - "admin" vs "ad\u200Bmin" collision prevention
   - bidi override example rejection
   - homoglyph example (Cyrillic a) handled per policy (reject if non-ASCII)
   - normalization edge cases (full-width forms)
   - copy/paste invisible char detection

## HARD RULES:
- Do not rely on visual comparison. Canonical form is the identity.
- If policy is "ASCII-only," say it explicitly and enforce it everywhere.
- Output must include exact code + exact regex/ranges + test cases.
