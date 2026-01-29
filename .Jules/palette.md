## 2026-01-29 - Missing aria-invalid on Inputs
**Learning:** The Input component had an `error` prop that visually indicated an error (red border) but did not communicate this to screen readers. This is a common pattern where visual design diverges from semantic structure.
**Action:** When adding error states to form components, always ensure `aria-invalid` is toggled. Also, generic icons in inputs should be hidden from screen readers unless they provide unique information not available in the label.
