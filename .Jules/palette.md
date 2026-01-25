## 2026-01-25 - Critical Navigation Controls Missing Accessibility
**Learning:** The custom `AdminShell` layout used raw `button` elements for key navigation (mobile menu toggle, notifications) without ARIA labels. This renders the admin panel difficult to navigate for screen reader users on mobile.
**Action:** Always audit `layout` components for interactive elements and ensure they have `aria-label` if they are icon-only.
