## 2025-05-22 - Admin UI Accessibility Patterns
**Learning:** The Admin UI frequently uses icon-only buttons (like back buttons) and form inputs (like search and filters) without associated labels or aria-labels. This pattern relies heavily on visual context (icons, placeholders) which excludes screen reader users.
**Action:** When working on Admin UI components, proactively check for missing `aria-label` on `Link` components with icons and `input`/`select` elements that rely solely on placeholders.
