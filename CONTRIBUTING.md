# Contributing to ProSektorWeb

We enforce a strict, AI-proof Git workflow to ensure history remains readable and debuggable.

## 1. Branching Strategy
**Format:** `<type>/<scope>-<short-description>`

| Type | Use Case | Example |
| :--- | :--- | :--- |
| `feat` | New features | `feat/auth-sso-login` |
| `fix` | Bug fixes | `fix/invoice-calc-tax-rounding` |
| `refactor` | Code change that neither fixes a bug nor adds a feature | `refactor/admin-ui-components` |
| `perf` | Performance improvements | `perf/dashboard-redis-cache` |
| `docs` | Documentation only | `docs/api-swagger-update` |
| `test` | Adding missing tests or correcting existing tests | `test/auth-middleware-coverage` |
| `chore` | Build process, tool updates, git maintenance | `chore/eslint-strict-rules` |

**Rules:**
- NO direct commits to `main`.
- Feature branches only.

## 2. Commit Message Convention
We use **Conventional Commits**.
Structure:
```
<type>(<scope>): <subject>

WHY: <1-2 lines explaining the intent/business value>
RISK: <1 line about trade-offs, edge cases, or "None">
```

**Examples:**
✅ Good:
```
perf(cache): add redis cache-aside for dashboard stats

WHY: Dashboard load time was >2s due to 14 parallel DB queries. Redis L2 reduces this to <50ms.
RISK: Data may be stale up to 5 minutes (TTL).
```

❌ Bad:
- "fix"
- "final fix"
- "update dashboard"
- "misc changes"

## 3. Pull Request Process
1.  **Rebase** your branch on `main` before opening PR (`git pull --rebase origin main`).
2.  Use the provided **PR Template**.
3.  **Self-Review**: You must verify your own diff.
4.  **Squash** (or Rebase-Merge) upon approval.

## 4. Linting/Formatting
- No code with linter errors (run `npm run lint` locally).
- No console.logs (use `logger`).
