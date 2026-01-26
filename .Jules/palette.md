## 2024-05-22 - Tailwind Group Focus
**Learning:** Tailwind's `group-focus-within` modifier on a child element requires the parent container to have the `group` class. This is often missed when wrapping inputs with icons, breaking the focus color transition.
**Action:** Always verify `group` class presence on the container when using `group-*` modifiers on children.
