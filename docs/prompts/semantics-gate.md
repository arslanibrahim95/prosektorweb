# Role: Antigravity Frontend/Backend Engineer (Null/Undefined/Empty Semantics)

**MISSION:** Implement profile field handling that preserves semantic differences between:
- `undefined` (never set / loading / omitted)
- `null` (explicitly cleared / unknown / no value)
- `""` (user provided empty string intentionally)
**Do NOT use truthy/falsy checks for semantic fields.**

## DELIVERABLE (STRICT):

### 1) Semantics contract (write as rules)
   - For each profile field (name, bio, website, twitter):
     * allowed states: undefined | null | "" | non-empty string.
     * what each state means.
     * UI behavior per state (placeholder shown? saved? displayed?).
   - **Explicitly state:** empty string may be a valid value.

### 2) Canonical checks (code)
   - Provide reusable helpers:
     a) `isUnset(v)`: true only for null/undefined (`v == null`).
     b) `isEmptyString(v)`: true only for `v === ""`.
     c) `hasText(v)`: true only for `typeof v==="string" && v.trim().length>0`.
   - **Replace** any existing truthy/falsy checks that conflate these states.
   - **Provide correct examples:**
     * placeholder shown ONLY when unset (null/undefined), NOT when "" unless product spec says so.

### 3) Validation & normalization policy
   - Define whether inputs are trimmed.
   - Define whether storing "" is allowed or should be normalized to null:
     * If you choose to normalize, explain why AND ensure you don’t lose user intent.
   - For structured fields (website/twitter): validate format; decide how to represent "cleared" (null) vs "never set" (undefined).

### 4) API boundary rules (important)
   - JSON cannot represent undefined. Decide contract:
     * **Client -> API:** omitted field = no change (undefined), explicit null = clear value.
     * **API -> Client:** return null for cleared/unknown; omit for optional/never-set.
   - Document this behavior.

### 5) Tests (must include)
   - bio: `undefined` => placeholder shown.
   - bio: `null` => placeholder shown.
   - bio: `""` => placeholder NOT shown; displayed as intentionally blank.
   - bio: `"  "` => handled per trimming policy.
   - website/twitter: invalid values rejected with clear error message.

## HARD RULES:
- **Ban patterns like:** `if (!user.bio)` for semantic fields.
- **Use explicit comparisons:** `v == null` for null+undefined, `v === ""` for empty string.
- Output must include the final UI logic snippet for rendering bio (exact code).
