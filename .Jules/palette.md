## 2024-05-23 - Accessibility in Search Components
**Learning:** Reusable components like `FilterBar` often lack form labels because they rely on visual placeholders. Adding `aria-label` using the placeholder prop is a quick, high-impact a11y win.
**Action:** When auditing admin panels, check all filter/search bars for implicit labels.
