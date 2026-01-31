## 2026-01-31 - [Barrel File Import Safety]
**Learning:** Importing utilities like `cn` from the root barrel file `@/shared/lib` in client components pulls in server-side dependencies (like `next-auth`, `redis`), causing unit tests (Vitest/JSDOM) to crash with module resolution errors.
**Action:** Always import `cn` and other shared utilities from their specific files (e.g., `@/shared/lib/utils`) in client-side components (`src/components/ui/*`).

## 2026-01-31 - [Localization Strategy in UI Components]
**Learning:** The codebase mixes English variable names with hardcoded Turkish UI strings in shared components (e.g., `ThemeToggle`). This complicates accessibility improvements that require text labels.
**Action:** Use optional props for text labels in shared UI components, defaulting to the existing hardcoded language (Turkish) to maintain backward compatibility while enabling localization override by consumers.
