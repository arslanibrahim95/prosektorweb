# Design System Audit & Remediation Plan

**Date:** 2026-01-24
**Auditor:** Frontend Architect
**Scope:** `prosektorweb` (UI/UX Architecture)
**Status:** 🚨 FRAGMENTED & INCONSISTENT

## 1. Executive Summary: The "Frankenstein" UI

The application lacks a unified Design System. Instead, it relies on three disconnected "islands":
1.  **Landing Page:** "Flashy" components (`GradientButton`, `SpotlightCard`) with hardcoded visual effects.
2.  **Admin Panel:** A private UI kit (`src/components/admin/ui`) using distinct styling (Neutral/Black).
3.  **App Pages (Login):** Inline HTML elements (`<button>`, `<input>`) with no component usage, leading to massive code duplication.

**Risk:** Changing the primary brand color requires editing 50+ files. UI consistency is impossible to guarantee.

## 2. Architecture Map & Boundaries

| Layer | Status | Location | Verdict |
| :--- | :--- | :--- | :--- |
| **Tokens** | ⚠️ Partial | `globals.css` | Defined but ignored. "Fluent Blue" comments conflict with "Brand Red" values. |
| **Primitives** | ❌ **MISSING** | `src/components/ui` | No standard `Button`, `Input`, `Dialog`. Only "Effect" components exist. |
| **Admin UI** | ⚠️ Isolated | `src/components/admin/ui` | Re-implements `SubmitButton`, `StatsCard` instead of reusing global primitives. |
| **Pages** | ❌ Wild West | `src/app/login/page.tsx` | Hardcoded hex values, inline SVGs, raw HTML inputs. |

## 3. Token Health: Critical

- **Hardcoded Colors:**
  - `bg-[#F7F7F9]` (Footer gray) repeated 4+ times.
  - `text-[#8B1E1E]` (Brand Red) repeated 10+ times in headings/links.
  - `bg-[#0a0a0a]` (Dark mode backgrounds) hardcoded in landing.
- **Inconsistent Theming:**
  - Admin uses `bg-neutral-900` (Black).
  - Login uses `from-brand-600` (Red).
  - Landing uses `bg-[#050505]`.
  - **Result:** The user experiences 3 different "apps" visually.

## 4. Component Duplication (The "Button" Crisis)

| Implementation | Location | Style | State Handling |
| :--- | :--- | :--- | :--- |
| `GradientButton` | `components/ui` | Gradient Red | `isLoading` prop |
| `SubmitButton` | `components/admin/ui` | Solid Black | `useFormStatus` (hook) |
| `<button>` | `login/page.tsx` | Gradient Red (Inline) | Manual state (`isPending`) |
| `<button>` | `landing/NewLandingPage` | Mixed | None |

**Consolidation Plan:** Create ONE `src/components/ui/button.tsx` (cva-based) that supports:
- `variant="default"` (Brand Red)
- `variant="secondary"` (Neutral/Black)
- `variant="ghost"`
- `isLoading={true}` (Uniform spinner)

## 5. Critical Findings (P0/P1)

### [DS-001] P0 - Missing Core Primitives
- **Problem:** No standard `Button` or `Input` component exists.
- **Impact:** Every form re-implements validation styling, error states, and loading logic.
- **Evidence:** `src/app/login/page.tsx` manually renders `<input>` with 10 lines of Tailwind classes.
- **Fix:** Implement `shadcn/ui` style `Button` and `Input` immediately.

### [DS-002] P1 - Hardcoded Brand Colors
- **Problem:** `text-[#8B1E1E]` and `bg-[#F7F7F9]` are scattered across the app.
- **Impact:** Rebranding is impossible. Dark mode support is broken (hardcoded hex doesn't flip).
- **Fix:** Move these to `globals.css` variables (`--color-brand-primary`, `--color-bg-subtle`) and use Tailwind utility classes (`text-brand-primary`).

### [DS-003] P1 - Admin UI Isolation
- **Problem:** `src/components/admin/ui` exists.
- **Impact:** Admin features cannot easily be exposed to the User Portal because components are coupled to Admin.
- **Fix:** Move generic components (`StatsCard`, `PageHeader`) to `src/components/ui`. Deprecate `admin/ui`.

## 6. Master To-Do & Migration Plan

### Phase 1: Foundation (P0)
- [ ] **Create `Button` Primitive**: Implement `src/components/ui/button.tsx` with `cva`.
  - Variants: `default` (Red), `secondary` (Black/Gray), `outline`, `ghost`.
- [ ] **Create `Input` Primitive**: Implement `src/components/ui/input.tsx`.
  - Must support `error` state (red border) via props.
- [ ] **Define Brand Tokens**: Replace `#8B1E1E` in `globals.css` with a proper semantic name and update Tailwind config.

### Phase 2: Refactor (P1)
- [ ] **Refactor Login Page**: Replace inline HTML with `<Button>` and `<Input>`.
- [ ] **Refactor Admin Submit**: Replace `SubmitButton` with `<Button type="submit" isLoading={pending} />`.
- [ ] **Refactor Footers**: Replace `bg-[#F7F7F9]` with `bg-muted`.

### Phase 3: Cleanup (P2)
- [ ] **Delete `admin/ui`**: Move unique parts to `admin/components`, generic parts to `ui`.
- [ ] **Lint Rules**: Add `eslint-plugin-tailwindcss` to forbid arbitrary values (`text-[#...]`).

## 7. Guardrails (Linting)

Add to `.eslintrc.json`:
```json
"rules": {
  "react/forbid-component-props": ["error", { "forbid": ["style"] }],
  "no-restricted-syntax": [
    "error",
    {
      "selector": "JSXAttribute[name.name='className'] Literal[value=/bg-\[#.*\]/",
      "message": "Do not use hardcoded hex colors in backgrounds. Use theme tokens."
    }
  ]
}
```