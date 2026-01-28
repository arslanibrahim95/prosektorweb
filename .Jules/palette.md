## 2026-01-28 - Input Component Accessibility & Visuals
**Learning:** The `Input` component used `group-focus-within` for the leading icon color transition but missed the `group` class on the container, rendering the effect inert. Additionally, the component lacked `aria-invalid` connection to the error prop and `aria-hidden` for decorative icons.
**Action:** Always verify that `group-*` modifiers have a corresponding parent with `group` class. Ensure form components map error states to `aria-invalid` for screen readers.
