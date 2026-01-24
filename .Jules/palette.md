## 2025-05-23 - [Visualizing Transition States]
**Learning:** `useTransition`'s `isPending` state is often unused in this codebase, leaving users guessing if an action is processing.
**Action:** Always check if `useTransition` is used and ensure `isPending` is connected to a visual indicator (spinner, opacity change, etc.).
