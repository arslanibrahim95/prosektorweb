# Antigravity Git Workflow 🚀

**Goal:** A clean, readable history that is easy to debug ("ne zaman bozuldu?") and safe to deploy.

## 1. Branch Naming Strategy
We use `group/action-context` format.

| Group | Use Case | Example |
| :--- | :--- | :--- |
| `feat` | New features | `feat/auth-login-screen` |
| `fix` | Bug fixes | `fix/user-avatar-crash` |
| `perf` | Performance improvements | `perf/dashboard-query-optimization` |
| `refactor` | Code restructuring | `refactor/api-folder-structure` |
| `docs` | Documentation only | `docs/update-readme` |
| `chore` | Build/Tooling/Deps | `chore/upgrade-nextjs` |

**Rule:** No direct commits to `main`. Always use a branch + PR.

## 2. Commit Messages (Conventional Commits)
We enforce structure to allow auto-changelogs and easy scanning.

**Format:**
```text
<type>(<scope>): <logic summary>

WHY: <reasoning>
RISK: <optional mitigation>
```

**Allowed Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `revert`.

**Bad Examples (Blocked):**
- ❌ "fix"
- ❌ "wip"
- ❌ "update formatting"
- ❌ "fixes bug"

**Good Example:**
```text
feat(auth): implement rate limiting for login

WHY: To prevent brute-force attacks on admin accounts.
RISK: Users behind shared NAT might get throttled; monitored via logflare.
```

## 3. Pull Request (PR) Policy
- **Template Required:** Use the standard template in `.github/pull_request_template.md`.
- **Self-Review:** You must check your own PR first (lint, clean comments).
- **Fast Tests:** Unit tests (`npm run test:unit`) must pass before requesting review.

## 4. Interactive Rebase (Level 1)
Before merging, clean up your messy history. "fix typo", "tried again" commits should be squashed.

```bash
# Rebase last 5 commits interactively
git rebase -i HEAD~5
```
- `pick`: keep commit
- `squash`: merge into previous
- `reword`: change message

## 5. Git Bisect (Level 2)
Use this when you know "it worked yesterday" but it's broken now.

```bash
git bisect start
git bisect bad                 # Current version is broken
git bisect good <commit-hash>  # Version from yesterday was fine

# Auto-run with script
git bisect run ./scripts/bisect-run.sh
```

## 6. Git Worktree (Level 3)
Working on `feat-A` but need to fix a critical bug `fix-B` immediately? Don't `stash`.

```bash
# Create a parallel folder linked to the same git repo
git worktree add ../hotfix-branch main
cd ../hotfix-branch

# Do your fix...
git commit -am "fix: critical bug"
git push origin HEAD

# Cleanup
cd ../prosektorweb
git worktree remove ../hotfix-branch
```

## 7. Signed Commits (Level 4 - Optional)
If working on sensitive modules (Billing/Auth), sign your commits.
1. Enable signing: `git config commit.gpgsign true`
2. Verify: Commits show "Verified" badge on GitHub.

## 8. Hooks (The Enforcer)
We use `husky` to enforce standards automatically.
- **pre-commit:** Runs `lint-staged` (Format + Lint).
- **pre-push:** Runs `npm run test:unit`.
- **commit-msg:** Checks for Conventional Commits format.

Run `npm run prepare` to install hooks locally.
