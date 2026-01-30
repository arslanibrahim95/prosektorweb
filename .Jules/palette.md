## 2026-01-30 - Accessible Custom Form Controls
**Learning:** Custom form interactive elements (like password visibility toggles) are often implemented with `tabIndex="-1"` to avoid "cluttering" the tab order, but this completely excludes keyboard users. Furthermore, relying on visual icons without `aria-label` leaves screen reader users in the dark.
**Action:** When creating or auditing compound inputs, always ensure internal buttons are keyboard-focusable and have dynamic `aria-labels` that reflect their state (e.g., "Show password" vs "Hide password").
