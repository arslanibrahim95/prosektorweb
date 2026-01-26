## 2026-01-26 - Improving Form Accessibility and Visual Polish
**Learning:** Tailwind's `group-*` modifiers (like `group-focus-within`) strictly require the `group` class on a parent element. This was missing in our `Input` component wrapper, causing the leading icon transition to fail.
**Action:** Always verify `group` class presence when using `group-*` modifiers.

**Learning:** Visual "required" asterisks (`*`) in form labels are often announced as "Star" or "Asterisk" by screen readers, which is redundant if the input is already marked `required` or explicitly labeled.
**Action:** Use `aria-hidden="true"` on decorative asterisks to reduce noise for screen reader users.
