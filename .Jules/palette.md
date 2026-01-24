## 2025-05-15 - Missing ARIA Labels in Admin Shell
**Learning:** The AdminShell component, which wraps the entire admin interface, was missing ARIA labels on key interactive elements (mobile menu toggle, close button, search, notifications). This significantly hampers accessibility for screen reader users on the most used part of the system.
**Action:** When auditing layout components (Shells, Sidebars, Headers), always prioritize checking icon-only buttons and search inputs for accessible labels, as they are often overlooked in visual-first development.
