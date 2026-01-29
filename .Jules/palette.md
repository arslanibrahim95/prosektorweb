## 2026-01-29 - Missing Form Accessibility
**Learning:** Found that common UI components (Input) lacked basic accessibility attributes like `aria-invalid` and `aria-hidden` for decorative icons. This suggests a pattern where accessibility was not a primary constraint during initial component creation.
**Action:** Audit other form components (Select, Checkbox, Radio) for similar issues. Ensure future components include `aria-invalid` connected to error props by default.
