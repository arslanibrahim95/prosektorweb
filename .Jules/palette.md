# Palette's Journal

## 2024-05-22 - Pagination Accessibility
**Learning:** The admin dashboard pagination links rely solely on icons (ChevronLeft/Right) without text or ARIA labels, making navigation impossible for screen reader users.
**Action:** Always verify that icon-only navigation components carry explicit `aria-label` attributes describing their function (e.g., "Previous page", "Next page").
