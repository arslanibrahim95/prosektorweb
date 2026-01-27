## 2024-05-23 - [Design System] Input Component Focus State
**Learning:** The `Input` component in this project relies on `group-focus-within` on the icon wrapper to change color when the input is focused. This requires the parent wrapper to have the `group` class, which was missing. This pattern (parent `group` -> child `group-focus-within`) is a specific dependency in this UI kit that needs to be maintained.
**Action:** Always ensure wrapper components in this design system have the `group` class if their children rely on group state modifiers.
